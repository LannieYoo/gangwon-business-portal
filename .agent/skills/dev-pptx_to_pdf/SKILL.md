# PPTX to PDF Conversion Skill

## Objectives

Convert PowerPoint presentations (PPTX/PPT) to PDF format efficiently while preserving formatting, layout, and visual quality.

## Use Cases

- Convert course slides to PDF for easier sharing and viewing
- Archive presentations in a universal format
- Prepare presentation materials for printing
- Create read-only versions of slides
- Batch convert multiple presentations
- Generate PDFs with notes or handouts layout

## Key Capabilities

1. **Single File Conversion** - Convert individual PPTX files to PDF
2. **Batch Processing** - Convert multiple presentations at once
3. **Layout Options** - Slides only, notes pages, or handouts
4. **Quality Control** - Adjust resolution and compression
5. **Cross-Platform** - Works on Windows, macOS, and Linux

## Instructions

### Method Selection

Choose the appropriate method based on your environment:

**Windows (Recommended):**
- Use `comtypes` with Microsoft PowerPoint (if installed)
- Use `unoconv` with LibreOffice (free alternative)

**macOS:**
- Use AppleScript with Keynote/PowerPoint
- Use `unoconv` with LibreOffice

**Linux:**
- Use `unoconv` with LibreOffice
- Use `libreoffice --headless` command

**Cross-Platform (Python):**
- Use `python-pptx` + `reportlab` (limited formatting)
- Use `aspose-slides` (commercial, high quality)

### Implementation Approach

#### Option 1: Windows with PowerPoint (Best Quality)

```python
import comtypes.client
from pathlib import Path

def pptx_to_pdf_windows(pptx_path: str, pdf_path: str = None):
    """
    Convert PPTX to PDF using Microsoft PowerPoint on Windows.
    
    Args:
        pptx_path: Path to input PPTX file
        pdf_path: Path to output PDF file (optional)
    """
    pptx_path = Path(pptx_path).resolve()
    if pdf_path is None:
        pdf_path = pptx_path.with_suffix('.pdf')
    else:
        pdf_path = Path(pdf_path).resolve()
    
    # Initialize PowerPoint
    powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
    powerpoint.Visible = 1
    
    try:
        # Open presentation
        presentation = powerpoint.Presentations.Open(str(pptx_path))
        
        # Save as PDF (format 32 = PDF)
        presentation.SaveAs(str(pdf_path), 32)
        
        # Close presentation
        presentation.Close()
        
        print(f"✓ Converted: {pptx_path.name} → {pdf_path.name}")
        
    finally:
        powerpoint.Quit()
```

**Required Package:**
```powershell
uv add comtypes
```

#### Option 2: LibreOffice (Cross-Platform, Free)

```python
import subprocess
from pathlib import Path

def pptx_to_pdf_libreoffice(pptx_path: str, output_dir: str = None):
    """
    Convert PPTX to PDF using LibreOffice.
    
    Args:
        pptx_path: Path to input PPTX file
        output_dir: Output directory (optional, defaults to same as input)
    """
    pptx_path = Path(pptx_path).resolve()
    if output_dir is None:
        output_dir = pptx_path.parent
    else:
        output_dir = Path(output_dir).resolve()
    
    # LibreOffice command
    cmd = [
        'soffice',  # or 'libreoffice' on some systems
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', str(output_dir),
        str(pptx_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        pdf_path = output_dir / pptx_path.with_suffix('.pdf').name
        print(f"✓ Converted: {pptx_path.name} → {pdf_path.name}")
        return pdf_path
    else:
        print(f"✗ Error: {result.stderr}")
        return None
```

**Installation:**
- Windows: Download from https://www.libreoffice.org/
- Add LibreOffice to PATH or use full path to `soffice.exe`

#### Option 3: Batch Conversion

