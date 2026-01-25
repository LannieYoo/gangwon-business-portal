---
name: dev-pdf_ocr
description: Extract text from image-based PDFs using OCR. Use when (1) PDF contains scanned images or screenshots, (2) standard text extraction returns empty, (3) need to read diagrams with text, (4) processing architecture diagrams or flowcharts.
---

# PDF OCR Processing

## Objectives

- Convert image-based PDF pages to PNG format
- Apply OCR to extract text from images
- Handle multi-page PDFs efficiently
- Support both English and Chinese text recognition
- Preserve page structure in output

## Prerequisites

Install required dependencies:

```bash
uv add pymupdf pillow pytesseract
```

**Note:** Tesseract OCR engine must be installed on system:
- Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
- Linux: `apt-get install tesseract-ocr tesseract-ocr-chi-sim`
- Mac: `brew install tesseract tesseract-lang`

## Core Workflow

### Step 1: Convert PDF to PNG Images

Use PyMuPDF (fitz) to render PDF pages as high-resolution images:

```python
import fitz  # PyMuPDF
from pathlib import Path

def pdf_to_images(pdf_path: str, output_dir: str = "temp_images", dpi: int = 300):
    """Convert PDF pages to PNG images."""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    doc = fitz.open(pdf_path)
    image_paths = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        # Render at high DPI for better OCR accuracy
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)
        
        img_path = output_path / f"page_{page_num + 1}.png"
        pix.save(str(img_path))
        image_paths.append(img_path)
    
    doc.close()
    return image_paths
```

### Step 2: Apply OCR to Images

Use pytesseract to extract text from each image:

```python
import pytesseract
from PIL import Image

def ocr_image(image_path: str, lang: str = "eng+chi_sim") -> str:
    """Extract text from image using OCR."""
    img = Image.open(image_path)
    
    # Configure OCR parameters
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(img, lang=lang, config=custom_config)
    
    return text
```

### Step 3: Complete Pipeline

Combine both steps:

```python
def extract_text_from_pdf_ocr(pdf_path: str, lang: str = "eng+chi_sim") -> str:
    """Complete OCR pipeline for image-based PDFs."""
    # Convert PDF to images
    image_paths = pdf_to_images(pdf_path)
    
    # Extract text from each page
    full_text = ""
    for i, img_path in enumerate(image_paths, 1):
        print(f"Processing page {i}/{len(image_paths)}...")
        page_text = ocr_image(str(img_path), lang=lang)
        full_text += f"\n\n=== Page {i} ===\n\n{page_text}"
    
    # Cleanup temporary images
    import shutil
    shutil.rmtree("temp_images", ignore_errors=True)
    
    return full_text
```

## Usage Examples

### Basic Usage

```python
# Extract text from image-based PDF
text = extract_text_from_pdf_ocr("docs/Architecture.pdf")
print(text)
```

### Save to File

```python
text = extract_text_from_pdf_ocr("docs/Architecture.pdf")
with open("docs/Architecture_extracted.txt", "w", encoding="utf-8") as f:
    f.write(text)
```

### Bilingual Documents

```python
# For documents with both English and Chinese
text = extract_text_from_pdf_ocr("document.pdf", lang="eng+chi_sim")
```

### English Only

```python
# Faster processing for English-only documents
text = extract_text_from_pdf_ocr("document.pdf", lang="eng")
```

## OCR Parameters

### Language Codes

- `eng` - English
- `chi_sim` - Simplified Chinese
- `chi_tra` - Traditional Chinese
- `fra` - French
- `eng+chi_sim` - English + Chinese (recommended for mixed documents)

### PSM Modes (Page Segmentation)

- `--psm 3` - Fully automatic (default)
- `--psm 6` - Uniform block of text (recommended for documents)
- `--psm 11` - Sparse text (for diagrams with labels)
- `--psm 12` - Sparse text with OSD (orientation detection)

### OEM Modes (OCR Engine)

- `--oem 3` - Default, based on what is available (recommended)
- `--oem 1` - Neural nets LSTM engine only
- `--oem 0` - Legacy engine only

## Quality Optimization

### Improve OCR Accuracy

1. **Increase DPI**: Use 300-600 DPI for better quality
   ```python
   pdf_to_images(pdf_path, dpi=600)
   ```

2. **Preprocess images**: Apply filters before OCR
   ```python
   from PIL import ImageEnhance, ImageFilter
   
   img = Image.open(image_path)
   img = img.convert('L')  # Grayscale
   img = img.filter(ImageFilter.SHARPEN)  # Sharpen
   enhancer = ImageEnhance.Contrast(img)
   img = enhancer.enhance(2)  # Increase contrast
   ```

3. **Use appropriate PSM mode**: Match document layout
   ```python
   custom_config = r'--oem 3 --psm 6'  # For standard documents
   ```

## Validation

Check OCR output quality:

- [ ] Text is readable and makes sense
- [ ] Page numbers are correctly identified
- [ ] Special characters are preserved
- [ ] Chinese characters (if any) are correctly recognized
- [ ] No excessive garbage characters

## Common Issues

### Issue: Empty or garbled output

**Solution:** Check Tesseract installation and language data:
```bash
tesseract --list-langs  # Should show installed languages
```

### Issue: Poor accuracy

**Solutions:**
1. Increase DPI to 600
2. Apply image preprocessing (contrast, sharpening)
3. Use correct PSM mode for document type
4. Ensure correct language pack is installed

### Issue: Slow processing

**Solutions:**
1. Reduce DPI to 200-300
2. Process pages in parallel (use multiprocessing)
3. Use `--psm 6` instead of `--psm 3`

## Integration with Existing Code

For the Ottawa GenAI project, integrate into document service:

```python
# In backend/app/services/document_service.py

def _extract_text_from_pdf(self, file_path: str) -> str:
    """Extract text from PDF, with OCR fallback."""
    # Try standard extraction first
    text = self._standard_pdf_extraction(file_path)
    
    # If empty or too short, use OCR
    if not text or len(text.strip()) < 100:
        logger.info(f"Standard extraction failed, using OCR for {file_path}")
        text = extract_text_from_pdf_ocr(file_path)
    
    return text
```

## Performance Considerations

- **Memory**: Each page image ~5-10MB at 300 DPI
- **Speed**: ~2-5 seconds per page depending on complexity
- **Disk**: Temporary images stored in `temp_images/` (auto-cleaned)

For large PDFs (>50 pages), consider:
- Processing in batches
- Using multiprocessing
- Streaming results instead of loading all in memory

## Next Steps

After extracting text:
1. Clean and normalize text (remove extra whitespace)
2. Split into chunks for vector storage
3. Extract metadata (page numbers, sections)
4. Store in document repository

**For advanced preprocessing techniques:** See `references/image_preprocessing.md` (to be created)
