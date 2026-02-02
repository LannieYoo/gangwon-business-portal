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

**Student Information:**

Read student information from `.env.local` in workspace root:

- `NAME` - Student name
- `NUMBER` - Student number
- `EMAIL` - Student email (optional)

Use `python-dotenv` to load environment variables at the start of the script.

**For Python scripts (.py):**

Use the template at `templates/ml_lab_template.py` as base.

```python
"""
CST8506 Lab [N]: [Title]
Author: Peng Wang
Student Number: 041107730

[Brief description]
"""

import os
# ... other imports

# 配置常量
# Configuration Constants
RANDOM_STATE = 42
OUTPUT_DIR = 'lab[n]_images'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# 步骤1：[步骤标题]
# Step 1: [Step Title]
# ============================================================
print("Step 1: [Step Title]")
print("-" * 40)

# [中文注释]
# [English comment]
# code here

print()
```

### 3. Output Formatting Requirements

**⚠️ PRINCIPLE 1: Raw Data Integrity**

When printing datasets or statistics, **always show the original form of the data**.

- **No Internal Mapping**: Never map numeric labels (e.g., `0, 1`) to string names (e.g., `class_0`) inside the script for the "Statistics" step.
- **Show Objects As-Is**: Display data exactly as it looks after loading. Do not "beautify" or alter original values.
- **Raw Means Clean**: The most professional output is one that accurately reflects the raw state of the dataset.

**⚠️ PRINCIPLE 2: Concise and Aligned Output**

- **Header Format**: Use exactly 80 '=' characters above and below the step title.
  ```python
  print("=" * 80)
  print("Step N: Step Title")
  print("=" * 80)
  ```
- **Avoid Truncation**: Use `pd.set_option('display.max_columns', None)`, `pd.set_option('display.width', 1000)`, and `pd.set_option('display.expand_frame_repr', False)` to ensure all data columns are visible in a single block.
- **Overwrite Policy**: All operations (executing scripts, capturing output, generating screenshots) should **directly overwrite** existing files. Do not use temporary or numbered filenames.
- **Verification First**: Always run the script and verify the console output (saved to `output.txt`) BEFORE generating screenshots.

**Example of Precise Output:**

```python
# ✅ GOOD - Precision for "Step 2: Dataset Statistics"
import pandas as pd
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)
pd.set_option('display.expand_frame_repr', False)

print("=" * 80)
print("Step 2: Print dataset statistics")
print("=" * 80)
print(f"Number of instances: {X.shape[0]}")
print(f"Number of attributes: {X.shape[1]}")
print(df.head())
```

**Do NOT include:**

- Over-design: No complex tables if simple DataFrame print is enough.
- Redundant info: Don't print stats in the "Load" step.
- Truncated output: Ensure all columns are shown.
- Mismatched headers: Always 80 '='.

```python
# ❌ BAD - Results as raw arrays
print(f"Accuracy: {accuracy}")
print(f"Confusion Matrix: {cm}")

# ✅ GOOD - Formatted results table
from tabulate import tabulate

print("Step 10: Results table with accuracies and confusion matrices")
print("-" * 40)
results_table = []
for name, acc, cm in results:
    results_table.append([name, f"{acc:.4f}", str(cm.tolist())])

headers = ["Model", "Accuracy", "Confusion Matrix"]
print(tabulate(results_table, headers=headers, tablefmt="simple"))
```

**Required Dependencies for Formatted Output:**

```python
from tabulate import tabulate  # For formatted tables
import pandas as pd            # For DataFrame display
```

**Do NOT include:**

- Generic messages like "Step completed!"
- Submission reminders in middle of output (only at very end if needed)
- Truncated array output (use proper formatting or summarize)
- Raw object representations (like `_wine_dataset:`)

**Default Parameter Documentation:**

When using algorithms with default parameters, ALWAYS print them:

```python
# ✅ GOOD - Document default parameters
print(f"SVM with Linear kernel")
print(f"  C (regularization): 1.0 (default)")
print(f"  - Higher C = less regularization, may overfit")
print(f"  - Lower C = more regularization, may underfit")
```

**For Jupyter Notebooks (.ipynb):**

- First cell: Code to load student info from `.env.local` and print header
- Second cell: Markdown with title, author info (using variables), date
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

**Comments (Bilingual):**

Follow `dev-code_comment` skill for bilingual comments:

- File docstring: English only
- Inline comments: Chinese line + English line above code
- Complex logic: Add reason (原因/Reason)

Example:

```python
# 使用StandardScaler标准化数据
# Use StandardScaler to standardize data
# 原因：SVM对特征尺度敏感
# Reason: SVM is sensitive to feature scales
scaler = StandardScaler()
```

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

### 5. Environment Setup

**Required Package:**

Ensure `python-dotenv` is available for loading `.env.local`:

```python
from dotenv import load_dotenv
import os

load_dotenv('.env.local')
STUDENT_NAME = os.getenv('NAME', '[Your Name]')
STUDENT_NUMBER = os.getenv('NUMBER', '[Your Student Number]')
```

**Date Formatting:**

Use `datetime` for current date:

```python
from datetime import datetime
current_date = datetime.now().strftime('%Y-%m-%d')
```

### 6. Language Requirements

**Bilingual Comments (Chinese + English):**

- Variable names: English
- Function names: English
- Comments: Chinese line first, then English line
- Docstrings: English only
- Print outputs: English

### 7. Screenshot Separation

**CRITICAL: Do NOT include internal logging or screenshot code in scripts.**

- **No Logger Classes**: Avoid defining `Logger` or `OutputCapture` classes in the coursework script.
- **Manual Redirection**: Use terminal redirection to capture `output.txt` for verification and screenshots.
  ```bash
  uv run python lab[n]_*.py > lab[n]_images/output.txt 2>&1
  ```

**Never include:**

- `OutputCapture` or `Logger` classes
- `save_code_screenshot()` functions
- `StringIO` or screenshot-related imports
- Any code that captures or redirects `stdout` internally

**Keep assignment code focused on:**

- Core analysis logic
- Data processing
- Visualization (using `plt.savefig()` for plots)
- Results output to terminal

**For screenshot generation:** Use the `learning-code_screenshot` skill separately.

### 8. Submission Reminder

**⚠️ IMPORTANT: Submission reminders are for debugging purposes ONLY.**

The reminder section should:

- Be placed at the very END of the script
- Be separated from the last step's output
- **NOT appear in output screenshots** (use `generate_output_screenshots.py` which captures step-by-step output, not the entire run)

```python
# Only print reminder after all steps are complete (debugging only)
print()
print("=" * 60)
print("Reminder:")
print("1. Take screenshots of code from Google Colab")
print("2. Paste screenshots into Lab1AnswerTemplate.md")
print("3. Fill in descriptions for each step")
print("4. Convert markdown to .docx for submission")
print("=" * 60)
```

**Note:** When generating output screenshots with `learning-code_screenshot` skill, each step's output is captured separately, so submission reminders won't appear in the screenshots.

## Validation

After generating code, check:

**Documentation:**

- [ ] Student info loaded from `.env.local` using `python-dotenv`
- [ ] Current date generated using `datetime`
- [ ] File-level docstring with author info
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
