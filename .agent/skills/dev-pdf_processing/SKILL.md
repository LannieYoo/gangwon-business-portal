---
name: dev-pdf_processing
description: Comprehensive PDF processing toolkit. Use when (1) extracting text/tables from PDFs, (2) converting PDF to markdown, (3) creating bilingual documentation, (4) processing academic materials, (5) filling PDF forms, (6) merging/splitting PDFs, (7) creating new PDFs programmatically.
---

# PDF Processing Assistant

## Objectives

- Extract text and tables from PDF files accurately
- Convert PDF to clean markdown format
- Generate bilingual (中英文) documentation for academic materials
- Fill PDF forms programmatically
- Merge, split, and manipulate PDF documents
- Create new PDFs with reportlab
- Handle scanned PDFs with OCR
- Preserve structure (headings, tables, formulas)

## Library Selection Guide

Choose the right tool for your task:

| Task               | Best Library                | Why                        |
| ------------------ | --------------------------- | -------------------------- |
| Extract text       | `pdfplumber`                | Best layout preservation   |
| Extract tables     | `pdfplumber`                | Excellent table detection  |
| Merge/split PDFs   | `pypdf`                     | Fast and lightweight       |
| Create PDFs        | `reportlab`                 | Professional output        |
| Fill forms         | `pypdf` or `pdf-lib` (JS)   | Form field support         |
| Extract images     | `pdfimages` (CLI)           | Fastest, preserves quality |
| OCR scanned PDFs   | `pytesseract` + `pdf2image` | Industry standard          |
| High-res rendering | `pypdfium2`                 | Chromium's PDF engine      |

## Core Workflows

### 1. Quick Text Extraction

**Install dependencies:**

```bash
uv add pypdf pdfplumber pymupdf  # Core libraries
uv add pytesseract pdf2image     # For OCR (optional)
```

**Basic extraction:**

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()
```

**Better extraction with pdfplumber:**

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

### 2. Extract Tables

**Using pdfplumber:**

```python
import pdfplumber
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

    if all_tables:
        combined_df = pd.concat(all_tables, ignore_index=True)
        combined_df.to_excel("extracted_tables.xlsx", index=False)
```

**For complex tables:** See `references/advanced_techniques.md` for custom settings

### 3. Merge and Split PDFs

**Merge:**

```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

**Split:**

```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

**For command-line alternatives:** See `references/cli_tools.md`

### 4. Fill PDF Forms

**Check and fill fields:**

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("form.pdf")
if reader.get_form_text_fields():
    writer = PdfWriter()
    writer.append_pages_from_reader(reader)
    writer.update_page_form_field_values(
        writer.pages[0],
        {"field_name": "John Doe", "email": "john@example.com"}
    )
    with open("filled_form.pdf", "wb") as output:
        writer.write(output)
```

**For complex forms:** See official Anthropic PDF skill's `forms.md`

### 5. Create New PDFs

**Basic creation:**

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("output.pdf", pagesize=letter)
width, height = letter
c.drawString(100, height - 100, "Hello World!")
c.save()
```

**For professional reports with tables:** See `references/advanced_techniques.md`

### 6. OCR for Scanned PDFs

```python
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')
text = ""
for i, image in enumerate(images):
    text += pytesseract.image_to_string(image)
```

### 7. Extract Images

**Command-line (fastest):**

```bash
pdfimages -all document.pdf images/img
```

**Python approach:**

```python
import fitz  # PyMuPDF

pdf_document = fitz.open("document.pdf")
for page_num in range(len(pdf_document)):
    page = pdf_document[page_num]
    for img_index, img in enumerate(page.get_images()):
        xref = img[0]
        base_image = pdf_document.extract_image(xref)
        with open(f"page{page_num}_img{img_index}.{base_image['ext']}", "wb") as f:
            f.write(base_image["image"])
```

### 8. Convert PDF to Markdown (Academic Materials)

**Use our unified converter:**

```bash
# Basic conversion
uv run python scripts/pdf_converter.py lecture.pdf

# Bilingual template
uv run python scripts/pdf_converter.py lecture.pdf --bilingual

