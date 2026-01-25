---
description: 使用 Playwright 生成和运行端到端测试。创建测试场景、运行测试、捕获截图/视频/追踪，并上传工件。
---

# E2E Command

此命令调用 **e2e-runner** agent 来生成、维护和执行使用 Playwright 的端到端测试。

## 此命令的功能

1. **生成测试场景** - 为用户流程创建 Playwright 测试
2. **运行 E2E 测试** - 跨浏览器执行测试
3. **捕获工件** - 失败时的截图、视频、追踪
4. **上传结果** - HTML 报告和 JUnit XML
5. **识别不稳定测试** - 隔离不稳定的测试

## 何时使用

在以下情况使用 `/e2e`：
- 测试关键用户流程（登录、项目申请、实绩提交）
- 验证多步骤流程端到端工作
- 测试 UI 交互和导航
- 验证前端和后端之间的集成
- 准备生产部署

## 工作原理

e2e-runner agent 将：

1. **分析用户流程**并识别测试场景
2. **生成 Playwright 测试**使用 Page Object Model 模式
3. **跨多个浏览器运行测试**（Chrome、Firefox）
4. **捕获失败**时的截图、视频和追踪
5. **生成报告**包含结果和工件
6. **识别不稳定测试**并推荐修复

## 项目关键流程（必须测试）

**🔴 CRITICAL（必须始终通过）:**
1. 用户注册和登录
2. 项目列表浏览
3. 项目申请提交
4. 实绩报告提交
5. FAQ 查看和咨询提交
6. 语言切换（韩语 ↔ 中文）

**🟡 IMPORTANT:**
1. 管理员会员管理
2. 管理员项目审核
3. 文件上传
4. 表单验证
5. 响应式布局

## 示例用法

```bash
# 生成登录流程测试
/e2e 测试用户登录流程

# 生成项目申请测试
/e2e 测试项目申请提交流程

# 运行所有 E2E 测试
npx playwright test

# 运行特定测试
npx playwright test tests/e2e/auth/login.spec.js

# 查看报告
npx playwright show-report
```

## 测试工件

当测试运行时，会捕获以下工件：

**所有测试:**
- 带有时间轴和结果的 HTML 报告
- 用于 CI 集成的 JUnit XML

**仅失败时:**
- 失败状态的截图
- 测试的视频录制
- 用于调试的追踪文件（逐步重放）
- 网络日志
- 控制台日志

## 查看工件

```bash
# 在浏览器中查看 HTML 报告
npx playwright show-report

# 查看特定追踪文件
npx playwright show-trace artifacts/trace-abc123.zip

# 截图保存在 artifacts/ 目录
```

## 最佳实践

**DO:**
- ✅ 使用 Page Object Model 以提高可维护性
- ✅ 使用 data-testid 属性作为选择器
- ✅ 等待 API 响应，而不是任意超时
- ✅ 端到端测试关键用户流程
- ✅ 合并到 main 之前运行测试
- ✅ 测试失败时审查工件

**DON'T:**
- ❌ 使用脆弱的选择器（CSS 类可能会改变）
- ❌ 测试实现细节
- ❌ 针对生产环境运行测试
- ❌ 忽略不稳定的测试
- ❌ 失败时跳过工件审查
- ❌ 用 E2E 测试每个边缘情况（使用单元测试）

## 快速命令

```bash
# 运行所有 E2E 测试
npx playwright test

# 运行特定测试文件
npx playwright test tests/e2e/auth/login.spec.js

# 有界面模式运行（查看浏览器）
npx playwright test --headed

# 调试测试
npx playwright test --debug

# 生成测试代码
npx playwright codegen http://localhost:5173

# 查看报告
npx playwright show-report
```

## 相关 Agents

此命令调用位于以下位置的 `e2e-runner` agent：
`.claude/agents/e2e-runner.md`
