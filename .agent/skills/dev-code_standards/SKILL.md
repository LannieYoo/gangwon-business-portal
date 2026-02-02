---
name: code-standards
description: 代码规范检查与自动修正。Use when (1) 创建新项目/模块需要规范目录结构, (2) 检查文件命名是否符合规范, (3) 验证代码组织是否合理, (4) 重构现有代码结构
---

# Code Standards & Structure Validation

## Objectives

- Validate directory structure follows project conventions
- Check file naming conventions (snake_case, kebab-case, PascalCase)
- Verify code organization and module boundaries
- Suggest refactoring when structure becomes messy

## Directory Structure Standards

### Python Projects

```
project/
├── src/                 # Source code
│   ├── core/           # Core business logic
│   ├── api/            # API endpoints
│   ├── models/         # Data models
│   ├── services/       # Business services
│   └── utils/          # Utility functions
├── tests/              # Test files (mirror src structure)
├── scripts/            # Utility scripts
│   ├── scrapers/       # Data collection
│   ├── organizers/     # Data processing
│   └── utils/          # Script utilities
├── docs/               # Documentation
└── pyproject.toml      # Dependencies
```

### TypeScript/React Projects

```
project/
├── src/
│   ├── components/     # React components (PascalCase)
│   ├── hooks/          # Custom hooks (use*.ts)
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── pages/          # Page components
├── public/             # Static assets
└── package.json
```

## Naming Conventions

### Python

- **Files**: `snake_case.py`
- **Classes**: `PascalCase`
- **Functions/Variables**: `snake_case`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: `_leading_underscore`

### TypeScript/JavaScript

- **Files**: `kebab-case.ts` or `PascalCase.tsx` (components)
- **Classes/Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### General

- **Directories**: `lowercase` or `kebab-case`
- **Config files**: Follow ecosystem conventions (`.eslintrc.js`, `pyproject.toml`)
- **Documentation**: `UPPERCASE.md` (README, CHANGELOG) or `kebab-case.md`

## Validation Steps

### 1. Check Directory Structure

```python
# Verify standard directories exist
required_dirs = ["src", "tests", "docs"]
optional_dirs = ["scripts", "config", "data"]

# Check for anti-patterns
bad_patterns = [
    "utils/utils.py",           # Redundant naming
    "helpers/helper.py",        # Vague naming
    "misc/", "temp/", "old/"    # Unclear purpose
]
```

### 2. Validate File Naming

- Check case consistency within each directory
- Verify test files match source files (`test_*.py` or `*.test.ts`)
- Flag overly generic names (`utils.py`, `helpers.py`, `common.py`)
- Suggest descriptive names based on file content

### 3. Check Module Organization

- **Single Responsibility**: Each file should have one clear purpose
- **Cohesion**: Related code should be grouped together
- **Coupling**: Minimize cross-module dependencies
- **Size**: Files over 500 lines should be split

### 4. Verify Import Structure

```python
# Good: Clear dependency hierarchy
from src.core.models import User
from src.services.auth import AuthService

# Bad: Circular imports, unclear boundaries
from src.utils import everything
```

## Auto-Fix Suggestions

When violations are found:

1. **List all issues** with file paths and line numbers
2. **Explain the problem** and why it matters
3. **Suggest specific fixes** with code examples
4. **Offer to apply fixes** if user approves

Example output:

```
❌ backend/scripts/helpers.py
   Issue: Generic filename in wrong location
   Fix: Move to backend/scripts/utils/file_helpers.py

❌ frontend/src/components/button.tsx
   Issue: Component file should use PascalCase
   Fix: Rename to Button.tsx

✓ Apply all fixes? (y/n)
```

## Common Refactoring Patterns

### Split Large Files

```python
# Before: services.py (800 lines)
# After:
services/
├── __init__.py
├── auth_service.py
├── user_service.py
└── email_service.py
```

### Extract Utilities

```python
# Before: Mixed in main module
# After:
utils/
├── validators.py    # Input validation
├── formatters.py    # Data formatting
└── converters.py    # Type conversion
```

### Organize by Feature

```python
# Feature-based (preferred for large projects)
features/
├── auth/
│   ├── models.py
│   ├── services.py
│   └── api.py
└── users/
    ├── models.py
    ├── services.py
    └── api.py
```

## Project-Specific Rules

Check for project-specific conventions in:

- `.kiro/steering/naming-conventions.md`
- `docs/development-principles.md`
- `docs/dependency-rules.md`

Load these files first to understand project context.

## Validation Checklist

Before completing:

- [ ] All files follow naming conventions
- [ ] Directory structure is logical and consistent
- [ ] No circular dependencies
- [ ] No files over 500 lines (without good reason)
- [ ] No generic names (utils.py, helpers.py, common.py)
- [ ] Test files mirror source structure
- [ ] Documentation is up to date

## Integration with Development Workflow

Trigger this skill when:

- Creating new modules or features
- Before committing major refactoring
- During code review
- When project structure feels messy
- User explicitly asks for structure validation

**For detailed naming rules:** See project docs in `docs/naming-conventions.md`
**For dependency guidelines:** See `docs/dependency-rules.md`
m
