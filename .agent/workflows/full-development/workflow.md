---
name: full-development
description: 完整软件开发流程 - 从需求到上线的一站式工作流
version: 1.0.0
trigger: /full-dev
state_file: '{project-root}/.dev-state.yaml'
---

# Full Development Workflow

一个命令，完成从需求分析到代码审查的完整开发流程。自动跳过已完成的阶段。

## 使用方法

```bash
/full-dev                    # 启动/继续完整流程
/full-dev reset              # 重置状态，从头开始
/full-dev status             # 查看当前进度
/full-dev skip               # 跳过当前阶段
/full-dev goto <phase>       # 跳转到指定阶段
```

## 工作流阶段

| 阶段 | 名称 | 产出物 | 检查点 |
|------|------|--------|--------|
| 1 | 需求分析 (requirements) | `docs/requirements.md` | ✓ 文件存在且非空 |
| 2 | 产品需求文档 (prd) | `docs/prd.md` | ✓ 文件存在且非空 |
| 3 | UX 设计 (ux_design) | `docs/ux-design.md` | ✓ 文件存在且非空 |
| 4 | 系统架构 (architecture) | `docs/architecture.md` | ✓ 文件存在且非空 |
| 5 | 任务分解 (stories) | `docs/stories.md` | ✓ 文件存在且非空 |
| 6 | 数据库设计 (database) | `docs/database.md` + migrations | ✓ 文件存在 |
| 7 | 后端开发 (backend) | `src/` 后端代码 | ✓ 代码检查通过 |
| 8 | 前端开发 (frontend) | `src/` 前端代码 | ✓ 代码检查通过 |
| 9 | 测试 (testing) | `tests/` | ✓ 测试通过 |
| 10 | 代码审查 (review) | Review 报告 | ✓ 审查通过 |
| 11 | 部署 (deployment) | 部署配置 | ✓ 部署成功 |

---

## 初始化

### 1. 加载状态

首先检查状态文件 `.dev-state.yaml`：

```yaml
# .dev-state.yaml 示例
project: my-project
started_at: 2025-01-28T10:00:00
current_phase: 4
phases:
  requirements:
    status: completed
    completed_at: 2025-01-28T10:30:00
    output: docs/requirements.md
  prd:
    status: completed
    completed_at: 2025-01-28T11:00:00
    output: docs/prd.md
  ux_design:
    status: completed
    completed_at: 2025-01-28T11:30:00
    output: docs/ux-design.md
  architecture:
    status: in_progress
    started_at: 2025-01-28T12:00:00
  stories:
    status: pending
  database:
    status: pending
  backend:
    status: pending
  frontend:
    status: pending
  testing:
    status: pending
  review:
    status: pending
  deployment:
    status: pending
```

### 2. 检查跳过逻辑

对于每个阶段，检查：
1. 状态文件中标记为 `completed`？→ 跳过
2. 产出物文件存在且有效？→ 标记完成，跳过
3. 否则 → 执行该阶段

---

## 阶段执行

### Phase 1: 需求分析 (requirements)

**触发条件**: `docs/requirements.md` 不存在或为空

**执行步骤**:
1. 加载 skill: `dev-product_manager`
2. 执行 workflow: `1-analysis/create-product-brief`
3. 与用户对话，收集需求
4. 生成 `docs/requirements.md`

**完成检查**:
- [ ] `docs/requirements.md` 存在
- [ ] 文件包含：项目背景、目标用户、核心功能、非功能需求

**完成后**: 更新状态，进入 Phase 2

---

### Phase 2: 产品需求文档 (prd)

**触发条件**: `docs/prd.md` 不存在或为空

**前置条件**: Phase 1 完成

**执行步骤**:
1. 加载 skill: `dev-product_manager`
2. 读取 `docs/requirements.md`
3. 执行 workflow: `2-plan-workflows/create-prd`
4. 生成 `docs/prd.md`

**完成检查**:
- [ ] `docs/prd.md` 存在
- [ ] 文件包含：用户故事、验收标准、优先级

**完成后**: 更新状态，进入 Phase 3

---

### Phase 3: UX 设计 (ux_design)

**触发条件**: `docs/ux-design.md` 不存在或为空

**前置条件**: Phase 2 完成

**执行步骤**:
1. 加载 skill: `dev-ux_designer`
2. 读取 `docs/prd.md`
3. 执行 workflow: `2-plan-workflows/create-ux-design`
4. 创建用户画像 (Personas)
5. 绘制用户旅程地图 (Journey Maps)
6. 设计信息架构 (Information Architecture)
7. 创建交互设计规范 (Interaction Patterns)
8. 定义视觉设计系统 (Design System)
9. 生成 `docs/ux-design.md`

**完成检查**:
- [ ] `docs/ux-design.md` 存在
- [ ] 文件包含：用户画像、旅程地图、信息架构、交互模式、设计系统

**完成后**: 更新状态，进入 Phase 4

---

### Phase 4: 系统架构 (architecture)

**触发条件**: `docs/architecture.md` 不存在或为空

**前置条件**: Phase 3 完成

**执行步骤**:
1. 加载 skill: `dev-senior_architect`
2. 读取 `docs/prd.md` 和 `docs/ux-design.md`
3. 执行 workflow: `3-solutioning/create-architecture`
4. 生成 `docs/architecture.md`

