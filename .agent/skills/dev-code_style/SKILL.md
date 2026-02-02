---
name: code-style
description: 代码风格检查与自动格式化。Use when (1) 配置 linter/formatter, (2) 修复代码风格问题, (3) 设置 pre-commit hooks, (4) 统一团队代码风格
---

# Code Style & Formatting

## Objectives

- Configure and run code formatters (Prettier, Black, Ruff)
- Set up linters (ESLint, Ruff, mypy)
- Fix style violations automatically
- Establish pre-commit hooks for consistency

## Python Style

### Tools

- **Ruff**: Fast linter + formatter (replaces Black, isort, flake8)
- **mypy**: Static type checker
- **pyproject.toml**: Configuration file

### Configuration

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py310"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
]
ignore = ["E501"]  # Line too long (handled by formatter)

[tool.mypy]
python_version = "3.10"
strict = true
warn_return_any = true
warn_unused_configs = true
```

### Commands

```bash
# Format code
ruff format .

# Check and fix linting issues
ruff check --fix .

# Type check
mypy src/

# Run all checks
ruff format . && ruff check --fix . && mypy src/
```

## TypeScript/JavaScript Style

### Tools

- **Prettier**: Code formatter
- **ESLint**: Linter
- **TypeScript**: Type checker

### Configuration

```javascript
// eslint.config.js
export default [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Commands

```bash
# Format code
npm run format
# or
npx prettier --write "src/**/*.{ts,tsx}"

# Lint and fix
npm run lint
# or
npx eslint --fix "src/**/*.{ts,tsx}"

# Type check
npx tsc --noEmit
```

## Style Rules

### Formatting

- **Line length**: 100 characters (Python and TypeScript)
- **Indentation**: 4 spaces (Python), 2 spaces (TypeScript)
- **Quotes**: Double quotes (TypeScript), either (Python, but consistent)
- **Trailing commas**: Yes (for multi-line)
- **Semicolons**: Yes (TypeScript)

### Naming (enforced by linters)

```python
# Python
class UserService:           # PascalCase
    MAX_RETRIES = 3         # UPPER_SNAKE_CASE

    def get_user(self):     # snake_case
        user_id = 123       # snake_case
        return user_id
```

```typescript
// TypeScript
class UserService {
  // PascalCase
  private readonly maxRetries = 3; // camelCase

  getUser(): User {
    // camelCase
    const userId = 123; // camelCase
    return user;
  }
}
```

### Imports

```python
# Python: Sorted by Ruff (isort)
import os
import sys
from pathlib import Path

import requests
from fastapi import FastAPI

from src.core.models import User
from src.services.auth import AuthService
```

```typescript
// TypeScript: Sorted by ESLint
import { useState, useEffect } from "react";
import type { User } from "@/types";

import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
```

## Type Annotations

### Python

```python
# Always annotate function signatures
def get_user(user_id: int) -> User | None:
    """Get user by ID."""
    return db.query(User).get(user_id)

# Use modern syntax (Python 3.10+)
def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}
```

### TypeScript

```typescript
// Prefer explicit types for public APIs
function getUser(userId: number): User | null {
  return db.users.find(userId);
}

// Use type inference for locals
const users = await fetchUsers(); // Type inferred
```

## Documentation

### Python Docstrings

```python
def calculate_score(
    user_id: int,
    weights: dict[str, float],
    normalize: bool = True
) -> float:
    """Calculate weighted score for user.

    Args:
        user_id: User identifier
        weights: Feature weights mapping
        normalize: Whether to normalize to [0, 1]

    Returns:
        Calculated score

    Raises:
        ValueError: If user not found
    """
    pass
```

### TypeScript JSDoc

```typescript
/**
 * Calculate weighted score for user
 *
 * @param userId - User identifier
 * @param weights - Feature weights mapping
 * @param normalize - Whether to normalize to [0, 1]
 * @returns Calculated score
 * @throws {Error} If user not found
 */
function calculateScore(
  userId: number,
  weights: Record<string, number>,
  normalize = true,
): number {
  // ...
}
```

## Pre-commit Hooks

### Python (using pre-commit)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
```

Install: `pre-commit install`

### TypeScript (using husky + lint-staged)

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

Install: `npx husky install && npx husky add .husky/pre-commit "npx lint-staged"`

## Auto-fix Workflow

When style issues are found:

1. **Run formatter first** (fixes most issues)

   ```bash
   ruff format .              # Python
   prettier --write .         # TypeScript
   ```

2. **Run linter with auto-fix**

   ```bash
   ruff check --fix .         # Python
   eslint --fix .             # TypeScript
   ```

3. **Check remaining issues**

   ```bash
   ruff check .               # Python
   eslint .                   # TypeScript
   ```

4. **Type check**
   ```bash
   mypy src/                  # Python
   tsc --noEmit               # TypeScript
   ```

## Common Issues

### Python

- **Import order**: Let Ruff handle it automatically
- **Line too long**: Use formatter, or add `# noqa: E501` if necessary
- **Type errors**: Add type annotations or use `# type: ignore[error-code]`

### TypeScript

- **Any types**: Replace with proper types or use `unknown`
- **Unused vars**: Remove or prefix with `_` if intentionally unused
- **Missing return types**: Add explicit return type annotations

## IDE Integration

### VS Code

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Validation Checklist

Before committing:

- [ ] Code is formatted (Prettier/Ruff)
- [ ] No linting errors (ESLint/Ruff)
- [ ] Type checks pass (TypeScript/mypy)
- [ ] All imports are sorted
- [ ] No unused variables or imports
- [ ] Functions have type annotations
- [ ] Public APIs have documentation

## Project-Specific Rules

Check for project overrides in:

- `pyproject.toml` (Python)
- `eslint.config.js` (TypeScript)
- `.prettierrc` (TypeScript)
- `.vscode/settings.json` (IDE settings)

Load these files first to understand project conventions.
