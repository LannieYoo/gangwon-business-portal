"""
Generate bilingual markdown from scraped article data
"""
import json
from pathlib import Path

def generate_bilingual_markdown(json_path: Path, output_path: Path):
    """Generate bilingual markdown from article data"""
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    md_lines = []
    
    # Header
    md_lines.append(f"# {data['title']} (中英对照)\n")
    md_lines.append("> **原文链接:** https://medium.com/data-science/math-of-q-learning-python-code-5dcbdc49b6f6\n")
    md_lines.append("---\n")
    
    # Process sections
    last_image_hash = None
    for i, section in enumerate(data['sections']):
        stype = section['type']
        
        # Skip UI elements
        if stype == 'p' and section['text'] in ['--', 'Listen', 'Share', '4']:
            continue
        
        # Headers
        if stype == 'h1':
            continue  # Skip duplicate title
        elif stype == 'h2':
            md_lines.append(f"\n## {section['text']}\n")
            md_lines.append("\n[待翻译]\n")
        elif stype == 'h3':
            if 'UPDATE' in section['text']:
                md_lines.append(f"\n> {section['text']}\n")
            else:
                md_lines.append(f"\n### {section['text']}\n")
                md_lines.append("\n[待翻译]\n")
        
        # Paragraphs
        elif stype == 'p':
            md_lines.append(f"\n{section['text']}\n")
            md_lines.append("\n[待翻译]\n")
        
        # Images - skip duplicates by checking hash in filename
        elif stype == 'image':
            if 'local_path' in section:
                # Extract hash from filename (e.g., img_16_21c1b3df.png -> 21c1b3df)
                import re
                match = re.search(r'img_\d+_([a-f0-9]+)\.\w+', section['local_path'])
                if match:
                    current_hash = match.group(1)
                    # Only add if different hash from last image
                    if current_hash != last_image_hash:
                        md_lines.append(f"\n![{section.get('alt', '')}]({section['local_path']})\n")
                        if section.get('caption'):
                            md_lines.append(f"*{section['caption']}*\n")
                        last_image_hash = current_hash
        
        # Code blocks
        elif stype == 'code':
            md_lines.append(f"\n```python\n{section['text']}\n```\n")
    
    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(md_lines)
    
    print(f"Generated bilingual markdown: {output_path}")

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    resources_dir = script_dir.parent / "resources"
    
    json_path = resources_dir / "article_data.json"
    output_path = resources_dir / "math_of_q_learning_python_bilingual_generated.md"
    
    generate_bilingual_markdown(json_path, output_path)
