# PPTX to PDF Conversion Skill

Convert PowerPoint presentations to PDF format with high quality and flexibility.

## Quick Start

### Single File Conversion

**Windows (with PowerPoint):**
```powershell
uv add comtypes
uv run python .skills/dev-pptx_to_pdf/scripts/convert_single.py lecture.pptx
```

**Cross-Platform (with LibreOffice):**
```powershell
uv run python .skills/dev-pptx_to_pdf/scripts/convert_single.py lecture.pptx --method libreoffice
```

### Batch Conversion

```powershell
# Convert all PPTX files in a directory
uv run python .skills/dev-pptx_to_pdf/scripts/batch_convert.py slides/ pdf_output/

# With LibreOffice
uv run python .skills/dev-pptx_to_pdf/scripts/batch_convert.py slides/ pdf_output/ --method libreoffice

# Recursive search
uv run python .skills/dev-pptx_to_pdf/scripts/batch_convert.py courses/ --recursive
```

## Methods

### 1. Windows PowerPoint (Best Quality)
- Requires: Microsoft Office installed
- Quality: Excellent (native conversion)
- Speed: Moderate
- Package: `comtypes`

### 2. LibreOffice (Free, Cross-Platform)
- Requires: LibreOffice installed
- Quality: Good (minor formatting differences possible)
- Speed: Fast
- Package: None (uses command line)

## Installation

### Windows PowerPoint Method
```powershell
uv add comtypes
```

### LibreOffice Method
1. Download LibreOffice: https://www.libreoffice.org/
2. Install and add to PATH
3. Verify: `soffice --version`

## Common Use Cases

1. **Course Materials**: Convert lecture slides to PDF for distribution
2. **Archiving**: Create permanent PDF copies of presentations
3. **Printing**: Generate print-ready PDFs
4. **Sharing**: Create universal format for viewing without PowerPoint

## Troubleshooting

**PowerPoint not found:**
- Install Microsoft Office or use LibreOffice method

**soffice command not found:**
- Add LibreOffice to PATH or use full path to executable

**Formatting issues:**
- Use native PowerPoint method on Windows for best results
- Test with sample files first

## Related Skills

- `dev-pdf_processing` - PDF manipulation
- `dev-docx_to_md` - Document conversion
- `learning-assignment_document` - Creating submission documents
