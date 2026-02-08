---
name: prd_i18n_restructure
description: i18n 翻译键体系重构需求文档
---

# PRD-008: i18n 翻译键体系重构 (i18n Keys Restructure)

## 0. 版本信息

| 版本 | 日期       | 作者   | 说明       |
| :--- | :--------- | :----- | :--------- |
| v1.0 | 2026-02-07 | Claude | 初始版本   |

## 1. 执行摘要与目标

### 1.1 功能概述

对整个项目的 i18n 翻译键体系进行系统性重构，统一命名规范、消除重复定义、修复混合语言错误、规范嵌套层级，建立可维护的翻译键标准。

### 1.2 核心业务痛点

| 问题类别 | 严重程度 | 具体表现 |
|----------|----------|----------|
| 混合语言值 | **Critical** | ko.json 中出现中文字符（2处确认） |
| 命名不一致 | **Major** | camelCase / snake_case 混用，同概念不同命名 |
| 重复定义 | **Moderate** | regions、industryClassification 等在多处重复 |
| 嵌套层级混乱 | **Moderate** | 2-5 层不等，无统一规范 |
| 键结构不对称 | **Major** | ko.json 和 zh.json 键名不完全一致 |
| 模块间前缀不统一 | **Major** | admin 模块统一用 `admin.*`，member 模块顶层键混乱 |
| 插值变量命名混乱 | **Minor** | `{{companyName}}` vs `{{company_name}}` 混用 |

### 1.3 成功指标

- **100% 键对称**：所有 ko.json 和 zh.json 拥有完全一致的键结构
- **0 混合语言**：ko.json 中无中文字符，zh.json 中无韩文字符
- **统一命名规范**：所有翻译键遵循相同的命名规则
- **0 重复定义**：共享概念只在 shared 层定义一次
- **嵌套层级统一**：最多 3 层嵌套（namespace.section.key）

## 2. 当前状态分析

### 2.1 翻译文件分布

```
frontend/src/
├── shared/i18n/locales/          # 共享翻译（基础层）
│   ├── ko.json                   # 共享韩文
│   └── zh.json                   # 共享中文
├── admin/modules/                # Admin 模块翻译
│   ├── layouts/locales/          # 布局（header, menu）
│   ├── auth/locales/             # 认证
│   ├── dashboard/locales/        # 仪表盘
│   ├── members/locales/          # 会员管理
│   ├── performance/locales/      # 业绩管理
│   ├── projects/locales/         # 事业公告
│   ├── statistics/locales/       # 统计报告
│   ├── content/locales/          # 内容管理
│   └── messages/locales/         # 消息管理
└── member/modules/               # Member 模块翻译
    ├── layouts/locales/          # 布局
    ├── home/locales/             # 首页
    ├── auth/locales/             # 认证
    ├── projects/locales/         # 项目
    ├── performance/locales/      # 业绩
    ├── support/locales/          # 客服
    └── about/locales/            # 关于
```

共计 **38 个翻译文件**（19 对 ko/zh）。

### 2.2 当前顶层命名空间

```
// shared/i18n/locales/ (共享层)
common.*              // 通用文本（按钮、状态、操作等）
editor.*              // 富文本编辑器
fileAttachments.*     // 文件附件
terms.*               // 服务条款
error.*               // 错误消息
member.*              // ⚠️ 命名冲突：与 member 模块重名
notifications.*       // 通知
industryClassification.* // 行业分类
profile.*             // 用户资料（含 regions）

// admin/modules/ (Admin 层)
admin.header.*        // Admin 头部
admin.menu.*          // Admin 菜单
admin.auth.*          // Admin 认证
admin.dashboard.*     // Admin 仪表盘
admin.members.*       // Admin 会员管理
admin.performance.*   // Admin 业绩管理
admin.projects.*      // Admin 事业公告
admin.statistics.*    // Admin 统计报告
admin.content.*       // Admin 内容管理
admin.messages.*      // Admin 消息管理

// member/modules/ (Member 层)
header.*              // ⚠️ 无前缀，可能冲突
menu.*                // ⚠️ 无前缀，可能冲突
footer.*              // ⚠️ 无前缀
home.*                // ⚠️ 无前缀
auth.*                // ⚠️ 与 admin.auth 概念重叠
projects.*            // ⚠️ 与 admin.projects 概念重叠
performance.*         // ⚠️ 与 admin.performance 概念重叠
support.*
about.*
```

