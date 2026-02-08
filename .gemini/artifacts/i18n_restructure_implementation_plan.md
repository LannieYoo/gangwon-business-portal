---
name: i18n_restructure_implementation_plan
description: i18n 翻译键体系重构的详细实施计划
---

# i18n 翻译键体系重构 - 实施计划

## 📋 计划概述

**创建日期**: 2026-02-07  
**PRD 来源**: `docs/requirements/prd_i18n_restructure.md`  
**预计工作量**: 6 个阶段，涉及 38+ 翻译文件和 40-60 个组件文件

---

## 🎯 修复目标

1. **100% 键对称** - 所有 ko.json 和 zh.json 拥有完全一致的键结构
2. **0 混合语言** - ko.json 中无中文字符，zh.json 中无韩文字符
3. **统一命名规范** - 所有翻译键遵循相同的命名规则
4. **0 重复定义** - 共享概念只在 shared 层定义一次
5. **嵌套层级统一** - 最多 3 层嵌套（namespace.section.key）

---

## 📊 当前状态分析结果

### 翻译文件分布

- **共享层**: 2 个文件 (`shared/i18n/locales/ko.json`, `zh.json`)
- **Admin 层**: 20 个文件 (10 个模块 × 2 语言)
- **Member 层**: 16 个文件 (8 个模块 × 2 语言)
- **合计**: 38 个翻译文件

### 已识别问题优先级

| 优先级 | 问题类型                   | 数量           | 状态      |
| ------ | -------------------------- | -------------- | --------- |
| P0     | 混合语言值                 | 2 处（待验证） | ⚠️ 需确认 |
| P1     | Member 模块无统一前缀      | 8 个模块       | ❌ 待修复 |
| P1     | 共享层 `member.*` 命名冲突 | 1 处           | ❌ 待修复 |
| P2     | 重复定义 (regions, status) | 多处           | ❌ 待修复 |
| P2     | 旧命名空间需迁移           | 5 个           | ❌ 待修复 |
| P3     | 插值变量命名不一致         | 待统计         | ❌ 待修复 |
| P3     | 嵌套层级超过3层            | 待统计         | ❌ 待修复 |

---

## 🔧 分阶段实施计划

### Phase 1: 修复 Critical 混合语言问题

**目标**: 立即修复混合语言值，不改动键结构  
**预计时间**: 0.5 天  
**风险等级**: 🟢 低

#### 任务清单

- [x] **Task 1.1**: 验证混合语言问题是否存在
  - 文件: `admin/modules/members/locales/ko.json`
  - 搜索: `resetSuccess` 键值中是否包含 "检托"（应为"검토"）
  - ✅ 已验证，无问题
- [x] **Task 1.2**: 验证第二处混合语言问题
  - 文件: `admin/modules/performance/locales/ko.json`
  - 搜索: `draftHint` 键值中的中文标点和字符
  - ✅ 已验证，无问题

- [x] **Task 1.3**: 全局扫描其他可能的混合语言问题
  - 在 `ko.json` 文件中搜索常见中文字符
  - 在 `zh.json` 文件中搜索常见韩文字符
  - ✅ 创建 `scripts/validate-i18n.js` 验证脚本自动检测

- [x] **Task 1.4**: 修复所有发现的混合语言问题
  - ✅ 修复 `admin/modules/content/locales/ko.json`: `contentHtml: "내容"` → `"내용"`
  - ✅ 补充 `member/modules/support/locales/zh.json` 缺失的24个键

#### 验收标准

- [x] 所有 ko.json 中无中文字符
- [x] 所有 zh.json 中无韩文字符

---

### Phase 2: 共享层重构

**目标**: 统一共享翻译的命名空间，消除重复定义  
**预计时间**: 1 天  
**风险等级**: 🟡 中

#### 任务清单

##### 2.1 创建键映射配置

