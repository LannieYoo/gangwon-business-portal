# 项目规范

本目录包含项目管理和协作相关规范。

## 文档列表

| 文档                                     | 描述                          |
| ---------------------------------------- | ----------------------------- |
| [Git 提交规范](./git-commit-standard.md) | Commit message 格式、分支策略 |

## Git 提交规范快速参考

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

| 类型       | 描述      |
| ---------- | --------- |
| `feat`     | 新功能    |
| `fix`      | Bug 修复  |
| `docs`     | 文档更新  |
| `style`    | 代码格式  |
| `refactor` | 代码重构  |
| `test`     | 测试相关  |
| `chore`    | 构建/工具 |

### 示例

```bash
git commit -m "feat(auth): 添加用户登录功能"
git commit -m "fix(api): 修复绩效数据查询分页问题"
git commit -m "docs: 更新 API 文档"
```

---

_最后更新: 2026-01-24_
