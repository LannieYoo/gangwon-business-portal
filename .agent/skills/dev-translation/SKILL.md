---
name: dev-translation
description: IT technical document translation assistant. Use when (1) translating technical articles, documentation, or papers, (2) creating bilingual (Chinese-English) content, (3) ensuring technical term consistency, (4) translating code comments or API docs.
---

# IT Technical Translation

## Objectives

- Translate technical documents accurately while preserving meaning
- Maintain consistency of technical terminology
- Create bilingual documentation with proper formatting
- Handle code blocks, formulas, and technical diagrams appropriately

## Core Translation Rules

### Technical Term Handling

**On first use, add English in parentheses:**

- "智能体 (agent)" not just "智能体"
- Use standard Chinese translations
- Maintain consistency throughout document

**Never translate:**

- Variable names, function names, class names
- Code blocks and syntax
- Mathematical formulas
- URLs, file paths, commands
- Configuration keys

**Always translate:**

- Explanatory text and descriptions
- Section headings and titles
- Image captions
- Error messages

**For comprehensive term database:** See `references/terminology-database.md`

### Bilingual Format (Recommended)

Use sequential format for readability:

```markdown
## Introduction

This is an introduction to the agent system.

这是对智能体 (agent) 系统的介绍。

---

## Getting Started

Follow these steps to begin.

按照以下步骤开始。
```

### Quality Requirements

Before finalizing:

- [ ] Technical terms consistent
- [ ] Code blocks unchanged
- [ ] Formulas preserved
- [ ] Chinese reads naturally (not word-for-word)
- [ ] Terminology matches industry standards

## Translation Workflow

1. **Analyze structure** - Identify sections, code blocks, technical terms
2. **Create glossary** - Build consistent term mapping for this document
3. **Translate section by section** - Preserve structure, add Chinese below English
4. **Validate** - Check consistency, formatting, and readability

## Using LLM APIs

### Recommended Free/Cheap APIs

- **Gemini API**: 1500 requests/day free, good quality
- **DeepSeek API**: ~$0.001/request, excellent Chinese
- **Groq API**: Free tier, ultra-fast

### Translation Prompt Template

```python
prompt = f"""请将以下英文技术文档翻译成中文。要求：

1. 保持技术术语的准确性
2. 专业术语后面用括号标注英文，如：智能体 (agent)
3. 翻译要流畅自然，符合中文表达习惯
4. 不要翻译代码、公式、变量名
5. 保持 Markdown 格式

英文原文：
{english_text}

中文翻译："""
```

### Batch Translation Pattern

```python
def translate_markdown(input_path, output_path):
    content = read_file(input_path)
    sections = split_by_markers(content)

    for section in sections:
        chinese = call_llm_api(section)
        append_translation(section, chinese)
        time.sleep(4)  # Rate limiting

    write_file(output_path, translated_content)
```

## Common Patterns

### Academic Paper

```markdown
## Abstract | 摘要

English text...
中文翻译...
```

### API Documentation

```markdown
## `getUserById(id)` | 根据 ID 获取用户

Returns user info. | 返回用户信息。
```

### Tutorial

```markdown
## Installation | 安装

Install using npm: | 使用 npm 安装：
\`\`\`bash
npm install package
\`\`\`
```

## Common Mistakes

❌ **Translating code:**

```python
# Bad: 定义 函数(参数)
# Good: def function(parameter)
```

❌ **Inconsistent terms:**

```
Bad: 智能体, 代理, agent (mixed)
Good: 智能体 (agent) (consistent)
```

❌ **English grammar in Chinese:**

```
Bad: 这个函数返回一个 user 对象
Good: 这个函数返回一个用户 (user) 对象
```

## References

**For detailed examples:** See `references/translation-examples.md`
**For comprehensive IT terms:** See `references/terminology-database.md`
**For API integration:** See `references/api-integration.md`
