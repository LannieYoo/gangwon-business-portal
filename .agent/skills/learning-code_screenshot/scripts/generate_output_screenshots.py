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
    """
    Extract step markers from Python script.
    
    Args:
        filepath (Path): Path to Python script
        
    Returns:
        list: List of (step_num, step_name) tuples
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match step markers: # Step 1:, # Step 2:, etc.
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
    """
    Run Python script and capture its output.
    
    Args:
        script_file (Path): Path to Python script
        
    Returns:
        str: Captured output
    """
    try:
        # Get absolute path and working directory
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
    """
    Split captured output into sections based on step markers.
    
    Args:
        output (str): Full captured output
        steps (list): List of (step_num, step_name) tuples
        
    Returns:
        dict: Dictionary mapping step_name to output text
    """
    sections = {}
    lines = output.split('\n')
    
    current_step = None
    current_lines = []
    step_dict = {num: name for num, name in steps}
    
    for line in lines:
        # Check if line contains a step marker
        step_match = re.search(r'Step (\d+):', line)
        
        if step_match:
            # Save previous step if exists
            if current_step and current_lines:
                sections[current_step] = '\n'.join(current_lines).strip()
            
            # Start new step
            step_num = int(step_match.group(1))
            current_step = step_dict.get(step_num)
            current_lines = [line] if current_step else []
        elif current_step is not None:
            current_lines.append(line)
    
    # Save last step
    if current_step and current_lines:
        sections[current_step] = '\n'.join(current_lines).strip()
    
    return sections


def get_monospace_font(size=13):
    """
    Get a monospace font for terminal display.
    
    Args:
        size (int): Font size
        
    Returns:
        ImageFont: Font object
    """
    # Try common monospace fonts
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
    
    # Fallback to default font
    return ImageFont.load_default()


def save_output_screenshot(output_text, filename, output_dir):
    """
    Save output text as screenshot image using Pillow.
    
    Args:
        output_text (str): Output text to screenshot
        filename (str): Output filename
        output_dir (Path): Output directory
    """
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
    
    # Calculate image dimensions
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
    
    # Draw text line by line
    y = padding
    for line in lines:
        draw.text((padding, y), line, font=font, fill=text_color)
        y += line_height
    
    # Save
    output_path = output_dir / filename
    img.save(output_path, 'PNG')
    
    print(f"✓ Generated: {filename}")


def generate_output_screenshots(script_file, output_dir='images'):
    """
    Generate output screenshots by running script and capturing output.
    
    Args:
        script_file (str): Path to Python script
        output_dir (str): Output directory for screenshots
    """
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
