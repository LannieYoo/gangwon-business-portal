# 会员字段全链路对比文档

> 基准：管理员页面（MemberDetail.jsx）+ 会员 Profile（useCompanyInfo.js）所展示的全部字段
> 对比范围：注册表单 → auth.service 映射 → 后端 Schema → register_member() 保存 → DB 列

## 图例

- ✅ = 存在且字段名一致
- ⚠️ = 存在但字段名不匹配或有转换问题
- ❌ = 缺失（数据会丢失）
- 🔒 = 注册时不需要（后期通过 profile 编辑）
- `—` = 系统字段，注册时自动生成

---

## 一、基础信息

| # | 中文名 | 韩文 | 注册表单 | auth.service | Schema | register_member() | DB 列 | 状态 |
|---|--------|------|----------|-------------|--------|-------------------|-------|------|
| 1 | 企业名称 | 기업명 | `companyName` ✅ | `company_name` ✅ | `company_name` ✅ | ✅ | `company_name` ✅ | ✅ 完整 |
| 2 | 营业执照号 | 사업자등록번호 | `businessNumber` ✅ | `business_number` ✅ | `business_number` ✅ | ✅ | `business_number` ✅ | ✅ 完整 |
| 3 | 法人注册号 | 법인등록번호 | `corporationNumber` ✅ | `corporate_number` ✅ | `corporate_number` ✅ | ❌ **未保存** | `legal_number` ⚠️ | 🔴 **Bug** |
| 4 | 成立日期 | 설립일 | `establishedDate` ✅ | `founding_date` ✅ | `founding_date` ✅ | ✅ | `founding_date` ✅ | ✅ 完整 |
| 5 | 代表人姓名 | 대표자 | `representative` ✅ | `representative` ✅ | `representative` ✅ | ✅ | `representative` ✅ | ✅ 完整 |
| 6 | 代表人出生日期 | 대표자 생년월일 | 🔒 无 | 🔒 无 | 🔒 无 | 🔒 无 | `representative_birth_date` ✅ | 🔒 Profile 编辑 |
| 7 | 代表人性别 | 대표자 성별 | 🔒 无 | 🔒 无 | 🔒 无 | 🔒 无 | `representative_gender` ✅ | 🔒 Profile 编辑 |
| 8 | 代表人电话 | 대표자 전화번호 | `representativePhone` ✅ | `representative_phone` ✅ | `representative_phone` ✅ | ✅ | `representative_phone` ✅ | ✅ 完整 |
| 9 | 公司代表电话 | 회사 전화번호 | `phone` ✅ | `phone` ✅ | `phone` ✅ | ✅ | `phone` ✅ | ✅ 完整 |
| 10 | 邮箱 | 이메일 | `email` ✅ | `email` ✅ | `email` ✅ | ✅ | `email` ✅ | ✅ 完整 |
| 11 | 网站 | 웹사이트 | `websiteUrl` ✅ | `website` ✅ | `website` ✅ | ✅ | `website` ✅ | ✅ 完整 |
| 12 | 企业Logo | 로고 | `logo` (File) ✅ | `logo_file_id` ✅ | `logo_file_id` ✅ | ❌ **未保存** | `logo_url` ⚠️ | ⚠️ 需要转换逻辑 |
| 13 | 营业执照文件 | 사업자등록증 | `businessLicenseFile` ✅ | `certificate_file_id` ✅ | `certificate_file_id` ✅ | ❌ **未保存** | 无专用列 | ⚠️ 需要附件逻辑 |
| 14 | 状态 | 승인상태 | — | — | — | `"pending"` 自动 | `approval_status` | — 系统字段 |
| 15 | 注册时间 | 가입일시 | — | — | — | `datetime` 自动 | `created_at` | — 系统字段 |
| 16 | 密码 | 비밀번호 | `password` ✅ | `password` ✅ | `password` ✅ | ✅ (→hash) | `password_hash` ✅ | ✅ 完整 |

---

## 二、负责人信息（담당자）

