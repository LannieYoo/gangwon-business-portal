# Web Scraping Scripts

Utility scripts for web scraping and content extraction.

## scrape_medium.py

Scrape Medium articles and generate bilingual documents.

### Features

- Stealth mode browser automation (anti-bot)
- Article content extraction
- Automatic bilingual template generation
- Filter out meta information and ads

### Usage

```bash
# Scrape a Medium article
python scrape_medium.py https://medium.com/@author/article-title

# Output: article_title_bilingual.md
```

### Requirements

```bash
# Install dependencies
uv add playwright beautifulsoup4

# Install browser (first time only)
uv run playwright install chromium
```

## fetch_links.py

Batch scrape links from a links.md file and generate bilingual documents.

### Features

- Parse markdown link files
- Batch scraping with progress tracking
- Site-specific content extraction (Medium, generic)
- Automatic bilingual document generation

### Usage

```bash
# Scrape all links from a file
python fetch_links.py path/to/links.md

# Example
python fetch_links.py ../courses/rl/links.md
```

### Link File Format

```markdown
# Resources

## Articles

- [Article Title](https://example.com/article)
- [Another Article](https://medium.com/@author/post)

## Videos

- [Video Title](https://youtube.com/watch?v=xxx)
```

## Anti-Bot Strategies

These scripts use several techniques to avoid detection:

1. **Stealth mode**: Disable automation flags
2. **Real user agent**: Use actual browser user agents
3. **Natural timing**: Random delays between requests
4. **Proper viewport**: Standard browser window size

## Dependencies

```bash
uv add playwright beautifulsoup4 lxml
```
