---
inclusion: always
---

# Windows Command Standards

This workspace runs on Windows with PowerShell. All commands must follow Windows conventions.

## Critical Rules

1. **ALWAYS prefix Python commands with `uv run`** - Never invoke `python` directly
2. **NEVER use `cd` command** - Use the `cwd` parameter in tool calls instead
3. **Use PowerShell syntax** - Not bash/Linux commands (`dir` not `ls`, `Remove-Item` not `rm`)
4. **Use semicolon (`;`) for command chaining** - Not `&&` or `||`

## Python Package Management

**REQUIRED: Use `uv` exclusively for all Python package operations.**

```powershell
# Install packages
uv add package-name
uv add --dev dev-package-name

# Execute Python
uv run python script.py
uv run python -m module.name

# Sync dependencies
uv sync
```

**FORBIDDEN:**
- `pip install` - Use `uv add`
- `conda install` - Use `uv add`
- `python script.py` - Use `uv run python script.py`

## Working Directory Management

**CRITICAL: Never use `cd` command. Always use `cwd` parameter in tool calls.**

```python
# ✅ CORRECT
executePwsh(
    command="uv run python script.py",
    cwd="courses/ml/code/lab1"
)

# ❌ FORBIDDEN
executePwsh(command="cd courses/ml/code/lab1; python script.py")
executePwsh(command="cd courses/ml/code/lab1 && python script.py")
```

## PowerShell File Operations

Use PowerShell cmdlets, not Linux commands:

```powershell
# List files
dir
Get-ChildItem

# Create directory
mkdir dirname
New-Item -ItemType Directory -Path dirname

# Remove file/directory
Remove-Item file.txt
Remove-Item -Recurse -Force dirname

# Copy/Move
Copy-Item source.txt destination.txt
Move-Item source.txt destination.txt

# Read file
Get-Content file.txt

# Check existence
Test-Path file.txt
```

**FORBIDDEN Linux commands:**
- `ls` → Use `dir` or `Get-ChildItem`
- `rm` → Use `Remove-Item`
- `cp` → Use `Copy-Item`
- `mv` → Use `Move-Item`
- `cat` → Use `Get-Content`

## Path Conventions

PowerShell accepts both forward slashes and backslashes. Be consistent within each path:

```powershell
# Both acceptable
courses/ml/code/lab1/file.py
courses\ml\code\lab1\file.py

# Relative paths
.\script.py
..\parent\file.txt
```

## Command Chaining

```powershell
# ✅ CORRECT - Use semicolon
command1; command2; command3

# ✅ CORRECT - Use pipeline
Get-ChildItem | Where-Object {$_.Extension -eq ".py"}

# ❌ FORBIDDEN
command1 && command2    # Not supported
command1 || command2    # Not supported
```

## Environment Variables

```powershell
# Set variable
$env:VAR_NAME = "value"

# Get variable
$env:VAR_NAME
```

## Common Task Patterns

### Running Python Scripts

```powershell
# Basic execution
uv run python script.py

# With arguments
uv run python script.py arg1 arg2

# Module execution
uv run python -m pytest tests/

# In specific directory (use cwd parameter)
executePwsh(
    command="uv run python script.py",
    cwd="target/directory"
)
```

### Installing Dependencies

```powershell
# Add packages
uv add requests pandas numpy

# Add dev dependencies
uv add --dev pytest black ruff
```

### Running Tests

```powershell
# Execute tests
uv run pytest tests/

# With specific file
uv run pytest tests/test_file.py
```

## Quick Reference Table

| Operation | ✅ Use | ❌ Never Use |
|-----------|--------|--------------|
| Install package | `uv add package` | `pip install package` |
| Run Python | `uv run python script.py` | `python script.py` |
| List files | `dir` or `Get-ChildItem` | `ls` |
| Remove file | `Remove-Item file.txt` | `rm file.txt` |
| Copy file | `Copy-Item src dst` | `cp src dst` |
| Change directory | Use `cwd` parameter | `cd directory` |
| Chain commands | `;` | `&&` or `||` |

## Pre-Execution Checklist

Before executing any command, verify:

- [ ] Python commands prefixed with `uv run`
- [ ] No `cd` commands (using `cwd` parameter instead)
- [ ] PowerShell syntax (not Linux commands)
- [ ] Semicolon (`;`) for command chaining (not `&&`)
- [ ] Consistent path separators within each path
