# Code Principles and Examples

## Self-Documenting Code

### Bad: Needs comments to understand

```python
x = df[df['c'] > 0]
y = x.groupby('g').mean()  # Calculate mean by group
```

### Good: Self-explanatory

```python
positive_values = df[df['count'] > 0]
mean_by_group = positive_values.groupby('category').mean()
```

## Function Usage

### Good: Functions for repeated code

```python
# This plotting code appears 3 times with different data
# Extract into a function
def plot_comparison(data1, data2, title):
    """Plot comparison between two datasets."""
    plt.figure(figsize=(10, 6))
    plt.plot(data1, label='Before')
    plt.plot(data2, label='After')
    plt.title(title)
    plt.legend()
    plt.show()

# Use the function
plot_comparison(original_data, processed_data, 'Data Comparison')
plot_comparison(train_data, test_data, 'Train vs Test')
plot_comparison(predicted, actual, 'Prediction vs Actual')
```

### Bad: Function for one-time operation

```python
# This only happens once - no need for a function
def load_and_split_data():
    """Load data and split into train/test."""
    df = pd.read_csv('data.csv')
    return train_test_split(df, test_size=0.2)

# Just write it inline instead
df = pd.read_csv('data.csv')
X_train, X_test, y_train, y_test = train_test_split(df, test_size=0.2)
```

## Comment Philosophy

### When to Add Comments

✅ **Explaining WHY a specific approach was chosen:**

```python
# Use StandardScaler instead of MinMaxScaler because PCA is sensitive to variance
scaler = StandardScaler()
```

✅ **Documenting non-obvious algorithm decisions:**

```python
# Set test_size=0.2 to follow 80/20 rule for sufficient training data
# while keeping enough test samples for reliable evaluation
X_train, X_test = train_test_split(X, test_size=0.2)
```

✅ **Clarifying complex mathematical operations:**

```python
# Calculate Zipf exponent using log-log linear regression
# Slope of log(rank) vs log(frequency) gives negative exponent
slope, _, r_value, _, _ = stats.linregress(log_rank, log_freq)
zipf_exponent = -slope
```

❌ **Describing WHAT the code does (should be obvious):**

```python
# Create a StandardScaler
scaler = StandardScaler()

# Scale the data
X_scaled = scaler.fit_transform(X)

# Split into train and test
X_train, X_test = train_test_split(X, test_size=0.2)
```

## Comment Progression: Good → Better → Best

### Good: Comments explain "why"

```python
# Use StandardScaler because PCA is sensitive to variance
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 80/20 split balances training data with test reliability
X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)
```

### Better: Self-explanatory code with minimal comments

```python
# StandardScaler preserves feature importance for PCA
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 80/20 split balances training data size with test reliability
TEST_SIZE = 0.2
RANDOM_STATE = 42
X_train, X_test = train_test_split(X, test_size=TEST_SIZE, random_state=RANDOM_STATE)
```

### Best: Self-documenting code (no comments needed)

```python
scaler = StandardScaler()
scaled_features = scaler.fit_transform(features)

TRAIN_TEST_SPLIT_RATIO = 0.2
REPRODUCIBILITY_SEED = 42
train_data, test_data = train_test_split(
    scaled_features, 
    test_size=TRAIN_TEST_SPLIT_RATIO, 
    random_state=REPRODUCIBILITY_SEED
)
```

## Avoiding AI-Generated Appearance

### ❌ Bad: Looks AI-generated

```python
# ... main code ...

# Summary
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Original features: {n_features}")
print(f"Reduced features: {n_components}")
print(f"Variance retained: {variance:.2%}")
print(f"Baseline accuracy: {baseline_acc:.4f}")
print(f"PCA accuracy: {pca_acc:.4f}")
print(f"Accuracy change: {(pca_acc - baseline_acc)*100:+.2f}%")
print()
print("Lab 1 completed successfully!")
print("=" * 80)
```

### ✅ Good: Natural ending

```python
# ... main code ...

# Step 14: Plot 3D visualization
plot_3d_pca(X_train_pca, y_train)

# Submission reminder
print("\nReminder:")
print("1. Take screenshots of all plots")
print("2. Save to Lab1.docx")
print("3. Submit code and document")
```

## Code Requirements Checklist

### Must Include

- ✅ File-level docstring with author, section, date (if required)
- ✅ Function docstrings with Args/Returns (for all functions)
- ✅ Meaningful, self-explanatory variable names
- ✅ Constants for magic numbers
- ✅ Minimal "why" comments (only when needed)
- ✅ Proper spacing (2 lines between functions)
- ✅ Follow assignment step order exactly

### Code Clarity Principle

- Write code that explains itself through clear naming
- Only add comments when "why" is not obvious
- Prefer refactoring unclear code over adding comments
- If you need a comment to explain "what", improve the code

### Function Usage Principle

- Only create functions when code is repeated (DRY)
- Don't create functions for one-time operations
- Keep main program flow readable and sequential

## Special Considerations

### Data Downloads

```python
# Comment out download commands with instructions
# Uncomment the following line on first run to download data:
# !wget https://example.com/data.csv

# Check if data exists before downloading
if not os.path.exists('data.csv'):
    print("Please download data.csv first")
```

### Plotting

```python
# Use English labels
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.title('PCA Visualization')

# Include grid for readability
plt.grid(True, alpha=0.3)

# Use appropriate figure sizes
plt.figure(figsize=(10, 6))
```

### Error Handling

```python
# Add try-except for file operations
try:
    df = pd.read_csv('data.csv')
except FileNotFoundError:
    print("Error: data.csv not found")
    print("Please ensure the file is in the current directory")
    exit(1)

# Validate input data
if df.isnull().any().any():
    print("Warning: Dataset contains missing values")
```
