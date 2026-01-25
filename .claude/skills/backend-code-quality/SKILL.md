---
name: backend-code-quality
description: 后端代码质量检查工具，检查模块结构、命名规范、依赖关系、分层架构等。
---

# Backend Code Quality Checker Skill

后端代码质量检查工具，用于确保 Python 后端模块符合项目架构规范。

## 脚本位置

本 skill 包含的脚本已迁移到：
- `.claude/skills/backend-code-quality/scripts/module_checker/` - 完整的模块检查器

> **注意**: 原始 `backend/scripts/module_checker/` 目录下的这些脚本可以安全删除。

## 功能特性

### 架构检查

基于 Outside-In 开发方法和分层架构的代码质量检查：

1. **分层结构检查**
   - 验证模块目录结构
   - 检查必需文件存在性
   - 确保分层清晰

2. **命名规范检查**
   - 文件命名规范
   - 类命名规范
   - 函数命名规范

3. **依赖关系检查**
   - 层级依赖规则（下层不依赖上层）
   - 循环依赖检测
   - 外部依赖管理

4. **代码规范检查**
   - 导入规范
   - 导出规范
   - 注释规范
   - 类型注解

### 检查器列表

| 检查器 | 功能 | 优先级 |
|--------|------|--------|
| `check_layer_structure` | 分层结构 | 🔴 CRITICAL |
| `check_naming` | 文件命名 | 🔴 CRITICAL |
| `check_layer_dependency` | 层级依赖 | 🔴 CRITICAL |
| `check_imports` | 导入规范 | 🟡 HIGH |
| `check_exports` | 导出规范 | 🟡 HIGH |
| `check_functions` | 函数规范 | 🟡 HIGH |
| `check_dataclass` | Dataclass 规范 | 🟢 MEDIUM |
| `check_enum` | Enum 规范 | 🟢 MEDIUM |
| `check_interface` | Interface 规范 | 🟢 MEDIUM |
| `check_model` | Model 规范 | 🟢 MEDIUM |
| `check_dto` | DTO 规范 | 🟢 MEDIUM |
| `check_router` | Router 规范 | 🟡 HIGH |
| `check_service` | Service 规范 | 🟡 HIGH |
| `check_repository` | Repository 规范 | 🟡 HIGH |
| `check_impl` | Impl 规范 | 🟢 MEDIUM |
| `check_abstract` | Abstract 规范 | 🟢 MEDIUM |
| `check_deps` | 依赖注入 | 🟡 HIGH |

## 使用方法

### 检查单个模块

```bash
# 从项目根目录运行
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py backend/modules/your_module

# 检查特定方面
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_naming.py backend/modules/your_module
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_imports.py backend/modules/your_module
```

### 检查所有模块

```bash
# 批量检查所有模块
for module in backend/modules/*; do
  if [ -d "$module" ]; then
    echo "检查: $module"
    python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py "$module"
  fi
done
```

## 架构规范

### 分层结构

项目采用严格的分层架构：

```
backend/modules/your_module/
├── contract/              # 契约层（接口定义）
│   ├── d_*.py            # Dataclass
│   ├── e_*.py            # Enum
│   └── i_*.py            # Interface
├── data/                  # 数据层
│   ├── model.py          # 数据库模型
│   └── dto.py            # 数据传输对象
├── outside/               # 外层（API入口）
│   └── router.py         # FastAPI 路由
├── inside/                # 内层（业务逻辑）
│   ├── service.py        # 业务服务
│   ├── repository.py     # 数据访问
│   ├── impl/             # 实现
│   │   └── *_impl.py
│   └── abstract/         # 抽象基类
│       └── *_abstract.py
├── deps.py               # 依赖注入
└── __init__.py
```

### 命名规范

1. **Contract 层**
   - Dataclass: `d_user.py` → `class UserData`
   - Enum: `e_status.py` → `class StatusEnum`
   - Interface: `i_service.py` → `class IUserService`

2. **Data 层**
   - Model: `model.py` → `class User`
   - DTO: `dto.py` → `class UserCreateDTO`

3. **Outside 层**
   - Router: `router.py` → `router = APIRouter()`

4. **Inside 层**
   - Service: `service.py` → `class UserService`
   - Repository: `repository.py` → `class UserRepository`
   - Impl: `user_impl.py` → `class UserServiceImpl`
   - Abstract: `base_abstract.py` → `class BaseService`

### 依赖规则

```
Outside (router) ──→ Inside (service) ──→ Data (repository, model)
                 ↓                    ↓
              Contract (interface) ←───┘
```

**规则**:
- ✅ 上层可以依赖下层
- ❌ 下层不能依赖上层
- ✅ 所有层可以依赖 Contract
- ❌ 禁止循环依赖

## 检查报告

### 成功示例

```
✓ 分层结构检查通过
✓ 命名规范检查通过
✓ 层级依赖检查通过
✓ 导入规范检查通过

总结: 所有检查通过 ✓
```

### 失败示例