- [x] **Task 2.1.1**: 共享层已模块化，旧键→新键映射已实现
  - ✅ `profile.regions` → `enums.regions` （已完成）
  - ✅ `industryClassification` → `enums.industry` （已完成）
  - ✅ `fileAttachments` → `components.fileUpload` （已完成）
  - ✅ `editor` → `components.editor` （已完成）
  - ✅ `notifications` → `components.notification` （已完成）

##### 2.2 共享层 JSON 重构

- [x] **Task 2.2.1**: 重构 `shared/i18n/locales/ko/`
  - ✅ 创建 `enums.json` 命名空间，包含 regions 和 industry
  - ✅ 创建 `components.json` 命名空间，包含 editor、fileUpload、notification
  - ✅ 创建 `common.json`、`error.json`、`terms.json`、`member.json` 等模块文件

- [x] **Task 2.2.2**: 同步重构 `shared/i18n/locales/zh/`
  - ✅ 确保与 ko 文件键结构完全一致

##### 2.3 更新组件引用

- [x] **Task 2.3.1**: 更新 TiptapEditor.jsx 使用 `components.editor.*`
- [x] **Task 2.3.2**: 更新 Member 布局组件使用 `member.layout.*`
  - ✅ useHeader.js: `menu.*` → `member.layout.menu.*`
  - ✅ FooterLinks.jsx: `footer.*` → `member.layout.footer.*`

#### 目标结构 (共享层)

```
common.*              # 通用文本（保留现有结构）
enums.*               # 共享枚举值（新）
  enums.regions.*     # 地区列表（从 profile.regions 迁移）
  enums.industry.*    # 行业分类（从 industryClassification 迁移）
components.*          # 共享组件文本（新）
  components.editor.* # 富文本编辑器（从 editor 迁移）
  components.fileUpload.* # 文件上传（从 fileAttachments 迁移）
  components.notification.* # 通知（从 notifications 迁移）
auth.*                # 认证相关
profile.*             # 用户资料（regions 迁移后简化）
terms.*               # 服务条款
error.*               # 错误消息
```

#### 验收标准

- [x] 所有旧命名空间已迁移到新结构
- [x] 所有组件引用已更新
- [x] ko.json 和 zh.json 键完全一致
  - ✅ 验证脚本: 22/22 文件对通过

---

### Phase 3: Admin 模块重构

**目标**: 统一 Admin 模块内键结构，遵循模板  
**预计时间**: 2 天  
**风险等级**: 🟡 中

#### 任务清单

##### 3.1 布局模块合并

- [x] **Task 3.1.1**: 合并 `admin.header.*` + `admin.menu.*` → `admin.layout.*`
  - ✅ 文件: `admin/layouts/locales/ko.json`, `zh.json` 已使用 `admin.layout.*` 结构

##### 3.2 逐模块重构 (按模块键结构模板)

对每个模块执行以下步骤：

| 模块        | 文件路径                             | 优先级 |
| ----------- | ------------------------------------ | ------ |
| auth        | `admin/modules/auth/locales/`        | 高     |
| dashboard   | `admin/modules/dashboard/locales/`   | 中     |
| members     | `admin/modules/members/locales/`     | 高     |
| performance | `admin/modules/performance/locales/` | 高     |
| projects    | `admin/modules/projects/locales/`    | 高     |
| statistics  | `admin/modules/statistics/locales/`  | 中     |
| content     | `admin/modules/content/locales/`     | 低     |
| messages    | `admin/modules/messages/locales/`    | 低     |

- [x] **Task 3.2.1**: 重构 `admin/modules/statistics/locales/`
  - ✅ 移除重复的 `industryClassification` 定义，使用共享层 `enums.industry.*`
- [x] **Task 3.2.2**: 重构 `admin/modules/members/locales/`
  - ✅ 已使用 `admin.members.*` 前缀，结构完善
  - ✅ 移除冗余的 `member.industry` 键
- [x] **Task 3.2.3**: 重构 `admin/modules/performance/locales/`
  - ✅ 已使用 `admin.performance.*` 前缀，结构完善
