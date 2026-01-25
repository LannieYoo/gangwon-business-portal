---
name: dev-code_style
description: 代码风格检查与自动格式化。Use when (1) 配置 linter/formatter, (2) 修复代码风格问题, (3) 设置 pre-commit hooks, (4) 统一团队代码风格
---

# 代码风格与格式化

## 目标

- 配置和运行代码格式化工具
- 设置代码检查工具
- 自动修复风格问题
- 建立 pre-commit hooks

## Python 配置

### 工具

- **Ruff**: 快速 linter + formatter（替代 Black, isort, flake8）
- **mypy**: 静态类型检查
- **pyproject.toml**: 配置文件

### 配置

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
```

### 命令

```bash
# 格式化
uv run ruff format .

# 检查并修复
uv run ruff check --fix .

# 类型检查
uv run mypy app/

# 运行所有检查
uv run ruff format . && uv run ruff check --fix . && uv run mypy app/
```

## TypeScript/JavaScript 配置

### 工具

- **Prettier**: 代码格式化
- **ESLint**: Linter
- **TypeScript**: 类型检查

### 配置

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

```javascript
// eslint.config.js
export default [
  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
```

### 命令

```bash
# 格式化
npm run format

# 检查并修复
npm run lint -- --fix

# 类型检查
npx tsc --noEmit
```

## 格式化规则

| 规则     | Python         | TypeScript |
| -------- | -------------- | ---------- |
| 行长度   | 100            | 100        |
| 缩进     | 4 空格         | 2 空格     |
| 引号     | 双引号或单引号 | 双引号     |
| 尾随逗号 | 是             | 是         |
| 分号     | N/A            | 是         |

## 类型注解

### Python

```python
# ✅ 始终注解函数签名
def get_user(user_id: int) -> User | None:
    return db.query(User).get(user_id)

# 使用现代语法 (Python 3.10+)
def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}
```

### TypeScript

```typescript
// ✅ 公共 API 使用显式类型
function getUser(userId: number): User | null {
  return db.users.find(userId);
}

// 局部变量可以使用类型推断
const users = await fetchUsers(); // 类型推断
```

## Pre-commit Hooks

### Python

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
```

安装: `pre-commit install`

### TypeScript

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

安装: `npx husky install && npx husky add .husky/pre-commit "npx lint-staged"`

## 自动修复流程

1. **先运行格式化**

   ```bash
   ruff format .              # Python
   prettier --write .         # TypeScript
   ```

2. **运行 linter 并自动修复**

   ```bash
   ruff check --fix .         # Python
   eslint --fix .             # TypeScript
   ```

3. **检查剩余问题**

   ```bash
   ruff check .               # Python
   eslint .                   # TypeScript
   ```

4. **类型检查**
   ```bash
   mypy app/                  # Python
   tsc --noEmit               # TypeScript
   ```

## VS Code 配置

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

## 验证检查清单

- [ ] 代码已格式化
- [ ] 无 linting 错误
- [ ] 类型检查通过
- [ ] 所有导入已排序
- [ ] 无未使用的变量或导入
- [ ] 函数有类型注解
- [ ] 公共 API 有文档

---

**主要规则参见**：`.kiro/steering/code-quality.md`
