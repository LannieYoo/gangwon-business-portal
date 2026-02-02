# Code Structure Examples

## Python Script (.py) Structure

```python
"""
Course Code Lab X: Title
Author: [Student Name]
Section: [Section Number]
Date: [Date]

Brief description of what the program does.

Innovations:
- Innovation 1
- Innovation 2
"""

# Step 1: Import libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Constants
RANDOM_STATE = 42
TEST_SIZE = 0.2

# Step 2: Load data
data = pd.read_csv('data.csv')

# Step 3: Preprocess
# ... implementation

# Define functions only for repeated operations
def plot_comparison(data1, data2, title):
    """Plot comparison between two datasets."""
    plt.figure(figsize=(10, 6))
    plt.plot(data1, label='Before')
    plt.plot(data2, label='After')
    plt.title(title)
    plt.legend()
    plt.show()

# Main analysis following assignment steps
# Step 4: ...
# Step 5: ...

# Submission reminder
print("\nReminder:")
print("1. Take screenshots")
print("2. Save to Assignment.docx")
```

## Jupyter Notebook (.ipynb) Structure

### Cell 1: Markdown - Title

```markdown
# Course Code Lab X: Title

**Author:** [Student Name]  
**Section:** [Section Number]  
**Date:** [Date]

## Description

Brief description of what the program does.

## Innovations

- Innovation 1
- Innovation 2
```

### Cell 2: Markdown - Step 1

```markdown
## Step 1: Import Libraries

Import required libraries for data analysis and visualization.
```

### Cell 3: Code - Step 1

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
```

### Cell 4: Markdown - Step 2

```markdown
## Step 2: Load Data

Load the dataset from CSV file.
```

### Cell 5: Code - Step 2

```python
data = pd.read_csv('data.csv')
data.head()
```

### Continue pattern for remaining steps...

### Final Cell: Markdown - Submission

```markdown
## Submission Reminder

- Take screenshots of all plots/outputs
- Save to Assignment.docx
- Complete discussion section
```

## Jupyter-Specific Guidelines

- Use `# %%` magic comments if converting from .py
- Keep markdown cells concise (2-4 sentences)
- Run all cells before saving to show outputs
- Use `plt.show()` for plots (displays inline)
- Clear outputs if file size is too large
- One code cell per logical step
- Keep cells focused (< 50 lines)
