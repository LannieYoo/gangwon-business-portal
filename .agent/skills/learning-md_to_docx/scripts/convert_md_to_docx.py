#!/usr/bin/env python3
"""
Universal Markdown to DOCX Converter for Lab Reports

Usage:
    python convert_md_to_docx.py <input.md> [output.docx]
    
Example:
    python convert_md_to_docx.py Lab1_Template.md Lab1.docx
"""
import sys
import os
import pypandoc


def ensure_pandoc():
    """Ensure pandoc is available, download if necessary."""
    try:
        version = pypandoc.get_pandoc_version()
        print(f"✓ Pandoc version {version} found")
        return True
    except OSError:
        print("⚠ Pandoc not found. Downloading...")
        try:
            pypandoc.download_pandoc()
            print("✓ Pandoc downloaded successfully!")
            return True
        except Exception as e:
            print(f"✗ Failed to download pandoc: {e}")
            print("\nPlease install pandoc manually:")
            print("  Windows: choco install pandoc")
            print("  Or download from: https://pandoc.org/installing.html")
            return False


def convert_md_to_docx(md_file, docx_file=None, reference_doc=None):
    """
    Convert markdown file to docx with proper formatting.
    
    Args:
        md_file: Path to input markdown file
        docx_file: Path to output docx file (optional, defaults to same name)
        reference_doc: Path to reference docx template (optional)
    """
    # Validate input file
    if not os.path.exists(md_file):
        print(f"✗ Error: Input file not found: {md_file}")
        return False
    
    # Determine output file
    if docx_file is None:
        docx_file = os.path.splitext(md_file)[0] + '.docx'
    
    # Get absolute paths
    md_file = os.path.abspath(md_file)
    docx_file = os.path.abspath(docx_file)
    md_dir = os.path.dirname(md_file)
    
    print(f"\n{'='*60}")
    print(f"Converting Markdown to DOCX")
    print(f"{'='*60}")
    print(f"Input:  {md_file}")
    print(f"Output: {docx_file}")
    print(f"{'='*60}\n")
    
    # Prepare pandoc arguments
    extra_args = [
        '--standalone',
        f'--resource-path={md_dir}',  # Look for images relative to md file
        '--wrap=preserve',  # Preserve line breaks
    ]
    
    if reference_doc and os.path.exists(reference_doc):
        extra_args.extend(['--reference-doc', reference_doc])
        print(f"Using reference template: {reference_doc}")
    
    try:
        # Convert
        pypandoc.convert_file(
            md_file,
            'docx',
            outputfile=docx_file,
            extra_args=extra_args
        )
        
        # Success
        file_size = os.path.getsize(docx_file) / 1024
        print(f"\n✓ Conversion successful!")
        print(f"  Output file: {docx_file}")
        print(f"  File size: {file_size:.2f} KB")
        
        # Validation checklist
        print(f"\n{'='*60}")
        print("Validation Checklist:")
        print("  [ ] Open the .docx file and verify:")
        print("  [ ] All images display correctly")
        print("  [ ] Headings are properly formatted")
        print("  [ ] Tables are formatted correctly")
        print("  [ ] Page layout is appropriate")
        print(f"{'='*60}\n")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Conversion failed: {e}")
        print("\nTroubleshooting:")
        print("  1. Check that all images exist in the images/ directory")
        print("  2. Verify markdown syntax is correct")
        print("  3. Ensure image paths are relative (e.g., images/pic.png)")
        print("  4. Check for special characters in filenames")
        return False


def main():
    """Main entry point."""
    # Check arguments
    if len(sys.argv) < 2:
        print("Usage: python convert_md_to_docx.py <input.md> [output.docx]")
        print("\nExample:")
        print("  python convert_md_to_docx.py Lab1_Template.md Lab1.docx")
        sys.exit(1)
    
    md_file = sys.argv[1]
    docx_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Ensure pandoc is available
    if not ensure_pandoc():
        sys.exit(1)
    
    # Convert
    success = convert_md_to_docx(md_file, docx_file)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
