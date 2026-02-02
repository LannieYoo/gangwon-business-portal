# Workflows Manager

本项目集成了 BMAD-METHOD 工作流系统，提供结构化的开发流程。

## 🚀 快速触发命令

### Quick Dev (QD) - 快速开发/Bug 修复
```
QD - 修复 [bug 描述]
QD - 实现 [功能描述]
```

**工作流路径:** `.github/ai-dev-config/core/workflows/bmad-quick-flow/quick-dev/`

**特点:**
- 最小化流程，快速执行
- 自动 TDD 流程（RED → GREEN → REFACTOR）
- 内置自检和对抗性审查
- 适合 Bug 修复和小功能开发
- **集成 Skills**: PDF 处理、PPTX 转换

**集成的 Skills:**
- `dev-pdf_processing` - PDF 文档处理
  - 提取文本和图片
  - 转换为 Markdown
  - 支持 OCR 识别
- `dev-pptx_to_pdf` - PPTX 转 PDF
  - Windows PowerPoint 方法（最佳质量）
  - LibreOffice 方法（跨平台）

**流程步骤:**
1. 模式检测（Bug 修复 / 功能开发）
2. 上下文收集（支持 PDF/PPTX 需求文档）
3. 执行实现
4. 自检验证
5. 对抗性审查
6. 解决发现的问题

**使用示例:**
```bash
# 从 PDF 需求文档开始开发
QD - 根据 requirements.pdf 实现功能

# 从 PPTX 需求文档开始开发
QD - 根据 design.pptx 修复 bug
```

---

### Quick Spec (QS) - 快速技术规格
```
TS - 创建技术规格 [功能描述]
QS - 创建技术规格 [功能描述]
```

**工作流路径:** `.github/ai-dev-config/core/workflows/bmad-quick-flow/quick-spec/`

**用途:** 新功能开发前的技术设计

**流程步骤:**
1. 理解需求
2. 技术调研
3. 生成规格
4. 审查验证

---

### Code Review (CR) - 代码审查
```
CR - 审查当前变更
CR - 审查 [文件/模块]
```

**工作流路径:** `.github/ai-dev-config/core/workflows/4-implementation/code-review/`

**审查维度:**
- 代码质量和可读性
- 测试覆盖率（目标 80%+）
- 安全漏洞（XSS、SQL 注入等）
- 性能问题
- i18n 完整性
- 不可变性模式
- 架构合规性

---

## 📋 完整工作流列表

### 1. Analysis Phase (分析阶段)

**路径:** `.github/ai-dev-config/core/workflows/1-analysis/`

#### 1.1 Create Product Brief (创建产品简报)
- **入口:** `.github/ai-dev-config/core/workflows/1-analysis/create-product-brief/workflow.md`
- **用途:** 定义产品愿景、用户、指标和范围
- **步骤:** 初始化 → 愿景 → 用户 → 指标 → 范围 → 完成

#### 1.2 Research (研究)
- **入口:** `.github/ai-dev-config/core/workflows/1-analysis/research/workflow.md`
- **类型:**
  - **Domain Research** (领域研究): 行业分析、竞争格局、法规、技术趋势
  - **Market Research** (市场研究): 客户行为、痛点、决策因素、竞争分析
  - **Technical Research** (技术研究): 技术概览、集成模式、架构模式、实现研究

---

### 2. Planning Phase (规划阶段)

**路径:** `.github/ai-dev-config/core/workflows/2-plan-workflows/`

#### 2.1 Create PRD (创建产品需求文档)
- **入口:** `.github/ai-dev-config/core/workflows/2-plan-workflows/create-prd/workflow.md`
- **模式:**
  - **Create Mode** (创建模式): 从零开始创建 PRD
  - **Edit Mode** (编辑模式): 编辑现有 PRD
  - **Validate Mode** (验证模式): 验证 PRD 质量
- **验证维度:** 密度、覆盖率、可测量性、可追溯性、实现泄漏、领域合规、SMART 原则