### 2.3 已确认的具体问题

#### 问题 1: 混合语言值（Critical）

| 文件 | 位置 | 当前值 | 问题 |
|------|------|--------|------|
| `admin/modules/members/locales/ko.json` | `resetSuccess` | `"检토 대기로 재설정되었습니다"` | "检토"是中文，应为"검토" |
| `admin/modules/performance/locales/ko.json` | `draftHint` | `"（초안 상태，기업이 아직 제출하지 않음）"` | 逗号和部分文字为中文 |

#### 问题 2: Member 模块无统一前缀

Admin 模块所有键都在 `admin.*` 命名空间下，但 Member 模块键直接暴露在顶层：

```javascript
// Admin: 有统一前缀 ✅
admin.header.title
admin.menu.dashboard
admin.members.title

// Member: 无统一前缀 ❌
header.title          // 可能与 admin.header 合并时冲突
menu.home             // 可能与 admin.menu 合并时冲突
home.welcome
projects.title        // 与 admin.projects 概念模糊
```

#### 问题 3: 共享层 `member.*` 命名冲突

共享翻译中存在 `member.*` 命名空间，与 Member 模块翻译中的键可能产生合并冲突。

#### 问题 4: 重复定义

| 数据 | 定义位置 | 说明 |
|------|----------|------|
| regions（地区列表） | `shared/profile.regions.*` | 主定义 |
| regions（地区列表） | `member/performance/` | 重复定义 |
| industryClassification | `shared/industryClassification.*` | 主定义 |
| 状态枚举（approved/rejected/pending） | `admin/members/`, `admin/performance/`, `admin/projects/` | 各模块独立定义 |

#### 问题 5: 插值变量命名不一致

```javascript
// 驼峰 (camelCase) — 项目规范要求
"welcome": "{{companyName}}님 환영합니다"

// 下划线 (snake_case) — 违反规范
"notification": "{{company_name}} has been updated"
```

#### 问题 6: 嵌套层级不统一

```javascript
// 2 层（太浅，语义不清）
"title": "회원 관리"

// 3 层（推荐）
"admin.members.title": "회원 관리"

// 4-5 层（太深，维护困难）
"admin.members.detail.nicednb.warning": "..."
"admin.statistics.help.patentHelp": "..."
```

## 3. 设计方案

### 3.1 翻译键命名规范

#### 3.1.1 命名空间层级结构（最多 3 层）

```
<scope>.<section>.<key>
```

| 层级 | 说明 | 示例 |
|------|------|------|
| scope | 作用域（模块或共享） | `common`, `admin`, `member` |
| section | 功能区域 | `members`, `performance`, `auth` |
| key | 具体键名 | `title`, `submitButton`, `statusApproved` |

对于需要分组的键，使用扁平化命名而非深嵌套：

```javascript
// ❌ 避免：深嵌套
"admin.members.detail.nicednb.warning"
"admin.members.status.approved"
"admin.members.status.rejected"

// ✅ 推荐：扁平化 + 语义前缀
"admin.members.detailNicednbWarning"
"admin.members.statusApproved"
"admin.members.statusRejected"
```

例外：当一组键数量 >= 5 且语义高度内聚时，允许第 4 层嵌套：

```javascript
// ✅ 允许：语义内聚的枚举组
"admin.members.status.approved"
"admin.members.status.rejected"
"admin.members.status.pending"
"admin.members.status.suspended"
"admin.members.status.withdrawn"
```

#### 3.1.2 键名规则

