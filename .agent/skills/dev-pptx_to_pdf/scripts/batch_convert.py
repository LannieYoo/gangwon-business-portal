"""
Batch PPTX to PDF Converter
Converts multiple PowerPoint files to PDF format.
"""

import sys
from pathlib import Path
from typing import List

def convert_windows(pptx_path: Path, pdf_path: Path):
    """Convert using Windows PowerPoint."""
    try:
        import comtypes.client
    except ImportError:
        print("Error: comtypes not installed. Run: uv add comtypes")
        return False
    
    powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
    powerpoint.Visible = 1
    
    try:
        presentation = powerpoint.Presentations.Open(str(pptx_path))
        presentation.SaveAs(str(pdf_path), 32)
        presentation.Close()
        return True
    except Exception as e:
        print(f"  Error: {e}")
        return False
    finally:
        powerpoint.Quit()


def convert_libreoffice(pptx_path: Path, output_dir: Path):
    """Convert using LibreOffice."""
    import subprocess
    
    cmd = [
        'soffice',
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', str(output_dir),
        str(pptx_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def batch_convert(
    input_dir: str,
    output_dir: str = None,
    pattern: str = "*.pptx",
    method: str = "windows",
    recursive: bool = False
):
    """
    Batch convert PPTX files to PDF.
    
    Args:
        input_dir: Directory containing PPTX files
        output_dir: Output directory (optional)
        pattern: File pattern to match
        method: Conversion method ('windows' or 'libreoffice')
        recursive: Search subdirectories
    """
    input_dir = Path(input_dir)
    if not input_dir.exists():
        print(f"Error: Directory not found: {input_dir}")
        return
    
    if output_dir is None:
        output_dir = input_dir / "pdf_output"
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Find files
    if recursive:
        pptx_files = list(input_dir.rglob(pattern))
    else:
        pptx_files = list(input_dir.glob(pattern))
    
    if not pptx_files:
        print(f"No files matching '{pattern}' found in {input_dir}")
        return
    
    print(f"Found {len(pptx_files)} files to convert")
    print(f"Method: {method}")
    print(f"Output: {output_dir}\n")
    
    success_count = 0
    fail_count = 0
    
    for i, pptx_file in enumerate(pptx_files, 1):
        print(f"[{i}/{len(pptx_files)}] {pptx_file.name}...", end=" ")
        
        try:
            if method == "windows":
                pdf_path = output_dir / pptx_file.with_suffix('.pdf').name
                success = convert_windows(pptx_file, pdf_path)
            elif method == "libreoffice":
                success = convert_libreoffice(pptx_file, output_dir)
            else:
                print(f"Unknown method: {method}")
                success = False
            
            if success:
                print("✓")
                success_count += 1
            else:
                print("✗")
                fail_count += 1
                
        except Exception as e:
            print(f"✗ {e}")
            fail_count += 1
    
    print(f"\n{'='*50}")
    print(f"Conversion complete!")
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Total: {len(pptx_files)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: uv run python batch_convert.py <input_dir> [output_dir] [options]")
        print("\nOptions:")
        print("  --pattern <pattern>    File pattern (default: *.pptx)")
        print("  --method <method>      windows or libreoffice (default: windows)")
        print("  --recursive            Search subdirectories")
        print("\nExample:")
        print("  uv run python batch_convert.py slides/ pdf/ --method libreoffice")
        sys.exit(1)
    
    input_dir = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
    
    # Parse options
    pattern = "*.pptx"
    method = "windows"
    recursive = False
    
    args = sys.argv[2:] if output_dir else sys.argv[2:]
    
    i = 0
    while i < len(args):
        if args[i] == "--pattern" and i + 1 < len(args):
            pattern = args[i + 1]
            i += 2
        elif args[i] == "--method" and i + 1 < len(args):
            method = args[i + 1]
            i += 2
        elif args[i] == "--recursive":
            recursive = True
            i += 1
        else:
            i += 1
    
    batch_convert(input_dir, output_dir, pattern, method, recursive)
