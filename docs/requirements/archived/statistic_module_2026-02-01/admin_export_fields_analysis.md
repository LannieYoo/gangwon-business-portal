# Admin 模块导出字段分析（含URL/附件处理建议）

## 概述

本文档分析 Admin 所有模块的导出功能，列出当前导出的字段，重点分析URL和附件字段的处理建议。

## 导出策略原则（方案A：适度放宽）

### 核心原则

1. **统计模块 (Statistics)** - 尽可能多的字段
   - ✅ 导出所有业务字段（用于数据分析）
   - ❌ 去掉 URL、file、attachments 等无用字段
   - 目的：提供完整的数据用于统计分析和报表

2. **其他模块 (Members, Performance, Projects等)** - 本表字段 + 必要的关联标识
   - ✅ 导出该模块对应数据库表的所有字段
   - ✅ 包含必要的关联标识字段（公司名称、项目名称等，替代无意义的ID）
   - ❌ 不包含 URL、file、attachments 等字段
   - ❌ 不包含复杂的统计计算（如申请数量、增长率等）
   - 目的：保持简洁的同时，确保导出数据对用户有意义

### 字段过滤规则

**所有模块统一移除:**
- ❌ 图片URL字段 (`logo_url`, `image_url`, `avatar_url` 等)
- ❌ 文件URL字段 (`file_url`, `document_url` 等)
- ❌ 附件字段 (`attachments`, `files` 等)
- ❌ 复杂统计字段（`applications_count`, `growth_rate` 等）

**允许包含的关联字段:**
- ✅ 标识性字段：公司名称、项目名称、用户名称等（让ID变得有意义）
- ✅ 关键业务字段：行业、地区、营收等（会员管理的核心信息）
- ❌ 不包含：详细描述、长文本、统计数据等

**统计模块特殊处理:**
- ✅ 保留所有业务相关字段（产业分类、经营指标、代表者信息等）
- ✅ 可以包含跨表聚合的统计数据
- ❌ 仍然要移除 URL 和附件字段

---

## 1. 会员管理 (Members) 导出

### 当前导出字段

**基本信息:**
- ✅ `id` - 会员ID
- ✅ `business_number` - 事业者注册号
- ✅ `company_name` - 公司名称
- ✅ `email` - 邮箱
- ✅ `status` - 状态
- ✅ `approval_status` - 审批状态

**企业资料 (Profile):**
- ✅ `industry` - 行业
- ✅ `revenue` - 营收
- ✅ `employee_count` - 员工数
- ✅ `founding_date` - 成立日期
- ✅ `region` - 地区
- ✅ `address` - 地址
- ⚠️ `website` - 网站URL
- ❌ `logo_url` - Logo图片URL

**时间戳:**
- ✅ `created_at` - 创建时间
- ✅ `updated_at` - 更新时间

### URL/附件字段分析

| 字段 | 类型 | 当前状态 | 建议 | 理由 |
|------|------|----------|------|------|
| `logo_url` | 图片URL | ✅ 导出中 | ❌ **立即移除** | 图片URL在Excel中无法预览，只是无用文本 |
| `website` | 网站URL | ✅ 导出中 | ⚠️ **可选保留** | 有一定参考价值，可设置为超链接 |

### 导出策略

**📋 原则: members 表 + 关键 profile 字段**

根据适度放宽策略，会员管理模块导出 `members` 表字段，并包含关键的 `profile` 字段，让导出数据更有意义。

### 建议导出字段（members 表 + 关键 profile 字段）

**✅ Members 表字段（全部保留）:**
- `id` - 会员ID
- `business_number` - 事业者注册号
- `company_name` - 公司名称
- `email` - 邮箱
- `status` - 状态
- `approval_status` - 审批状态
- `created_at` - 创建时间
- `updated_at` - 更新时间
- `rejection_reason` - 拒绝原因（如果有）