| # | 中文名 | 韩文 | 注册表单 | auth.service | Schema | register_member() | DB 列 | 状态 |
|---|--------|------|----------|-------------|--------|-------------------|-------|------|
| 17 | 负责人姓名 | 담당자 성명 | `contactPersonName` ✅ | `contact_person` ✅ | `contact_person` ✅ | `contact_person_name` ✅ | `contact_person_name` ✅ | ✅ 完整 |
| 18 | 负责人部门 | 담당자 부서 | `contactPersonDepartment` ✅ | `contact_person_department` ✅ | `contact_person_department` ✅ | ✅ | `contact_person_department` ✅ | ✅ 完整 |
| 19 | 负责人职位 | 담당자 직급 | `contactPersonPosition` ✅ | `contact_person_position` ✅ | `contact_person_position` ✅ | ✅ | `contact_person_position` ✅ | ✅ 完整 |
| 20 | 负责人电话 | 담당자 전화번호 | `contactPersonPhone` ✅ | `contact_person_phone` ✅ | `contact_person_phone` ✅ | ✅ | `contact_person_phone` ✅ | ✅ 完整 |

---

## 三、地址信息

| # | 中文名 | 韩文 | 注册表单 | auth.service | Schema | register_member() | DB 列 | 状态 |
|---|--------|------|----------|-------------|--------|-------------------|-------|------|
| 21 | 地址 | 주소 | `address` ✅ | `address` ✅ | `address` ✅ | ✅ | `address` ✅ | ✅ 完整 |
| 22 | 详细地址 | 상세주소 | `addressDetail` ✅ | ❌ **未映射** | ❌ 无 | ❌ | ❌ 无 | ⚠️ 前端有但未传递 |
| 23 | 所在地 | 지역 | `region` ✅ | `region` ✅ | `region` ✅ | ✅ | `region` ✅ | ✅ 完整 |

---

## 四、业务分类信息

| # | 中文名 | 韩文 | 注册表单 | auth.service | Schema | register_member() | DB 列 | 状态 |
|---|--------|------|----------|-------------|--------|-------------------|-------|------|
| 24 | 企业类别 | 기업유형 | `category` ✅ | `company_type` + `category` | `company_type` + `category` | `category` ✅ | `category` ✅ | ✅ 完整 |
| 25 | 创业类型 | 창업유형 | `startupType` ✅ | `startup_type` ✅ | `startup_type` ✅ | ✅ | `startup_type` ✅ | ✅ 完整 |
| 26 | 创业区分 | 창업구분 | `startupStage` ✅ | `startup_stage` ✅ | `startup_stage` ✅ | ✅ | `startup_stage` ✅ | ✅ 完整 |
| 27 | KSIC [大类] | 한국표준산업분류[대] | `ksicMajor` ✅ | `ksic_major` ✅ | `ksic_major` ✅ | ✅ | `ksic_major` ✅ | ✅ 完整 |
| 28 | KSIC [中类] | 한국표준산업분류[중] | `ksicSub` ✅ | `ksic_sub` ✅ | `ksic_sub` ✅ | ✅ | `ksic_sub` ✅ | ✅ 完整 |
| 29 | 地区主力産業代碼 | 지역주력산업코드 | `businessFieldCode` ✅ | `business_field` ✅ | `business_field` ✅ | ✅ | `business_field` ✅ | ✅ 完整 |
| 30 | 主力产业KSIC[大类] | 주력산업 KSIC[대] | `mainIndustryKsicMajor` ✅ | ❌ **未映射** | ❌ **缺失** | ❌ **未保存** | `main_industry_ksic_major` ✅ | 🔴 **Bug** |
| 31 | 主力产业KSIC[中类] | 주력산업 KSIC[세부] | `mainIndustryKsicCodes` ✅ | ❌ **未映射** | ❌ **缺失** | ❌ **未保存** | `main_industry_ksic_codes` ✅ | 🔴 **Bug** |
| 32 | 江原道7大未来产业 | 강원도 7대 미래산업 | `gangwonIndustry` ✅ | ❌ **未映射** | ❌ **缺失** | ❌ **未保存** | `gangwon_industry` ✅ | 🔴 **Bug** |
| 33 | 未来新技术 | 미래유망 신기술 | `futureTech` ✅ | ❌ **未映射** | ❌ **缺失** | ❌ **未保存** | `future_tech` ✅ | 🔴 **Bug** |

---

## 五、经营信息

| # | 中文名 | 韩文 | 注册表单 | auth.service | Schema | register_member() | DB 列 | 状态 |
|---|--------|------|----------|-------------|--------|-------------------|-------|------|
| 34 | 销售额 | 매출액 | `sales` ✅ | `revenue` ✅ | `revenue` ✅ | ✅ | `revenue` ✅ | ✅ 完整 |
| 35 | 员工人数 | 직원수 | `employeeCount` ✅ | `employee_count` ✅ | `employee_count` ✅ | ✅ | `employee_count` ✅ | ✅ 完整 |
| 36 | 主要业务 | 주요사업 | `mainBusiness` ✅ | `main_business` ✅ | `main_business` ✅ | ❌ **未保存** | `main_business` ✅ | 🔴 **Bug** |
| 37 | 企业介绍 | 기업소개 | 🔒 无 | 🔒 无 | 🔒 无 | 🔒 无 | `description` ✅ | 🔒 Profile 编辑 |
| 38 | 行业领域 | 업종 | — | `industry` ✅ | `industry` ✅ | ✅ | `industry` ✅ | ✅ 完整 |

