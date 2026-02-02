---
name: bilingual-content
description: Generate bilingual learning materials from structured content. Use when (1) translating technical articles, (2) creating dual-language study notes, (3) preparing course materials with original and translation, (4) converting scraped content to bilingual markdown.
---

# Bilingual Content Generation

## Objectives

- Generate bilingual markdown from structured content
- Preserve original text with translation placeholders
- Handle code blocks, images, and formatting correctly
- Support incremental translation workflow

## Key Instructions

### 1. Input Format

Expect structured JSON data with sections:
```json
{
  "title": "Article Title",
  "sections": [
    {"type": "h2", "text": "Section Header"},
    {"type": "p", "text": "Paragraph content"},
    {"type": "code", "text": "code content", "language": "python"},
    {"type": "image", "src": "url", "local_path": "images/img.png", "caption": "..."}
  ]
}
```

### 2. Generate Bilingual Markdown

```python
def generate_bilingual_markdown(data: dict, output_path: Path):
    md_lines = []
    
    # Header with original title
    md_lines.append(f"# {data['title']} (中英对照)\n")
    md_lines.append(f"> **原文链接:** {data.get('source_url', '')}\n")
    md_lines.append("---\n")
    
    last_image_hash = None
    
    for section in data['sections']:
        stype = section['type']
        
        # Headers
        if stype == 'h2':
            md_lines.append(f"\n## {section['text']}\n")
            md_lines.append("\n[待翻译]\n")
        elif stype == 'h3':
            md_lines.append(f"\n### {section['text']}\n")
            md_lines.append("\n[待翻译]\n")
        
        # Paragraphs
        elif stype == 'p':
            md_lines.append(f"\n{section['text']}\n")
            md_lines.append("\n[待翻译]\n")
        
        # Code blocks (no translation needed)
        elif stype == 'code':
            lang = section.get('language', 'python')
            md_lines.append(f"\n```{lang}\n{section['text']}\n```\n")
        
        # Images (deduplicate by hash)
        elif stype == 'image':
            if 'local_path' in section:
                current_hash = extract_hash(section['local_path'])
                if current_hash != last_image_hash:
                    md_lines.append(f"\n![{section.get('alt', '')}]({section['local_path']})\n")
                    if section.get('caption'):
                        md_lines.append(f"*{section['caption']}*\n")
                    last_image_hash = current_hash
    
    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(md_lines)
```

### 3. Handle Special Cases

**Skip UI elements**:
```python
# Filter out common UI noise
skip_texts = ['--', 'Listen', 'Share', 'Follow', 'Sign up', 'Sign in']
if section['type'] == 'p' and section['text'] in skip_texts:
    continue
```

**Deduplicate images**:
```python
import re

def extract_hash(filename: str) -> str:
    """Extract hash from filename like img_16_21c1b3df.png"""
    match = re.search(r'img_\d+_([a-f0-9]+)\.\w+', filename)
    return match.group(1) if match else None
```

**Preserve code formatting**:
```python
# Don't add translation placeholders for code blocks
if stype == 'code':
    md_lines.append(f"\n```{section.get('language', '')}\n{section['text']}\n```\n")
    # No [待翻译] here
```

## Workflow

### Step 1: Prepare Structured Data

From web scraping or manual extraction:
```python
article_data = {
    'title': 'Technical Article Title',
    'source_url': 'https://...',
    'sections': [...]
}

with open('article_data.json', 'w', encoding='utf-8') as f:
    json.dump(article_data, f, indent=2, ensure_ascii=False)
```

### Step 2: Generate Bilingual Template

```bash
uv run python generate_bilingual_md.py
```

Output example:
```markdown
# Technical Article Title (中英对照)

> **原文链接:** https://...

---

## Introduction

[待翻译]

This article explains the concept...

[待翻译]

```python
def example():
    pass
```

![Diagram](images/img_1.png)
```

### Step 3: Fill in Translations

Manually or with AI assistance:
```markdown
## Introduction

## 简介

[待翻译]

This article explains the concept...

本文解释了这个概念...
```

## Configuration

### Translation Placeholder

Customize the placeholder text:
```python
TRANSLATION_PLACEHOLDER = "[待翻译]"  # Chinese
# or
TRANSLATION_PLACEHOLDER = "[To be translated]"  # English
```

### Section Handling

Configure which sections need translation:
```python
TRANSLATABLE_TYPES = ['h1', 'h2', 'h3', 'p', 'blockquote']
NO_TRANSLATION_TYPES = ['code', 'image', 'table']
```

### Image Deduplication

Enable/disable:
```python
DEDUPLICATE_IMAGES = True  # Recommended for Medium articles
```

## Output Formats

### Standard Bilingual (Side-by-side)

```markdown
Original text here.

翻译文本在这里。
```

### Inline Bilingual

```markdown
Original text here. (翻译文本在这里。)
```

### Separate Files

```python
# Generate two files
generate_original_only(data, 'article_en.md')
generate_translation_only(data, 'article_zh.md')
```

## Validation

Before using the generated markdown:

- [ ] Check that all sections have translation placeholders
- [ ] Verify code blocks are preserved without placeholders
- [ ] Ensure images are not duplicated
- [ ] Confirm formatting (headers, lists, quotes) is correct
- [ ] Test that links and image paths are valid

## Best Practices

1. **Preserve structure**: Keep original formatting intact
2. **Clear placeholders**: Use consistent, searchable placeholder text
3. **Code blocks**: Never add translation placeholders inside code
4. **Image captions**: Translate captions separately if needed
5. **Incremental work**: Fill translations section by section
6. **Version control**: Commit original template before translating

## Integration with Translation Tools

### Manual Translation

1. Generate template with placeholders
2. Use editor's find/replace to locate `[待翻译]`
3. Replace with actual translation
4. Keep original text above translation

### AI-Assisted Translation

```python
def translate_section(text: str, target_lang: str = 'zh') -> str:
    # Use OpenAI, DeepL, or other translation API
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"Translate to {target_lang}: {text}"
        }]
    )
    return response.choices[0].message.content
```

### Batch Translation

```python
def fill_translations(md_path: Path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all sections needing translation
    sections = re.findall(r'(.*?)\n\n\[待翻译\]', content)
    
    for section in sections:
        translation = translate_section(section)
        content = content.replace(
            f"{section}\n\n[待翻译]",
            f"{section}\n\n{translation}"
        )
    
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(content)
```

## Common Issues

### Issue: Images appear multiple times

**Solution**: Enable hash-based deduplication:
```python
last_image_hash = None
for section in sections:
    if section['type'] == 'image':
        current_hash = extract_hash(section['local_path'])
        if current_hash != last_image_hash:
            # Add image
            last_image_hash = current_hash
```

### Issue: Code blocks have translation placeholders

**Solution**: Skip translation for code:
```python
if section['type'] == 'code':
    md_lines.append(f"\n```{lang}\n{text}\n```\n")
    # Don't add [待翻译]
```

### Issue: Special characters break formatting

**Solution**: Use proper encoding:
```python
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(content)
```

## Reference Scripts

See `.skills/learning-bilingual_content/scripts/` for implementation:
- `generate_bilingual_md.py` - Main generation script
- `translate_batch.py` - Batch translation helper