**✅ Profile 关键字段（识别企业必需）:**
- `industry` - 行业（识别企业类型）
- `region` - 地区（识别企业位置）
- `revenue` - 营收（识别企业规模）
- `employee_count` - 员工数（识别企业规模）
- `founding_date` - 成立日期（识别企业阶段）
- `representative` - 代表者姓名
- `representative_gender` - 代表者性别

**❌ 应该移除的字段:**
- ❌ `logo_url` - 图片URL（无用）
- ❌ `website` - 网站URL（可在详情页查看）
- ❌ `address` - 详细地址（太长，region足够）
- ❌ 其他非关键 profile 字段

**💡 说明:**
- 包含关键 profile 字段让管理员能快速了解企业基本情况
- 避免导出后只看到ID和名称，不知道企业是做什么的
- 如果需要更完整的数据分析，应该使用**统计模块**导出

---

## 2. 业绩管理 (Performance) 导出

### 当前导出字段

**基本信息:**
- ✅ `id` - 记录ID
- ✅ `member_id` - 会员ID
- ✅ `year` - 年度
- ✅ `quarter` - 季度
- ✅ `status` - 状态

**经营指标:**
- ✅ `revenue` - 营收
- ✅ `operating_profit` - 营业利润
- ✅ `net_profit` - 净利润
- ✅ `total_assets` - 总资产
- ✅ `total_liabilities` - 总负债
- ✅ `employee_count` - 员工数
- ✅ `export_amount` - 出口额
- ✅ `investment_amount` - 投资额
- ✅ `patent_count` - 专利数

**时间戳:**
- ✅ `submitted_at` - 提交时间
- ✅ `reviewed_at` - 审核时间
- ✅ `created_at` - 创建时间
- ✅ `updated_at` - 更新时间

### URL/附件字段分析

| 字段 | 类型 | 当前状态 | 建议 | 理由 |
|------|------|----------|------|------|
| 附件字段 | - | ❌ 未导出 | ✅ **保持不导出** | 正确的做法，附件不应导出到Excel |

### 导出策略

**📋 原则: performance_records 表 + 公司标识**

根据适度放宽策略，业绩管理模块导出 `performance_records` 表字段，并包含公司标识信息。

### 建议导出字段（performance_records 表 + 公司标识）

**✅ Performance_records 表字段（全部保留）:**
- `id` - 记录ID
- `member_id` - 会员ID
- `year` - 年度
- `quarter` - 季度
- `type` - 类型
- `status` - 状态
- `data_json` - 业绩数据（JSON格式，包含所有经营指标）
- `submitted_at` - 提交时间
- `reviewed_at` - 审核时间
- `created_at` - 创建时间
- `updated_at` - 更新时间

**✅ 关联标识字段（让 member_id 有意义）:**
- `member_company_name` - 公司名称（关联 members 表）
- `member_business_number` - 事业者注册号（关联 members 表）

**❌ 应该移除的字段:**
- ❌ 附件相关字段（如果有）

**💡 说明:**
- 包含公司名称让管理员能快速识别是哪个公司的业绩
- 避免导出后只看到 member_id，需要再去查询是哪个公司
- `data_json` 字段包含了所有业绩数据，可以根据需要展开为多列
- 如果需要更完整的数据分析，应该使用**统计模块**导出

---

## 3. 项目管理 (Projects) 导出

### 当前导出字段

**基本信息:**
- ✅ `id` - 项目ID
- ✅ `title` - 标题
- ⚠️ `description` - 描述（长文本）
- ✅ `status` - 状态
- ✅ `start_date` - 开始日期
- ✅ `end_date` - 结束日期
- ✅ `budget` - 预算
- ✅ `target_companies` - 目标企业
- ✅ `eligibility_criteria` - 资格标准
- ✅ `application_deadline` - 申请截止日期
- ✅ `view_count` - 浏览次数
- ✅ `applications_count` - 申请人数

**URL/附件字段:**
- ❌ `image_url` - 项目封面图URL
- ❌ `attachments` - 附件数组（JSON格式）

**时间戳:**
- ✅ `created_at` - 创建时间
- ✅ `updated_at` - 更新时间

