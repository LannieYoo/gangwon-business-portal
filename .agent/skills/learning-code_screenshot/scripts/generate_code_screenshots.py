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
    
    # Find separator line before a step marker (# ===)
    def find_separator_before(content, pos):
        """Find the separator line (# ===) before a given position."""
        lines_before = content[:pos].split('\n')
        for i in range(len(lines_before) - 1, -1, -1):
            line = lines_before[i].strip()
            if line.startswith('# ==='):
                return len('\n'.join(lines_before[:i])) + (1 if i > 0 else 0)
            elif line and not line.startswith('#'):
                break
        return pos
    
    # Extract header section (before first step)
    if matches:
        header_end = find_separator_before(content, matches[0].start())
        header_text = content[:header_end].strip()
        if header_text:
            sections.append(('step00_imports_and_setup', header_text))
    
    for i, match in enumerate(matches):
        step_num = match.group(1)
        step_desc = match.group(2).strip()
        
        # Start from the separator line (includes Chinese comment and separator)
        start_pos = find_separator_before(content, match.start())
        
        # Find end position (next section's separator or end of file)
        if i + 1 < len(matches):
            end_pos = find_separator_before(content, matches[i + 1].start())
        else:
            end_pos = len(content)
        
        # Extract code for this section
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
        
        # Create step name - use only step number for consistency
        step_name = f"step{step_num.zfill(2)}"
        
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


def get_token_color(token_type):
    """
    Get color for syntax highlighting based on token type.
    Colors match Google Colab theme.
    
    Args:
        token_type: Pygments token type
        
    Returns:
        tuple: RGB color
    """
    # Google Colab color scheme (light background)
    colors = {
        Token.Keyword: (215, 58, 73),           # Pink/Red - keywords (import, from, def, if, for, etc.)
        Token.Keyword.Namespace: (215, 58, 73), # Pink/Red - import, from
        Token.Name.Function: (0, 0, 0),         # Black - function names
        Token.Name.Class: (0, 0, 0),            # Black - class names
        Token.Name.Builtin: (0, 128, 0),        # Green - built-in functions
        Token.String: (186, 33, 33),            # Dark red - strings
        Token.Number: (0, 102, 102),            # Teal - numbers
        Token.Comment: (64, 128, 128),          # Teal gray - comments
        Token.Operator: (102, 102, 102),        # Dark gray - operators
        Token.Name: (0, 0, 0),                  # Black - variables
        Token.Operator.Word: (215, 58, 73),     # Pink/Red - as, in
    }
    
    # Check for exact match
    if token_type in colors:
        return colors[token_type]
    
    # Check for parent types
    for token_parent in token_type.split():
        if token_parent in colors:
            return colors[token_parent]
    
    # Default color (black)
    return (0, 0, 0)


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
    bg_color = (247, 247, 247)  # Colab light gray background
    
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
    
    # Get script name without extension for filename prefix
    script_name = script_path.stem
    
    print(f"Extracting code sections from: {script_file}")
    sections = extract_step_sections(script_path)
    
    if not sections:
        print("Warning: No step markers found in script")
        return
    
    print(f"Found {len(sections)} code sections")
    print()
    
    for step_name, code_text in sections:
        filename = f"{script_name}_{step_name}_code.png"
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
