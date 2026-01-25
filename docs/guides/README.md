# 开发指南

本目录包含开发规范和最佳实践文档。

## 文档列表

| 文档                                       | 描述                                   |
| ------------------------------------------ | -------------------------------------- |
| [API 设计规范](./api-design-standard.md)   | RESTful API 设计标准、状态码、错误处理 |
| [编码规范](./coding-standard.md)           | Python/JavaScript 代码风格规范         |
| [字段格式规范](./field-format-standard.md) | 数据字段命名和格式定义                 |

## 快速参考

### API 设计

- 基础路径: `/api/v1`
- 响应格式: `{ code, message, data }`
- 认证方式: Bearer Token (JWT)

### 代码规范

**后端 (Python)**:

- 类名: `PascalCase`
- 函数/变量: `snake_case`
- 常量: `UPPER_SNAKE_CASE`

**前端 (JavaScript)**:

- 组件: `PascalCase`
- 函数/变量: `camelCase`
- 样式: `kebab-case` (BEM)

---

_最后更新: 2026-01-24_