### URL/附件字段分析

| 字段 | 类型 | 当前状态 | 建议 | 理由 |
|------|------|----------|------|------|
| `image_url` | 封面图URL | ✅ 导出中 | ❌ **立即移除** | 项目封面图URL在Excel中无实际用途 |
| `attachments` | 附件数组(JSON) | ✅ 导出中 | ❌ **立即移除** | JSON数组在Excel中完全不可读 |

### 导出策略

**📋 原则: projects 表字段（保持简洁）**

项目管理模块导出 `projects` 表字段，项目信息相对独立，不需要额外关联。

### 建议导出字段（projects 表）

**✅ Projects 表字段（保留）:**
- `id` - 项目ID
- `title` - 标题
- `description` - 描述（可截断到200字符）
- `status` - 状态
- `start_date` - 开始日期
- `end_date` - 结束日期
- `budget` - 预算
- `target_company_name` - 目标企业
- `target_business_number` - 目标企业注册号
- `eligibility_criteria` - 资格标准
- `application_deadline` - 申请截止日期
- `view_count` - 浏览次数
- `created_at` - 创建时间
- `updated_at` - 更新时间

**❌ 应该移除的字段:**
- ❌ `image_url` - 项目封面图URL（无用）
- ❌ `attachments` - 附件数组（JSON，不可读）
- ❌ `applications_count` - 统计数据（非表字段）

**💡 说明:**
- 项目信息相对独立，包含的字段已经足够识别项目
- 不需要额外关联其他表的数据
- 如果需要项目申请统计，应该单独导出申请数据或使用**统计模块**

---

## 4. 项目申请 (Project Applications) 导出

### 当前导出字段

**基本信息:**
- ✅ `id` - 申请ID
- ✅ `project_id` - 项目ID
- ✅ `project_title` - 项目标题
- ✅ `member_id` - 会员ID
- ✅ `member_company_name` - 公司名称
- ✅ `member_business_number` - 事业者注册号
- ✅ `status` - 状态
- ⚠️ `application_reason` - 申请理由（长文本）

**时间戳:**
- ✅ `submitted_at` - 提交时间
- ✅ `reviewed_at` - 审核时间
- ✅ `created_at` - 创建时间

### URL/附件字段分析

| 字段 | 类型 | 当前状态 | 建议 | 理由 |
|------|------|----------|------|------|
| 附件字段 | - | ❌ 未导出 | ✅ **保持不导出** | 正确的做法，附件不应导出到Excel |

### 导出策略

**📋 原则: project_applications 表 + 关联标识**

根据适度放宽策略，项目申请模块导出 `project_applications` 表字段，并包含项目和公司标识信息。

### 建议导出字段（project_applications 表 + 关联标识）

**✅ Project_applications 表字段（全部保留）:**
- `id` - 申请ID
- `project_id` - 项目ID
- `member_id` - 会员ID
- `status` - 状态
- `application_reason` - 申请理由（可截断到200字符）
- `submitted_at` - 提交时间
- `reviewed_at` - 审核时间
- `created_at` - 创建时间

**✅ 关联标识字段（让ID有意义）:**
- `project_title` - 项目标题（关联 projects 表）
- `member_company_name` - 公司名称（关联 members 表）
- `member_business_number` - 事业者注册号（关联 members 表）

**❌ 应该移除的字段:**
- ❌ 附件相关字段

**💡 说明:**
- 包含项目标题和公司名称让管理员能快速了解"谁申请了什么项目"
- 避免导出后只看到 project_id 和 member_id，不知道具体是什么
- 如果需要更详细的项目或公司信息，应该使用**统计模块**导出

---

## 5. 仪表板统计 (Dashboard) 导出

### 当前导出字段

**汇总统计:**
- ✅ `totalMembers` - 总会员数
- ✅ `totalSales` - 总销售额
- ✅ `totalEmployment` - 总雇佣人数
- ✅ `totalIntellectualProperty` - 总知识产权数

