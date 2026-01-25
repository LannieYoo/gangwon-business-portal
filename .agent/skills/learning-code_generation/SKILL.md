---
name: learning-code_generation
description: Generate Python code and Jupyter notebooks for course assignments. Use when (1) user asks to generate code for lab/assignment, (2) mentions "生成代码" or "generate code", (3) needs to create .py or .ipynb files for coursework.
---

# Learning Code Generation

## Objectives

Generate well-structured, self-documenting Python code for course assignments that meets academic requirements.

## Instructions

### 1. Understand Requirements

Before generating code:

- Read assignment document thoroughly
- Identify all required steps and their order
- Note submission requirements (file format, naming, structure)
- Check for instructor-specific code style requirements

### 2. Code Structure

**For Python scripts (.py):**

```python
"""
Course Code Lab X: Title
Author: [Student Name]
Section: [Section Number]
Date: [Date]

Brief description of what the program does.
"""

# Import libraries
import required_libraries

# Main program following assignment steps
# Step 1: ...
# Step 2: ...
```

**For Jupyter Notebooks (.ipynb):**

- First cell: Markdown with title, author, section, date
- Each step: Markdown cell + Code cell
- Final cell: Submission reminder (if needed)

**For detailed structure examples:** See `references/structure-examples.md`

### 3. Core Principles

**Self-Documenting Code:**

- Use clear, descriptive variable names
- Extract magic numbers to named constants
- Structure code to reveal intent
- Only add comments to explain "why", not "what"

**Function Usage:**

- Only create functions when code is repeated (DRY principle)
- Don't create functions for one-time operations
- Keep main program flow readable and sequential

**Comments:**

- Minimize comments - let code speak for itself
- Only explain non-obvious design decisions
- Never repeat what code already shows
- Use English for all comments

**Avoid AI Appearance:**

- No summary/conclusion sections at end
- No "Lab completed successfully!" messages
- No structured final summaries with statistics
- End with last required step + simple submission reminder

**For detailed principles and examples:** See `references/code-principles.md`

### 4. Common Patterns

- Data Analysis: Import → Load → Preprocess → Analyze → Visualize
- Algorithm: Import → Define helpers → Implement → Test → Analyze
- Machine Learning: Import → Load → Engineer → Train → Evaluate → Visualize

**For pattern details:** See `references/common-patterns.md`

### 5. Language Requirements

All code content must be in English:

- Variable names: English
- Function names: English
- Comments: English
- Docstrings: English
- Print outputs: English

### 6. Screenshot Separation

**CRITICAL: Do NOT include screenshot generation code in assignment scripts.**

Screenshot functionality is handled by the separate `learning-code_screenshot` skill.

**Never include:**
- `OutputCapture` classes
- `save_code_screenshot()` functions
- `StringIO` or screenshot-related imports
- Any code that captures terminal output to images

**Keep assignment code focused on:**
- Core analysis logic
- Data processing
- Visualization (using `plt.savefig()` for plots)
- Results output to terminal

**For screenshot generation:** Use the `learning-code_screenshot` skill separately.

### 7. Submission Reminder

Add simple reminder at end (if appropriate):

```python
print("\nReminder:")
print("1. Take screenshots of code from Google Colab")
print("2. Paste screenshots into Lab1AnswerTemplate.md")
print("3. Fill in descriptions for each step")
print("4. Convert markdown to .docx for submission")
```

## Validation

After generating code, check:

**Documentation:**
- [ ] File-level docstring with author info (if required)
- [ ] Function docstrings with Args/Returns (for all functions)

**Code Quality:**
- [ ] Meaningful, self-explanatory variable names
- [ ] Constants for magic numbers
- [ ] Minimal comments (only "why", not "what")
- [ ] Functions only for repeated code
- [ ] No screenshot generation code (use `learning-code_screenshot` skill)

**Requirements:**
- [ ] Follows assignment step order exactly
- [ ] All required steps implemented
- [ ] No AI-generated appearance (summaries, conclusions)
- [ ] English language throughout

**For detailed validation checklist:** See `references/validation-guide.md`

## Workflow

1. Read assignment document
2. Identify all steps
3. Generate code following step order
4. Use self-documenting code practices
5. Add functions only for repeated operations
6. Include docstrings for functions
7. Add minimal "why" comments if needed
8. Add submission reminder (if appropriate)
9. Validate against checklist
10. Save to appropriate location

## Anti-Patterns

- ❌ Generating code without reading requirements
- ❌ Using Chinese comments or variable names
- ❌ Over-commenting obvious operations
- ❌ Creating functions for one-time operations
- ❌ Adding AI-generated summaries/conclusions
- ❌ Using meaningless variable names (x, y, data1)
- ❌ Not following assignment step order
- ❌ Hardcoding values that should be constants
- ❌ Including screenshot generation code (use `learning-code_screenshot` skill)

**For more examples:** See `references/code-principles.md`
