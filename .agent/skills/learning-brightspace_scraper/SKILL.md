---
name: brightspace-scraper
description: Scrape course materials from Brightspace LMS. Use when (1) need to download course content (slides, labs, assignments), (2) organize course materials locally, (3) filter specific module types, (4) batch download from multiple courses.
---

# Brightspace Course Scraper

## Objectives

- Automate downloading of course materials from Brightspace LMS
- Organize content by course and module hierarchy
- Filter specific content types (slides, labs, assignments, etc.)
- Handle authentication and session management
- Avoid re-downloading unchanged content

## Script Location

`.skills/learning-brightspace_scraper/scripts/brightspace/scraper.py`

## Quick Start

### 1. First Time Setup - Login

```bash
cd .skills/learning-brightspace_scraper/scripts
uv run python run.py --login-only
```

This opens a browser for manual login. Session is saved to `.session.json` for future use.

### 2. List Available Courses

```bash
uv run python run.py --list-courses
```

Shows all enrolled courses with their IDs.

### 3. Scrape Entire Course

```bash
uv run python run.py --course 846088
```

### 4. Scrape Specific Module Type

```bash
# Only slides
uv run python run.py --course 846088 --module slides

# Only labs
uv run python run.py --course 846088 --module labs

# Only assignments
uv run python run.py --course 846088 --module assignment

# Specific week
uv run python run.py --course 846088 --module "Week 1"
```

## Configuration

Edit `.skills/learning-brightspace_scraper/scripts/brightspace/config.py`:

```python
COURSES = {
    "846088": "ml",           # Course ID -> local directory name
    "846083": "nlp",
    "846092": "mv",
    "846085": "rl",
}

OUTPUT_DIR = Path(__file__).parent / "data"  # Temporary storage
```

## Command Line Options

| Option           | Short | Description                            |
| ---------------- | ----- | -------------------------------------- |
| `--course`       | `-c`  | Course ID to scrape                    |
| `--module`       | `-m`  | Filter modules by name (partial match) |
| `--headless`     |       | Run browser in headless mode           |
| `--login-only`   |       | Only perform login and save session    |
| `--list-courses` | `-l`  | List all available courses             |
| `--keep-open`    | `-k`  | Keep browser open after completion     |
| `--dump-html`    |       | Save page HTML for debugging           |

## How It Works

### 1. Authentication

- Uses Playwright to automate browser
- Saves session cookies to `.session.json`
- Reuses session for subsequent runs
- Manual login required only once

### 2. Content Discovery

- Navigates course content tree structure
- Parses module hierarchy (parent/child relationships)
- Identifies content types (PDF, PPTX, links, HTML pages)
- Tracks content with unique IDs

### 3. Smart Downloading

- Computes content hash to detect changes
- Skips unchanged files (stored in `.content_hashes.json`)
- Downloads files via "Download" button clicks
- Extracts external links to `links.md`
- Saves HTML snapshots for reference

### 4. Module Filtering

When `--module` is specified:

- Case-insensitive partial matching
- Matches module title or full path
- Automatically enters parent modules if children match
- Example: `--module slides` matches "Slides", "Week 1 Slides", "Course Slides"

### 5. Content Organization

```
data/                            # Root data directory
└── ml/                          # Course directory
    ├── .content_hashes.json     # Change detection
    ├── index.html               # Course home page
    ├── Week 1/                  # Module
    │   ├── index.html
    │   ├── Slides/              # Sub-module
    │   │   ├── index.html
    │   │   ├── 12345_Lecture1.pdf
    │   │   └── links.md
    │   └── Labs/
    │       ├── index.html
    │       └── 67890_Lab1.pdf
    └── Week 2/
        └── ...
```

## Common Workflows

### Workflow 1: Download All Course Materials

```bash
cd .skills/learning-brightspace_scraper/scripts

# Login once
uv run python run.py --login-only

# Scrape all configured courses
uv run python run.py
```

### Workflow 2: Update Specific Content Type

```bash
# Only download new slides
uv run python run.py --course 846088 --module slides

# Only download new labs
uv run python run.py --course 846088 --module labs
```

### Workflow 3: Download Single Week

```bash
uv run python run.py --course 846088 --module "Week 3"
```

### Workflow 4: Debug Scraping Issues

```bash
# Keep browser open to inspect
uv run python run.py --course 846088 --keep-open

# Dump HTML for analysis
uv run python run.py --course 846088 --dump-html
```

## Validation

After scraping, verify:

- [ ] Files downloaded to `data/{course_name}/`
- [ ] Module hierarchy preserved in directory structure
- [ ] `.content_hashes.json` created for change tracking
- [ ] `links.md` files contain external resources
- [ ] No duplicate downloads on re-run

## Troubleshooting

### Session Expired

**Symptom:** Redirected to login page

**Solution:**

```bash
cd .skills/learning-brightspace_scraper/scripts/brightspace
rm .session.json
cd ../..
uv run python run.py --login-only
```

### Missing Content

**Symptom:** Expected files not downloaded

**Solution:**

- Check if content is in sub-module (use `--keep-open` to inspect)
- Verify module filter isn't too restrictive
- Check HTML snapshots for content structure

### Download Button Not Found

**Symptom:** "No download button found" message

**Solution:**

- Content might be embedded (check HTML snapshot)
- Try without `--headless` to see browser behavior
- File might be in iframe or require special handling

### Rate Limiting

**Symptom:** Slow downloads or timeouts

**Solution:**

- Script includes random delays (1-3 seconds)
- Adjust `MIN_DELAY` and `MAX_DELAY` in script if needed

## Integration with Course Organization

After scraping, move content to course directories:

```bash
# Manual organization
Copy-Item -Recurse data/ml/Week\ 1/Slides/*.pdf courses/ml/slides/
```

## Best Practices

1. **Login once per session** - Session persists across runs
2. **Use module filters** - Faster and more targeted
3. **Run incrementally** - Only new/changed content is downloaded
4. **Check HTML snapshots** - Useful for debugging structure
5. **Keep browser open for debugging** - Use `--keep-open` when troubleshooting
6. **Organize after scraping** - Move from `data/` to `courses/` structure

## Dependencies

```bash
# Install with uv
uv add playwright

# Install browser
uv run playwright install chromium
```

## Advanced Usage

### Custom Course Mapping

Add new courses to `config.py`:

```python
COURSES = {
    "123456": "new-course",
}
```

### Modify Content Detection

Edit `_process_item()` method to handle new file types:

```python
file_types = ["pdf", "ppt", "pptx", "doc", "docx", "ipynb", "py"]
```

### Change Output Directory

Edit `config.py`:

```python
OUTPUT_DIR = Path("/custom/path/to/output")
```

**For implementation details:** See `scripts/brightspace/scraper.py` source code
