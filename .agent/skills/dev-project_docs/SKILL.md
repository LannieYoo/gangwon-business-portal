---
name: dev-project_docs
description: 项目文档管理专家。使用场景：(1) 创建或更新项目文档，(2) 规划文档结构，(3) 编写 README、API 文档、架构文档，(4) 建立文档自动化流程。
---

# 项目文档管理

## 目标

提供项目文档的全生命周期管理指导，确保文档质量、一致性和可维护性。

## 核心原则

### 1. 文档即代码

- 使用版本控制管理文档
- 文档与代码同步更新
- 自动化文档生成和部署

### 2. 用户导向

- 明确文档受众和使用场景
- 提供清晰的导航和搜索
- 收集和响应用户反馈

### 3. 标准化

- 统一的文档模板和格式
- 标准化的命名规范
- 一致的写作风格和术语

## 文档结构标准

### 基础目录结构

```
docs/
├── index.md                 # 文档索引
├── architecture/            # 架构文档
│   ├── overview.md         # 架构概览
│   └── system-architecture.md # 系统架构
├── codemaps/               # 代码地图
│   ├── index.md           # 代码地图索引
│   └── frontend.md        # 前端架构
├── guides/                 # 用户指南
│   ├── setup.md           # 开发环境搭建
│   └── deployment.md      # 部署指南
├── project/                # 项目规范
│   ├── contributing.md    # 贡献指南
│   └── changelog.md       # 变更日志
├── reports/                # 自动生成报告
│   ├── prd-validation.md  # PRD 验证报告
│   └── doc-validation.txt # 文档验证报告
└── requirements/           # 需求文档（分层 PRD）
    ├── master_prd.md      # 总体规划
    └── phase1_prd.md      # Phase 1: 基础架构
```

### PRD 分层策略

| 层级       | 文件            | 内容                               | 受众           |
| ---------- | --------------- | ---------------------------------- | -------------- |
| **战略层** | `master_prd.md` | 愿景、KPIs、技术规格、约束、路线图 | PM、利益相关者 |
| **战术层** | `phaseN_prd.md` | 用户故事、验收标准、功能需求细节   | 开发团队       |

**拆分原则**：

- 每个 Phase PRD ≤ 150 行
- 每个 Phase 包含 2-5 个用户故事
- 验收标准必须可验证（带复选框）

### 文档类型

| 类型   | 说明           | 示例                       |
| ------ | -------------- | -------------------------- |
| 项目级 | 项目入口文档   | README.md, CONTRIBUTING.md |
| 架构   | 系统设计和决策 | ADR, 组件设计              |
| API    | 接口规范和示例 | OpenAPI, SDK 文档          |
| 用户   | 使用指南和教程 | 快速开始, 安装指南         |
| 开发   | 开发流程和规范 | 环境搭建, 测试指南         |

## README.md 模板

```markdown
# 项目名称

简洁的项目描述（1-2句话）

## 特性

- 核心功能1
- 核心功能2

## 快速开始

### 安装

\`\`\`bash
npm install
\`\`\`

### 基本使用

\`\`\`bash
npm run dev
\`\`\`

## 文档

- [开发指南](docs/guides/setup.md)
- [架构文档](docs/codemaps/index.md)

## 贡献

请阅读 [贡献指南](docs/project/contributing.md)

## 许可证

Apache License 2.0
```

## 架构决策记录 (ADR) 模板

```markdown
# ADR-001: 决策标题

## 状态

已接受 / 已废弃 / 待定

## 背景

描述做出此决策的背景和原因。

## 决策

具体的决策内容。

## 理由

1. 理由1
2. 理由2

## 后果

- 正面影响
- 负面影响
- 风险

## 替代方案

考虑过的其他方案及其优缺点。
```

## 文档维护流程

### 生命周期管理

1. **创建阶段**：使用标准模板，明确目标和受众
2. **维护阶段**：定期审查更新，跟踪使用情况
3. **归档阶段**：标记过时文档，提供迁移指南

### Git 提交规范

```bash
# 文档变更提交
git commit -m "docs: update API authentication guide"
git commit -m "docs(api): add rate limiting documentation"
```

