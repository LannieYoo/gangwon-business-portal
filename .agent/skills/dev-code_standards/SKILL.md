---
name: dev-code_standards
description: 代码规范检查与自动修正。Use when (1) 创建新项目/模块需要规范目录结构, (2) 检查文件命名是否符合规范, (3) 验证代码组织是否合理, (4) 重构现有代码结构
---

# 代码规范与结构验证

## 目标

- 验证目录结构遵循项目规范
- 检查文件命名规范
- 验证代码组织和模块边界
- 提供重构建议

## 目录结构标准

### Python 项目（按功能/领域组织）

```
project/
├── app/                    # 应用代码
│   ├── users/             # 用户功能模块
│   │   ├── models.py      # 数据模型
│   │   ├── service.py     # 业务逻辑
│   │   ├── routes.py      # API 路由
│   │   └── schemas.py     # Pydantic schemas
│   ├── markets/           # 市场功能模块
│   │   ├── models.py
│   │   ├── service.py
│   │   └── routes.py
│   ├── core/              # 核心配置与共享工具
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── enums.py
│   │   ├── exceptions.py
│   │   └── utils.py
├── tests/                  # 测试文件 (镜像 app 结构)
│   ├── users/
│   └── markets/
├── scripts/                # 工具脚本
├── docs/                   # 文档
└── pyproject.toml          # 依赖
```

### TypeScript/React 项目

```
project/
├── src/
│   ├── features/          # 功能模块（推荐）
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   └── markets/
│   ├── shared/            # 共享代码
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── app/               # 应用入口
│   └── styles/            # 全局样式
├── public/                 # 静态资源
└── package.json
```

## 命名规范

### Python

| 类型      | 格式                  | 示例              |
| --------- | --------------------- | ----------------- |
| 文件      | `snake_case.py`       | `user_service.py` |
| 类        | `PascalCase`          | `UserService`     |
| 函数/变量 | `snake_case`          | `get_user_by_id`  |
| 常量      | `UPPER_SNAKE_CASE`    | `MAX_RETRIES`     |
| 私有      | `_leading_underscore` | `_internal_state` |

### TypeScript/JavaScript

| 类型        | 格式               | 示例             |
| ----------- | ------------------ | ---------------- |
| 文件 (组件) | `PascalCase.tsx`   | `UserCard.tsx`   |
| 文件 (其他) | `camelCase.ts`     | `userService.ts` |
| 类/组件     | `PascalCase`       | `UserCard`       |
| 函数/变量   | `camelCase`        | `getUserById`    |
| 常量        | `UPPER_SNAKE_CASE` | `MAX_RETRIES`    |
| 类型/接口   | `PascalCase`       | `UserData`       |

### 目录

- 使用 `lowercase` 或 `kebab-case`
- 按功能/领域命名，不按类型

## 文件大小规范

| 指标     | 理想    | 最大 |
| -------- | ------- | ---- |
| 文件行数 | 200-400 | 800  |
| 函数行数 | 10-20   | 50   |
| 嵌套深度 | 2-3     | 4    |

## 验证步骤

### 1. 检查目录结构

```python
# 验证是否按功能/领域组织
good_patterns = [
    "app/users/",
    "app/markets/",
    "src/features/users/",
]

bad_patterns = [
    "models/",           # 按类型组织
    "services/",         # 按类型组织
    "utils/utils.py",    # 冗余命名
    "misc/", "temp/",    # 不清晰的目的
]
```

### 2. 检查文件大小

- 超过 800 行 → 必须拆分
- 函数超过 50 行 → 必须拆分

### 3. 检查导入结构

```python
# ✅ 正确：清晰的依赖层次
from app.users.models import User
from app.users.service import UserService

# ❌ 错误：循环导入，不清晰的边界
from app.utils import everything
```

## 拆分大文件示例

```python
# ❌ 一个 1000 行的文件
# services.py (1000 lines)

# ✅ 拆分为功能模块
app/
├── users/
│   └── service.py    (200 lines)
├── markets/
│   └── service.py    (250 lines)
└── orders/
    └── service.py    (180 lines)
```

## 验证检查清单

- [ ] 按功能/领域组织目录
- [ ] 所有文件遵循命名规范
- [ ] 无循环依赖
- [ ] 文件不超过 800 行
- [ ] 无泛型名称 (utils.py, helpers.py, common.py)
- [ ] 测试文件镜像源代码结构
- [ ] 文档保持最新

---

**详细规则参见**：`.kiro/steering/code-quality.md`