# Custom output
uv run python scripts/pdf_converter.py lecture.pdf -o notes/lecture1.md
```

**Script location:** `backend/scripts/data/skills/dev-pdf_processing/scripts/pdf_converter.py`

### 9. Bilingual Documentation

**Two approaches:**

**A. Side-by-side:**

```markdown
## Concept Name | 概念名称

English explanation... | 中文解释...
```

**B. Separate sections:**

```markdown
## English Version

Content...

---

## 中文版本

中文内容...
```

**Translation workflow:**

1. Extract English content from PDF
2. Use LLM to translate technical terms accurately
3. Preserve code blocks, formulas, and tables
4. Format as bilingual markdown

## Key Instructions

### PDF Extraction Best Practices

1. **Choose the right library:**
   - `pypdf`: Fast, basic text extraction
   - `pdfplumber`: Better for tables and layout
   - `PyMuPDF (fitz)`: Best for images, complex layouts
   - `pdf2image` + `pytesseract`: For OCR on scanned PDFs

2. **Handle different content types:**
   - **Images:** Use PyMuPDF, save to `{pdf_name}_images/` folder
   - **Tables:** Use `pdfplumber.extract_tables()`, convert to markdown
   - **Formulas:** Wrap in code blocks or LaTeX: `` `formula` `` or `$formula$`

3. **Preserve structure:**
   - Add page markers: `## Page N`
   - Use horizontal rules: `---`
   - Maintain heading hierarchy

### Bilingual Conversion

1. **Technical term consistency:**
   - Create glossary for key terms
   - Use standard translations (e.g., PCA → 主成分分析)
   - Keep English terms in parentheses: "主成分分析 (PCA)"

2. **Formula handling:**
   - Keep mathematical notation in English
   - Translate variable descriptions

3. **Code preservation:**
   - Never translate code blocks
   - Add bilingual explanations around code

### Quality Checks

- [ ] All pages extracted successfully
- [ ] Tables formatted correctly
- [ ] Formulas preserved or noted
- [ ] Bilingual terms consistent
- [ ] Markdown syntax valid

## Common Patterns

### Pattern 1: Course Material → Study Notes

```bash
uv run python scripts/pdf_converter.py course.pdf --bilingual
```

Workflow: Extract → Convert to markdown → Add notes → Create bilingual version

### Pattern 2: Academic Paper → Summary

Extract abstract, sections, conclusions → Translate → Create side-by-side comparison

### Pattern 3: Slides → Interactive Notes

Extract content → Expand bullet points → Add code examples → Create practice questions

## File Organization

```
course/
├── slides/
│   └── lecture1.pdf          # Original PDF
├── notes/
│   ├── lecture1_extracted.md # Raw extraction
│   └── lecture1_bilingual.md # Bilingual version
└── labs/
    └── lab1_practice.py      # Practice code
```

## Quick Reference

| Task           | Best Tool          | Command/Code                      |
| -------------- | ------------------ | --------------------------------- |
| Extract text   | `pdfplumber`       | `page.extract_text()`             |
| Extract tables | `pdfplumber`       | `page.extract_tables()`           |
| Merge PDFs     | `pypdf` or `qpdf`  | See workflows above               |
| Fill forms     | `pypdf`            | `update_page_form_field_values()` |
| Create PDFs    | `reportlab`        | Canvas or Platypus                |
| OCR scanned    | `pytesseract`      | Convert to image first            |
| Extract images | `pdfimages` (CLI)  | `pdfimages -all input.pdf output` |
| Convert to MD  | `pdf_converter.py` | See workflow 8 above              |

## Advanced Topics

**For detailed techniques, see:**

- `references/advanced_techniques.md` - Password protection, watermarks, batch processing, metadata extraction
- `references/cli_tools.md` - Complete command-line tools reference (qpdf, pdftotext, pdftoppm, pdfimages)

## Next Steps

- Use `pdf_converter.py` for academic material conversion
- Check official Anthropic PDF skill for form filling: `backend/scripts/discover/raw_data/ai_skills/skills/pdf/`
- Install command-line tools: `apt-get install poppler-utils` (Linux) or `brew install poppler` (Mac)