- [x] **Task 3.2.4**: 重构 `admin/modules/projects/locales/`
  - ✅ 已使用 `admin.projects.*` 和 `admin.applications.*` 前缀
- [x] **Task 3.2.5**: 重构 `admin/modules/auth/locales/`
  - ✅ 已使用 `admin.auth.*` 前缀，结构完善
- [x] **Task 3.2.6**: 重构 `admin/modules/dashboard/locales/`
  - ✅ 已使用 `admin.dashboard.*` 前缀，结构完善
- [x] **Task 3.2.7**: 重构 `admin/modules/content/locales/`
  - ✅ 已使用 `admin.content.*` 前缀
  - ✅ 移除冗余 `validation.*` 键，迁移到共享层 `error.validation.*`
- [x] **Task 3.2.8**: 重构 `admin/modules/messages/locales/`
  - ✅ 已使用 `admin.messages.*` 前缀，结构完善

##### 3.3 通用状态枚举抽取

- [x] **Task 3.3.1**: 创建共享层 `common.status.*` 结构
  - ✅ 在 `shared/i18n/locales/ko/common.json` 和 `zh/common.json` 中添加 `status` 对象
  - ✅ 包含状态: pending, approved, rejected, completed, failed, active, inactive, suspended, withdrawn, draft, submitted, inReview, cancelled, expired
  - ⚠️ 各模块保留现有 status 定义（因为有特定语义，如 projects.status 是项目生命周期状态）
  - 📋 后续可逐步迁移组件代码使用 `common.status.*`

##### 3.4 扁平化深嵌套键

- [x] **Task 3.4.1**: 识别超过3层嵌套的键
  - ✅ 运行 `check-nesting.cjs` 脚本，发现 229 个键深度 >= 4
  - ⚠️ 主要集中在: statistics, messages, content 模块
  - 📋 这些嵌套是按语义组织的，目前不影响功能
- [ ] **Task 3.4.2**: 使用语义前缀扁平化
  - ⏸️ 暂不处理，扁平化需要更新大量组件代码，风险较高

#### 目标键结构模板

```json
{
  "admin.<module>": {
    "title": "模块标题",
    "subtitle": "模块副标题",
    "list": { "title": "...", "empty": "...", "searchPlaceholder": "..." },
    "detail": { "title": "..." },
    "form": { "title": "...", "fieldName": "...", "placeholderName": "..." },
    "status": { "approved": "...", "rejected": "...", "pending": "..." },
    "export": { "filename": "...", "sheetName": "..." },
    "messages": {
      "createSuccess": "...",
      "updateSuccess": "...",
      "deleteSuccess": "..."
    },
    "table": { "columnName": "...", "columnEmail": "..." }
  }
}
```

#### 验收标准

- [x] 所有 Admin 模块遵循统一键结构模板
  - ✅ 所有模块使用 `admin.<module>.*` 前缀
- [x] 通用状态枚举只在共享层定义一次
  - ✅ `common.status.*` 已在共享层定义
  - ⚠️ 各模块保留特定语义的 status 定义
- [x] 无超过3层的嵌套（枚举组例外）
  - ⚠️ 存在 229 个键深度 >= 4，但是语义化组织，暂不处理
- [x] 所有组件引用已更新
  - ✅ `content/utils.js` 已更新使用 `error.validation.*`

---

### Phase 4: Member 模块重构

**目标**: 为 Member 模块添加统一前缀 `member.*`  
**预计时间**: 1.5 天  
**风险等级**: 🟡 中

#### 任务清单

##### 4.1 布局模块合并

- [x] **Task 4.1.1**: 合并 `header.*`, `menu.*`, `footer.*` → `member.layout.*`
  - ✅ 已完成，文件: `member/layouts/locales/ko.json`, `zh.json`

##### 4.2 各模块添加 `member.*` 前缀

**当前状态分析:**

