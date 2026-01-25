---
name: dev-markdown_check
description: Markdown format validation and quality checker. Use when (1) checking markdown syntax errors, (2) validating document structure, (3) fixing formatting issues, (4) ensuring markdown best practices, (5) reviewing generated markdown files.
---

# Markdown Format Checker

## Objectives

- Validate markdown syntax and structure
- Check for common formatting errors
- Ensure consistent style and conventions
- Verify links, images, and code blocks
- Improve markdown readability and quality

## Quick Validation

### Common Issues to Check

1. **Headings:**
   - [ ] Proper hierarchy (no skipped levels: H1 → H2 → H3)
   - [ ] Space after `#` symbols
   - [ ] Only one H1 per document
   - [ ] Consistent heading style

2. **Lists:**
   - [ ] Consistent bullet markers (`-`, `*`, or `+`)
   - [ ] Proper indentation (2 or 4 spaces)
   - [ ] Blank lines before/after lists
   - [ ] Nested lists properly indented

3. **Links:**
   - [ ] Valid syntax: `[text](url)`
   - [ ] No broken links
   - [ ] Relative paths correct
   - [ ] Reference-style links defined

4. **Images:**
   - [ ] Valid syntax: `![alt](path)`
   - [ ] Alt text provided
   - [ ] Image files exist
   - [ ] Paths are correct

5. **Code Blocks:**
   - [ ] Properly fenced with ` ``` `
   - [ ] Language specified for syntax highlighting
   - [ ] Closing fence present
   - [ ] Inline code uses single backticks

6. **Tables:**
   - [ ] Header row present
   - [ ] Separator row with `---`
   - [ ] Consistent column count
   - [ ] Proper alignment markers

7. **Formatting:**
   - [ ] No trailing whitespace
   - [ ] Consistent line endings
   - [ ] Blank line before/after blocks
   - [ ] Proper escaping of special characters

## Validation Workflow

### Step 1: Syntax Check

Read the markdown file and check for syntax errors:

````python
def check_markdown_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    issues = []
    in_code_block = False
    code_block_start = 0

    for i, line in enumerate(lines, 1):
        # Check code blocks
        if line.strip().startswith('```'):
            if in_code_block:
                in_code_block = False
            else:
                in_code_block = True
                code_block_start = i

        # Skip checks inside code blocks
        if in_code_block:
            continue

        # Check heading format
        if line.startswith('#'):
            if not line.startswith('# ') and len(line) > 1:
                issues.append(f"Line {i}: Missing space after # in heading")

        # Check list format
        if line.strip().startswith(('-', '*', '+')):
            if not line.strip()[1:2] == ' ':
                issues.append(f"Line {i}: Missing space after list marker")

        # Check trailing whitespace
        if line.rstrip() != line.rstrip('\n'):
            issues.append(f"Line {i}: Trailing whitespace")

    # Check unclosed code blocks
    if in_code_block:
        issues.append(f"Line {code_block_start}: Unclosed code block")

    return issues
````

### Step 2: Structure Check

Verify document structure:

```python
def check_structure(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []

    # Check heading hierarchy
    import re
    headings = re.findall(r'^(#{1,6})\s+(.+)$', content, re.MULTILINE)

    prev_level = 0
    for heading, text in headings:
        level = len(heading)

        # Check for skipped levels
        if level > prev_level + 1:
            issues.append(f"Heading '{text}': Skipped level (H{prev_level} → H{level})")

        # Check for multiple H1
        if level == 1 and prev_level == 1:
            issues.append(f"Multiple H1 headings found")

        prev_level = level

    return issues
```

### Step 3: Link Validation

Check all links:

```python
import os
from pathlib import Path

def check_links(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []
    base_dir = Path(file_path).parent

    # Find all markdown links
    import re
    links = re.findall(r'\[([^\]]+)\]\(([^\)]+)\)', content)

    for text, url in links:
        # Skip external URLs
        if url.startswith(('http://', 'https://', 'mailto:')):
            continue

        # Check relative file paths
        if not url.startswith('#'):
            file_path = base_dir / url
            if not file_path.exists():
                issues.append(f"Broken link: [{text}]({url})")

    return issues
```

## Common Fixes

### Fix Heading Hierarchy

