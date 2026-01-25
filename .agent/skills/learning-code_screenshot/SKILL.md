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
- Name: `step01_xxx.png` (without _code suffix)

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

### Approach 1: Integrated in Main Script

Add screenshot capture directly in the Python script:

```python
class OutputCapture:
    """Capture console output and save as image."""
    
    def __init__(self, step_name, images_dir='images'):
        self.step_name = step_name
        self.images_dir = Path(images_dir)
        self.output_buffer = StringIO()
        self.original_stdout = sys.stdout
        
    def __enter__(self):
        sys.stdout = self.output_buffer
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self.original_stdout
        output_text = self.output_buffer.getvalue()
        print(output_text, end='')
        self._save_as_image(output_text)
```

### Approach 2: Separate Screenshot Generator

Run after main script to generate code screenshots:

```bash
python generate_code_screenshots.py lab1_pca.py images/
```

**For detailed implementations:** See `references/screenshot-script.md`

## Usage Workflow

### Option A: All-in-One (Recommended)

1. Write Python script with:
   - Step markers in comments
   - OutputCapture context managers
2. Run script once
3. Generates both code and output screenshots
4. Paste into assignment template

### Option B: Two-Step Process

1. Run main script (generates output screenshots)
2. Run screenshot generator (generates code screenshots)
3. Paste both into assignment template

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
