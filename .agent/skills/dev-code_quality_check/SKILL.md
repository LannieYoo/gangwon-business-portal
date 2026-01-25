---
name: dev-code_quality_check
description: 自动代码质量检查器。Use when (1) 手动检查代码质量, (2) 提交前审查代码, (3) 分析函数/文件大小, (4) 检查嵌套深度
---

# 代码质量检查器

使用 AST（抽象语法树）分析的自动代码质量检查工具。

## 目标

- 检查函数大小（最大 50 行）
- 检查文件大小（最大 800 行）
- 检查嵌套深度（最大 4 层）
- 检测代码异味
- 生成质量报告

## 质量标准

### 文件大小

- **理想**: 200-400 行
- **最大**: 800 行
- **行动**: 超过 800 行必须拆分

### 函数大小

- **理想**: 10-20 行
- **最大**: 50 行
- **行动**: 超过 50 行必须拆分

### 嵌套深度

- **最大**: 4 层
- **行动**: 使用 early return 或提取函数

## 使用方式

### 检查单个文件

```powershell
uv run python .skills/dev-code_quality_check/scripts/check_code_format.py <file_path>
```

### 检查多个文件

```powershell
Get-ChildItem -Recurse -Include *.py | ForEach-Object {
    uv run python .skills/dev-code_quality_check/scripts/check_code_format.py $_.FullName
}
```

## 输出格式

```
检查: app/users/service.py

发现问题:
- 函数 'process_user_data' 过长 (85 行, 最大 50)
- 函数 'validate_input' 嵌套过深 (5 层, 最大 4)
- 文件过长 (950 行, 最大 800)

摘要:
- 总问题数: 3
- 检查函数数: 12
- 平均函数大小: 35 行
```

## 代码异味检测

### 1. 长函数

```python
# ❌ 超过 50 行的函数
def process_everything():
    # 100 行代码
    pass

# ✅ 拆分为小函数
def process_everything():
    validate_input()
    transform_data()
    save_results()
```

### 2. 深度嵌套

```python
# ❌ 5+ 层嵌套
if user:
    if user.is_admin:
        if market:
            if market.active:
                ...

# ✅ Early Return
if not user:
    return
if not user.is_admin:
    return
if not market:
    return
if not market.active:
    return
# 主逻辑
```

### 3. 魔法数字

```python
# ❌ 无解释的数字
if retry_count > 3:
    pass

# ✅ 命名常量
MAX_RETRIES = 3
if retry_count > MAX_RETRIES:
    pass
```

### 4. 重复代码

```python
# ❌ 重复逻辑
def process_user():
    if user.age < 18:
        return "Minor"
    return "Adult"

def check_eligibility():
    if user.age < 18:
        return False
    return True

# ✅ 提取共同逻辑
def is_adult(user):
    return user.age >= 18
```

## 自动修复建议

发现问题时:

1. **列出所有问题** - 文件路径和行号
2. **解释问题** - 为什么有问题
3. **建议修复** - 具体的代码示例
4. **提供修复** - 用户批准后执行

示例输出:

```
❌ app/users/service.py:45
   问题: 函数过长 (75 行)
   修复: 拆分为多个小函数

❌ app/markets/routes.py:120
   问题: 嵌套过深 (5 层)
   修复: 使用 early return

✓ 应用所有修复? (y/n)
```

## 集成

此脚本在以下情况自动调用:

- 保存 Python 文件时（通过 hook）
- 提交前（通过 pre-commit）
- 手动运行质量检查时

## 相关资源

- **主要规则**: `.kiro/steering/code-quality.md`
- **检查脚本**: `.skills/dev-code_quality_check/scripts/`
