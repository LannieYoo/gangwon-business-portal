"""
Single PPTX to PDF Converter
Converts a single PowerPoint file to PDF format.
"""

import sys
from pathlib import Path

# Windows method using comtypes
def convert_windows(pptx_path: str, pdf_path: str = None):
    """Convert PPTX to PDF using Microsoft PowerPoint on Windows."""
    try:
        import comtypes.client
    except ImportError:
        print("Error: comtypes not installed. Run: uv add comtypes")
        return False
    
    pptx_path = Path(pptx_path).resolve()
    if not pptx_path.exists():
        print(f"Error: File not found: {pptx_path}")
        return False
    
    if pdf_path is None:
        pdf_path = pptx_path.with_suffix('.pdf')
    else:
        pdf_path = Path(pdf_path).resolve()
    
    print(f"Converting: {pptx_path.name}")
    print(f"Output: {pdf_path}")
    
    powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
    powerpoint.Visible = 1
    
    try:
        presentation = powerpoint.Presentations.Open(str(pptx_path))
        presentation.SaveAs(str(pdf_path), 32)  # 32 = PDF format
        presentation.Close()
        print("✓ Conversion successful!")
        return True
    except Exception as e:
        print(f"✗ Conversion failed: {e}")
        return False
    finally:
        powerpoint.Quit()


# LibreOffice method (cross-platform)
def convert_libreoffice(pptx_path: str, output_dir: str = None):
    """Convert PPTX to PDF using LibreOffice."""
    import subprocess
    
    pptx_path = Path(pptx_path).resolve()
    if not pptx_path.exists():
        print(f"Error: File not found: {pptx_path}")
        return False
    
    if output_dir is None:
        output_dir = pptx_path.parent
    else:
        output_dir = Path(output_dir).resolve()
        output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Converting: {pptx_path.name}")
    print(f"Output directory: {output_dir}")
    
    cmd = [
        'soffice',
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', str(output_dir),
        str(pptx_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        pdf_path = output_dir / pptx_path.with_suffix('.pdf').name
        print(f"✓ Conversion successful: {pdf_path.name}")
        return True
    else:
        print(f"✗ Conversion failed: {result.stderr}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: uv run python convert_single.py <input.pptx> [output.pdf] [--method windows|libreoffice]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
    
    # Determine method
    method = "windows"  # default
    if "--method" in sys.argv:
        idx = sys.argv.index("--method")
        if idx + 1 < len(sys.argv):
            method = sys.argv[idx + 1]
    
    # Convert
    if method == "windows":
        convert_windows(input_file, output_file)
    elif method == "libreoffice":
        convert_libreoffice(input_file, output_file or Path(input_file).parent)
    else:
        print(f"Unknown method: {method}")
        sys.exit(1)
