---
name: web-scraping
description: 网页抓取与数据提取。Use when (1) 需要抓取网页内容, (2) 绕过反爬虫机制, (3) 处理动态加载内容, (4) 批量采集数据, (5) 解析特定网站结构
---

# Web Scraping with Browser Automation

## Objectives

- Use Playwright to simulate real user behavior and bypass anti-bot detection
- Handle dynamic content, infinite scroll, and JavaScript-heavy sites
- Implement robust error handling, retries, and rate limiting
- Extract structured data efficiently

## Core Strategy

### 1. Stealth Mode (Anti-Bot)

Always use stealth configuration to avoid detection:

```python
# Remove automation flags
context.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
""")

# Use realistic settings
browser = playwright.chromium.launch(
    args=['--disable-blink-features=AutomationControlled']
)
```

### 2. Human-like Behavior

Add random delays and smooth interactions:

```python
import random
await asyncio.sleep(random.uniform(0.5, 2.0))
await page.mouse.move(x, y, steps=random.randint(10, 30))
```

### 3. Wait for Content

Use appropriate wait strategies:

```python
# For static content
await page.goto(url, wait_until='networkidle')

# For dynamic content
await page.wait_for_selector('.content')
await page.wait_for_function("document.querySelectorAll('.item').length > 10")
```

## Common Patterns

### Pattern 1: Article/Blog Content

```python
title = await page.locator('h1').first.text_content()
paragraphs = await page.locator('article p').all_text_contents()
content = '\n\n'.join(paragraphs)
```

### Pattern 2: Infinite Scroll

```python
while len(items) < max_items:
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await page.wait_for_timeout(2000)
    current_items = await page.locator('.item').all()
    if len(current_items) == previous_count:
        break
```

### Pattern 3: Handle Popups

```python
# Close cookie banners and modals
try:
    await page.click('button:has-text("Accept")', timeout=3000)
except:
    pass
```

### Pattern 4: Login Required

```python
await page.fill('input[name="username"]', username)
await page.fill('input[name="password"]', password)
await page.click('button[type="submit"]')
await page.wait_for_url('**/dashboard')
cookies = await context.cookies()  # Save for reuse
```

## Rate Limiting & Retries

Implement rate limiting to avoid bans:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=4, max=10))
async def scrape_with_retry(url: str):
    # Your scraping logic
    pass
```

Track requests per time window:

```python
class RateLimiter:
    def __init__(self, max_requests: int, time_window: int):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []

    async def wait_if_needed(self):
        # Remove old requests, wait if limit reached
        pass
```

## Data Extraction

Use BeautifulSoup for parsing after Playwright renders:

```python
from bs4 import BeautifulSoup

soup = BeautifulSoup(html, 'lxml')

# Remove unwanted elements
for element in soup(['script', 'style', 'nav', 'footer']):
    element.decompose()

# Extract structured data
article = soup.find('article') or soup.find('main')
paragraphs = [p.get_text(strip=True) for p in article.find_all('p')]
```

## Caching

Cache results to minimize requests:

```python
import hashlib
import json

def get_cache_path(url: str) -> Path:
    url_hash = hashlib.md5(url.encode()).hexdigest()
    return Path(f'.cache/{url_hash}.json')

# Check cache before scraping
cached = load_from_cache(url)
if cached:
    return cached
```

## Installation

```bash
pip install playwright beautifulsoup4 lxml tenacity
playwright install chromium

# Or with uv
uv add playwright beautifulsoup4 lxml tenacity
uv run playwright install chromium
```

## Project Structure

```
scripts/scrapers/
├── base.py              # Base scraper class with stealth mode
├── extractors/          # Site-specific extractors
│   ├── medium.py
│   ├── github.py
│   └── generic.py
├── utils/
│   ├── stealth.py       # Anti-bot utilities
│   ├── cache.py         # Caching logic
│   └── rate_limit.py    # Rate limiting
└── config.py            # User agents, timeouts, etc.
```

## Validation Checklist

Before deploying:

- [ ] Uses stealth mode (removes webdriver flag)
- [ ] Implements rate limiting
- [ ] Has retry logic with exponential backoff
- [ ] Uses caching to avoid redundant requests
- [ ] Handles errors gracefully
- [ ] Closes browser resources properly
- [ ] Respects robots.txt
- [ ] Logs all operations

## Common Issues

- **"Executable doesn't exist"** → Run `playwright install chromium`
- **Timeout errors** → Increase timeout or use `wait_until='domcontentloaded'`
- **Element not found** → Add explicit waits with `wait_for_selector()`
- **Detected as bot** → Use stealth mode, rotate user agents, add random delays
- **Memory leaks** → Always close browser in finally block

## Best Practices

1. **Respect robots.txt** - Check before scraping
2. **Use caching** - Avoid redundant requests
3. **Rate limit** - Don't overload servers
4. **Rotate user agents** - Avoid detection
5. **Log everything** - Debug and monitor
6. **Handle errors** - Retry with backoff
7. **Clean up resources** - Close browsers properly

**For detailed code examples:** See `references/examples.md`
**For site-specific patterns:** See `references/patterns.md`
**For advanced anti-bot techniques:** See `references/stealth-guide.md`
