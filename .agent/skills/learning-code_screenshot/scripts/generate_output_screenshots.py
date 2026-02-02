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
    step_pattern = r'# Step (\d+):'
    matches = re.findall(step_pattern, content)
    
    steps = []
    for step_num in matches:
        # Use only step number for consistency
        step_name = f"step{step_num.zfill(2)}"
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
        
        # Try uv run first, fallback to python
        try:
            result = subprocess.run(
                ['uv', 'run', 'python', script_abs.name],
                capture_output=True,
                text=True,
                cwd=work_dir,
                timeout=300,
                encoding='utf-8'
            )
        except FileNotFoundError:
            # Fallback to python if uv not available
            result = subprocess.run(
                ['python', script_abs.name],
                capture_output=True,
                text=True,
                cwd=work_dir,
                timeout=300,
                encoding='utf-8'
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
    step_dict = {num: name for num, name in steps}
    
    def is_separator(line):
        stripped = line.strip()
        return len(stripped) > 10 and all(c in '=-*' for c in stripped)

    # Find indices of all step markers
    marker_indices = []
    for i, line in enumerate(lines):
        if re.search(r'Step (\d+):', line):
            marker_indices.append(i)
    
    for i, marker_idx in enumerate(marker_indices):
        line = lines[marker_idx]
        step_match = re.search(r'Step (\d+):', line)
        step_num = int(step_match.group(1))
        step_name = step_dict.get(step_num)
        
        if not step_name:
            continue
            
        # 1. Determine START of section
        # Look one line back for a separator
        start_idx = marker_idx
        if marker_idx > 0 and is_separator(lines[marker_idx - 1]):
            start_idx = marker_idx - 1
            
        # 2. Determine END of section
        # Default to end of output
        end_idx = len(lines)
        if i + 1 < len(marker_indices):
            next_marker_idx = marker_indices[i + 1]
            # The next step starts either at its marker or the separator before it
            if next_marker_idx > 0 and is_separator(lines[next_marker_idx - 1]):
                end_idx = next_marker_idx - 1
            else:
                end_idx = next_marker_idx
        
        # Extract and clean lines
        section_lines = lines[start_idx:end_idx]
        
        # Remove trailing empty lines and separators from the end of THIS section
        while section_lines:
            if not section_lines[-1].strip():
                section_lines.pop()
                continue
                
            # Count distance from "Step" line in this section
            step_line_in_section = marker_idx - start_idx
            trailing_lines_count = len(section_lines) - 1 - step_line_in_section
            
            # If the last line is a separator AND it's not the one immediately after the Step line, pop it
            if is_separator(section_lines[-1]) and trailing_lines_count > 1:
                section_lines.pop()
            else:
                break
                
        sections[step_name] = '\n'.join(section_lines).strip()
    
    return sections


def get_monospace_font(size=13):
    """
    Get a monospace font for terminal display.
    
    Args:
        size (int): Font size
        
    Returns:
        ImageFont: Font object
    """
    # Try fonts that support both English and Chinese
    font_names = [
        'C:/Windows/Fonts/msyh.ttc',     # Microsoft YaHei (Windows)
        'C:/Windows/Fonts/simhei.ttf',   # SimHei (Windows)
        'C:/Windows/Fonts/simsun.ttc',   # SimSun (Windows)
        'msyh.ttc',
        'simhei.ttf',
        'consola.ttf',      # Consolas (Windows) - English only fallback
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
    bg_color = (255, 255, 255)  # White background (Colab style)
    text_color = (0, 0, 0)  # Black text
    
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
    
    # Get script name without extension for filename prefix
    script_name = script_path.stem
    
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
        filename = f"{script_name}_{step_name}_result.png"
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
