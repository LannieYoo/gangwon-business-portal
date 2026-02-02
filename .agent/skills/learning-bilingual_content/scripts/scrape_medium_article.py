"""
Scrape Medium article with images using Playwright
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import hashlib
import json

async def scrape_medium_article(url: str, output_dir: Path):
    """Scrape Medium article content and images"""
    
    output_dir.mkdir(parents=True, exist_ok=True)
    images_dir = output_dir / "images"
    images_dir.mkdir(exist_ok=True)
    
    async with async_playwright() as p:
        # Launch browser with stealth mode
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        
        # Remove webdriver flag
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        page = await context.new_page()
        
        try:
            print(f"Loading {url}...")
            # Use domcontentloaded instead of networkidle for faster loading
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            
            # Wait for article content with longer timeout
            await page.wait_for_selector('article', timeout=20000)
            
            # Extract article structure
            article_data = await page.evaluate("""
                () => {
                    const article = document.querySelector('article');
                    if (!article) return null;
                    
                    const data = {
                        title: '',
                        sections: []
                    };
                    
                    // Get title
                    const h1 = document.querySelector('h1');
                    if (h1) data.title = h1.textContent.trim();
                    
                    // Get all content elements in order
                    // Medium uses specific structure for code blocks
                    const walker = document.createTreeWalker(
                        article,
                        NodeFilter.SHOW_ELEMENT,
                        null
                    );
                    
                    const processedElements = new Set();
                    
                    while (walker.nextNode()) {
                        const el = walker.currentNode;
                        
                        // Skip if already processed
                        if (processedElements.has(el)) continue;
                        
                        if (el.tagName === 'H1') {
                            data.sections.push({type: 'h1', text: el.textContent.trim()});
                            processedElements.add(el);
                        } else if (el.tagName === 'H2') {
                            data.sections.push({type: 'h2', text: el.textContent.trim()});
                            processedElements.add(el);
                        } else if (el.tagName === 'H3') {
                            data.sections.push({type: 'h3', text: el.textContent.trim()});
                            processedElements.add(el);
                        } else if (el.tagName === 'P') {
                            const text = el.textContent.trim();
                            if (text) data.sections.push({type: 'p', text: text});
                            processedElements.add(el);
                        } else if (el.tagName === 'PRE') {
                            // Extract code from pre tag
                            const code = el.querySelector('code');
                            const codeText = code ? code.textContent : el.textContent;
                            data.sections.push({type: 'code', text: codeText, language: 'python'});
                            processedElements.add(el);
                        } else if (el.classList && el.classList.contains('gist')) {
                            // Handle embedded gists
                            const codeBlocks = el.querySelectorAll('.blob-code-inner');
                            if (codeBlocks.length > 0) {
                                const codeLines = Array.from(codeBlocks).map(block => block.textContent);
                                data.sections.push({type: 'code', text: codeLines.join('\\n'), language: 'python'});
                                processedElements.add(el);
                            }
                        } else if (el.tagName === 'FIGURE') {
                            const img = el.querySelector('img');
                            if (img && img.src) {
                                const caption = el.querySelector('figcaption');
                                data.sections.push({
                                    type: 'image',
                                    src: img.src,
                                    alt: img.alt || '',
                                    caption: caption ? caption.textContent.trim() : ''
                                });
                                processedElements.add(el);
                            }
                        }
                    }
                    
                    return data;
                }
            """)
            
            if not article_data:
                print("No article content found")
                return None
            
            # Download images
            print(f"Found {len([s for s in article_data['sections'] if s['type'] == 'image'])} images")
            
            for i, section in enumerate(article_data['sections']):
                if section['type'] == 'image':
                    img_url = section['src']
                    # Generate filename from URL hash
                    img_hash = hashlib.md5(img_url.encode()).hexdigest()[:8]
                    img_ext = img_url.split('.')[-1].split('?')[0] or 'jpg'
                    img_filename = f"img_{i}_{img_hash}.{img_ext}"
                    img_path = images_dir / img_filename
                    
                    try:
                        # Download image
                        response = await page.request.get(img_url)
                        if response.ok:
                            with open(img_path, 'wb') as f:
                                f.write(await response.body())
                            section['local_path'] = f"images/{img_filename}"
                            print(f"Downloaded: {img_filename}")
                    except Exception as e:
                        print(f"Failed to download {img_url}: {e}")
            
            # Save structured data
            json_path = output_dir / "article_data.json"
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(article_data, f, indent=2, ensure_ascii=False)
            
            print(f"\nSaved article data to {json_path}")
            return article_data
            
        finally:
            await browser.close()


async def main():
    url = "https://medium.com/data-science/math-of-q-learning-python-code-5dcbdc49b6f6"
    # Use absolute path from script location
    script_dir = Path(__file__).parent
    output_dir = script_dir.parent / "resources"
    
    article_data = await scrape_medium_article(url, output_dir)
    
    if article_data:
        print(f"\nTitle: {article_data['title']}")
        print(f"Sections: {len(article_data['sections'])}")


if __name__ == "__main__":
    asyncio.run(main())