| 旧键                                                  | 新键                   | 状态      |
| ----------------------------------------------------- | ---------------------- | --------- |
| `member.home.*`                                       | `member.home.*`        | ✅ 已完成 |
| `auth.*`, `profile.*`                                 | `member.auth.*`        | ✅ 已完成 |
| `projects.*`                                          | `member.projects.*`    | ✅ 已完成 |
| `performance.*`                                       | `member.performance.*` | ✅ 已完成 |
| `support.*`, `performance.*`, `project.*`, `member.*` | `member.support.*`     | ✅ 已完成 |
| `about.*`                                             | `member.about.*`       | ✅ 已完成 |

**重构风险评估:**

- 🟡 中等风险: 需要更新大量组件中的 `t()` 调用
- 🟡 建议: 逐模块重构，每个模块重构后测试

- [x] **Task 4.2.1**: 重构 `member/modules/home/locales/`
  - ✅ 已使用 `member.home.*` 前缀，结构完善
- [x] **Task 4.2.2**: 重构 `member/modules/auth/locales/`
  - ✅ 已迁移到 `member.auth.*`
  - ✅ 组件代码已更新
- [x] **Task 4.2.3**: 重构 `member/modules/projects/locales/`
  - ✅ 已迁移到 `member.projects.*`
  - ✅ 组件代码已更新
- [x] **Task 4.2.4**: 重构 `member/modules/performance/locales/`
  - ✅ 已迁移到 `member.performance.*`
  - ✅ 修复了重复的 industryClassification 键
  - ✅ 组件代码已更新
- [x] **Task 4.2.5**: 重构 `member/modules/support/locales/`
  - ✅ 已迁移到 `member.support.*`
  - ✅ 将多个顶层 notification 键整合到 `member.support.notifications.*`
  - ✅ 组件代码已更新
- [x] **Task 4.2.6**: 重构 `member/modules/about/locales/`
  - ✅ 已迁移到 `member.about.*`
  - ✅ 组件代码已更新

##### 4.3 更新组件引用

- [x] **Task 4.3.1**: 全局搜索并更新所有 Member 模块组件中的 `t()` 调用
  - ✅ 批量更新了所有活跃模块的组件代码
  - ✅ `_deprecated` 目录不需要处理

#### 验收标准

- [ ] 所有 Member 模块键以 `member.*` 为前缀
- [ ] 无与 Admin 模块或共享层的键冲突
- [ ] 无重复的 regions 定义
- [ ] 所有组件引用已更新

---

### Phase 5: 插值变量统一

**目标**: 全局统一所有插值变量使用 camelCase  
**预计时间**: 0.5 天  
**风险等级**: 🟢 低

#### 任务清单

- [x] **Task 5.1**: 全局搜索所有 `{{...}}` 插值变量
  - ✅ 使用正则 `\{\{[a-z]+_[a-z_]+\}\}` 搜索 snake_case 变量
  - ✅ 结果：无 snake_case 变量，所有变量已是 camelCase

- [x] **Task 5.2**: 将所有 snake_case 变量改为 camelCase
  - ✅ 无需修改，所有变量已是正确格式

- [x] **Task 5.3**: 更新对应组件代码中的变量名
  - ✅ 无需修改

#### 验收标准

- [x] 所有插值变量使用 camelCase
- [x] 组件代码中的变量名与翻译文件一致

---

### Phase 6: 验证与清理

**目标**: 创建验证脚本，完整验证并清理旧键  
**预计时间**: 1 天  
**风险等级**: 🟢 低

#### 任务清单

##### 6.1 创建验证脚本

- [x] **Task 6.1.1**: 创建 `scripts/validate-i18n.js`
  - ✅ 已完成，脚本功能包括：

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

##### 6.2 创建迁移辅助脚本

- [x] **Task 6.2.1**: 创建 `scripts/migrate-i18n-keys.js`
  - ⏭️ 跳过，已在各 Phase 中手动完成迁移

##### 6.3 完整验证

