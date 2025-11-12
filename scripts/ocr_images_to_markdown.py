#!/usr/bin/env python3
"""
OCR images in a directory and export recognized text into a Markdown file.

Usage:
  python scripts/ocr_images_to_markdown.py \
    --input-dir "public/pdfs/knowledge-reasoning/Middle Tearm Exam" \
    --output-md "public/pdfs/knowledge-reasoning/Middle Tearm Exam/Middle-Tearm-Exam-OCR.md" \
    --lang eng

Notes:
- Requires: pillow, pytesseract
- Also requires Tesseract OCR installed on the system.
- On Windows, install Tesseract and optionally pass --tesseract-cmd if not on PATH.
"""

import argparse
import os
import sys
from typing import List

try:
    from PIL import Image
except ImportError:
    print("Error: pillow is not installed. Run: pip install pillow", file=sys.stderr)
    sys.exit(1)

try:
    import pytesseract
except ImportError:
    print("Error: pytesseract is not installed. Run: pip install pytesseract", file=sys.stderr)
    sys.exit(1)


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"}


def list_image_files(input_dir: str) -> List[str]:
    entries = []
    for name in os.listdir(input_dir):
        ext = os.path.splitext(name)[1].lower()
        if ext in SUPPORTED_EXTENSIONS:
            entries.append(name)
    # Stable, human-friendly ordering: numeric-aware filename sort
    def sort_key(n: str):
        # Put shorter names earlier if everything else equal
        return ("".join([c if c.isdigit() else " " for c in n]).strip(), n)
    return sorted(entries, key=lambda n: (n.lower(), sort_key(n)))


def ocr_image(image_path: str, lang: str) -> str:
    with Image.open(image_path) as img:
        # Convert to RGB to avoid mode issues
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        text = pytesseract.image_to_string(img, lang=lang)
        return text.strip()


def main() -> None:
    parser = argparse.ArgumentParser(description="OCR images in a directory to a Markdown file")
    parser.add_argument("--input-dir", required=True, help="Directory containing images")
    parser.add_argument("--output-md", required=True, help="Output Markdown path")
    parser.add_argument("--lang", default="eng", help="Tesseract language(s), e.g. 'eng', 'chi_sim', or 'eng+chi_sim'")
    parser.add_argument("--tesseract-cmd", default=None, help="Path to tesseract executable (Windows) if not in PATH")

    args = parser.parse_args()

    if args.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = args.tesseract_cmd

    input_dir = args.input_dir
    output_md = args.output_md

    if not os.path.isdir(input_dir):
        print(f"Error: input directory not found: {input_dir}", file=sys.stderr)
        sys.exit(1)

    images = list_image_files(input_dir)
    if not images:
        print(f"No images found in: {input_dir}")
        # still create an empty file for consistency
        os.makedirs(os.path.dirname(output_md), exist_ok=True)
        with open(output_md, "w", encoding="utf-8") as f:
            f.write("# OCR Output\n\n_No images found._\n")
        sys.exit(0)

    os.makedirs(os.path.dirname(output_md), exist_ok=True)

    lines = ["# OCR Output", "", f"Source folder: {input_dir}", f"Language: {args.lang}", "", "---", ""]

    for idx, name in enumerate(images, 1):
        path = os.path.join(input_dir, name)
        print(f"OCR {idx}/{len(images)}: {name}")
        try:
            text = ocr_image(path, lang=args.lang)
        except Exception as e:
            text = f"[ERROR] Failed to OCR '{name}': {e}"
        lines.append(f"## Page {idx}: {name}")
        lines.append("")
        if text.strip():
            lines.append("```text")
            lines.append(text)
            lines.append("```")
        else:
            lines.append("_No text recognized._")
        lines.append("")
        lines.append("---")
        lines.append("")

    with open(output_md, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Done. Wrote: {output_md}")


if __name__ == "__main__":
    main()