### 自动化检查

```yaml
# .github/workflows/docs.yml
name: Documentation Check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
      - name: Lint markdown
        uses: articulate/actions-markdownlint@v1
```

## 质量审查清单

### 内容质量

- [ ] 信息准确且时效
- [ ] 逻辑结构清晰
- [ ] 语言表达简洁
- [ ] 示例代码可执行
- [ ] 链接有效

### 格式规范

- [ ] 遵循 Markdown 规范
- [ ] 统一的标题层级
- [ ] 一致的代码块格式
- [ ] 规范的图片引用

### 用户体验

- [ ] 导航结构合理
- [ ] 搜索功能有效
- [ ] 移动端适配

## 写作规范

### 语言风格

- 使用简洁明了的语言
- 避免技术术语过度使用
- 使用主动语态
- 提供必要的背景信息

### 结构组织

- **金字塔原则**：先总后分
- **逐步深入**：从简单到复杂
- **逻辑清晰**：使用编号和标题
- **交叉引用**：提供相关链接

### 内容层次

```
Level 1: 概览 (Overview)
├── 项目简介
├── 核心特性
└── 快速开始

Level 2: 指南 (Guides)
├── 安装配置
├── 基础教程
└── 进阶用法

Level 3: 参考 (Reference)
├── API 文档
├── 配置选项
└── 错误代码

Level 4: 解释 (Explanation)
├── 架构设计
├── 设计决策
└── 最佳实践
```

## 常见问题

### 文档同步问题

**问题**：代码更新后文档未及时更新

**解决方案**：

- 建立代码审查时的文档检查机制
- 使用自动化工具从代码生成文档
- 在 CI/CD 流程中加入文档更新检查

### 文档碎片化

**问题**：文档分散在多个平台，难以维护

**解决方案**：

- 建立统一的文档平台
- 制定文档归档和迁移计划
- 使用文档即代码的方式集中管理

## 工具推荐

| 工具                | 用途     | 说明              |
| ------------------- | -------- | ----------------- |
| MkDocs              | 静态站点 | Material 主题推荐 |
| Swagger/Redoc       | API 文档 | OpenAPI 规范      |
| Mermaid             | 图表     | Markdown 内嵌图表 |
| markdown-link-check | 链接检查 | CI 集成           |

## 验证步骤

完成文档后，验证以下内容：

1. 所有链接可访问
2. 代码示例可执行
3. 格式符合规范
4. 包含最后更新时间
5. 受众明确

## 自动化脚本

`scripts/` 目录包含文档自动化工具：

| 脚本                   | 功能           | 命令                                                               |
| ---------------------- | -------------- | ------------------------------------------------------------------ |
| `generate-codemaps.js` | 生成代码地图   | `node .agent/skills/dev-project_docs/scripts/generate-codemaps.js` |
| `update-docs.js`       | 自动更新文档   | `node .agent/skills/dev-project_docs/scripts/update-docs.js`       |
| `validate-docs.js`     | 验证文档质量   | `node .agent/skills/dev-project_docs/scripts/validate-docs.js`     |
| `validate-prd.js`      | 验证 PRD 实现  | `node .agent/skills/dev-project_docs/scripts/validate-prd.js`      |
| `serve-docs.js`        | 启动文档服务器 | `node .agent/skills/dev-project_docs/scripts/serve-docs.js`        |
| `update-all.js`        | 批量执行全部   | `node .agent/skills/dev-project_docs/scripts/update-all.js`        |

### 脚本功能说明

1. **generate-codemaps.js**：分析项目结构，自动生成前端、后端、数据库和集成的代码地图文档
2. **update-docs.js**：从源代码（package.json、.env.example 等）同步更新项目文档
3. **validate-docs.js**：检查文档质量、链接有效性、格式规范和代码示例
4. **validate-prd.js**：验证 PRD 需求文档中的功能是否已在代码中实现
5. **serve-docs.js**：启动本地文档服务器，支持 Markdown 实时预览
6. **update-all.js**：按顺序执行所有文档自动化任务，生成执行汇总报告

---

**详细参考**：查看 `references/` 目录获取更多模板和示例。
