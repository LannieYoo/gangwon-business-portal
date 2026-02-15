---
name: dev-pptx_to_md
description: PPTX to Markdown 转换。Use when (1) 将 .pptx 转换为 .md, (2) 提取 PPT 内容和截图, (3) 需求文档/修改事项 PPTX 解析, (4) 包含标注截图的 PPTX 处理, (5) 批量转换演示文稿
---

# PPTX to Markdown Converter

## Pipeline

This skill chains two existing skills in sequence:

```
PPTX → [dev-pptx_to_pdf] → PDF → [dev-pdf_processing] → Markdown (with page images + text)
```

## Steps

### Step 1: PPTX → PDF

Use the `dev-pptx_to_pdf` skill script:

```bash
python .agent/skills/dev-pptx_to_pdf/scripts/convert_single.py <input.pptx> [output.pdf] [--method windows|libreoffice]
```

- **Windows (default)**: Uses PowerPoint COM via `comtypes`
- **LibreOffice fallback**: `--method libreoffice`

See: `.agent/skills/dev-pptx_to_pdf/SKILL.md` for full details.

### Step 2: PDF → Markdown (with page images)

Use the `dev-pdf_processing` skill script:

```bash
python .agent/skills/dev-pdf_processing/scripts/pdf_to_image_md.py <input.pdf> [output.md] [--dpi 200]
```

This creates:

- `{stem}_pages/` — directory of page images (PNG)
- `{stem}.md` — markdown with embedded image links + extracted text

See: `.agent/skills/dev-pdf_processing/SKILL.md` for full details.

## Quick Text-Only Extraction (No PDF Needed)

If you only need text (no screenshots), use `python-pptx` directly:

```python
from pptx import Presentation

prs = Presentation("input.pptx")
for i, slide in enumerate(prs.slides, 1):
    print(f"=== Slide {i} ===")
    for shape in slide.shapes:
        if hasattr(shape, "text") and shape.text.strip():
            print(shape.text)
```

## Output Format (Project Convention)

For this project's requirements documents (창업톡 수정사항 series), the output markdown follows this format:

```markdown
# Document Title

**Source:** `filename.pptx`
**Total Pages:** N
**Format:** Page Image + OCR Text

---

## Page 1

### 📷 Page Image

![Page 1](pages/page_001.png)

### 📝 Text Content

(extracted text)

### ✍️ Notes

> **需求 #1**: (需求描述)
> **原文**: (Korean original text)
> **翻译**: (Chinese translation)
> **实施**: ⬜ 未开始
> **优先级**: 高/中/低
```

## Notes Section Guidelines

After generating the raw markdown, **manually annotate** each page's `### ✍️ Notes`:

1. **需求 #N** — Sequential requirement number
2. **原文** — Korean text from the slide
3. **翻译** — Chinese translation
4. **涉及文件** — Affected source code files
5. **实施状态**: ⬜ 未开始 / 🔄 进行中 / ✅ 已完成
6. **优先级**: 高 / 中 / 低

## Project-Specific Conventions

- **Always use the screenshot pipeline** (Step 1 + Step 2) for requirements docs — visual context (arrows, circles, highlights) is critical
- **Output naming**: `{stem}_截图版.md`
- **Notes in Chinese** (项目惯例)
- **Reference**: `docs/requirements/archived/bug_fix_2026-02-01/창업톡_수정사항_260130_截图版.md`

## Related Skills

- `dev-pptx_to_pdf` — Step 1: PPTX → PDF conversion
- `dev-pdf_processing` — Step 2: PDF → page images + markdown
- `dev-docx_to_md` — Word document to Markdown conversion
- `dev-translation` — Bilingual content translation
