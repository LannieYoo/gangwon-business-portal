---
name: learning-code_consistency
description: Verify consistency between .py, .ipynb, and .md files for lab assignments. Use when (1) user asks to check consistency, (2) mentions "一致" or "consistency", (3) before lab submission.
---

# Learning Code Consistency Checker

## Objectives

- Verify code logic matches between .py and .ipynb files
- Ensure .md documentation data matches code output
- Validate all screenshots/images are referenced correctly

## Instructions

### 1. Compare .py and .ipynb Files

**Check these elements:**

- Function definitions (names, parameters, logic)
- Import statements
- Main execution flow
- Output statements (print, plots)
- File paths (especially image save paths)

**Common differences to ignore:**

- Jupyter cell structure vs sequential execution
- Interactive outputs (`plt.show()` in .ipynb vs `plt.savefig()` in .py)
- Cell magic commands (`%matplotlib inline`)

### 2. Verify .md Documentation Against Code

**Data consistency checks:**

- Statistical values (α, R², counts, percentages)
- Top N results (word frequencies, rankings)
- Image filenames match actual generated files
- Screenshot descriptions match code output

**How to verify:**

1. Run the .py file and capture output
2. Compare printed values with .md content
3. Check `[Image Data]` markers in output for easy matching
4. Verify image paths are relative and correct

### 3. Image Reference Validation

**Check:**

- All images in .md exist in the specified directory
- Image paths are relative (e.g., `images/xxx.png`)
- No absolute paths (e.g., `C:\Users\...`)
- No broken image links

### 4. Report Format

Provide a structured report:

```markdown
## Consistency Check Report

### ✅ .py vs .ipynb

- Functions: Identical
- Logic: Consistent
- Outputs: Match (accounting for interactive differences)

### ✅ .md vs Code Output

- Statistical values: All match
- Image references: All valid
- Data points verified: [list key values]

### ⚠️ Issues Found

- [Issue 1]: Description and fix
- [Issue 2]: Description and fix

### 📋 Summary

Ready for submission: Yes/No
```

## Validation Steps

1. **Code execution test**: Run .py file successfully
2. **Output comparison**: Match printed values with .md
3. **Image check**: Verify all images exist and display correctly
4. **Cross-reference**: Ensure .ipynb produces same results as .py

## Common Issues

- **Different random seeds**: Ensure reproducibility with `random.seed()` or `np.random.seed()`
- **Path differences**: Use relative paths consistently
- **Rounding differences**: Check decimal places match in .md
- **Missing images**: Verify all plots are saved before referencing