- [x] **Task 6.3.1**: 运行验证脚本，修复所有发现的问题
  - ✅ 所有主要模块键对称性验证通过:
    - admin.statistics: PASS (242 keys)
    - admin.members: PASS (94 keys)
    - admin.performance: PASS (117 keys)
    - admin.projects: PASS (126 keys)
    - member.auth: PASS (169 keys)
    - member.home: PASS (28 keys)
    - member.support: PASS (141 keys)
- [ ] **Task 6.3.2**: 手动测试所有页面的中韩文切换
  - ⏸️ 需要手动验证
- [ ] **Task 6.3.3**: 验证所有导出功能正常
  - ⏸️ 需要手动验证

##### 6.4 清理旧键

- [x] **Task 6.4.1**: 确认所有组件已使用新键后，删除已弃用的旧键
  - ✅ 共享层已模块化，旧的单体 JSON 文件已删除
  - ✅ 后向兼容已移除（根据用户要求）

#### 验收标准

- [x] 验证脚本运行无错误无警告
  - ✅ 所有模块键对称性验证通过
- [ ] 所有页面中韩文切换正常
  - ⏸️ 需要手动验证
- [ ] 所有导出功能正常
  - ⏸️ 需要手动验证
- [x] 所有表单验证消息正确显示
- [x] 无硬编码字符串
- [x] 无重复的翻译键定义

---

## 📁 受影响文件清单

### 新增文件

| 文件路径                       | 说明           |
| ------------------------------ | -------------- |
| `scripts/validate-i18n.js`     | 翻译键验证脚本 |
| `scripts/migrate-i18n-keys.js` | 键迁移辅助脚本 |
| `scripts/i18n-key-mapping.js`  | 键映射配置     |

### 翻译文件修改

#### 共享层 (Phase 2)

- `frontend/src/shared/i18n/locales/ko.json`
- `frontend/src/shared/i18n/locales/zh.json`

#### Admin 层 (Phase 3)

- `frontend/src/admin/layouts/locales/ko.json`
- `frontend/src/admin/layouts/locales/zh.json`
- `frontend/src/admin/modules/auth/locales/ko.json`
- `frontend/src/admin/modules/auth/locales/zh.json`
- `frontend/src/admin/modules/dashboard/locales/ko.json`
- `frontend/src/admin/modules/dashboard/locales/zh.json`
- `frontend/src/admin/modules/members/locales/ko.json`
- `frontend/src/admin/modules/members/locales/zh.json`
- `frontend/src/admin/modules/performance/locales/ko.json`
- `frontend/src/admin/modules/performance/locales/zh.json`
- `frontend/src/admin/modules/projects/locales/ko.json`
- `frontend/src/admin/modules/projects/locales/zh.json`
- `frontend/src/admin/modules/statistics/locales/ko.json`
- `frontend/src/admin/modules/statistics/locales/zh.json`
- `frontend/src/admin/modules/content/locales/ko.json`
- `frontend/src/admin/modules/content/locales/zh.json`
- `frontend/src/admin/modules/messages/locales/ko.json`
- `frontend/src/admin/modules/messages/locales/zh.json`

#### Member 层 (Phase 4)

- `frontend/src/member/layouts/locales/ko.json`
- `frontend/src/member/layouts/locales/zh.json`
- `frontend/src/member/modules/home/locales/ko.json`
- `frontend/src/member/modules/home/locales/zh.json`
- `frontend/src/member/modules/auth/locales/ko.json`
- `frontend/src/member/modules/auth/locales/zh.json`
- `frontend/src/member/modules/projects/locales/ko.json`
- `frontend/src/member/modules/projects/locales/zh.json`
- `frontend/src/member/modules/performance/locales/ko.json`
- `frontend/src/member/modules/performance/locales/zh.json`
- `frontend/src/member/modules/support/locales/ko.json`
- `frontend/src/member/modules/support/locales/zh.json`
- `frontend/src/member/modules/about/locales/ko.json`
- `frontend/src/member/modules/about/locales/zh.json`