**时间序列数据:**
- ✅ `period` - 时间段
- ✅ `members` - 会员数
- ✅ `sales` - 销售额
- ✅ `employment` - 雇佣人数

### URL/附件字段分析

无URL或附件字段，全部为统计数据。

### 建议导出字段

**✅ 建议保留:**
- 所有当前字段

**➕ 建议添加:**
- `year` - 年度（明确标识）
- `quarter` - 季度（明确标识）
- `growth_rate_members` - 会员增长率
- `growth_rate_sales` - 销售额增长率
- `growth_rate_employment` - 雇佣增长率
- `average_sales_per_member` - 人均销售额
- `average_employment_per_member` - 人均雇佣数

---

## 6. 统计报告 (Statistics) 导出

### 当前导出字段

**时间维度:**
- ✅ `year` - 年度
- ✅ `quarter` - 季度
- ✅ `month` - 月份

**基本信息:**
- ✅ `businessRegNo` - 事业者注册号
- ✅ `enterpriseName` - 企业名称

**企业特征:**
- ✅ `ksicMajor` - KSIC大分类
- ✅ `ksicSub` - KSIC中分类
- ✅ `gangwonIndustry` - 江原主导产业
- ✅ `gangwonIndustrySub` - 江原主导产业中分类
- ✅ `gangwonFutureIndustry` - 江原7大未来产业
- ✅ `futureTech` - 未来有望新技术
- ✅ `workYears` - 业力
- ✅ `startupStage` - 创业阶段
- ✅ `region` - 所在地

**经营指标:**
- ✅ `totalInvestment` - 投资额
- ✅ `annualRevenue` - 年营收
- ✅ `exportAmount` - 出口额
- ✅ `employeeCount` - 员工数
- ✅ `patentCount` - 专利数

**代表者信息:**
- ✅ `representativeGender` - 代表者性别
- ✅ `representativeAge` - 代表者年龄

**政策关联:**
- ✅ `policyTags` - 政策标签

### URL/附件字段分析

无URL或附件字段，全部为业务数据。

### 导出策略

**📋 原则: 统计模块可以导出尽可能多的字段**

统计模块是唯一可以包含跨表聚合数据的导出模块，用于数据分析和报表。

### 建议导出字段（跨表聚合数据）

**✅ 应该保留的所有字段:**
- 所有当前字段都非常有价值，建议全部保留
- 时间维度、基本信息、企业特征、经营指标、代表者信息、政策关联等

**❌ 应该移除的字段:**
- ❌ 任何 URL 字段（logo_url, website, image_url 等）
- ❌ 任何附件字段（attachments, files 等）

**➕ 可以添加的字段:**
- `email` - 邮箱（用于联系）
- `phone` - 电话（用于联系）
- `address` - 详细地址
- `representative` - 代表者姓名
- `cooperation_fields` - 产业合作意向领域

**💡 说明:**
- 统计模块是数据分析的核心，可以包含来自多个表的聚合数据
- 但仍然要遵守"不导出URL和附件"的原则
- 所有业务相关的字段都可以包含，用于统计分析

---

## 总结建议

### 导出策略总结

| 模块 | 导出范围 | 是否跨表 | URL/附件 | 说明 |
|------|----------|----------|----------|------|
| **统计模块** | 尽可能多的字段 | ✅ 允许 | ❌ 移除 | 用于数据分析，可包含聚合数据 |
| **会员管理** | 仅 members 表 | ❌ 不允许 | ❌ 移除 | 只导出账号管理信息 |
| **业绩管理** | 仅 performance_records 表 | ❌ 不允许 | ❌ 移除 | 只导出业绩记录本身 |
| **项目管理** | 仅 projects 表 | ❌ 不允许 | ❌ 移除 | 只导出项目基本信息 |
| **项目申请** | 仅 project_applications 表 | ❌ 不允许 | ❌ 移除 | 只导出申请记录本身 |
| **仪表板** | 统计汇总数据 | ✅ 允许 | ❌ 移除 | 导出统计结果 |

