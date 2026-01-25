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
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.token import Token


def extract_step_sections(filepath):
    """
    Extract code sections based on step markers.
    
    Args:
        filepath (Path): Path to Python script
        
    Returns:
        list: List of (step_name, code_text) tuples
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sections = []
    
    # Pattern to match step markers: # Step 1:, # Step 2:, etc.
    step_pattern = r'# Step (\d+):([^\n]*)\n'
    matches = list(re.finditer(step_pattern, content))
    
    # Extract header section (before first step)
    if matches:
        header_end = matches[0].start()
        header_text = content[:header_end].strip()
        if header_text:
            sections.append(('step00_imports_and_setup', header_text))
    
    for i, match in enumerate(matches):
        step_num = match.group(1)
        step_desc = match.group(2).strip()
        start_pos = match.end()
        
        # Find end position (next step or end of file)
        if i + 1 < len(matches):
            end_pos = matches[i + 1].start()
        else:
            end_pos = len(content)
        
        # Extract code between markers
        code_text = content[start_pos:end_pos].strip()
        
        # Clean up code (remove excessive blank lines)
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
    """
    Get a monospace font for code display.
    
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


def get_token_color(token_type):
    """
    Get color for syntax highlighting based on token type.
    Colors match VS Code Dark+ theme.
    
    Args:
        token_type: Pygments token type
        
    Returns:
        tuple: RGB color
    """
    # VS Code Dark+ color scheme
    colors = {
        Token.Keyword: (197, 134, 192),      # Purple - keywords (def, if, for, etc.)
        Token.Name.Function: (220, 220, 170), # Yellow - function names
        Token.Name.Class: (78, 201, 176),     # Teal - class names
        Token.Name.Builtin: (220, 220, 170),  # Yellow - built-in functions
        Token.String: (206, 145, 120),        # Orange - strings
        Token.Number: (181, 206, 168),        # Light green - numbers
        Token.Comment: (106, 153, 85),        # Green - comments
        Token.Operator: (171, 178, 191),      # Light gray - operators
        Token.Name: (156, 220, 254),          # Light blue - variables
    }
    
    # Check for exact match
    if token_type in colors:
        return colors[token_type]
    
    # Check for parent types
    for token_parent in token_type.split():
        if token_parent in colors:
            return colors[token_parent]
    
    # Default color (light gray)
    return (171, 178, 191)


def save_code_screenshot(code_text, filename, output_dir):
    """
    Save code as screenshot image using Pillow with syntax highlighting.
    
    Args:
        code_text (str): Code to screenshot
        filename (str): Output filename
        output_dir (Path): Output directory
    """
    if not code_text.strip():
        return
    
    # Tokenize code for syntax highlighting
    lexer = PythonLexer()
    tokens = list(lexer.get_tokens(code_text))
    
    # Settings
    font_size = 14
    font = get_monospace_font(font_size)
    line_height = font_size + 6
    padding = 20
    bg_color = (40, 44, 52)  # Dark background like VS Code
    
    # Calculate dimensions by rendering all text
    lines = code_text.split('\n')
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
    
    # Draw text with syntax highlighting
    x = padding
    y = padding
    
    for token_type, token_value in tokens:
        color = get_token_color(token_type)
        
        # Handle newlines
        if '\n' in token_value:
            lines_in_token = token_value.split('\n')
            for i, line in enumerate(lines_in_token):
                if line:  # Draw non-empty line
                    draw.text((x, y), line, font=font, fill=color)
                    bbox = font.getbbox(line)
                    x += bbox[2] - bbox[0]
                
                if i < len(lines_in_token) - 1:  # Not the last line
                    y += line_height
                    x = padding
        else:
            # Draw token
            draw.text((x, y), token_value, font=font, fill=color)
            bbox = font.getbbox(token_value)
            x += bbox[2] - bbox[0]
    
    # Save
    output_path = output_dir / filename
    img.save(output_path, 'PNG')
    
    print(f"✓ Generated: {filename}")


def generate_screenshots(script_file, output_dir='images'):
    """
    Generate code screenshots from Python script.
    
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