```
❌ 分层结构检查失败
  - 缺少必需目录: contract/
  - 缺少必需文件: deps.py

❌ 命名规范检查失败
  - 文件命名错误: contract/user.py 应为 d_user.py 或 i_user.py

❌ 层级依赖检查失败
  - 违反依赖规则: data/model.py 导入了 outside/router.py

总结: 3/10 检查失败 ❌
```

## 工作流场景

### 场景 1: 创建新模块

**需求**: 创建新模块并验证结构

```bash
# 1. 创建模块目录
mkdir -p backend/modules/new_module/{contract,data,outside,inside}

# 2. 创建必需文件
touch backend/modules/new_module/{__init__.py,deps.py}
touch backend/modules/new_module/data/{model.py,dto.py}
touch backend/modules/new_module/outside/router.py
touch backend/modules/new_module/inside/{service.py,repository.py}

# 3. 运行结构检查
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_layer_structure.py backend/modules/new_module

# 4. 运行完整检查
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py backend/modules/new_module
```

### 场景 2: 重构现有模块

**需求**: 重构模块以符合规范

```bash
# 1. 运行完整检查，识别问题
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py backend/modules/old_module

# 2. 查看详细错误
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_naming.py backend/modules/old_module
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_layer_dependency.py backend/modules/old_module

# 3. 修复问题后重新检查
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py backend/modules/old_module
```

### 场景 3: CI/CD 集成

**需求**: 在 CI/CD 管道中自动检查

```yaml
# .github/workflows/code-quality.yml
name: Code Quality Check

on: [push, pull_request]

jobs:
  check-modules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Check all modules
        run: |
          for module in backend/modules/*; do
            if [ -d "$module" ]; then
              python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py "$module" || exit 1
            fi
          done
```

### 场景 4: Pre-commit Hook

**需求**: 提交前自动检查

```bash
# .git/hooks/pre-commit
#!/bin/bash

# 检查修改的模块
changed_files=$(git diff --cached --name-only --diff-filter=ACM | grep "^backend/modules/")

if [ -n "$changed_files" ]; then
  modules=$(echo "$changed_files" | cut -d'/' -f1-3 | sort -u)

  for module in $modules; do
    echo "检查模块: $module"
    python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py "$module"

    if [ $? -ne 0 ]; then
      echo "❌ 代码质量检查失败，请修复后再提交"
      exit 1
    fi
  done
fi
```

## 配置选项

### 自定义检查规则

编辑检查器脚本以自定义规则：

```python
# check_naming.py
NAMING_RULES = {
    "dataclass": r"^d_[a-z_]+\.py$",
    "enum": r"^e_[a-z_]+\.py$",
    "interface": r"^i_[a-z_]+\.py$",
}

# 自定义规则
CUSTOM_RULES = {
    "service": r"^[a-z_]+_service\.py$",
}
```

### 跳过特定检查

```bash
# 跳过命名检查
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py backend/modules/your_module --skip naming

# 仅运行结构检查
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_layer_structure.py backend/modules/your_module
```

## 最佳实践

### 1. Outside-In 开发顺序

遵循检查器的顺序开发：

1. **Router** (Outside) - 定义 API 接口
2. **Service** (Inside) - 实现业务逻辑
3. **Repository** (Inside) - 实现数据访问
4. **Impl** - 提取可复用实现
5. **Abstract** - 提取公共基类
6. **Deps** - 配置依赖注入

### 2. 频繁检查

- 创建新文件后立即检查
- 重构代码后立即检查
- 提交前必须检查
- PR 合并前必须通过所有检查

### 3. 修复优先级

1. **CRITICAL** - 立即修复（结构、命名、依赖）
2. **HIGH** - 尽快修复（导入、导出、函数）
3. **MEDIUM** - 计划修复（类型注解、注释）

### 4. 团队协作

- 所有成员遵循相同规范
- 代码审查时检查架构合规性
- 定期重构以保持代码质量

## 故障排除

### Q: "找不到模块路径"

**A**: 确保从项目根目录运行
```bash
# ✅ GOOD
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py backend/modules/your_module

# ❌ BAD
cd backend/modules/your_module
python check_all.py .
```

### Q: "检查器报告误报"

**A**: 检查文件内容是否符合预期
1. 查看检查器源代码了解规则
2. 确认文件命名和内容一致
3. 如有必要，提交 issue 或修改规则

### Q: "某些规则太严格"

**A**: 可以自定义检查器
1. 复制检查器脚本
2. 修改规则配置
3. 使用自定义版本

## 集成 Claude Code

### 自动检查建议

当用户修改 backend 模块时，Claude Code 应该：

1. **识别修改的模块**
2. **自动运行相关检查**
3. **报告问题和建议修复**

```
User: 创建新的 user 模块

Claude: 正在创建 user 模块...
✓ 创建目录结构
✓ 创建必需文件

正在运行代码质量检查...
python .claude/skills/backend-code-quality/scripts/module_checker/checkers/check_all.py backend/modules/user

✓ 所有检查通过！
```

## 相关资源

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Outside-In TDD](https://www.codecademy.com/article/tdd-outside-in)

---

**记住**: 架构规范不是限制，而是保证代码质量和可维护性的基础。
