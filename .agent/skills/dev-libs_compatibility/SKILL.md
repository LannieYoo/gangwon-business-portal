---
name: dev-libs_compatibility
description: 库兼容性检查专家。Use when (1) adding new dependencies, (2) upgrading packages, (3) encountering import errors, (4) resolving version conflicts.
---

# 库兼容性检查工作流

确保项目依赖之间的兼容性，避免版本冲突和运行时错误。

## 触发场景

- 添加新的依赖库
- 升级现有依赖版本
- 遇到 ImportError 或 ModuleNotFoundError
- 运行时出现意外的 API 变更错误
- CI/CD 构建失败
- 依赖安全漏洞修复

## 开发环境管理 (uv)

本项目使用 `uv` 统一管理 Python 环境和依赖。所有 Python 相关命令必须通过 `uv` 执行以确保环境隔离。

### 常用命令

| 任务             | 命令                        | 备注                                   |
| ---------------- | --------------------------- | -------------------------------------- |
| 同步依赖         | `uv sync`                   | 根据 `pyproject.toml` 安装所有包       |
| 添加依赖         | `uv add <package>`          | 自动更新 `pyproject.toml` 和 `uv.lock` |
| 添加开发依赖     | `uv add --dev <package>`    |                                        |
| 运行 Python 脚本 | `uv run <script.py>`        | 自动启动 venv                          |
| 运行模块命令     | `uv run python -m <module>` | 如 `uv run python -m py_compile`       |
| 运行测试         | `uv run pytest`             |                                        |
| 检查依赖状态     | `uv tree`                   | 查看依赖树                             |

### 多目录管理规约

根目录和 `backend/` 均有 `pyproject.toml`，但在根目录执行 `uv` 命令会自动识别 root `.venv`。

- **推荐做法**: 始终在项目根目录运行 `uv run ...`。

### 1. 版本约束策略

```toml
# 推荐：使用兼容版本约束
"package>=1.0.0,<2.0.0"    # 主版本锁定
"package~=1.4.2"           # 兼容版本（>=1.4.2,<1.5.0）
"package>=1.0.0"           # 仅最低版本（风险较高）
```

### 2. 语义版本规则

| 版本变化 | 含义                       | 风险  |
| -------- | -------------------------- | ----- |
| X.0.0    | 主版本（Breaking Changes） | 🔴 高 |
| 1.X.0    | 次版本（新功能，向后兼容） | 🟡 中 |
| 1.0.X    | 补丁版本（Bug 修复）       | 🟢 低 |

## 兼容性检查清单

### 添加新依赖前

```bash
# 1. 检查依赖的 Python 版本支持
uv run python -c "import package; print(package.__version__)"

# 2. 检查依赖的依赖（传递依赖）
uv pip show package

# 3. 检查是否与现有依赖冲突
uv pip check

# 4. 查看依赖的发布历史和维护状态
# 访问 PyPI: https://pypi.org/project/package/
```

### 升级依赖前

```bash
# 1. 查看当前版本
uv pip list | grep package

# 2. 查看可用版本
uv pip index versions package

# 3. 查看变更日志
# 访问项目的 CHANGELOG.md 或 GitHub Releases

# 4. 测试升级
uv pip install package==new_version --dry-run
```

## 已知兼容性问题

### Python 版本相关

| 库                          | 问题                                | 解决方案                                  |
| --------------------------- | ----------------------------------- | ----------------------------------------- |
| `passlib` + `bcrypt>=4.1.0` | passlib 不支持 bcrypt 4.1+ 的新 API | 降级 `bcrypt<4.1.0` 或直接使用 bcrypt     |
| `asyncio` + Python 3.10     | 移除了 `loop` 参数                  | 更新异步代码                              |
| `typing` 泛型               | Python 3.9+ 支持内置泛型            | 使用 `from __future__ import annotations` |

### 常见库组合问题

| 组合                        | 问题              | 解决方案                              |
| --------------------------- | ----------------- | ------------------------------------- |
| `passlib` + `bcrypt>=5.0.0` | API 不兼容        | 使用 `bcrypt<4.1.0` 或直接使用 bcrypt |
| `pydantic>=2.0` + 旧代码    | V2 API 变更       | 使用 `pydantic.v1` 兼容层             |
| `sqlalchemy>=2.0` + 旧 ORM  | API 变更          | 更新到 2.0 风格                       |
| `httpx>=0.25` + `app=` 参数 | 移除了 `app` 参数 | 使用 `ASGITransport`                  |

## 兼容性修复模式

### 模式 1: 版本降级

```toml
# pyproject.toml
dependencies = [
    "bcrypt>=4.0.0,<4.1.0",  # 锁定兼容版本
]
```

### 模式 2: 兼容性适配器

```python
# 创建兼容性层
try:
    from new_api import feature
except ImportError:
    from old_api import feature  # 回退

# 或使用版本检查
import package
if package.__version__ >= "2.0.0":
    from package.v2 import API
else:
    from package.v1 import API
```

### 模式 3: 替换实现

```python
# 替换 passlib 为直接使用 bcrypt
import bcrypt

def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    return bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(
        plain.encode('utf-8'),
        hashed.encode('utf-8')
    )
```

## 依赖审计流程

### 定期检查

```bash
# 1. 检查过时的包
uv pip list --outdated

# 2. 检查安全漏洞
pip-audit  # 需要安装 pip-audit

# 3. 验证依赖完整性
uv pip check
```

### CI/CD 集成

```yaml
# GitHub Actions
- name: Check Dependencies
  run: |
    uv pip check
    uv run pytest tests/ -v
```

## 项目依赖矩阵

维护一个依赖兼容性矩阵文档：

```markdown
# docs/dependencies.md

| 依赖     | 当前版本 | 兼容范围       | 已知问题       | 最后检查   |
| -------- | -------- | -------------- | -------------- | ---------- |
| fastapi  | 0.109.0  | >=0.104.0      | 无             | 2026-01-24 |
| pydantic | 2.5.0    | >=2.0.0        | V1 迁移        | 2026-01-24 |
| bcrypt   | 4.0.1    | >=4.0.0,<4.1.0 | passlib 不兼容 | 2026-01-24 |
| httpx    | 0.26.0   | >=0.25.0       | ASGITransport  | 2026-01-24 |
```

## 最佳实践

1. **锁定主版本** - 使用 `>=X.0.0,<X+1.0.0` 约束
2. **定期更新** - 每月检查依赖更新
3. **测试覆盖** - 升级前确保测试通过
4. **阅读变更日志** - 了解 Breaking Changes
5. **使用 lock 文件** - `uv.lock` 确保可重现性
6. **隔离测试** - 在 CI 中测试新版本
7. **记录问题** - 维护已知兼容性问题文档

## 紧急修复流程

当遇到兼容性问题时：

1. **识别问题** - 查看错误信息，确定是哪个库
2. **检查版本** - `uv pip show package`
3. **搜索问题** - GitHub Issues, Stack Overflow
4. **选择方案**:
   - 降级版本
   - 使用兼容层
   - 替换实现
5. **更新 pyproject.toml** - 添加版本约束
6. **同步依赖** - `uv sync`
7. **运行测试** - 验证修复
8. **记录问题** - 更新依赖矩阵文档

---

**记住**：依赖兼容性问题是常见的，关键是建立系统化的检查和修复流程。
