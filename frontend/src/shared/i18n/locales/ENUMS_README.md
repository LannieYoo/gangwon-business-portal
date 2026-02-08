# 枚举翻译说明 (Enum Translations Reference)

本文档说明 `enums.json` 中各枚举与数据库字段的对应关系。

---

## 地区 (regions)

| 翻译键            | 数据库字段       | 说明       |
| ----------------- | ---------------- | ---------- |
| `enums.regions.*` | `members.region` | 企业所在地 |

---

## 产业分类 (industry)

### 韩国标准产业分类码 (KSIC)

| 翻译键                       | 数据库字段           | 说明                   |
| ---------------------------- | -------------------- | ---------------------- |
| `enums.industry.ksicMajor.*` | `members.ksic_major` | KSIC大分类 (A-U)       |
| `enums.industry.ksicSub.*`   | `members.ksic_sub`   | KSIC中分类 (2位数代码) |

### 江原道7大未来产业 (官方定义)

| 翻译键                             | 数据库字段                 | 说明              |
| ---------------------------------- | -------------------------- | ----------------- |
| `enums.industry.gangwonIndustry.*` | `members.gangwon_industry` | 江原道7大未来产业 |

**官方7大产业：**

- `semiconductor` - 반도체 / 半导体
- `bio_health` - 바이오헬스 / 生物健康
- `future_energy` - 미래에너지 / 未来能源
- `future_mobility` - 미래모빌리티 / 未来出行
- `food_tech` - 푸드테크 / 食品科技
- `advanced_defense` - 첨단방위 / 尖端防卫
- `climate_tech` - 기후테크 / 气候科技

### 未来有望新技术 (6大新技术)

| 翻译键                        | 数据库字段            | 说明           |
| ----------------------------- | --------------------- | -------------- |
| `enums.industry.futureTech.*` | `members.future_tech` | 未来有望新技术 |

**官方6大新技术:**

- `it` - IT (정보기술 / 信息技术)
- `bt` - BT (생명공학 / 生物技术)
- `nt` - NT (나노기술 / 纳米技术)
- `st` - ST (우주항공기술 / 航天技术)
- `et` - ET (환경기술 / 环境技术)
- `ct` - CT (문화기술 / 文化技术)

### 主力产业 KSIC

| 翻译键                                   | 数据库字段                         | 说明                        |
| ---------------------------------------- | ---------------------------------- | --------------------------- |
| `enums.industry.mainIndustryKsic.*`      | `members.main_industry_ksic_major` | 主力产业大分类              |
| `enums.industry.mainIndustryKsicCodes.*` | `members.main_industry_ksic_codes` | 主力产业详细代码 (JSON数组) |

### 事业领域

| 翻译键                           | 数据库字段               | 说明                      |
| -------------------------------- | ------------------------ | ------------------------- |
| `enums.industry.businessField.*` | `members.business_field` | 事业领域 (KSIC中分类代码) |

---

## 创业相关

| 翻译键                          | 数据库字段              | 说明     |
| ------------------------------- | ----------------------- | -------- |
| `enums.industry.startupType.*`  | `members.startup_type`  | 创业类型 |
| `enums.industry.startupStage.*` | `members.startup_stage` | 创业阶段 |

**创业类型 (startupType):**

- `student_startup` - 학생창업 / 学生创业
- `faculty_startup` - 교원창업 / 教员创业
- `women_enterprise` - 여성기업 / 女性企业
- `research_institute` - 연구소기업 / 研究所企业
- `venture_company` - 벤처기업 / 风险企业
- `non_venture` - 비벤처기업 / 非风险企业
- `preliminary_social_enterprise` - 예비사회적기업 / 预备社会企业
- `social_enterprise` - 사회적기업 / 社会企业
- `youth_enterprise` - 청년기업 / 青年企业
- `cooperative` - 협동조합 / 合作社
- `village_enterprise` - 마을기업 / 乡村企业
- `other` - 기타 / 其他

**创业阶段 (startupStage):**

- `preliminary` - 예비창업 / 预备创业
- `startup_under_3years` - 창업 3년 이내 / 创业3年内
- `growth_over_7years` - 성장기 (7년 이상) / 成长期(7年以上)
- `restart` - 재창업 / 再创业

---

## 参与项目

| 翻译键                          | 数据库字段                       | 说明                |
| ------------------------------- | -------------------------------- | ------------------- |
| `enums.participationPrograms.*` | `members.participation_programs` | 参与项目 (JSON数组) |

**项目列表:**

- `startup_university` - 창업중심대학 / 创业中心大学
- `global_glocal` - 글로벌·글로컬사업 / 全球·成长事业
- `rise` - RISE 사업단 / RISE 事业团
- `knu_tenant` - KNU 입주기업 / 江原大学入驻企业

---

## 知识产权

| 翻译键                        | 数据库字段                     | 说明         |
| ----------------------------- | ------------------------------ | ------------ |
| `enums.ip.type.*`             | `ip_records.type`              | 知识产权类型 |
| `enums.ip.registrationType.*` | `ip_records.registration_type` | 登记类型     |
| `enums.ip.overseasType.*`     | `ip_records.overseas_type`     | 海外申请类型 |

---

## 国家

| 翻译键            | 数据库字段 | 说明     |
| ----------------- | ---------- | -------- |
| `enums.country.*` | 各处       | 国家代码 |

---

## 通用字段 (industry)

`industry` 字段是一个通用字段，可能存储来自多个枚举的值。
`translateIndustry()` 函数会按以下优先级尝试翻译：

1. `mainIndustryKsic` - 主力产业
2. `gangwonIndustry` - 江原道7大未来产业
3. `futureTech` - 未来有望新技术
4. `ksicSub` - KSIC中分类

---

## 翻译函数使用

```javascript
import { useEnumTranslation } from "@shared/hooks";

const {
  translateRegion, // 地区
  translateStartupType, // 创业类型
  translateStartupStage, // 创业阶段
  translateKsicMajor, // KSIC大分类
  translateKsicSub, // KSIC中分类
  translateGangwonIndustry, // 江原道7大未来产业
  translateFutureTech, // 未来有望新技术
  translateMainIndustryKsic, // 主力产业
  translateMainIndustryKsicCodes, // 主力产业详细代码 (支持JSON数组)
  translateBusinessField, // 事业领域
  translateIndustry, // 通用产业翻译
  translateParticipationPrograms, // 参与项目 (支持JSON数组)
  translateGender, // 性别
} = useEnumTranslation();
```
