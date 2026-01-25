# Skill Generation Scripts

Scripts for creating and managing Claude skills programmatically.

## Overview

These scripts help automate the creation of skill files, extract prompts from resources, and generate skills from domain definitions.

## Core Scripts Location

**Note:** Generation scripts remain in `backend/scripts/generate/` due to their tight integration with the data layer. This README provides guidance on using them.

## Available Scripts

### 1. Create Skill

Create a new skill from scratch or from domain data.

```bash
cd backend/scripts
python -m generate.create_skill
```

**Programmatic usage:**

```python
from scripts.generate.create_skill import CreateSkillScript

script = CreateSkillScript(verbose=True)

# Create from domain
result = script.create_from_domain({
    "code": "my_domain",
    "name": "My Domain",
    "name_en": "My Domain",
    "description": "Domain description",
    "category_code": "category"
})

# Or create manually
result = script.create(
    name="category-domain",
    description="Skill description with use cases",
    instructions="Detailed instructions...",
    keywords=["keyword1", "keyword2"],
    is_public=True
)
```

### 2. Create AI Learning Skills

Generate skills for AI learning domains (RL, ML, DL, NLP, CV, LLM).

```bash
python -m generate.create_ai_learning_skills
```

Creates comprehensive learning assistant skills with:

- Concept explanation
- Code analysis
- Homework guidance
- Lab experiments
- Quiz generation
- Knowledge summarization

### 3. Create Skills from Domains

Batch create skills from domain definitions in `data/domain/domains.py`.

```bash
python -m generate.create_skills_from_domains
```

### 4. Extract Prompts

Extract prompts from awesome-chatgpt-prompts or other sources.

```bash
python -m generate.extract_prompts
```

Extracts and categorizes prompts into:

- `text_processing/` - Translation, proofreading, simplification
- `analysis/` - Comparison, sentiment, plagiarism check
- `generation/` - Email, checklist, questions
- `code/` - Code explanation and generation

## Skill File Structure

Generated skills follow this structure:

```
backend/scripts/data/skills/category-domain/
├── SKILL.md           # Main skill definition
├── metadata.json      # Skill metadata
├── references/        # Optional detailed guides
│   └── guide.md
└── scripts/          # Optional utility scripts
    └── helper.py
```

## SKILL.md Format

```markdown
---
name: category-domain
description: Brief description. Use when (1) condition1, (2) condition2.
---

# Skill Name

## Objectives

- Objective 1
- Objective 2

## Instructions

1. Step 1
2. Step 2

## Validation

- Check 1
- Check 2
```

## Creating a Custom Skill

### Method 1: Using Script

```python
from scripts.generate.create_skill import CreateSkillScript

script = CreateSkillScript(verbose=True)
result = script.create(
    name="dev-my_tool",
    description="My tool assistant. Use when (1) using my tool, (2) debugging issues.",
    instructions="""
# My Tool Assistant

## Objectives
- Help users use my tool effectively
- Debug common issues

## Instructions
1. Understand user's goal
2. Provide relevant commands
3. Explain output
    """,
    keywords=["my tool", "tool name", "debugging"],
    is_public=True
)

print(f"Created: {result.message}")
```

### Method 2: Manual Creation

1. Create directory: `backend/scripts/data/skills/category-domain/`
2. Create `SKILL.md` with front matter
3. Create `metadata.json`:

```json
{
  "name": "category-domain",
  "display_name": "My Skill",
  "description": "Skill description",
  "keywords": ["keyword1", "keyword2"],
  "category": "category",
  "is_public": true,
  "version": "1.0.0"
}
```

## Skill Templates

### Learning Assistant Template

```markdown
---
name: ai_learning-topic
description: Comprehensive topic learning assistant. Use when studying concepts, debugging code, or working on assignments.
---

# Topic Learning Assistant

## Objectives

- Explain core concepts clearly
- Analyze code and algorithms
- Guide through homework and labs
- Generate practice questions

## Instructions

### Concept Explanation

1. Break down complex topics
2. Use analogies and examples
3. Provide visual aids when helpful

### Code Analysis

1. Review code structure
2. Identify issues
3. Suggest improvements

### Homework Guidance

1. Understand requirements
2. Guide through solution approach
3. Don't provide direct answers
4. Encourage learning

## Validation

- Explanations are clear and accurate
- Code suggestions follow best practices
- Guidance promotes understanding
```

### Tool Assistant Template

```markdown
---
name: dev-tool_name
description: Tool usage assistant. Use when (1) learning the tool, (2) debugging issues, (3) optimizing workflows.
---

# Tool Name Assistant

## Objectives

- Help users learn tool effectively
- Debug common issues
- Optimize workflows

## Instructions

1. Understand user's goal
2. Provide relevant commands/examples
3. Explain options and flags
4. Troubleshoot errors

## Common Patterns

### Pattern 1: Basic Usage

\`\`\`bash
tool command --option value
\`\`\`

### Pattern 2: Advanced Usage

\`\`\`bash
tool advanced-command --flag
\`\`\`

## Validation

- Commands are correct and safe
- Explanations are clear
- Examples are practical
```

## Prompt Extraction

Extract prompts from markdown files:

```python
from scripts.generate.extract_prompts import ExtractPromptsScript

script = ExtractPromptsScript(verbose=True)
result = script.run()

# Prompts saved to: backend/scripts/data/prompts/
```

Output structure:

```
prompts/
├── category-name/
│   ├── prompt.md
│   ├── metadata.json
│   └── examples.md
```

## Batch Operations

### Create Multiple Skills

```python
from scripts.generate.create_skills_from_domains import CreateSkillsFromDomainsScript

script = CreateSkillsFromDomainsScript(verbose=True)
result = script.run()

print(f"Created: {result.created} skills")
print(f"Updated: {result.updated} skills")
```

### Update Existing Skills

```python
script = CreateSkillScript(verbose=True)

# Update description
skill_dir = Path("backend/scripts/data/skills/category-domain")
skill_md = skill_dir / "SKILL.md"

# Read, modify, write
content = skill_md.read_text()
# ... modify content ...
skill_md.write_text(content)
```

## Validation

Validate skill structure:

```python
from pathlib import Path
import json

def validate_skill(skill_dir: Path) -> bool:
    """Validate skill has required files and structure"""

    # Check SKILL.md exists
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return False

    # Check front matter
    content = skill_md.read_text()
    if not content.startswith("---"):
        return False

    # Check metadata.json
    metadata_file = skill_dir / "metadata.json"
    if metadata_file.exists():
        metadata = json.loads(metadata_file.read_text())
        required_keys = ["name", "description", "keywords"]
        if not all(k in metadata for k in required_keys):
            return False

    return True
```

## Best Practices

1. **Clear Descriptions**: Include specific use cases in description
2. **Actionable Instructions**: Use imperative mood, be specific
3. **Validation Steps**: Always include validation criteria
4. **Keywords**: Add relevant keywords for discoverability
5. **Examples**: Provide concrete examples in instructions
6. **References**: Move detailed content to references/

## Troubleshooting

### Skill not loading

- Check front matter format
- Verify name matches directory
- Ensure description includes use cases

### Keywords not matching

- Add more keyword variations
- Include both English and Chinese terms
- Check skills-manager.md mappings

## Dependencies

```bash
uv add pyyaml
```

## Related Files

- `backend/scripts/generate/` - Generation scripts
- `backend/scripts/data/domain/` - Domain definitions
- `backend/scripts/data/skills/` - Generated skills
- `backend/scripts/data/prompts/` - Extracted prompts
