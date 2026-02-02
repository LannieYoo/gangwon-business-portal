---
name: learning-notebook_conversion
description: Convert between .ipynb and .py formats for course assignments. Use when (1) user asks to convert notebook to script or vice versa, (2) mentions "转换" or "convert", (3) needs to switch between interactive and script formats.
---

# Learning Notebook Conversion

## Objectives

- Convert .ipynb to .py while preserving structure and documentation
- Convert .py to .ipynb with proper cell organization
- Maintain code quality and academic formatting during conversion

## Instructions

### 1. Conversion Methods

**Method A: VS Code Built-in (Recommended for single files)**

1. Open .ipynb file
2. Press `Ctrl+Shift+P`
3. Select "Notebook: Export to Python Script"
4. Choose save location

**Method B: Jupyter nbconvert (Recommended for batch/automation)**

```bash
# .ipynb to .py
jupyter nbconvert --to python notebook.ipynb

# .py to .ipynb
jupytext --to notebook script.py
```

**Method C: Python script (For custom processing)**

```python
import nbformat
from nbconvert import PythonExporter

# Read notebook
with open('notebook.ipynb', 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

# Convert to Python
exporter = PythonExporter()
source, meta = exporter.from_notebook_node(nb)

# Write to file
with open('output.py', 'w', encoding='utf-8') as f:
    f.write(source)
```

### 2. .ipynb → .py Conversion

**What gets converted:**

- Code cells → Python code
- Markdown cells → Multi-line comments (`"""..."""`)
- Cell separators → `# %%` markers (VS Code interactive cells)
- Outputs → Removed (code only)

**Post-conversion cleanup:**

1. **Add file-level docstring** (if missing):

   ```python
   """
   Course Code Lab X: Title
   Author: [Student Name]
   Section: [Section Number]
   Date: [Date]
   """
   ```

2. **Review cell markers**:
   - Keep `# %%` for logical sections
   - Remove unnecessary markers
   - Add descriptive comments after markers

3. **Convert markdown to docstrings**:
   - Section headers → Comments
   - Important notes → Inline comments
   - Instructions → Function docstrings

4. **Adjust outputs**:
   - Change `display()` to `print()`
   - Ensure `plt.show()` for plots
   - Remove IPython-specific magic commands

**Example conversion:**

```python
# Before (in .ipynb markdown cell):
# ## Step 1: Load Data
# Load the dataset and display first 5 rows

# After (in .py):
# %% Step 1: Load Data
# Load the dataset and display first 5 rows
import pandas as pd
df = pd.read_csv('data.csv')
print(df.head())
```

### 3. .py → .ipynb Conversion

**Using jupytext:**

```bash
# Install jupytext
pip install jupytext

# Convert with cell markers
jupytext --to notebook script.py

# Convert and execute
jupytext --to notebook --execute script.py
```

**Cell organization rules:**

- `# %%` markers → New code cells
- Multi-line strings at top → Markdown cells
- Section comments → Markdown headers
- Code blocks → Code cells

**Post-conversion tasks:**

1. **Run all cells** to generate outputs
2. **Add markdown cells** for better documentation:
   - Title and metadata at top
   - Section headers before major steps
   - Explanations for complex logic

3. **Verify cell order**:
   - Logical flow maintained
   - No circular dependencies
   - Outputs display correctly

4. **Format markdown cells**:

   ```markdown
   ## Step 1: Import Libraries

   Import required packages for data analysis.
   ```

### 4. Batch Conversion

**Convert multiple files:**

```bash
# All .ipynb to .py in directory
jupyter nbconvert --to python *.ipynb

# All .py to .ipynb
for file in *.py; do jupytext --to notebook "$file"; done
```

**Python script for batch processing:**

