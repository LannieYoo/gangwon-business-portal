---
description: 端到端的新功能开发流程 (From Idea to Code)
---

# Feature Implementation Workflow

本工作流通过串联多个 Skill，协助用户完成高质量的功能开发。

## 1. 需求定义 (Requirement)

调用 `dev-prd` Skill 来明确需求和验收标准。

- [ ] 询问用户功能的具体描述。
- [ ] 使用 `python .agent/skills/dev-prd/scripts/generate_prd.py "功能名称"` 生成 PRD 草稿。
- [ ] 协助用户完善 "User Stories" 和 "Acceptance Criteria"。
- [ ] 确认需求已满足 `project-standards` 中的规范。

## 2. 测试驱动 (TDD Setup)

调用 `dev-tdd_workflow` Skill 准备测试环境。

- [ ] 基于验收标准编写失败的测试用例 (Red)。
- [ ] 验证测试确实失败。

## 3. 功能实现 (Implementation)

编写符合规范的代码。

- [ ] 遵循 `project-standards` (服务层纯净、不可变性等)。
- [ ] 实现代码以通过测试 (Green)。
- [ ] 使用 `dev-coding_standards` 检查代码质量。

## 4. 验证与重构 (Verify & Refactor)

调用 `dev-verification_loop` Skill。

- [ ] 运行所有测试确保无回归。
- [ ] 检查代码是否可以重构 (Cleaner code)。
- [ ] 确保文档（API 文档、注释）已更新。

## 5. 提交 (Commit)

遵循 Git 规范。

- [ ] 确认没有 console.log 或 secrets。
- [ ] 生成符合 `git-workflow` 的提交信息 (e.g., `feat: ...`).
