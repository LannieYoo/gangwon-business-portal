---
name: learning-md_to_docx
description: Convert markdown lab reports to Word documents with proper formatting. Use when (1) user needs to submit .docx, (2) mentions "转docx" or "convert to word", (3) preparing lab submission.
---

# Learning Markdown to DOCX Converter

## Objectives

- Convert .md files to .docx with proper formatting
- Preserve images, tables, and code blocks
- Apply academic document styling

## Instructions

### 1. Use Python-docx or Pandoc

**Recommended: Pandoc (more reliable)**

```bash
pandoc input.md -o output.docx --reference-doc=template.docx
```

**Alternative: Python script with python-docx**

```python
from docx import Document
from docx.shared import Inches, Pt
import markdown
```

### 2. Formatting Requirements

**Document structure:**

- Title: Bold, 16pt
- Student info: Name, ID, Section, Date
- Headings: Hierarchical (Heading 1, 2, 3)
- Body text: 11pt, single spacing
- Code blocks: Courier New, 10pt, gray background
- Images: Centered, with captions

**Image handling:**

- Convert relative paths to absolute before processing
- Resize images to fit page width (max 6 inches)
- Add figure captions below images
- Maintain aspect ratio

### 3. Conversion Steps

1. **Pre-process markdown:**
   - Resolve relative image paths
   - Clean up formatting inconsistencies
   - Verify all images exist

2. **Convert to DOCX:**
   - Use pandoc or python-docx
   - Apply formatting rules
   - Insert images with proper sizing

3. **Post-process DOCX:**
   - Verify all images display correctly
   - Check page breaks
   - Ensure consistent formatting
   - Add page numbers if required

### 4. Pandoc Command Examples

**Basic conversion:**

```bash
pandoc Lab1_Template.md -o Lab1.docx
```

**With custom styling:**

```bash
pandoc Lab1_Template.md -o Lab1.docx \
  --reference-doc=academic_template.docx \
  --toc \
  --number-sections
```

**With metadata:**

```bash
pandoc Lab1_Template.md -o Lab1.docx \
  -M title="Lab 1: Zipf's Law" \
  -M author="Student Name" \
  -M date="2026-01-20"
```

### 5. Using the Conversion Script

**A ready-to-use script is available:** `scripts/convert_md_to_docx.py`

**Usage:**

```bash
# Basic conversion
python scripts/convert_md_to_docx.py Lab1_Template.md

# Specify output filename
python scripts/convert_md_to_docx.py Lab1_Template.md Lab1.docx

# The script will:
# - Auto-download pandoc if needed
# - Handle relative image paths
# - Provide validation checklist
```

**Features:**

- Automatic pandoc installation
- Relative path resolution for images
- Error handling and troubleshooting tips
- Validation checklist after conversion

## Validation

**Check the generated .docx:**

- [ ] All images display correctly
- [ ] Headings are properly formatted
- [ ] Code blocks are readable
- [ ] Tables are formatted correctly
- [ ] Page layout is appropriate
- [ ] File size is reasonable (<10MB)

## Common Issues

- **Missing images**: Ensure all image paths are resolved before conversion
- **Broken formatting**: Use `--reference-doc` with proper template
- **Large file size**: Compress images before conversion
- **Chinese characters**: Ensure UTF-8 encoding: `pandoc -f markdown+east_asian_line_breaks`

## Installation

**Pandoc:**

```bash
# Windows (using chocolatey)
choco install pandoc

# Or download from: https://pandoc.org/installing.html
```

**Python packages:**

```bash
pip install pypandoc python-docx
```
