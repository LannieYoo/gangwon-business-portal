"""
CST8506 Lab [N]: [Title]
Author: Peng Wang
Student Number: 041107730

[Brief description of what this lab does]
"""

# ============================================================
# 导入库
# Import Libraries
# ============================================================

# 导入操作系统模块
# Import os module
import os

# 导入数值计算库
# Import numerical computing libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# 导入sklearn相关模块（根据需要修改）
# Import sklearn modules (modify as needed)
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix

# ============================================================
# 配置常量
# Configuration Constants
# ============================================================

# 设置随机种子，确保实验可重现
# Set random seed to ensure experiment reproducibility
RANDOM_STATE = 42

# 设置测试集比例
# Set test set ratio
TEST_SIZE = 0.3

# 创建输出目录（替换 [n] 为实验编号）
# Create output directory (replace [n] with lab number)
OUTPUT_DIR = 'lab[n]_images'
os.makedirs(OUTPUT_DIR, exist_ok=True)
print(f"Output directory: {os.path.abspath(OUTPUT_DIR)}")

# ============================================================
# 步骤1：加载数据集
# Step 1: Load the dataset
# ============================================================
print("Step 1: Load the dataset")
print("-" * 40)

# 使用sklearn加载数据集
# Load dataset from sklearn
# 原因：这是一个标准数据集，适合演示机器学习算法
# Reason: This is a standard dataset suitable for demonstrating ML algorithms
data = load_wine()
X = data.data
y = data.target

# 打印加载成功消息
# Print loading success message
print(f"Dataset successfully loaded from sklearn.")

print()

# ============================================================
# 步骤2：打印统计信息
# Step 2: Print statistics
# ============================================================
print("Step 2: Print statistics")
print("-" * 40)

# 配置 Pandas 显示选项防止截断
# Configure Pandas display options to prevent truncation
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)

# 打印详细统计信息
# Print detailed statistics
print(f"Features shape: {X.shape}")
print(f"Target shape: {y.shape}")
print(f"\nFirst 5 rows:")
df = pd.DataFrame(X, columns=data.feature_names)
print(df.head())

print()

# ============================================================
# 步骤3：划分训练集和测试集
# Step 3: Split into train and test sets
# ============================================================
print("Step 3: Split into train and test sets")
print("-" * 40)

# 使用分层抽样划分数据
# Split data using stratified sampling
# 原因：分层抽样保持各类别比例一致
# Reason: Stratified sampling maintains consistent class ratios
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
)

print(f"Total samples: {len(X)}")
print(f"Training set: {len(X_train)} samples")
print(f"Test set: {len(X_test)} samples")

print()

# ============================================================
# 步骤4：数据标准化
# Step 4: Standardize data
# ============================================================
print("Step 4: Standardize data")
print("-" * 40)

# 使用StandardScaler标准化数据
# Use StandardScaler to standardize data
# 原因：许多算法对特征尺度敏感
# Reason: Many algorithms are sensitive to feature scales
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"StandardScaler applied:")
print(f"  - Fit on training data only (prevents data leakage)")
print(f"  - Transform both training and test data")
print(f"\nBefore scaling (first 3 features):")
print(f"  Mean: [{', '.join([f'{v:.2f}' for v in X_train[:, :3].mean(axis=0)])}]")
print(f"  Std:  [{', '.join([f'{v:.2f}' for v in X_train[:, :3].std(axis=0)])}]")
print(f"\nAfter scaling (first 3 features):")
print(f"  Mean: [{', '.join([f'{v:.4f}' for v in X_train_scaled[:, :3].mean(axis=0)])}]")
print(f"  Std:  [{', '.join([f'{v:.4f}' for v in X_train_scaled[:, :3].std(axis=0)])}]")
print(f"\nNote: After scaling, mean ≈ 0 and std ≈ 1")

print()

# ============================================================
# 步骤N：绘图示例
# Step N: Plot Example
# ============================================================
print("Step N: Plot Example")
print("-" * 40)

# 创建图表
# Create plot
fig, ax = plt.subplots(figsize=(10, 6))

# 绘制示例散点图
# Draw example scatter plot
scatter = ax.scatter(X_train_scaled[:, 0], X_train_scaled[:, 1], c=y_train, cmap='viridis')
ax.set_xlabel('Feature 1 (scaled)')
ax.set_ylabel('Feature 2 (scaled)')
ax.set_title('Sample Data Visualization')
plt.colorbar(scatter, label='Class')

# 保存图表（不使用 plt.show()）
# Save plot (don't use plt.show())
plot_path = os.path.join(OUTPUT_DIR, 'sample_plot.png')
plt.savefig(plot_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {plot_path}")

print()

# ============================================================
# 步骤N：结果汇总
# Step N: Results Summary
# ============================================================
print("Step N: Results Summary")
print("-" * 40)

# 创建结果DataFrame示例
# Create sample results DataFrame
results = [
    {'Model': 'Model A', 'Accuracy': 0.95, 'Note': 'Example'},
    {'Model': 'Model B', 'Accuracy': 0.92, 'Note': 'Example'},
]
results_df = pd.DataFrame(results)
print(results_df.to_string(index=False))

# 保存结果到CSV
# Save results to CSV
csv_path = os.path.join(OUTPUT_DIR, 'lab[n]_results.csv')
results_df.to_csv(csv_path, index=False)
print(f"Saved: {csv_path}")

print()

# ============================================================
# 提交提醒
# Submission Reminder
# ============================================================
print("=" * 60)
print("Reminder:")
print("1. Run: uv run python lab[n]_*.py > lab[n]_images/output.txt")
print("2. Check output.txt for correctness")
print("3. Generate screenshots using learning-code_screenshot skill")
print("4. Create answer document using Lab[n]AnswerTemplate.md")
print("5. Convert to .docx for submission")
print("=" * 60)