```python
import os
from pathlib import Path
import nbformat
from nbconvert import PythonExporter

def convert_notebooks_to_py(directory):
    """Convert all .ipynb files in directory to .py"""
    for ipynb_file in Path(directory).glob('*.ipynb'):
        with open(ipynb_file, 'r', encoding='utf-8') as f:
            nb = nbformat.read(f, as_version=4)

        exporter = PythonExporter()
        source, _ = exporter.from_notebook_node(nb)

        py_file = ipynb_file.with_suffix('.py')
        with open(py_file, 'w', encoding='utf-8') as f:
            f.write(source)

        print(f"Converted: {ipynb_file} → {py_file}")

# Usage
convert_notebooks_to_py('labs/')
```

### 5. Conversion Best Practices

**Before conversion:**

- [ ] Save and checkpoint current work
- [ ] Run all cells (for .ipynb) to verify execution
- [ ] Clear outputs if file size is large
- [ ] Commit to version control

**After conversion:**

- [ ] Test execution in target format
- [ ] Verify all imports work
- [ ] Check file paths are correct
- [ ] Validate outputs match original
- [ ] Update documentation if needed

**Maintain consistency:**

- Keep both formats if needed for different use cases
- Use version control to track changes
- Document which format is "source of truth"
- Sync changes between formats when updating

### 6. Format-Specific Considerations

**When to use .ipynb:**

- Interactive exploration and visualization
- Teaching and presentations
- Sharing with outputs visible
- Iterative development

**When to use .py:**

- Version control (cleaner diffs)
- Automated testing and CI/CD
- Production deployment
- Command-line execution
- Code review

**Hybrid approach:**

- Develop in .ipynb for interactivity
- Convert to .py for submission/version control
- Use jupytext to sync both formats automatically

## Validation

**After conversion, verify:**

### Code Execution

- [ ] Converted file runs without errors
- [ ] All imports resolve correctly
- [ ] File paths work in new format
- [ ] Outputs match original (if applicable)

### Structure Preservation

- [ ] Logical sections maintained
- [ ] Comments and documentation intact
- [ ] Function definitions complete
- [ ] Variable scope correct

### Academic Requirements

- [ ] File-level docstring present (for .py)
- [ ] Author and metadata included
- [ ] Step order follows assignment
- [ ] Submission format requirements met

## Common Issues

**Issue: Cell markers (`# %%`) not recognized**

- Solution: Install Python extension in VS Code
- Or: Use Jupyter extension for interactive cells

**Issue: Markdown cells lost in conversion**

- Solution: Use `jupytext` instead of basic `nbconvert`
- Or: Manually convert important markdown to docstrings

**Issue: Relative imports broken**

- Solution: Check working directory and adjust paths
- Or: Use absolute imports with package structure

**Issue: Magic commands cause errors in .py**

- Solution: Remove or comment out IPython magic commands:
  - `%matplotlib inline` → Remove or comment
  - `!pip install` → Convert to regular shell command
  - `%%time` → Use `time` module instead

**Issue: Outputs don't display in .py**

- Solution: Replace `display()` with `print()`
- Add `plt.show()` for matplotlib plots
- Use explicit print statements for results

## Installation Requirements

```bash
# Basic conversion
pip install jupyter nbconvert

# Advanced conversion with sync
pip install jupytext

# For Python API
pip install nbformat
```

## Example Workflow

**User request:** "把这个 notebook 转成 .py 文件"

**Your workflow:**

1. Identify the .ipynb file (from context or ask user)
2. Choose conversion method based on needs:
   - Single file → VS Code export or nbconvert
   - Batch → Script or command-line loop
   - Custom processing → Python script
3. Execute conversion
4. Perform post-conversion cleanup:
   - Add/verify docstrings
   - Clean up cell markers
   - Test execution
5. Validate against checklist
6. Inform user of completion and any issues

**User request:** "生成这个 .py 的 notebook 版本"

**Your workflow:**

1. Identify the .py file
2. Use jupytext to convert
3. Open in Jupyter/VS Code
4. Run all cells to generate outputs
5. Add markdown cells for documentation
6. Verify cell organization
7. Save and inform user
