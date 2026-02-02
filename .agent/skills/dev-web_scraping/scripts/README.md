# Web Scraping Scripts

Utility scripts for web scraping and content extraction.

## scrape_medium_to_html.py

Scrape Medium articles and convert to clean Markdown.

### Features

- **Playwright browser automation** - Loads dynamic content and handles anti-bot
- **Full HTML download** - Saves complete page locally
- **html2text conversion** - Converts HTML to clean Markdown
- **Smart content filtering** - Removes UI elements, ads, and navigation
- **Preserves structure** - Keeps headings, paragraphs, images, and links
- **Scroll loading** - Ensures all lazy-loaded content is captured

### Usage

```bash
# Basic usage
uv run python scrape_medium_to_html.py https://medium.com/@author/article

# Specify output file
uv run python scrape_medium_to_html.py https://medium.com/@author/article -o article.md

# Keep HTML file for debugging
uv run python scrape_medium_to_html.py https://medium.com/@author/article --keep-html
```

### Output

- Clean Markdown file with article content
- Preserved image links (Medium CDN URLs)
- Proper heading hierarchy
- Filtered UI elements and ads

### Requirements

```bash
# Install dependencies
uv add playwright html2text

# Install browser (first time only)
uv run playwright install chromium
```

## How It Works

1. **Launch Playwright** - Headless Chromium browser
2. **Load page** - Navigate to URL and wait for content
3. **Scroll page** - Trigger lazy-loading of all content
4. **Save HTML** - Download complete rendered HTML
5. **Convert to Markdown** - Use html2text for clean conversion
6. **Filter content** - Remove UI elements and ads
7. **Save result** - Output clean Markdown file

## Anti-Bot Features

- Real browser user agent
- Proper viewport size (1920x1080)
- Scroll simulation for lazy-loading
- ESC key to close popups
- Natural page loading timing

## Dependencies

```bash
uv add playwright html2text
uv run playwright install chromium
```