**完成检查**:
- [ ] `docs/architecture.md` 存在
- [ ] 文件包含：技术栈、系统组件、数据流、API 设计
- [ ] 架构设计符合 UX 设计规范

**完成后**: 更新状态，进入 Phase 5

---

### Phase 5: 任务分解 (stories)

**触发条件**: `docs/stories.md` 不存在或为空

**前置条件**: Phase 4 完成

**执行步骤**:
1. 加载 skill: `dev-product_manager`
2. 读取 `docs/architecture.md` 和 `docs/ux-design.md`
3. 执行 workflow: `3-solutioning/create-epics-and-stories`
4. 生成 `docs/stories.md`

**完成检查**:
- [ ] `docs/stories.md` 存在
- [ ] 文件包含：Epic 列表、Story 列表、任务依赖关系
- [ ] Story 覆盖 UX 设计中的所有用户旅程

**完成后**: 更新状态，进入 Phase 6

---

### Phase 6: 数据库设计 (database)

**触发条件**: `docs/database.md` 不存在或为空

**前置条件**: Phase 5 完成

**执行步骤**:
1. 加载 skill: `dev-senior_data_engineer`
2. 读取 `docs/architecture.md`
3. 设计数据库 schema
4. 生成 `docs/database.md`
5. 生成 migration 文件

**完成检查**:
- [ ] `docs/database.md` 存在
- [ ] 文件包含：ER 图、表结构、索引设计
- [ ] 运行检查脚本（如有）

**完成后**: 更新状态，进入 Phase 7

---

### Phase 7: 后端开发 (backend)

**触发条件**: 后端代码未完成

**前置条件**: Phase 6 完成

**执行步骤**:
1. 加载 skill: `dev-senior_backend`
2. 读取 `docs/stories.md`，获取待开发 Story
3. 执行 workflow: `4-implementation/dev-story`
4. 开发 Model、Router、Service、Schema
5. 每完成一个模块，运行检查脚本

**完成检查**:
- [ ] 所有后端 Story 完成
- [ ] 检查脚本通过

**完成后**: 更新状态，进入 Phase 8

---

### Phase 8: 前端开发 (frontend)

**触发条件**: 前端代码未完成

**前置条件**: Phase 7 完成（或可并行）

**执行步骤**:
1. 加载 skill: `dev-senior_frontend` 和 `dev-ux_designer`
2. 读取 `docs/stories.md` 和 `docs/ux-design.md`
3. 执行 workflow: `4-implementation/dev-story`
4. 开发组件、页面、状态管理
5. 确保实现符合 UX 设计规范
6. 每完成一个模块，运行检查脚本

**完成检查**:
- [ ] 所有前端 Story 完成
- [ ] 检查脚本通过
- [ ] UI/UX 符合设计规范

**完成后**: 更新状态，进入 Phase 9

---

### Phase 9: 测试 (testing)

**触发条件**: 测试未完成

**前置条件**: Phase 7, 8 完成

**执行步骤**:
1. 加载 skill: `dev-senior_qa`
2. 读取 `docs/prd.md` 中的验收标准
3. 读取 `docs/ux-design.md` 中的可用性测试框架
4. 执行 workflow: `testarch/automate`
5. 编写/运行测试（包括可用性测试）

**完成检查**:
- [ ] 测试覆盖率达标
- [ ] 所有测试通过
- [ ] 可用性测试通过

**完成后**: 更新状态，进入 Phase 10

---

### Phase 10: 代码审查 (review)

**触发条件**: 审查未完成

**前置条件**: Phase 9 完成

**执行步骤**:
1. 加载 skill: `dev-code_reviewer`
2. 执行 workflow: `4-implementation/code-review`
3. 生成审查报告
4. 修复发现的问题

**完成检查**:
- [ ] 审查报告生成
- [ ] 所有严重问题已修复

**完成后**: 更新状态，进入 Phase 11

---

### Phase 11: 部署 (deployment)

**触发条件**: 部署未完成

**前置条件**: Phase 10 完成

**执行步骤**:
1. 加载 skill: `dev-senior_devops`
2. 配置部署环境
3. 执行部署

**完成检查**:
- [ ] 部署成功
- [ ] 健康检查通过

**完成后**: 更新状态为全部完成

---

## 状态管理命令

### 查看状态
```
/full-dev status
```
显示当前进度、已完成阶段、待完成阶段。

### 重置流程
```
/full-dev reset
```
清除状态文件，从头开始。

### 跳过阶段
```
/full-dev skip
```
跳过当前阶段（需确认）。

### 跳转阶段
```
/full-dev goto architecture
```
跳转到指定阶段。

---

## 配置选项

在 `.dev-state.yaml` 中可配置：

```yaml
config:
  # 并行开发
  parallel_frontend_backend: true

  # 自动检查
  auto_check: true

  # 检查脚本路径
  check_scripts:
    database: scripts/check-database.py
    backend: scripts/check-backend.py
    frontend: scripts/check-frontend.py

  # 产出物目录
  docs_dir: docs
  src_dir: src
  tests_dir: tests
```

---

## 快捷方式

| 命令 | 等价于 |
|------|--------|
| `/full-dev` | 启动/继续完整流程 |
| `/quick-dev` | 快速开发（跳过文档阶段） |
| `/spec-only` | 只执行 Phase 1-4（规格阶段） |
| `/impl-only` | 只执行 Phase 5-9（实现阶段） |
