---
description: 系统化地修复 Bug (Reproduce -> Fix -> Verify)
---

# Bug Fix Protocol

本工作流用于规范化 Bug 修复过程，防止回归。

## 1. 复现与定位 (Reproduction)

不要猜测，先复现。

- [ ] 要求用户提供复现步骤或错误日志。
- [ ] 创建一个**必定失败的测试用例**来重现该 Bug (TDD)。
- [ ] 确认测试失败的原因与 Bug 描述一致。

## 2. 修复 (Fixing)

修复问题。

- [ ] 分析根本原因 (Root Cause Analysis).
- [ ] 实施修复。
- [ ] 保持代码风格符合 `project-standards`。

## 3. 验证 (Verification)

调用 `dev-verification_loop`。

- [ ] 运行之前的失败测试，确保通过。
- [ ] 运行相关模块的其他测试，确保无回归 (Regression Check)。

## 4. 记录 (Documentation)

如果 Bug 涉及复杂逻辑或设计缺陷。

- [ ] 更新相关文档。
- [ ] 代码中添加必要的解释性注释 (Follow comment rules)。