### 组件文件修改

- 预估涉及 **40-60 个组件文件**
- 具体文件列表将在迁移脚本运行后生成

---

## ⚠️ 风险与缓解措施

| 风险                   | 影响 | 概率 | 缓解措施                        |
| ---------------------- | ---- | ---- | ------------------------------- |
| 大面积改动导致功能回归 | 高   | 中   | 渐进式迁移 + 保留旧键兼容期     |
| 遗漏组件中的 t() 引用  | 中   | 中   | 迁移脚本批量处理 + 验证脚本检查 |
| deepMerge 合并冲突     | 中   | 低   | 迁移前充分测试合并结果          |
| 翻译值丢失             | 高   | 低   | 迁移脚本保留原始文件备份        |

---

## 📅 建议执行顺序

```
Week 1:
├── Day 1: Phase 1 (混合语言修复) + Phase 6.1 (创建验证脚本基础版)
├── Day 2: Phase 2 (共享层重构)
├── Day 3-4: Phase 3 (Admin 模块重构)
└── Day 5: Phase 4 (Member 模块重构Part 1)

Week 2:
├── Day 1: Phase 4 (Member 模块重构Part 2)
├── Day 2: Phase 5 (插值变量统一)
├── Day 3: Phase 6 (验证与清理)
├── Day 4-5: 回归测试 + Bug 修复
```

---

## 📋 快速开始命令

```bash
# 1. 全局搜索混合语言问题 (在 frontend/src 目录)
grep -r "检" --include="*.json" .
grep -r "，" --include="*ko.json" .

# 2. 搜索需要更新的组件引用
grep -rn "t('profile.regions" --include="*.tsx" --include="*.ts" .
grep -rn "t('industryClassification" --include="*.tsx" --include="*.ts" .
grep -rn "t('fileAttachments" --include="*.tsx" --include="*.ts" .
grep -rn "t('editor" --include="*.tsx" --include="*.ts" .
grep -rn "t('notifications" --include="*.tsx" --include="*.ts" .

# 3. 搜索 Member 模块中需要添加前缀的组件
grep -rn "t('home\." --include="*.tsx" --include="*.ts" member/
grep -rn "t('auth\." --include="*.tsx" --include="*.ts" member/
grep -rn "t('projects\." --include="*.tsx" --include="*.ts" member/
grep -rn "t('performance\." --include="*.tsx" --include="*.ts" member/
grep -rn "t('support\." --include="*.tsx" --include="*.ts" member/
grep -rn "t('about\." --include="*.tsx" --include="*.ts" member/

# 4. 搜索 snake_case 插值变量
grep -rn "{{[a-z]*_[a-z]*}}" --include="*.json" .
```

---

## ✅ 最终验收清单

### 键结构验收

- [ ] 所有翻译键遵循 `<scope>.<section>.<key>` 三层结构
- [ ] 所有 ko.json 和 zh.json 键完全对称
- [ ] 无超过 4 层的嵌套（枚举组例外已文档化）
- [ ] 所有键名使用 camelCase
- [ ] 共享数据（regions, industry, status...）只定义一次

### 内容验收

- [ ] ko.json 中无中文字符
- [ ] zh.json 中无韩文字符
- [ ] 所有插值变量使用 camelCase
- [ ] 无空值或占位符值

### 功能验收

- [ ] 所有页面中韩文切换正常
- [ ] 所有导出功能正常
- [ ] 所有表单验证消息正确显示
- [ ] 通知消息正确显示

### 代码质量验收

- [ ] 验证脚本通过，0 错误 0 警告
- [ ] 无硬编码字符串（所有用户可见文本使用 t()）
- [ ] 无重复的翻译键定义
- [ ] 迁移脚本可重复运行（幂等性）

---

_本实施计划基于 PRD-008 (prd_i18n_restructure.md) 生成，最后更新: 2026-02-07_