| 规则 | 示例 | 说明 |
|------|------|------|
| 使用 camelCase | `companyName` ✅ / `company_name` ❌ | 与 JS 变量命名一致 |
| 动词开头用于操作 | `submitForm`, `deleteRecord` | 按钮、操作类 |
| 名词开头用于标签 | `companyName`, `email` | 字段标签类 |
| 状态用 status 前缀 | `statusApproved`, `statusPending` | 状态枚举类 |
| 消息用 msg 前缀 | `msgSuccess`, `msgError` | 提示消息类 |
| 布尔用 is/has 前缀 | `isRequired`, `hasPermission` | 开关类 |
| 占位符用 placeholder 前缀 | `placeholderEmail` | 输入占位符 |
| 提示用 hint/tooltip 前缀 | `hintPassword` | 辅助信息 |

#### 3.1.3 插值变量规则

所有插值变量统一使用 **camelCase**：

```javascript
// ✅ 正确
"welcome": "{{companyName}}님 환영합니다"
"period": "{{startDate}} ~ {{endDate}}"

// ❌ 错误
"welcome": "{{company_name}}님 환영합니다"
"period": "{{start_date}} ~ {{end_date}}"
```

### 3.2 目标命名空间结构

```
共享层 (shared/i18n/locales/)
├── common.*                    # 通用文本
│   ├── common.actions.*        #   操作按钮（save, delete, cancel, edit...）
│   ├── common.status.*         #   通用状态（approved, rejected, pending...）
│   ├── common.labels.*         #   通用标签（name, email, phone...）
│   ├── common.messages.*       #   通用消息（success, error, confirm...）
│   └── common.pagination.*     #   分页相关
├── enums.*                     # 共享枚举值
│   ├── enums.regions.*         #   地区列表（从 profile.regions 迁移）
│   ├── enums.industry.*        #   行业分类（从 industryClassification 迁移）
│   └── enums.companyType.*     #   企业类型
├── components.*                # 共享组件文本
│   ├── components.editor.*     #   富文本编辑器（从 editor 迁移）
│   ├── components.fileUpload.* #   文件上传（从 fileAttachments 迁移）
│   └── components.notification.* # 通知组件
├── auth.*                      # 认证相关（登录、注册、忘记密码）
├── profile.*                   # 用户资料
├── terms.*                     # 服务条款
└── error.*                     # 错误消息

Admin 层 (admin/modules/*/locales/)
├── admin.layout.*              # Admin 布局（header + menu 合并）
├── admin.dashboard.*           # 仪表盘
├── admin.members.*             # 会员管理
├── admin.performance.*         # 业绩管理
├── admin.projects.*            # 事业公告
├── admin.statistics.*          # 统计报告
├── admin.content.*             # 内容管理
└── admin.messages.*            # 消息管理

Member 层 (member/modules/*/locales/)
├── member.layout.*             # Member 布局（header + menu + footer 合并）
├── member.home.*               # 首页
├── member.auth.*               # 认证（与共享 auth 区分的部分）
├── member.projects.*           # 项目申请
├── member.performance.*        # 业绩填报
├── member.support.*            # 客服支持
└── member.about.*              # 关于我们
```

### 3.3 共享键抽取规则

以下数据只在 **共享层** 定义一次，模块中引用共享键：

| 数据类型 | 目标位置 | 来源 |
|----------|----------|------|
| 操作按钮（保存、删除、编辑...） | `common.actions.*` | 各模块中重复的按钮文本 |
| 通用状态（批准、拒绝、待审...） | `common.status.*` | 各模块独立定义的状态枚举 |
| 地区列表 | `enums.regions.*` | `profile.regions.*` + member performance 重复 |
| 行业分类 | `enums.industry.*` | `industryClassification.*` |
| 文件附件 | `components.fileUpload.*` | `fileAttachments.*` |
| 编辑器 | `components.editor.*` | `editor.*` |

### 3.4 模块内键结构模板

每个模块的翻译文件应遵循统一结构：