### 通用原则（方案A：适度放宽）

**✅ 各模块应该导出的字段:**
1. **本表的所有业务字段** - 该模块数据库表的所有有意义字段
2. **必要的关联标识** - 公司名称、项目名称等（让ID变得有意义）
3. **状态和时间戳** - status, created_at, updated_at 等
4. **关键业务信息** - 行业、地区、营收等（会员管理的核心识别信息）

**❌ 所有模块都不应导出的字段:**
1. **URL字段** - logo_url, image_url, website, file_url 等
2. **附件字段** - attachments, files 等
3. **复杂JSON** - 除非是业务必需的数据（如 performance 的 data_json）
4. **统计计算字段** - applications_count, growth_rate 等（非表字段）

**✅ 允许包含的关联字段（适度放宽）:**
1. **标识性字段** - 公司名称、项目名称（替代无意义的ID）
2. **关键业务字段** - 行业、地区、营收等（会员的核心信息）
3. **原则** - 只包含"让数据有意义"的关联字段，不包含详细描述和统计数据

**🔒 敏感字段处理:**
1. **个人信息** - 邮箱、电话需加密或脱敏
2. **财务数据** - 根据权限控制导出
3. **审核意见** - 可能包含敏感信息，需谨慎处理

### 数据格式建议

1. **日期格式** - 统一使用 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`
2. **数字格式** - 金额使用千分位分隔符，保留2位小数
3. **布尔值** - 使用 "是/否" 或 "Yes/No" 而不是 true/false
4. **枚举值** - 使用翻译后的文本而不是代码
5. **JSON数组** - 转换为逗号分隔的文本或统计数量

### 国际化建议

1. **字段名** - 根据用户语言设置导出对应的列名
2. **枚举值** - 导出翻译后的文本（如 "成长期" 而不是 "growth"）
3. **日期格式** - 根据语言调整日期格式
4. **货币单位** - 明确标注货币单位（韩元/人民币）

---

## 实施优先级

### 高优先级 (立即实施) - 方案A

1. **移除所有模块的URL/附件字段** ⚠️
   - 会员管理: 移除 `logo_url`, `website`
   - 项目管理: 移除 `image_url`, `attachments`
   - 统计模块: 确保没有URL/附件字段

2. **添加必要的关联标识字段** ✅
   - 会员管理: 添加关键 profile 字段（industry, region, revenue, employee_count, founding_date, representative, representative_gender）
   - 业绩管理: 添加公司标识（member_company_name, member_business_number）
   - 项目申请: 添加关联标识（project_title, member_company_name, member_business_number）
   - 项目管理: 保持当前，不需要额外关联

3. **移除统计类字段** ❌
   - 项目管理: 移除 `applications_count`（统计数据）
   - 其他模块: 不包含任何统计计算字段

4. **统计模块优化**
   - 保持当前的跨表聚合功能
   - 移除任何URL和附件字段
   - 可以添加更多业务字段用于分析

### 中优先级 (近期实施)

1. 优化长文本字段显示（截断到合理长度）
2. 优化数据格式和国际化
3. 添加数据脱敏功能

### 低优先级 (长期优化)

1. 为导出添加字段选择功能（让用户选择要导出的列）
2. 支持自定义导出模板
3. 添加导出任务队列（大数据量异步导出）

---

## 附录：URL/附件字段详细分析

### 当前导出中的URL/附件字段汇总

| 模块 | 字段名 | 类型 | 当前状态 | 建议操作 | 理由 |
|------|--------|------|----------|----------|------|
| 会员管理 | `logo_url` | 图片URL | ✅ 导出中 | ❌ **移除** | 图片URL在Excel中无法预览，只是无用文本 |
| 会员管理 | `website` | 网站URL | ✅ 导出中 | ⚠️ **可选保留** | 有一定参考价值，但优先级低 |
| 项目管理 | `image_url` | 封面图URL | ✅ 导出中 | ❌ **移除** | 项目封面图URL在Excel中无实际用途 |
| 项目管理 | `attachments` | 附件数组(JSON) | ✅ 导出中 | ❌ **移除** | JSON数组在Excel中完全不可读 |
| 项目申请 | 附件字段 | - | ❌ 未导出 | ✅ **保持** | 正确的做法，附件不应导出 |
| 业绩管理 | 附件字段 | - | ❌ 未导出 | ✅ **保持** | 正确的做法，附件不应导出 |

### 为什么要移除这些字段？

#### 1. 图片/文件URL字段 (logo_url, image_url)

**问题:**
- Excel中只显示为长串文本: `https://storage.example.com/logos/abc123.png`
- 无法预览图片内容
- 用户需要手动复制URL到浏览器才能查看
- 占用列宽，影响其他重要数据的可读性

