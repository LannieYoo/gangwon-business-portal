---
description: 提交代码前的自动化质量检查 (Pre-commit Checks)
---

# Code Quality & Review Workflow

本工作流用于在提交代码前进行全面的质量把关。

## 1. 静态代码分析 (Static Analysis)

调用相关 Skill 进行扫描。

- [ ] **Lint & Format**: 调用 `dev-code_style` 检查格式问题。
- [ ] **Security**: 调用 `dev-security_scan` 检查是否有 Hardcoded secrets。
- [ ] **Complexity**: 调用 `dev-code_quality_check` 检查长函数或深层嵌套。

```bash
# 示例命令 (根据 actual package.json 或环境调整)
npm run lint
# on python
# uv run ruff check .
```

## 2. 标准符合性 (Standards Compliance)

对照 `project-standards` 进行检查。

- [ ] 检查是否违反了 "Service Layer Responsibilities" (服务层是否做了数据转换?).
- [ ] 检查变量命名是否符合规范.
- [ ] 检查是否修改了不可变对象 (Mutation checks).

## 3. 测试验证 (Testing)

确保功能正确性。

- [ ] 运行受影响模块的单元测试。
- [ ] 运行全量测试套件 (如果时间允许)。

## 4. 报告 (Report)

生成检查报告。

- [ ] 总结发现的问题。
- [ ] 如果有严重问题，阻止提交并提出修复建议。
- [ ] 如果通过，允许用户进行 `git push`.