```json
{
  "<scope>.<module>": {
    "title": "模块标题",
    "subtitle": "模块副标题",

    "list": {
      "title": "列表页标题",
      "empty": "暂无数据",
      "searchPlaceholder": "搜索..."
    },

    "detail": {
      "title": "详情页标题"
    },

    "form": {
      "title": "表单标题",
      "fieldName": "字段名",
      "placeholderName": "请输入..."
    },

    "status": {
      "approved": "已批准",
      "rejected": "已拒绝",
      "pending": "待审核"
    },

    "export": {
      "filename": "导出文件名",
      "sheetName": "工作表名"
    },

    "messages": {
      "createSuccess": "创建成功",
      "updateSuccess": "更新成功",
      "deleteSuccess": "删除成功",
      "deleteConfirm": "确认删除？"
    },

    "table": {
      "columnName": "列名",
      "columnEmail": "列名"
    }
  }
}
```

## 4. 功能需求 (Functional Requirements)

### 4.1 Phase 1: 修复 Critical 问题

**立即修复混合语言值**，不改动键结构。

| 文件 | 修复内容 |
|------|----------|
| `admin/modules/members/locales/ko.json` | `resetSuccess`: "检토" → "검토" |
| `admin/modules/performance/locales/ko.json` | `draftHint`: 修复混合中文标点和字符 |

### 4.2 Phase 2: 共享层重构

**目标**：统一共享翻译的命名空间，消除重复定义。

| 变更 | 旧键 | 新键 |
|------|------|------|
| 地区列表迁移 | `profile.regions.*` | `enums.regions.*` |
| 行业分类重命名 | `industryClassification.*` | `enums.industry.*` |
| 文件附件重命名 | `fileAttachments.*` | `components.fileUpload.*` |
| 编辑器重命名 | `editor.*` | `components.editor.*` |
| 通知重命名 | `notifications.*` | `components.notification.*` |
| 消除 member 命名冲突 | `member.*`（共享层） | 评估后迁入 `common.*` 或 `profile.*` |

**同时需要**：
- 更新所有引用这些键的组件代码
- 保持 ko.json 和 zh.json 键完全一致

### 4.3 Phase 3: Admin 模块重构

**目标**：统一 Admin 模块内键结构，遵循模板。

各模块的具体工作：
1. 按 3.4 节模板重新组织键
2. 将通用状态枚举迁移到 `common.status.*`
3. 将重复的按钮文本迁移到 `common.actions.*`
4. 将 `admin.header.*` + `admin.menu.*` 合并为 `admin.layout.*`
5. 扁平化超过 3 层的嵌套键

### 4.4 Phase 4: Member 模块重构

**目标**：为 Member 模块添加统一前缀 `member.*`。

| 变更 | 旧键 | 新键 |
|------|------|------|
| 布局统一 | `header.*`, `menu.*`, `footer.*` | `member.layout.*` |
| 首页 | `home.*` | `member.home.*` |
| 认证 | `auth.*` | `member.auth.*` |
| 项目 | `projects.*` | `member.projects.*` |
| 业绩 | `performance.*` | `member.performance.*` |
| 客服 | `support.*` | `member.support.*` |
| 关于 | `about.*` | `member.about.*` |

**同时需要**：
- 更新所有 Member 模块组件中的 `t()` 调用
- 消除 member performance 中重复的 regions 定义，改用 `enums.regions.*`

### 4.5 Phase 5: 插值变量统一

全局搜索所有 `{{...}}` 插值变量，将 snake_case 统一为 camelCase。

### 4.6 Phase 6: 键对称性验证

创建验证脚本 `scripts/validate-i18n.js`：

```javascript
/**
 * i18n 键验证脚本
 * 检查项：
 * 1. ko.json 和 zh.json 键完全一致
 * 2. 无混合语言字符
 * 3. 键名符合 camelCase 规范
 * 4. 嵌套层级不超过 4 层
 * 5. 无空值或占位符值
 * 6. 插值变量使用 camelCase
 */
```

## 5. 迁移策略

### 5.1 渐进式迁移（推荐）

为降低风险，采用**渐进式迁移**策略：

1. **兼容期**：新键和旧键同时存在，旧键标注 `@deprecated`
2. **迁移期**：逐模块更新组件代码引用新键
3. **清理期**：删除所有旧键