```python
from pathlib import Path
from typing import List

def batch_convert_pptx_to_pdf(
    input_dir: str,
    output_dir: str = None,
    pattern: str = "*.pptx",
    method: str = "windows"
):
    """
    Batch convert multiple PPTX files to PDF.
    
    Args:
        input_dir: Directory containing PPTX files
        output_dir: Output directory (optional)
        pattern: File pattern to match (default: *.pptx)
        method: Conversion method ('windows' or 'libreoffice')
    """
    input_dir = Path(input_dir)
    if output_dir is None:
        output_dir = input_dir
    else:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # Find all PPTX files
    pptx_files = list(input_dir.glob(pattern))
    
    if not pptx_files:
        print(f"No files matching '{pattern}' found in {input_dir}")
        return
    
    print(f"Found {len(pptx_files)} files to convert\n")
    
    # Convert each file
    for i, pptx_file in enumerate(pptx_files, 1):
        print(f"[{i}/{len(pptx_files)}] Converting {pptx_file.name}...")
        
        try:
            if method == "windows":
                pdf_path = output_dir / pptx_file.with_suffix('.pdf').name
                pptx_to_pdf_windows(str(pptx_file), str(pdf_path))
            elif method == "libreoffice":
                pptx_to_pdf_libreoffice(str(pptx_file), str(output_dir))
            else:
                print(f"Unknown method: {method}")
                
        except Exception as e:
            print(f"✗ Failed: {pptx_file.name} - {e}")
    
    print(f"\n✓ Batch conversion complete!")
```

### Usage Examples

**Single File:**
```python
# Windows with PowerPoint
pptx_to_pdf_windows("lecture_01.pptx")

# LibreOffice
pptx_to_pdf_libreoffice("lecture_01.pptx")
```

**Batch Conversion:**
```python
# Convert all PPTX in a directory
batch_convert_pptx_to_pdf(
    input_dir="courses/ml/slides",
    output_dir="courses/ml/slides_pdf",
    method="windows"
)
```

**Command Line (LibreOffice):**
```powershell
# Single file
soffice --headless --convert-to pdf --outdir output_folder input.pptx

# Batch (PowerShell)
Get-ChildItem *.pptx | ForEach-Object {
    soffice --headless --convert-to pdf --outdir pdf_output $_.FullName
}
```

## Best Practices

1. **Quality Preservation**
   - Use native PowerPoint conversion on Windows for best quality
   - LibreOffice may have minor formatting differences
   - Test with sample files first

2. **File Organization**
   - Keep original PPTX files
   - Use separate output directory for PDFs
   - Maintain consistent naming conventions

3. **Batch Processing**
   - Process files in smaller batches for large collections
   - Verify output quality periodically
   - Handle errors gracefully

4. **Performance**
   - Close other applications when converting large files
   - LibreOffice headless mode is faster than GUI
   - Consider parallel processing for many files

5. **Troubleshooting**
   - Ensure PowerPoint/LibreOffice is properly installed
   - Check file permissions
   - Verify input files are not corrupted
   - Use absolute paths to avoid path issues

## Common Issues & Solutions

**Issue: "PowerPoint not found" on Windows**
- Solution: Install Microsoft Office or use LibreOffice method

**Issue: "soffice command not found"**
- Solution: Add LibreOffice to system PATH or use full path

**Issue: Formatting differences in output**
- Solution: Use native PowerPoint on Windows for best fidelity

**Issue: Slow conversion**
- Solution: Use headless mode, close unnecessary applications

**Issue: Permission denied**
- Solution: Check file permissions, close files in other applications

## Related Skills

- `dev-pdf_processing` - For PDF manipulation and extraction
- `dev-docx_to_md` - For document format conversion
- `learning-assignment_document` - For creating submission documents

## References

- LibreOffice Documentation: https://www.libreoffice.org/
- python-pptx: https://python-pptx.readthedocs.io/
- comtypes: https://pythonhosted.org/comtypes/
