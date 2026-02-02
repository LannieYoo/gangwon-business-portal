# Screenshot Script Implementation

This document provides the complete implementation of screenshot generation scripts for course assignments.

## Overview

Two scripts work together to generate screenshots:

1. **generate_code_screenshots.py** - Generates code screenshots from Python script
2. **generate_output_screenshots.py** - Runs script and generates output screenshots

Both scripts use **Pillow (PIL)** to create realistic-looking screenshots with proper fonts and styling.

## Features

### Code Screenshots
- Dark theme background (#282C34) similar to VS Code
- Light gray text (#ABB2BF)
- System monospace font (Consolas on Windows)
- Automatic extraction from step markers
- Proper line spacing and padding

### Output Screenshots
- Terminal-style dark background (#0C0C0C)
- Light gray text (#CCCCCC)
- System monospace font
- Captures actual script execution output
- Splits output by step markers

## Installation

Both scripts require Pillow:

```bash
uv add pillow
```

## Usage

### Generate Code Screenshots

```bash
python generate_code_screenshots.py <script_file> [output_dir]
```

Example:
```bash
python generate_code_screenshots.py lab1_pca.py images/
```

### Generate Output Screenshots

```bash
python generate_output_screenshots.py <script_file> [output_dir]
```

Example:
```bash
python generate_output_screenshots.py lab1_pca.py images/
```

## How It Works

### Step Marker Detection

Both scripts look for step markers in the Python code:

```python
# Step 1: Load the CSV file
# Step 2: Print dataset information
# Step 3: Split the dataset
```

These markers are used to:
1. Extract code sections (for code screenshots)
2. Split output sections (for output screenshots)
3. Generate consistent filenames

### Filename Convention

**Code screenshots:**
- Format: `step{NN}_{description}_code.png`
- Example: `step01_load_the_csv_file_code.png`

**Output screenshots:**
- Format: `step{NN}_{description}.png`
- Example: `step01_load_the_csv_file.png`

### Font Selection

Scripts try to use system monospace fonts in order:
1. Consolas (Windows)
2. DejaVu Sans Mono (Linux)
3. Menlo (macOS)
4. Monaco (macOS)
5. Default font (fallback)

## Complete Implementation

### generate_code_screenshots.py

```python
"""
Generate code screenshots from Python script for assignment documentation.

Usage:
    python generate_code_screenshots.py <script_file> [output_dir]

Example:
    python generate_code_screenshots.py lab1_pca.py images/
"""

import re
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


def extract_step_sections(filepath):
    """Extract code sections based on step markers."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sections = []
    step_pattern = r'# Step (\d+):([^\n]*)\n'
    matches = list(re.finditer(step_pattern, content))
    
    for i, match in enumerate(matches):
        step_num = match.group(1)
        step_desc = match.group(2).strip()
        start_pos = match.end()
        
        # Find end position
        if i + 1 < len(matches):
            end_pos = matches[i + 1].start()
        else:
            end_pos = len(content)
        
        # Extract and clean code
        code_text = content[start_pos:end_pos].strip()
        code_lines = code_text.split('\n')
        cleaned_lines = []
        prev_blank = False
        
        for line in code_lines:
            is_blank = not line.strip()
            if is_blank and prev_blank:
                continue
            cleaned_lines.append(line)
            prev_blank = is_blank
        
        code_text = '\n'.join(cleaned_lines).strip()
        
        # Create step name
        step_name = f"step{step_num.zfill(2)}"
        if step_desc:
            step_name += f"_{step_desc.lower().replace(' ', '_')}"
        
        sections.append((step_name, code_text))
    
    return sections


def get_monospace_font(size=14):
    """Get a monospace font for code display."""
    font_names = [
        'consola.ttf',      # Consolas (Windows)
        'Consolas',
        'Courier New',
        'DejaVuSansMono.ttf',  # Linux
        'Menlo',            # macOS
        'Monaco',
    ]
    
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except:
            continue
    
    return ImageFont.load_default()


def save_code_screenshot(code_text, filename, output_dir):
    """Save code as screenshot image using Pillow."""
    if not code_text.strip():
        return
    
    lines = code_text.split('\n')
    
    # Settings
    font_size = 14
    font = get_monospace_font(font_size)
    line_height = font_size + 6
    padding = 20
    bg_color = (40, 44, 52)  # Dark background like VS Code
    text_color = (171, 178, 191)  # Light gray text
    
    # Calculate dimensions
    max_width = 0
    for line in lines:
        bbox = font.getbbox(line)
        line_width = bbox[2] - bbox[0]
        max_width = max(max_width, line_width)
    
    img_width = max_width + padding * 2
    img_height = len(lines) * line_height + padding * 2
    
    # Create image
    img = Image.new('RGB', (img_width, img_height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw text
    y = padding
    for line in lines:
        draw.text((padding, y), line, font=font, fill=text_color)
        y += line_height
    
    # Save
    output_path = output_dir / filename
    img.save(output_path, 'PNG')
    
    print(f"✓ Generated: {filename}")


def generate_screenshots(script_file, output_dir='images'):
    """Generate code screenshots from Python script."""
    script_path = Path(script_file)
    output_path = Path(output_dir)
    
    if not script_path.exists():
        print(f"Error: Script file not found: {script_file}")
        return
    
    output_path.mkdir(exist_ok=True)
    
    print(f"Extracting code sections from: {script_file}")
    sections = extract_step_sections(script_path)
    
    if not sections:
        print("Warning: No step markers found in script")
        return
    
    print(f"Found {len(sections)} code sections")
    print()
    
    for step_name, code_text in sections:
        filename = f"{step_name}_code.png"
        save_code_screenshot(code_text, filename, output_path)
    
    print()
    print(f"✓ Generated {len(sections)} code screenshots in {output_dir}/")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python generate_code_screenshots.py <script_file> [output_dir]")
        print("Example: python generate_code_screenshots.py lab1_pca.py images/")
        sys.exit(1)
    
    script_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'images'
    
    generate_screenshots(script_file, output_dir)
```

### generate_output_screenshots.py

```python
"""
Generate output screenshots by running Python script and capturing terminal output.

Usage:
    python generate_output_screenshots.py <script_file> [output_dir]

Example:
    python generate_output_screenshots.py lab1_pca.py images/
"""

import re
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


def extract_step_markers(filepath):
    """Extract step markers from Python script."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    step_pattern = r'# Step (\d+):([^\n]*)'
    matches = re.findall(step_pattern, content)
    
    steps = []
    for step_num, step_desc in matches:
        step_name = f"step{step_num.zfill(2)}"
        if step_desc.strip():
            step_name += f"_{step_desc.strip().lower().replace(' ', '_')}"
        steps.append((int(step_num), step_name))
    
    return steps


def run_script_and_capture_output(script_file):
    """Run Python script and capture its output."""
    try:
        script_abs = script_file.resolve()
        work_dir = script_abs.parent
        
        result = subprocess.run(
            ['python', script_abs.name],
            capture_output=True,
            text=True,
            cwd=work_dir,
            timeout=300
        )
        return result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return "Error: Script execution timed out"
    except Exception as e:
        return f"Error running script: {str(e)}"


def split_output_by_steps(output, steps):
    """Split captured output into sections based on step markers."""
    sections = {}
    lines = output.split('\n')
    
    current_step = None
    current_lines = []
    step_dict = {num: name for num, name in steps}
    
    for line in lines:
        step_match = re.search(r'Step (\d+):', line)
        
        if step_match:
            if current_step and current_lines:
                sections[current_step] = '\n'.join(current_lines).strip()
            
            step_num = int(step_match.group(1))
            current_step = step_dict.get(step_num)
            current_lines = [line] if current_step else []
        elif current_step is not None:
            current_lines.append(line)
    
    if current_step and current_lines:
        sections[current_step] = '\n'.join(current_lines).strip()
    
    return sections


def get_monospace_font(size=13):
    """Get a monospace font for terminal display."""
    font_names = [
        'consola.ttf',
        'Consolas',
        'Courier New',
        'DejaVuSansMono.ttf',
        'Menlo',
        'Monaco',
    ]
    
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except:
            continue
    
    return ImageFont.load_default()


def save_output_screenshot(output_text, filename, output_dir):
    """Save output text as screenshot image using Pillow."""
    if not output_text.strip():
        return
    
    lines = output_text.split('\n')
    
    # Settings
    font_size = 13
    font = get_monospace_font(font_size)
    line_height = font_size + 5
    padding = 15
    bg_color = (12, 12, 12)  # Dark terminal background
    text_color = (204, 204, 204)  # Light gray text
    
    # Calculate dimensions
    max_width = 0
    for line in lines:
        bbox = font.getbbox(line)
        line_width = bbox[2] - bbox[0]
        max_width = max(max_width, line_width)
    
    img_width = max_width + padding * 2
    img_height = len(lines) * line_height + padding * 2
    
    # Create image
    img = Image.new('RGB', (img_width, img_height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw text
    y = padding
    for line in lines:
        draw.text((padding, y), line, font=font, fill=text_color)
        y += line_height
    
    # Save
    output_path = output_dir / filename
    img.save(output_path, 'PNG')
    
    print(f"✓ Generated: {filename}")


def generate_output_screenshots(script_file, output_dir='images'):
    """Generate output screenshots by running script and capturing output."""
    script_path = Path(script_file)
    output_path = Path(output_dir)
    
    if not script_path.exists():
        print(f"Error: Script file not found: {script_file}")
        return
    
    output_path.mkdir(exist_ok=True)
    
    print(f"Extracting step markers from: {script_file}")
    steps = extract_step_markers(script_path)
    
    if not steps:
        print("Warning: No step markers found in script")
        return
    
    print(f"Found {len(steps)} steps")
    print()
    
    print(f"Running script: {script_file}")
    output = run_script_and_capture_output(script_path)
    print("Script execution completed")
    print()
    
    print("Splitting output by steps...")
    sections = split_output_by_steps(output, steps)
    print(f"Found {len(sections)} output sections")
    print()
    
    for step_name in sorted(sections.keys()):
        output_text = sections[step_name]
        filename = f"{step_name}.png"
        save_output_screenshot(output_text, filename, output_path)
    
    print()
    print(f"✓ Generated {len(sections)} output screenshots in {output_dir}/")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python generate_output_screenshots.py <script_file> [output_dir]")
        print("Example: python generate_output_screenshots.py lab1_pca.py images/")
        sys.exit(1)
    
    script_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'images'
    
    generate_output_screenshots(script_file, output_dir)
```

## Styling Details

### Code Screenshot Style
- Background: `#282C34` (VS Code Dark+ theme)
- Text: `#ABB2BF` (Light gray)
- Font size: 14pt
- Line height: 20pt (14 + 6)
- Padding: 20px

### Output Screenshot Style
- Background: `#0C0C0C` (Terminal black)
- Text: `#CCCCCC` (Light gray)
- Font size: 13pt
- Line height: 18pt (13 + 5)
- Padding: 15px

## Troubleshooting

### Font Not Found
If system fonts are not found, scripts fall back to default font. To use better fonts:

**Windows:**
- Consolas is usually available by default

**Linux:**
```bash
sudo apt-get install fonts-dejavu
```

**macOS:**
- Menlo and Monaco are available by default

### Output Not Captured
If output screenshots are empty:
1. Check that Python script runs successfully
2. Verify step markers exist in script
3. Ensure print statements include "Step N:" in output

### Image Too Large
If images are too large:
- Reduce font size in script
- Reduce line height
- Reduce padding

## Integration with Workflow

1. Write Python script with step markers
2. Run script to generate visualization plots
3. Generate code screenshots: `generate_code_screenshots.py`
4. Generate output screenshots: `generate_output_screenshots.py`
5. Create markdown template with image references
6. Fill in descriptions
7. Convert to .docx for submission
