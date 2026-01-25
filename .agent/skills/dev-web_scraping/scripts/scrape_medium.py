#!/usr/bin/env python3
"""
抓取 Medium 文章内容

用法:
    python scrape_medium.py <url>
"""

import asyncio
import sys
from pathlib import Path
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup


async def scrape_medium_article(url: str) -> dict:
    """抓取 Medium 文章"""
    
    async with async_playwright() as p:
        # 启动浏览器（使用 stealth 模式）
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        # 创建上下文
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='en-US',
        )
        
        # 移除自动化标识
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        page = await context.new_page()
        
        try:
            print(f"正在访问: {url}")
            
            # 访问页面（使用 domcontentloaded 更快）
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            
            # 等待文章内容加载
            try:
                await page.wait_for_selector('article', timeout=15000)
                print("✓ 文章内容已加载")
            except PlaywrightTimeout:
                print("⚠️  等待文章内容超时，尝试继续...")
            
            # 额外等待一下让动态内容加载
            await page.wait_for_timeout(2000)
            
            # 关闭可能的弹窗
            try:
                await page.click('button:has-text("Close")', timeout=3000)
            except:
                pass
            
            # 获取页面内容 - 直接用 Playwright 提取
            # 等待主要内容加载
            await page.wait_for_load_state('domcontentloaded')
            
            # 提取标题
            try:
                title = await page.locator('h1').first.text_content()
            except:
                title = await page.title()
            
            print(f"✓ 标题: {title}")
            
            # 提取所有段落文本
            paragraphs = []
            
            # 提取所有 p, h2, h3, pre 标签
            elements = await page.locator('p, h2, h3, pre').all()
            
            skip_keywords = ['UPDATE:', 'EDIT:', 'Note:', 'Click here', 'Read more', 'Sign up', 'Follow']
            
            for elem in elements:
                text = await elem.text_content()
                text = text.strip()
                
                # 过滤条件
                is_meta_info = any(keyword in text for keyword in skip_keywords)
                
                if text and len(text) > 30 and not text.startswith('http') and not is_meta_info:
                    paragraphs.append(text)
            
            print(f"✓ 提取到 {len(paragraphs)} 个段落")
            
            await browser.close()
            
            return {
                'title': title,
                'url': url,
                'content': '\n\n'.join(paragraphs),
                'paragraphs': paragraphs
            }
            
        except Exception as e:
            print(f"✗ 抓取失败: {e}")
            await browser.close()
            raise


def create_bilingual_doc(article: dict) -> str:
    """创建中英对照文档"""
    
    title = article['title']
    url = article['url']
    paragraphs = article['paragraphs']
    
    doc = f"""# {title} (中英对照)

> **原文链接:** {url}

---

"""
    
    for para in paragraphs:
        # 检测是否是标题（短且可能是标题）
        is_heading = len(para) < 80 and not para.endswith('.')
        
        if is_heading:
            doc += f"\n## {para}\n\n"
        else:
            doc += f"""{para}

[待翻译]

---

"""
    
    doc += """
## 学习建议

1. **理解核心概念** - 仔细阅读原文和翻译
2. **做笔记** - 标记重点和疑问
3. **实践** - 如果有代码示例，动手实现
4. **提问** - 对不理解的部分提问
"""
    
    return doc


async def main():
    if len(sys.argv) < 2:
        print("用法: python scrape_medium.py <url>")
        print("示例: python scrape_medium.py https://medium.com/...")
        sys.exit(1)
    
    url = sys.argv[1]
    
    # 抓取文章
    article = await scrape_medium_article(url)
    
    if not article['content']:
        print("✗ 未能提取到内容")
        sys.exit(1)
    
    # 生成文档
    doc = create_bilingual_doc(article)
    
    # 保存文件
    # 从标题生成文件名
    import re
    safe_title = re.sub(r'[^\w\s-]', '', article['title'].lower())
    safe_title = re.sub(r'[-\s]+', '_', safe_title)[:50]  # 限制长度
    filename = f"{safe_title}_bilingual.md"
    
    output_path = Path(filename)
    output_path.write_text(doc, encoding='utf-8')
    
    print(f"\n✓ 已保存到: {output_path}")
    print(f"  标题: {article['title']}")
    print(f"  段落数: {len(article['paragraphs'])}")


if __name__ == '__main__':
    asyncio.run(main())