#### 2.2 Create UX Design (创建 UX 设计)
- **入口:** `.github/ai-dev-config/core/workflows/2-plan-workflows/create-ux-design/workflow.md`
- **步骤:** 发现 → 核心体验 → 情感响应 → 灵感 → 设计系统 → 视觉基础 → 用户旅程 → 组件策略 → 响应式和无障碍

---

### 3. Solutioning Phase (解决方案阶段)

**路径:** `.github/ai-dev-config/core/workflows/3-solutioning/`

#### 3.1 Create Architecture (创建架构)
- **入口:** `.github/ai-dev-config/core/workflows/3-solutioning/create-architecture/workflow.md`
- **步骤:** 上下文 → 技术选型 → 架构决策 → 设计模式 → 项目结构 → 验证 → 完成

#### 3.2 Create Epics and Stories (创建史诗和故事)
- **入口:** `.github/ai-dev-config/core/workflows/3-solutioning/create-epics-and-stories/workflow.md`
- **步骤:** 验证前置条件 → 设计史诗 → 创建故事 → 最终验证

#### 3.3 Check Implementation Readiness (检查实现就绪度)
- **入口:** `.github/ai-dev-config/core/workflows/3-solutioning/check-implementation-readiness/workflow.md`
- **步骤:** 文档发现 → PRD 分析 → Epic 覆盖验证 → UX 对齐 → Epic 质量审查 → 最终评估

---

### 4. Implementation Phase (实现阶段)

**路径:** `.github/ai-dev-config/core/workflows/4-implementation/`

#### 4.1 Dev Story (开发故事)
- **入口:** `.github/ai-dev-config/core/workflows/4-implementation/dev-story/checklist.md`
- **特点:** 严格的任务追踪、100% 测试覆盖、详细实现记录
- **适用:** 复杂功能开发、多文件重构、架构变更

#### 4.2 Code Review (代码审查)
- **入口:** `.github/ai-dev-config/core/workflows/4-implementation/code-review/checklist.md`
- **用途:** Bug 修复后的质量检查、PR 提交前的自动审查

#### 4.3 Sprint Planning (冲刺规划)
- **入口:** `.github/ai-dev-config/core/workflows/4-implementation/sprint-planning/instructions.md`
- **用途:** 规划 Sprint 任务和优先级

#### 4.4 Sprint Status (冲刺状态)
- **入口:** `.github/ai-dev-config/core/workflows/4-implementation/sprint-status/instructions.md`
- **用途:** 跟踪 Sprint 进度

#### 4.5 Retrospective (回顾)
- **入口:** `.github/ai-dev-config/core/workflows/4-implementation/retrospective/instructions.md`
- **用途:** Sprint 结束后的回顾和改进

#### 4.6 Correct Course (纠正方向)
- **入口:** `.github/ai-dev-config/core/workflows/4-implementation/correct-course/instructions.md`
- **用途:** 当项目偏离轨道时进行调整

#### 4.7 Create Story (创建故事)
- **入口:** `.github/ai-dev-config/core/workflows/4-implementation/create-story/template.md`
- **用途:** 创建新的用户故事

---

### 5. BMAD Quick Flow (快速流程)

**路径:** `.github/ai-dev-config/core/workflows/bmad-quick-flow/`

#### 5.1 Quick Dev
- **入口:** `.github/ai-dev-config/core/workflows/bmad-quick-flow/quick-dev/workflow.md`
- **触发:** `QD - [描述]`
- **用途:** 快速开发和 Bug 修复

#### 5.2 Quick Spec
- **入口:** `.github/ai-dev-config/core/workflows/bmad-quick-flow/quick-spec/workflow.md`
- **触发:** `QS - [描述]` 或 `TS - [描述]`
- **用途:** 快速创建技术规格

---

### 6. Test Architecture (测试架构)

**路径:** `.github/ai-dev-config/core/workflows/testarch/`

#### 6.1 Test Design (测试设计)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/test-design/instructions.md`
- **用途:** 设计测试架构和策略