### 5.2 迁移辅助工具

创建迁移脚本 `scripts/migrate-i18n-keys.js`：

```javascript
/**
 * i18n 键迁移辅助脚本
 * 功能：
 * 1. 读取键映射配置（旧键 → 新键）
 * 2. 批量更新翻译 JSON 文件
 * 3. 批量更新组件中的 t() 调用
 * 4. 生成迁移报告
 */
```

### 5.3 键映射配置

```javascript
// scripts/i18n-key-mapping.js
export const KEY_MAPPING = {
  // 共享层重命名
  'profile.regions': 'enums.regions',
  'industryClassification': 'enums.industry',
  'fileAttachments': 'components.fileUpload',
  'editor': 'components.editor',
  'notifications': 'components.notification',

  // Member 模块添加前缀
  'header': 'member.layout.header',
  'menu': 'member.layout.menu',
  'footer': 'member.layout.footer',
  'home': 'member.home',
  // ...
}
```

## 6. 验收标准 (Acceptance Criteria)

### 6.1 键结构验收

- [ ] 所有翻译键遵循 `<scope>.<section>.<key>` 三层结构
- [ ] 所有 ko.json 和 zh.json 键完全对称
- [ ] 无超过 4 层的嵌套（枚举组例外已文档化）
- [ ] 所有键名使用 camelCase
- [ ] 共享数据（regions, industry, status...）只定义一次

### 6.2 内容验收

- [ ] ko.json 中无中文字符
- [ ] zh.json 中无韩文字符
- [ ] 所有插值变量使用 camelCase
- [ ] 无空值或占位符值

### 6.3 功能验收

- [ ] 所有页面中韩文切换正常
- [ ] 所有导出功能正常
- [ ] 所有表单验证消息正确显示
- [ ] 通知消息正确显示

### 6.4 代码质量验收

- [ ] 验证脚本通过，0 错误 0 警告
- [ ] 无硬编码字符串（所有用户可见文本使用 t()）
- [ ] 无重复的翻译键定义
- [ ] 迁移脚本可重复运行（幂等性）

## 7. 修改文件清单

### 7.1 新增文件

| 文件路径 | 说明 |
|----------|------|
| `scripts/validate-i18n.js` | 翻译键验证脚本 |
| `scripts/migrate-i18n-keys.js` | 键迁移辅助脚本 |
| `scripts/i18n-key-mapping.js` | 键映射配置 |

### 7.2 修改文件（翻译文件）

| 文件路径 | Phase | 修改类型 |
|----------|-------|----------|
| `shared/i18n/locales/ko.json` | 2 | 重构命名空间 |
| `shared/i18n/locales/zh.json` | 2 | 重构命名空间 |
| `admin/modules/layouts/locales/ko.json` | 3 | 合并为 admin.layout |
| `admin/modules/layouts/locales/zh.json` | 3 | 合并为 admin.layout |
| `admin/modules/members/locales/ko.json` | 1, 3 | 修复混合语言 + 重构 |
| `admin/modules/members/locales/zh.json` | 3 | 重构键结构 |
| `admin/modules/performance/locales/ko.json` | 1, 3 | 修复混合语言 + 重构 |
| `admin/modules/performance/locales/zh.json` | 3 | 重构键结构 |
| `admin/modules/projects/locales/ko.json` | 3 | 重构键结构 |
| `admin/modules/projects/locales/zh.json` | 3 | 重构键结构 |
| `admin/modules/statistics/locales/ko.json` | 3 | 重构键结构 |
| `admin/modules/statistics/locales/zh.json` | 3 | 重构键结构 |
| `admin/modules/auth/locales/ko.json` | 3 | 重构键结构 |
| `admin/modules/auth/locales/zh.json` | 3 | 重构键结构 |
| `admin/modules/dashboard/locales/ko.json` | 3 | 重构键结构 |
| `admin/modules/dashboard/locales/zh.json` | 3 | 重构键结构 |
| `admin/modules/content/locales/ko.json` | 3 | 重构键结构 |
| `admin/modules/content/locales/zh.json` | 3 | 重构键结构 |
| `admin/modules/messages/locales/ko.json` | 3 | 重构键结构 |
| `admin/modules/messages/locales/zh.json` | 3 | 重构键结构 |
| `member/modules/layouts/locales/ko.json` | 4 | 添加 member 前缀 |
| `member/modules/layouts/locales/zh.json` | 4 | 添加 member 前缀 |
| `member/modules/home/locales/ko.json` | 4 | 添加 member 前缀 |
| `member/modules/home/locales/zh.json` | 4 | 添加 member 前缀 |
| `member/modules/auth/locales/ko.json` | 4 | 添加 member 前缀 |
| `member/modules/auth/locales/zh.json` | 4 | 添加 member 前缀 |
| `member/modules/projects/locales/ko.json` | 4 | 添加 member 前缀 |
| `member/modules/projects/locales/zh.json` | 4 | 添加 member 前缀 |
| `member/modules/performance/locales/ko.json` | 4 | 添加 member 前缀 + 去重 |
| `member/modules/performance/locales/zh.json` | 4 | 添加 member 前缀 + 去重 |
| `member/modules/support/locales/ko.json` | 4 | 添加 member 前缀 |
| `member/modules/support/locales/zh.json` | 4 | 添加 member 前缀 |
| `member/modules/about/locales/ko.json` | 4 | 添加 member 前缀 |
| `member/modules/about/locales/zh.json` | 4 | 添加 member 前缀 |

