---
name: learning-lab_submission
description: Prepare and validate lab assignments for submission. Use when (1) user asks to prepare submission, (2) mentions "提交" or "submit lab", (3) ready to upload to Brightspace.
---

# Learning Lab Submission Preparation

## Objectives

- Validate all required files are present
- Ensure proper file naming and structure
- Create submission package (zip)
- Verify submission requirements are met

## Instructions

### 1. Pre-Submission Checklist

**Required files (typical lab):**

- [ ] Source code (.py file)
- [ ] Jupyter notebook (.ipynb file)
- [ ] Documentation (.docx or .pdf)
- [ ] Generated images/outputs (if applicable)
- [ ] README or instructions (if required)

**File naming conventions:**

- Use lowercase with underscores: `lab1_zipf_law.py`
- Include lab number: `lab1`, `lab2`, etc.
- Match assignment requirements exactly
- No spaces in filenames

### 2. Folder Structure

**Standard structure:**

```
lab1/
├── lab1_zipf_law.py          # Main Python script
├── lab1_zipf_law.ipynb       # Jupyter notebook
├── Lab1.docx                 # Documentation
└── images/                   # Generated outputs
    ├── zipf_comparison.png
    ├── zipf_stopword_comparison.png
    └── zipf_stability.png
```

### 3. Validation Steps

**Code validation:**

1. Run .py file from command line - verify no errors
2. Open .ipynb in Jupyter - run all cells successfully
3. Check all outputs are generated correctly
4. Verify no hardcoded absolute paths

**Documentation validation:**

1. Open .docx file - verify all images display
2. Check student info is filled in (Name, ID, Section)
3. Verify all required sections are complete
4. Check for spelling/grammar errors
5. Ensure data matches code output

**Consistency check:**

1. Compare .py and .ipynb logic
2. Verify .docx data matches code output
3. Check all image references are valid
4. Ensure file sizes are reasonable

### 4. Using the Submission Script

**A ready-to-use script is available:** `scripts/prepare_lab_submission.py`

**Usage:**

```bash
# Basic usage
python scripts/prepare_lab_submission.py <lab_dir> --files <file1> <file2> ...

# Example: Lab 1 with notebook and docx
python scripts/prepare_lab_submission.py lab1 --files lab1_zipf_law.ipynb Lab1.docx

# Example: Lab 2 with py, notebook, and pdf
python scripts/prepare_lab_submission.py lab2 --files lab2.py lab2.ipynb Lab2.pdf

# Custom output name
python scripts/prepare_lab_submission.py lab1 --files lab1.ipynb Lab1.docx --output my_submission

# Skip verification
python scripts/prepare_lab_submission.py lab1 --files lab1.ipynb Lab1.docx --no-verify
```

**Features:**

- Validates all required files exist
- Creates proper folder structure (lab1/files)
- Generates zip package automatically
- Verifies zip contents
- Provides submission checklist
- Shows file sizes and total package size

**Output:**

- Creates `<lab_name>.zip` in the lab directory
- Contains folder structure: `lab_name/files`
- Includes submission report and checklist

### 5. Final Checks Before Upload

- [ ] Zip file size is reasonable (<50MB)
- [ ] Filename matches requirements (e.g., `lab1.zip`)
- [ ] All required files are in the zip
- [ ] No unnecessary files included
- [ ] Student info is correct in all documents
- [ ] Code runs without errors
- [ ] Documentation is complete

### 6. Submission Report

Generate a submission checklist:

```markdown
## Lab Submission Report

**Lab:** Lab 1 - Zipf's Law Analysis
**Student:** [Name] ([ID])
**Date:** [Date]

### Files Included

- ✅ lab1_zipf_law.py (XX KB)
- ✅ lab1_zipf_law.ipynb (XX KB)
- ✅ Lab1.docx (XX KB)
- ✅ images/ (X files, XX KB total)

### Validation Results

- ✅ Code executes without errors
- ✅ All images generated successfully
- ✅ Documentation data matches code output
- ✅ File naming follows conventions
- ✅ Folder structure is correct

### Submission Package

- File: lab1.zip
- Size: XX KB
- Status: Ready for upload

### Upload Instructions

1. Go to Brightspace course page
2. Navigate to Assignments > Lab 1
3. Upload lab1.zip
4. Verify upload success
5. Check submission confirmation
```

## Common Submission Requirements

**Brightspace:**

- File format: .zip
- Max size: Usually 50-100MB
- Naming: Often `labX.zip` or `studentID_labX.zip`
- Deadline: Check course schedule

**Typical point deductions:**

- Missing files: -10 to -20%
- Wrong file format: -5 to -10%
- Code doesn't run: -20 to -50%
- Late submission: -10% per day
- Incorrect naming: -5%

## Troubleshooting

**Zip file too large:**

- Compress images (use PNG with lower DPI)
- Remove unnecessary files
- Don't include virtual environments or data files

**Code doesn't run:**

- Test on fresh environment
- Include requirements.txt or environment.yml
- Use relative paths only
- Add error handling

**Missing files:**

- Double-check assignment requirements
- Review rubric for required deliverables
- Ask instructor if unclear