#### 6.2 ATDD (验收测试驱动开发)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/atdd/instructions.md`
- **用途:** 基于验收标准的测试开发

#### 6.3 Test Automation (测试自动化)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/automate/instructions.md`
- **用途:** 自动化测试实现

#### 6.4 Test Review (测试审查)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/test-review/instructions.md`
- **用途:** 审查测试质量和覆盖率

#### 6.5 CI Integration (CI 集成)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/ci/instructions.md`
- **用途:** 集成测试到 CI/CD 流程

#### 6.6 Test Framework (测试框架)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/framework/instructions.md`
- **用途:** 设置测试框架

#### 6.7 NFR Assessment (非功能需求评估)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/nfr-assess/instructions.md`
- **用途:** 评估性能、安全性、可用性等非功能需求

#### 6.8 Traceability (可追溯性)
- **入口:** `.github/ai-dev-config/core/workflows/testarch/trace/instructions.md`
- **用途:** 建立需求到测试的追溯关系

---

### 7. Full Development (完整开发流程)

**路径:** `.github/ai-dev-config/core/workflows/full-development/`

**入口:** `.github/ai-dev-config/core/workflows/full-development/workflow.md`

**完整流程:**
1. 初始化
2. 需求分析
3. PRD 创建
4. 架构设计
5. 故事拆分
6. 数据库设计
7. 后端开发
8. 前端开发
9. 测试
10. 审查
11. 部署

---

### 8. Document Project (项目文档化)

**路径:** `.github/ai-dev-config/core/workflows/document-project/`

**入口:** `.github/ai-dev-config/core/workflows/document-project/instructions.md`

**工作流:**
- **Full Scan** (完整扫描): 全面分析项目结构
- **Deep Dive** (深入分析): 深入分析特定模块

**模板:**
- 项目概览模板
- 索引模板
- 深入分析模板
- 源码树模板

---

### 9. Utility Workflows (实用工具流程)

#### 9.1 Complete Lab (完成实验)
- **入口:** `.github/ai-dev-config/core/workflows/complete-lab.md`
- **用途:** 完成学习实验任务

#### 9.2 Explore Repo (探索仓库)
- **入口:** `.github/ai-dev-config/core/workflows/explore-repo.md`
- **用途:** 快速了解代码仓库结构

#### 9.3 Scrape Content (抓取内容)
- **入口:** `.github/ai-dev-config/core/workflows/scrape-content.md`
- **用途:** 网页内容抓取

---

## 🎯 推荐使用场景

| 场景 | 推荐工作流 | 触发命令 |
|------|-----------|---------|
| Bug 修复 | Quick Dev | `QD - 修复 [描述]` |
| 小功能开发 | Quick Dev | `QD - 实现 [描述]` |
| 新功能技术设计 | Quick Spec | `TS - [描述]` |
| 代码审查 | Code Review | `CR - 审查当前变更` |
| 复杂功能开发 | Dev Story | 手动触发 |
| 产品规划 | Create PRD | 手动触发 |
| 架构设计 | Create Architecture | 手动触发 |
| 完整项目开发 | Full Development | 手动触发 |
| 测试策略设计 | Test Design | 手动触发 |

---

## 📚 相关文档

- **代码规范:** `.kiro/steering/code-standard.md`
- **安全规范:** `.kiro/steering/security-guidelines.md`
- **测试要求:** `.kiro/steering/code-quality.md`
- **Windows 命令:** `.kiro/steering/windows-commands.md`
- **Skills 管理:** `.kiro/steering/skills-manager.md`

---

## 💡 使用提示

1. **快速迭代:** 使用 `QD` 进行快速开发和 Bug 修复
2. **技术设计:** 复杂任务先用 `TS` 创建技术规格
3. **质量保证:** 提交前始终运行 `CR` 审查
4. **TDD 流程:** 遵循项目的 TDD 流程（RED → GREEN → REFACTOR）
5. **文档优先:** 重要功能开发前先创建 PRD 和架构文档
