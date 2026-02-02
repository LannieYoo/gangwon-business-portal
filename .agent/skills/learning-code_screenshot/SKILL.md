---
name: learning-code_screenshot
description: Generate code and output screenshots from Python scripts for assignment documentation. Use when (1) user needs to create screenshots for Lab.docx, (2) mentions "代码截图" or "screenshot", (3) needs to capture code execution and results.
---

# Learning Code Screenshot

## Objectives

Automatically generate both code and output screenshots from Python scripts for inclusion in assignment documentation.

## Instructions

### 1. Two Types of Screenshots

**Code Screenshots:**

- Extract code sections from .py file
- Show the actual Python code
- Light background with syntax highlighting

**Output Screenshots:**

- Capture console output during execution
- Show results, prints, data displays
- Clean monospace formatting

### 2. Identify Code Sections

Parse Python script to identify:

- Step markers (comments like `# Step 1:`, `# Step 2:`)
- Function definitions
- Major code blocks
- Section separators

### 3. Capture Output

During script execution:

- Redirect stdout to buffer
- Capture print statements
- Save output as image
- Match with corresponding code section

### 4. Generate Screenshots

**Code screenshots:**

- Use monospace font
- Light background (#f8f8f8)
- Tight margins
- Name: `step01_xxx_code.png`

**Output screenshots:**

- Use monospace font
- White or light background
- Show actual execution results
- Name: `step01_xxx.png` (without \_code suffix)

### 5. Naming Convention

```
images/
├── step01_load_data_code.png      # Code
├── step01_load_data.png           # Output
├── step02_print_stats_code.png    # Code
├── step02_print_stats.png         # Output
└── ...
```

## Implementation Approaches

### Approach 1: Integrated Logging (Recommended)

Add a `Logger` class to the main script to automatically save all terminal output to `output.txt` while still displaying it in the console:

```python
import sys
import os

class Logger(object):
    def __init__(self, filename):
        self.terminal = sys.stdout
        self.log = open(filename, "w", encoding="utf-8")

    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)

    def flush(self):
        self.terminal.flush()
        self.log.flush()

# Usage:
os.makedirs('images', exist_ok=True)
sys.stdout = Logger('images/output.txt')
```

### Approach 2: Separate Screenshot Generator

Run these scripts after your main code is finished. They parse the `.py` file for step markers and the captured output for corresponding sections.

```bash
# Generate code images
python generate_code_screenshots.py lab1_pca.py images/

# Generate result images (auto-includes step headers/separators)
python generate_output_screenshots.py lab1_pca.py images/
```

**For detailed implementations:** See `references/screenshot-script.md`

## Usage Workflow

### Option A: Automatic Logger (Recommended)

1. Write Python script with:
   - Step markers in comments (e.g., `# Step 1:`)
   - `Logger` class integrated to auto-save `output.txt`
2. Run script once:
   ```bash
   uv run python lab[n]_*.py
   ```
3. Verify the generated `lab[n]_images/output.txt` looks professional.
4. Run screenshot scripts to batch generate all images.

### Option B: Manual Redirect

1. Run script and manually save output to file:
   ```bash
   uv run python lab[n]_*.py > lab[n]_images/output.txt 2>&1
   ```
2. **Check output file** - verify content (labels, spacing, labels conversion) is correct.
3. Generate screenshots using the helper scripts:
   ```bash
   # Code screenshots
   uv run python generate_code_screenshots.py lab[n]_*.py lab[n]_images/
   # Result screenshots (maintains step header formatting)
   uv run python generate_output_screenshots.py lab[n]_*.py lab[n]_images/
   ```

## Validation

Check generated screenshots:

- [ ] All steps have code screenshots
- [ ] All steps have output screenshots
- [ ] Code is readable (font size appropriate)
- [ ] Output is complete and formatted
- [ ] No excessive whitespace
- [ ] Filenames match template requirements
- [ ] Images saved in correct directory

## Common Patterns

**Pattern 1: Lab with numbered steps**

- Code: `step01_xxx_code.png`
- Output: `step01_xxx.png`

**Pattern 2: Visualization steps**

- Code: `step13_2d_plot_code.png`
- Output: `step13_2d_plot.png` (text output)
- Visualization: `lab1_pca_2d.png` (actual plot)

**Pattern 3: Comparison steps**

- Code: `step11_comparison_code.png`
- Output: `step11_comparison.png` (shows both results)

## Anti-Patterns

- ❌ Only capturing code without output
- ❌ Only capturing output without code
- ❌ Mismatched naming between code and output
- ❌ Screenshots with tiny font (unreadable)
- ❌ Excessive whitespace (wastes space)
- ❌ Missing step markers (can't identify sections)

**For detailed examples:** See `references/screenshot-examples.md`