**用户体验对比:**
```
❌ 糟糕体验:
用户: "我想看这个公司的Logo"
操作: 1. 在Excel中找到logo_url列
      2. 复制URL
      3. 打开浏览器
      4. 粘贴URL
      5. 查看图片

✅ 正确体验:
用户: "我想看这个公司的Logo"
操作: 1. 点击Excel中的公司名称链接（如果有）
      2. 或者访问系统详情页
      3. 直接查看Logo
```

#### 2. 附件数组字段 (attachments)

**问题:**
- 在Excel中显示为复杂的JSON字符串
- 示例: `[{"file_id":"abc","file_name":"doc.pdf","file_url":"https://...","file_size":1024}]`
- 完全不可读，无法快速了解附件信息
- 如果有多个附件，JSON会非常长

**替代方案对比:**
```
❌ 导出完整附件JSON:
attachments: [{"file_id":"abc123","file_name":"申请书.pdf","file_url":"https://storage.example.com/files/申请书.pdf","file_size":2048576,"file_type":"pdf","uploaded_at":"2024-01-15T10:30:00Z"},{"file_id":"def456","file_name":"营业执照.jpg","file_url":"https://storage.example.com/files/营业执照.jpg","file_size":1024000,"file_type":"image","uploaded_at":"2024-01-15T10:31:00Z"}]

✅ 导出附件统计:
attachments_count: 2
has_attachments: Yes
```

#### 3. 网站URL字段 (website)

**特殊情况:**
- 虽然也是URL，但网站地址有一定参考价值
- 可以快速了解企业是否有官网
- 在Excel中可以设置为超链接，点击直接打开
- **建议**: 可选保留，但不是必需字段

### 实施建议代码示例

#### 立即移除 (高优先级)

```python
# backend/src/modules/member/service.py
async def export_members_data(self, query: MemberListQuery) -> list[dict]:
    export_data.append({
        # ... 其他字段 ...
        # "logo_url": profile.get('logo_url'),  # ❌ 移除
        "website": profile.get('website'),      # ⚠️ 可选保留
    })

# backend/src/modules/project/service.py
async def export_projects_data(self, query: ProjectListQuery) -> list[dict]:
    export_data.append({
        # ... 其他字段 ...
        # "image_url": project.get("image_url"),     # ❌ 移除
        # "attachments": project.get("attachments"), # ❌ 移除
        "attachments_count": len(project.get("attachments", [])),  # ✅ 添加
    })
```

#### 用户需要查看附件时的正确流程

1. 在Excel中查看 `attachments_count` 了解附件数量
2. 如果需要查看具体附件，访问系统详情页
3. 在详情页可以预览、下载附件

这样既保持了Excel的简洁性，又不影响用户获取完整信息。

---

## 结论

通过移除无用的URL和附件字段，可以：
1. **提升Excel可读性** - 减少无用列，突出重要数据
2. **改善用户体验** - 用户不需要复制粘贴URL
3. **减少导出文件大小** - 特别是附件JSON数组很大时
4. **引导正确使用** - 鼓励用户在系统中查看详细信息

建议立即实施高优先级的移除操作，特别是 `logo_url`, `image_url`, `attachments` 这三个字段。