---

## 六、附加信息

| # | 中文名 | 韩文 | 注册表单 | auth.service | Schema | register_member() | DB 列 | 状态 |
|---|--------|------|----------|-------------|--------|-------------------|-------|------|
| 39 | 合作意向领域 | 산업협력 희망분야 | `cooperationFields` ✅ | ❌ **未映射** | ❌ **缺失** | ❌ **未保存** | `cooperation_fields` ✅ | 🔴 **Bug** |
| 40 | 参与项目 | 참여 프로그램 | 🔒 无 | 🔒 无 | 🔒 无 | 🔒 无 | `participation_programs` ✅ | 🔒 Profile 编辑 |
| 41 | 投资状况 | 투자유치 현황 | 🔒 无 | 🔒 无 | 🔒 无 | 🔒 无 | `investment_status` ✅ | 🔒 Profile 编辑 |

---

## 七、约款

| # | 中文名 | 韩文 | 注册表单 | auth.service | Schema | register_member() | DB 列 | 状态 |
|---|--------|------|----------|-------------|--------|-------------------|-------|------|
| 42 | 利用约款同意 | 이용약관 | `termsOfService` ✅ | `terms_agreed` ✅ | `terms_agreed` ✅ | ❌ **未保存** | ❌ 无列 | ⚠️ 无持久化 |

---

## 问题汇总

### 🔴 数据丢失 Bug（注册时用户填写了但未保存到数据库）

| # | 字段 | 问题描述 | 修复方案 |
|---|------|----------|----------|
| **B1** | `corporate_number` → `legal_number` | Schema 有字段、表单有输入，但 `register_member()` 未保存 | service.py 添加 `"legal_number": data.corporate_number` |
| **B2** | `main_business` | Schema 有、表单有、service 映射有，但 `register_member()` 漏存 | service.py 添加 `"main_business": data.main_business` |
| **B3** | `main_industry_ksic_major` | 表单有输入，auth.service 未映射、Schema 无、service 未保存 | 3 层全加 |
| **B4** | `main_industry_ksic_codes` | 同 B3 | 3 层全加 |
| **B5** | `gangwon_industry` | 同 B3 | 3 层全加 |
| **B6** | `future_tech` | 同 B3 | 3 层全加 |
| **B7** | `cooperation_fields` | 表单有输入，auth.service 未映射、Schema 无、service 未保存 | 3 层全加 |

### ⚠️ 次要问题

| # | 字段 | 问题描述 | 建议 |
|---|------|----------|------|
| **W1** | `addressDetail` | 前端表单有此输入框，但全链路无此字段 | 建议合并到 `address` 字段中传递 |
| **W2** | `logo_file_id` / `certificate_file_id` | Schema 有、service 映射有，但 `register_member()` 未将 file_id 存入 DB | 需要文件上传转 URL 的逻辑 |
| **W3** | `terms_agreed` | Schema 有、前端传递了，但 DB 无列、service 未保存 | 建议加 DB 列或接受当前行为 |

### 🔒 仅 Profile 编辑（注册时无需，合理缺失）

- `representative_birth_date` — 代表人出生日期
- `representative_gender` — 代表人性别
- `description` — 企业介绍
- `participation_programs` — 参与项目
- `investment_status` — 投资状况

---

## 修复文件清单

| 文件 | 修改内容 |
|------|----------|
| `frontend/src/member/modules/auth/services/auth.service.js` | 添加 5 个缺失字段映射: `main_industry_ksic_major`, `main_industry_ksic_codes`, `gangwon_industry`, `future_tech`, `cooperation_fields` |
| `backend/src/modules/user/schemas.py` | `MemberRegisterRequest` 添加 5 个缺失字段 |
| `backend/src/modules/user/service.py` | `register_member()` 添加 7 个缺失字段保存: `legal_number`, `main_business`, `main_industry_ksic_major`, `main_industry_ksic_codes`, `gangwon_industry`, `future_tech`, `cooperation_fields` |
