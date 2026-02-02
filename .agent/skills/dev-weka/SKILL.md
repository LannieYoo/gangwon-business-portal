---
name: dev-weka
description: Work with Weka data files (.arff format). Use when (1) user needs to convert ARFF to CSV, (2) mentions Weka data files, (3) needs to extract column names from ARFF files.
---

# Weka Data Processing

## Objectives

Process Weka ARFF files for use in Python machine learning projects, particularly converting to CSV format with proper column headers.

## Instructions

### 1. Understanding ARFF Format

ARFF (Attribute-Relation File Format) is Weka's native data format:

```
@relation diabetes

@attribute preg numeric
@attribute plas numeric
@attribute pres numeric
@attribute skin numeric
@attribute insu numeric
@attribute mass numeric
@attribute pedi numeric
@attribute age numeric
@attribute class {tested_negative,tested_positive}

@data
6,148,72,35,0,33.6,0.627,50,tested_positive
1,85,66,29,0,26.6,0.351,31,tested_negative
...
```

### 2. Converting ARFF to CSV

**Method 1: Using Python (Recommended)**

```python
import pandas as pd
from scipy.io import arff

# Load ARFF file
data, meta = arff.loadarff('diabetes.arff')
df = pd.DataFrame(data)

# Convert byte strings to regular strings (for categorical columns)
for col in df.columns:
    if df[col].dtype == 'object':
        df[col] = df[col].str.decode('utf-8')

# Save to CSV
df.to_csv('diabetes.csv', index=False)
```

**Method 2: Manual Extraction**

Read ARFF file and extract:
1. Column names from `@attribute` lines
2. Data from `@data` section
3. Write to CSV with headers

### 3. Common Weka Datasets

**Diabetes Dataset:**
- Location: `weka/data/diabetes.arff`
- Features: 8 numeric attributes
- Target: binary class (tested_negative, tested_positive)
- Instances: 768

**Column Names:**
- preg (pregnancies)
- plas (plasma glucose)
- pres (blood pressure)
- skin (skin thickness)
- insu (insulin)
- mass (BMI)
- pedi (diabetes pedigree function)
- age
- class (target)

### 4. Handling Class Labels

Weka uses string labels, Python ML libraries prefer numeric:

```python
# Convert class labels to numeric
df['class'] = df['class'].map({
    'tested_negative': 0,
    'tested_positive': 1
})
```

### 5. Required Packages

```bash
uv add scipy pandas
```

## Validation

After conversion, verify:

- [ ] CSV file has correct number of columns
- [ ] Column names match ARFF attributes
- [ ] Number of rows matches ARFF data section
- [ ] Class labels properly converted
- [ ] No missing values introduced

## Common Issues

**Issue: Byte strings in DataFrame**
- Solution: Use `.str.decode('utf-8')` for object columns

**Issue: Missing column names**
- Solution: Extract from `@attribute` lines in ARFF

**Issue: Class labels as bytes**
- Solution: Decode and optionally map to numeric

## Example Workflow

1. Locate Weka data file (usually in `weka/data/`)
2. Load ARFF using scipy.io.arff
3. Convert to pandas DataFrame
4. Decode string columns
5. Save to CSV with headers
6. Verify column names and data integrity

## Anti-Patterns

- ❌ Using CSV without column headers
- ❌ Not decoding byte strings
- ❌ Losing class label information
- ❌ Not verifying data integrity after conversion