### 7.3 修改文件（组件代码）

所有使用 `t()` 函数的组件文件都需要更新翻译键引用。具体文件列表将在迁移脚本运行后生成。

预估涉及 **40-60 个组件文件**。

## 8. 实施顺序

1. **Phase 1**: 修复 Critical 混合语言问题（2 个文件）
2. **Phase 2**: 共享层重构（重命名命名空间 + 去重）
3. **Phase 3**: Admin 模块键结构统一
4. **Phase 4**: Member 模块添加前缀 + 键结构统一
5. **Phase 5**: 全局插值变量统一
6. **Phase 6**: 创建验证脚本 + 完整验证 + 清理旧键

## 9. 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 大面积改动导致功能回归 | 高 | 中 | 渐进式迁移 + 保留旧键兼容期 |
| 遗漏组件中的 t() 引用 | 中 | 中 | 迁移脚本批量处理 + 验证脚本检查 |
| deepMerge 合并冲突 | 中 | 低 | 迁移前充分测试合并结果 |
| 翻译值丢失 | 高 | 低 | 迁移脚本保留原始文件备份 |

## 10. 附录

### 10.1 当前 i18n 配置合并顺序

```javascript
// shared/i18n/index.js
// 合并优先级：后面覆盖前面
const resources = {
  ko: deepMerge(
    sharedKo,       // 1. 共享翻译（最低优先级）
    memberKo,       // 2. Member 模块
    adminKo         // 3. Admin 模块（最高优先级）
  ),
  zh: deepMerge(
    sharedZh,
    memberZh,
    adminZh
  )
}
```

### 10.2 翻译键命名速查表

| 场景 | 模式 | 示例 |
|------|------|------|
| 页面标题 | `<scope>.<module>.title` | `admin.members.title` |
| 列表页 | `<scope>.<module>.list.*` | `admin.members.list.empty` |
| 详情页 | `<scope>.<module>.detail.*` | `admin.members.detail.title` |
| 表单字段 | `<scope>.<module>.form.*` | `admin.members.form.companyName` |
| 表格列 | `<scope>.<module>.table.*` | `admin.members.table.columnName` |
| 状态枚举 | `<scope>.<module>.status.*` | `admin.members.status.approved` |
| 操作按钮 | `common.actions.*` | `common.actions.save` |
| 导出相关 | `<scope>.<module>.export.*` | `admin.members.export.filename` |
| 提示消息 | `<scope>.<module>.messages.*` | `admin.members.messages.deleteSuccess` |

---

_本 PRD 根据项目规范和当前 i18n 现状分析生成。_
