#!/usr/bin/env python3
"""
PPTX to Screenshot Markdown Converter

Pipeline: PPTX → PDF → Page Images (PNG) → Markdown

Usage:
    python pptx_to_screenshot_md.py <input.pptx> [output_dir]

Output:
    - {stem}.pdf              - Intermediate PDF
    - {stem}_截图版_pages/     - Directory of page images
    - {stem}_截图版.md         - Markdown with images + text
"""

import sys
import subprocess
from pathlib import Path


def pptx_to_pdf_windows(pptx_path: Path, pdf_path: Path):
    """Convert PPTX to PDF using PowerPoint COM (Windows)."""
    try:
        import comtypes.client
        pptx_abs = str(pptx_path.resolve())
        pdf_abs = str(pdf_path.resolve())

        powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
        powerpoint.Visible = 1

        try:
            presentation = powerpoint.Presentations.Open(pptx_abs)
            presentation.SaveAs(pdf_abs, 32)
            presentation.Close()
            print(f"  ✓ PPTX → PDF (PowerPoint): {pdf_path.name}")
        finally:
            powerpoint.Quit()

        return True
    except Exception as e:
        print(f"  ⚠ PowerPoint COM failed: {e}")
        return False


def pptx_to_pdf_libreoffice(pptx_path: Path, output_dir: Path):
    """Convert PPTX to PDF using LibreOffice (fallback)."""
    try:
        result = subprocess.run(
            ['soffice', '--headless', '--convert-to', 'pdf',
             '--outdir', str(output_dir), str(pptx_path)],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            print(f"  ✓ PPTX → PDF (LibreOffice): {pptx_path.stem}.pdf")
            return True
        else:
            print(f"  ✗ LibreOffice error: {result.stderr}")
            return False
    except FileNotFoundError:
        print("  ✗ LibreOffice not found (soffice not in PATH)")
        return False
    except subprocess.TimeoutExpired:
        print("  ✗ LibreOffice conversion timed out")
        return False


def pptx_to_pdf(pptx_path: Path, pdf_path: Path):
    """Convert PPTX to PDF, trying PowerPoint first, then LibreOffice."""
    print("\n[Step 1/3] Converting PPTX → PDF...")

    # Try PowerPoint COM first (Windows)
    if sys.platform == 'win32':
        if pptx_to_pdf_windows(pptx_path, pdf_path):
            return pdf_path

    # Fallback to LibreOffice
    if pptx_to_pdf_libreoffice(pptx_path, pdf_path.parent):
        expected = pdf_path.parent / f"{pptx_path.stem}.pdf"
        if expected != pdf_path and expected.exists():
            expected.rename(pdf_path)
        return pdf_path

    raise RuntimeError("Cannot convert PPTX to PDF. Install PowerPoint or LibreOffice.")


def pdf_to_page_images(pdf_path: Path, output_dir: Path, dpi: int = 200):
    """Extract each PDF page as a PNG image using pymupdf."""
    import pymupdf

    print("\n[Step 2/3] Extracting page images...")
    output_dir.mkdir(parents=True, exist_ok=True)

    doc = pymupdf.open(str(pdf_path))
    image_paths = []

    zoom = dpi / 72
    mat = pymupdf.Matrix(zoom, zoom)

    for page_num, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=mat)
        img_path = output_dir / f"page_{page_num:03d}.png"
        pix.save(str(img_path))
        image_paths.append(img_path)
        print(f"  📸 Page {page_num}/{len(doc)} → {img_path.name}")

    doc.close()
    print(f"  ✓ Extracted {len(image_paths)} page images")
    return image_paths


def generate_markdown(
    pdf_path: Path,
    images_dir: Path,
    md_path: Path,
    source_pptx: str = None
):
    """Generate markdown with page images and extracted text."""
    import pymupdf

    print("\n[Step 3/3] Generating markdown...")

    doc = pymupdf.open(str(pdf_path))
    total_pages = len(doc)

    lines = []
    stem_clean = pdf_path.stem.replace('_', ' ')
    lines.append(f"# {stem_clean}\n")
    if source_pptx:
        lines.append(f"**Source:** `{source_pptx}`")
    lines.append(f"**Total Pages:** {total_pages}")
    lines.append(f"**Format:** Page Image + OCR Text\n")
    lines.append("---\n")

    for page_num, page in enumerate(doc, 1):
        lines.append(f"## Page {page_num}\n")

        # Page Image
        img_filename = f"page_{page_num:03d}.png"
        img_rel_path = f"{images_dir.name}/{img_filename}"
        lines.append("### 📷 Page Image\n")
        lines.append(f"![Page {page_num}]({img_rel_path})\n")

        # Text Content
        text = page.get_text().strip()
        lines.append("### 📝 Text Content\n")
        lines.append("```")
        if text:
            lines.append(text)
        else:
            lines.append("(No text extracted - image-only slide)")
        lines.append("```\n")

        # Notes section
        lines.append("### ✍️ Notes\n")
        lines.append("> **需求 #**: (待分析)\n")

        lines.append("---\n")

    doc.close()

    md_path.write_text("\n".join(lines), encoding='utf-8')
    print(f"  ✓ Generated: {md_path.name}")
    return md_path


def main():
    if len(sys.argv) < 2:
        print("Usage: python pptx_to_screenshot_md.py <input.pptx> [output_dir]")
        sys.exit(1)

    pptx_path = Path(sys.argv[1]).resolve()
    if not pptx_path.exists():
        print(f"Error: File not found: {pptx_path}")
        sys.exit(1)

    output_dir = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else pptx_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    stem = pptx_path.stem

    print(f"🔄 Converting: {pptx_path.name}")
    print(f"📂 Output: {output_dir}")

    # Step 1: PPTX → PDF
    pdf_path = output_dir / f"{stem}.pdf"
    pptx_to_pdf(pptx_path, pdf_path)

    # Step 2: PDF → Page Images
    images_dir = output_dir / f"{stem}_截图版_pages"
    pdf_to_page_images(pdf_path, images_dir)

    # Step 3: Generate Markdown
    md_path = output_dir / f"{stem}_截图版.md"
    generate_markdown(pdf_path, images_dir, md_path, source_pptx=pptx_path.name)

    print(f"\n✅ Pipeline complete!")
    print(f"   📄 PDF:    {pdf_path}")
    print(f"   🖼️  Images: {images_dir}")
    print(f"   📝 MD:     {md_path}")


if __name__ == "__main__":
    main()