```python
def fix_heading_hierarchy(content):
    """Ensure proper heading hierarchy"""
    lines = content.split('\n')
    fixed_lines = []
    prev_level = 0

    for line in lines:
        if line.startswith('#'):
            # Count heading level
            level = len(line) - len(line.lstrip('#'))

            # Fix skipped levels
            if level > prev_level + 1:
                level = prev_level + 1
                line = '#' * level + line.lstrip('#')

            prev_level = level

        fixed_lines.append(line)

    return '\n'.join(fixed_lines)
```

### Fix List Formatting

```python
def fix_list_formatting(content):
    """Ensure consistent list formatting"""
    lines = content.split('\n')
    fixed_lines = []

    for line in lines:
        # Fix list markers
        if line.strip().startswith(('-', '*', '+')):
            marker = line.strip()[0]
            rest = line.strip()[1:].lstrip()
            indent = len(line) - len(line.lstrip())
            fixed_lines.append(' ' * indent + f'{marker} {rest}')
        else:
            fixed_lines.append(line)

    return '\n'.join(fixed_lines)
```

### Remove Trailing Whitespace

```python
def remove_trailing_whitespace(content):
    """Remove trailing whitespace from all lines"""
    lines = content.split('\n')
    return '\n'.join(line.rstrip() for line in lines)
```

## Markdown Linters

### Use markdownlint (CLI)

```bash
# Install
npm install -g markdownlint-cli

# Check file
markdownlint document.md

# Fix automatically
markdownlint --fix document.md

# Check directory
markdownlint "**/*.md"
```

### Use remark (CLI)

```bash
# Install
npm install -g remark-cli remark-preset-lint-recommended

# Check file
remark document.md

# Fix automatically
remark document.md --output
```

### Python: markdown-it-py

```bash
uv add markdown-it-py
```

```python
from markdown_it import MarkdownIt

md = MarkdownIt()
tokens = md.parse(content)

# Validate structure
for token in tokens:
    print(f"{token.type}: {token.tag}")
```

## Best Practices

### 1. Consistent Style

- Use `-` for unordered lists
- Use `**bold**` not `__bold__`
- Use `*italic*` not `_italic_`
- Use fenced code blocks (` ``` `) not indented

### 2. Readability

- Add blank lines before/after headings
- Add blank lines before/after lists
- Add blank lines before/after code blocks
- Keep lines under 80-100 characters (optional)

### 3. Accessibility

- Provide alt text for all images
- Use descriptive link text (not "click here")
- Use proper heading hierarchy
- Add language to code blocks

### 4. Portability

- Use relative paths for local files
- Avoid platform-specific paths
- Use forward slashes `/` in paths
- Test on different markdown renderers

## Validation Checklist

Before finalizing markdown:

- [ ] Run markdown linter
- [ ] Check all headings follow hierarchy
- [ ] Verify all links work
- [ ] Confirm all images display
- [ ] Test code blocks render correctly
- [ ] Check tables are properly formatted
- [ ] Remove trailing whitespace
- [ ] Ensure consistent list formatting
- [ ] Verify proper blank line spacing
- [ ] Test rendering in target platform

## Quick Fix Script

```python
def quick_fix_markdown(file_path):
    """Apply common fixes to markdown file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply fixes
    content = remove_trailing_whitespace(content)
    content = fix_list_formatting(content)
    content = fix_heading_hierarchy(content)

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Fixed: {file_path}")
```

## Integration with PDF Converter

After converting PDF to markdown:

1. Run syntax check
2. Fix common issues automatically
3. Validate structure
4. Check links and images
5. Generate validation report

## Output Format

```markdown
# Markdown Validation Report

**File:** `document.md`
**Date:** 2024-01-20

## Summary

- ✓ Syntax: Valid
- ⚠ Structure: 2 issues
- ✗ Links: 1 broken link
- ✓ Images: All valid

## Issues Found

### Structure Issues

1. Line 45: Skipped heading level (H2 → H4)
2. Line 78: Multiple H1 headings

### Broken Links

1. Line 123: `[Guide](../missing.md)` - File not found

## Recommendations

1. Fix heading hierarchy at line 45
2. Change second H1 to H2
3. Update or remove broken link at line 123
```

## Tools Reference

| Tool           | Purpose               | Installation                      |
| -------------- | --------------------- | --------------------------------- |
| markdownlint   | Comprehensive linting | `npm install -g markdownlint-cli` |
| remark         | Markdown processor    | `npm install -g remark-cli`       |
| markdown-it-py | Python parser         | `uv add markdown-it-py`           |
| mdformat       | Python formatter      | `uv add mdformat`                 |

**For detailed linting rules:** See `references/linting_rules.md`
**For style guide:** See `references/style_guide.md`
