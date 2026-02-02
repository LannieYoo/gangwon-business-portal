---
name: docx-to-md
description: Word 文档转 Markdown。Use when (1) 将 .docx 转换为 .md, (2) 提取 Word 文档内容, (3) 批量转换文档, (4) 保留格式和图片, (5) 自动化文档处理
---

# DOCX to Markdown Converter

## Objectives

- Convert Word documents (.docx) to Markdown (.md)
- Preserve formatting (headings, lists, tables, bold, italic)
- Extract and save embedded images
- Handle batch conversions
- Support template-based conversions

## Core Strategy

### 1. Use Mammoth (Python)

**Mammoth is the recommended tool:**
- Pure Python solution - no external dependencies
- Good conversion quality
- Easy to customize
- Works cross-platform
- **CRITICAL: Preserves original content exactly - no modifications**

### 2. Python with Mammoth

**CRITICAL: Only convert format, never modify content.**

```python
import mammoth
from pathlib import Path

def docx_to_md_mammoth(docx_path: Path, md_path: Path):
    """
    Convert DOCX to Markdown using mammoth.
    
    CRITICAL: This function only converts format.
    It does NOT modify any content, titles, or text.
    """
    with open(docx_path, 'rb') as docx_file:
        result = mammoth.convert_to_markdown(docx_file)
        md_path.write_text(result.value, encoding='utf-8')
    
    # Print warnings
    for message in result.messages:
        print(f"Warning: {message}")
    
    return md_path
```

### 3. Installation

```bash
# Install mammoth
uv add mammoth
```

### 4. Batch Conversion

```python
from pathlib import Path
import mammoth

def batch_convert(input_dir: Path, output_dir: Path):
    """Convert all DOCX files in directory."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for docx_file in input_dir.glob('*.docx'):
        if docx_file.name.startswith('~$'):  # Skip temp files
            continue
        
        md_file = output_dir / f"{docx_file.stem}.md"
        
        with open(docx_file, 'rb') as f:
            result = mammoth.convert_to_markdown(f)
            md_file.write_text(result.value, encoding='utf-8')
        
        print(f"✓ Converted: {docx_file.name} -> {md_file.name}")
```

## Common Patterns

### Pattern 1: Convert with Image Insertion

```python
import subprocess
from pathlib import Path

def convert_with_images(docx_path: Path, output_dir: Path):
    """Convert DOCX and organize images."""
    md_path = output_dir / f"{docx_path.stem}.md"
    images_dir = output_dir / 'images'
    
    # Convert
    subprocess.run([
        'pandoc',
        str(docx_path),
        '-o', str(md_path),
        '--extract-media', str(images_dir)
    ])
    
    # Update image paths in markdown
    content = md_path.read_text(encoding='utf-8')
    content = content.replace('](media/', '](images/')
    md_path.write_text(content, encoding='utf-8')
    
    return md_path
```

### Pattern 2: Template-Based Conversion

```python
def convert_lab_template(docx_path: Path, output_path: Path):
    """Convert lab answer document with specific formatting."""
    # Convert
    subprocess.run([
        'pandoc',
        str(docx_path),
        '-o', str(output_path),
        '--wrap=none',
        '--atx-headers'
    ])
    
    # Post-process: Add front matter
    content = output_path.read_text(encoding='utf-8')
    
    front_matter = """---
title: Lab Assignment
author: Your Name
date: 2026-01-22
---

"""
    
    output_path.write_text(front_matter + content, encoding='utf-8')
```

### Pattern 3: Auto-Insert Screenshots

```python
def insert_screenshots(md_path: Path, images_dir: Path):
    """Automatically insert screenshots into markdown."""
    content = md_path.read_text(encoding='utf-8')
    
    # Find all image files
    images = sorted(images_dir.glob('*.png'))
    
    # Insert images at appropriate locations
    for i, img in enumerate(images, 1):
        marker = f"<!-- INSERT_IMAGE_{i} -->"
        if marker in content:
            img_markdown = f"![Step {i}]({img.relative_to(md_path.parent)})\n"
            content = content.replace(marker, img_markdown)
    
    md_path.write_text(content, encoding='utf-8')
```

## Installation

```bash
# Install mammoth
uv add mammoth
```

## Common Issues

**Images not extracted** → Mammoth converts images to base64 embedded in markdown

**Chinese characters garbled** → Ensure UTF-8 encoding when writing file

**Tables broken** → Mammoth handles simple tables, complex tables may need manual adjustment

**Formatting lost** → Mammoth preserves basic formatting (bold, italic, headings, lists)

**Temp files (~$*.docx)** → Skip files starting with `~$` in batch processing

## Helper Scripts

Use provided scripts for common tasks:

```bash
# Convert single file
uv run python .skills/dev-docx_to_md/scripts/convert_docx_mammoth.py input.docx output.md

# Batch convert
uv run python .skills/dev-docx_to_md/scripts/batch_convert.py input_dir/ output_dir/
```

## References

**For detailed examples:** See `references/examples.md`

**For pandoc filters:** See `references/filters.md`

**For troubleshooting:** See `references/troubleshooting.md`

## Quick Reference

```bash
# Install
uv add mammoth

# Convert single file (Python)
uv run python -c "import mammoth; print(mammoth.convert_to_markdown(open('input.docx', 'rb')).value)" > output.md

# Or use helper script
uv run python .skills/dev-docx_to_md/scripts/convert_docx_mammoth.py input.docx output.md
```
