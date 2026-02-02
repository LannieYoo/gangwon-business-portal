# 统计报表筛选器与表格列对齐

## 更新原则

1. **顺序一致**：表格列的顺序完全遵循筛选器的组织顺序
2. **范围一致**：只显示筛选器中存在的维度，移除筛选器中不存在的列
3. **分组清晰**：按照筛选器的分组结构组织表格列

## 筛选器组织结构

### 1. 快速筛选组 (Quick Filters)
- ❌ 时间 (year, quarter, month) - 不显示在表格
- ✅ 政府项目 (policyTags)
- ❌ 关键词搜索 (searchQuery) - 不显示在表格

### 2. 企业特征组 (Company Profile)
- ✅ 标准产业大分类 (majorIndustryCodes) → ksicMajor
- ✅ 标准产业中分类 (subIndustryCodes) → ksicSub
- ✅ 江原主导产业大分类 (gangwonIndustryCodes) → gangwonIndustry
- ✅ 江原主导产业中分类 (gangwonIndustrySubCodes) → gangwonIndustrySub
- ✅ 江原7大未来产业 (gangwonFutureIndustries) → gangwonFutureIndustry
- ✅ 未来有望新技术 (futureTechnologies) → futureTech
- ✅ 企业工龄 (minWorkYears, maxWorkYears) → workYears
- ✅ 创业阶段 (startupStages) → startupStage
- ✅ 所在地 (location) → region

### 3. 经营指标组 (Business Metrics)
- ✅ 投资 (hasInvestment, min/max) → totalInvestment
- ✅ 年营收 (min/max) → annualRevenue
- ✅ 员工数 (min/max) → employeeCount
- ✅ 专利 (min/max) → patentCount
- ✅ 出口额 → exportAmount (虽然筛选器中没有，但作为经营指标保留)

### 4. 代表者信息组 (Representative)
- ✅ 性别 (gender) → representativeGender
- ✅ 年龄 (min/max) → representativeAge

## 表格列最终顺序

```javascript
[
  // 基本信息
  "businessRegNo",        // 企业注册号
  "enterpriseName",       // 企业名
  
  // 快速筛选组
  "policyTags",          // 政府项目
  
  // 企业特征组
  "ksicMajor",           // 标准产业(大分类)
  "ksicSub",             // 标准产业(中分类)
  "gangwonIndustry",     // 江原主导产业(大分类)
  "gangwonIndustrySub",  // 江原主导产业(中分类)
  "gangwonFutureIndustry", // 江原7大未来产业
  "futureTech",          // 未来有望新技术
  "workYears",           // 企业工龄
  "startupStage",        // 创业阶段
  "region",              // 所在地
  
  // 经营指标组
  "totalInvestment",     // 投资额
  "annualRevenue",       // 年营收
  "exportAmount",        // 出口额
  "employeeCount",       // 员工数
  "patentCount",         // 专利数
  
  // 代表者信息组
  "representativeGender", // 代表者性别
  "representativeAge",    // 代表者年龄
]
```

## 移除的列

以下列在筛选器中不存在，已从表格中移除：

1. ❌ **startupType** (创业类型) - 筛选器中没有此维度
2. ❌ **businessField** (业务领域) - 筛选器中没有此维度
3. ❌ **cooperationField** (合作领域) - 筛选器中有 CooperationFilters，但未在表格中显示

## 数据库字段映射

| 表格字段 | 后端字段 | 数据库字段 | 来源表 |
|---------|---------|-----------|--------|
| businessRegNo | business_reg_no | business_number | members |
| enterpriseName | enterprise_name | company_name | members |
| policyTags | policy_tags | participation_programs | members |
| ksicMajor | ksic_major | ksic_major | members |
| ksicSub | ksic_sub | ksic_sub | members |
| gangwonIndustry | gangwon_industry | main_industry_ksic_major | members |
| gangwonIndustrySub | gangwon_industry_sub | main_industry_ksic_codes | members |
| gangwonFutureIndustry | gangwon_future_industry | gangwon_industry | members |
| futureTech | future_tech | future_tech | members |
| workYears | work_years | 计算自 founding_date | members |
| startupStage | startup_stage | startup_stage | members |
| region | region | region | members |
| totalInvestment | total_investment | 聚合自 performance_records | performance_records |
| annualRevenue | annual_revenue | revenue | members |
| exportAmount | export_amount | 聚合自 performance_records | performance_records |
| employeeCount | employee_count | employee_count | members |
| patentCount | patent_count | 聚合自 performance_records | performance_records |
| representativeGender | representative_gender | representative_gender | members |
| representativeAge | representative_age | 计算自 representative_birth_date | members |

## 翻译键

### 韩语 (ko.json)
```json
{
  "table": {
    "businessRegNo": "사업자 등록번호",
    "enterpriseName": "기업명",
    "programs": "정부사업",
    "ksicMajor": "표준산업(대분류)",
    "ksicSub": "표준산업(중분류)",
    "gangwonIndustry": "강원주도산업(대분류)",
    "gangwonIndustrySub": "강원주도산업(중분류)",
    "gangwonFutureIndustry": "강원7대미래산업",
    "futureTech": "미래유망신기술",
    "workYears": "업력(년)",
    "startupStage": "창업단계",
    "region": "소재지",
    "investmentAmount": "투자유치(원)",
    "revenue": "매출액(원)",
    "exportAmount": "수출(원)",
    "employeeCount": "직원수(명)",
    "patentCount": "특허(개)",
    "representativeGender": "대표자 성별",
    "representativeAge": "대표자 나이"
  }
}
```

### 中文 (zh.json)
```json
{
  "table": {
    "businessRegNo": "企业注册号",
    "enterpriseName": "公司名",
    "programs": "政府项目",
    "ksicMajor": "标准产业(大类)",
    "ksicSub": "标准产业(中类)",
    "gangwonIndustry": "江原主导产业(大类)",
    "gangwonIndustrySub": "江原主导产业(中类)",
    "gangwonFutureIndustry": "江原7大未来产业",
    "futureTech": "未来有望新技术",
    "workYears": "成立年限(年)",
    "startupStage": "创业阶段",
    "region": "所在地",
    "investmentAmount": "融资额(元)",
    "revenue": "销售额(元)",
    "exportAmount": "出口额(元)",
    "employeeCount": "员工数(人)",
    "patentCount": "专利(个)",
    "representativeGender": "代表人性别",
    "representativeAge": "代表人年龄"
  }
}
```

## 修改文件清单

### 前端
1. ✅ `frontend/src/admin/modules/statistics/enum.js`
   - 重新组织 TABLE_COLUMNS 和 TABLE_COLUMN_CONFIGS
   - 按筛选器顺序排列
   - 移除不存在的列

2. ✅ `frontend/src/admin/modules/statistics/locales/ko.json`
   - 更新表格列翻译
   - 移除不需要的翻译键

3. ✅ `frontend/src/admin/modules/statistics/locales/zh.json`
   - 更新表格列翻译
   - 移除不需要的翻译键

### 后端
1. ✅ `backend/src/modules/statistics/schemas.py`
   - 更新 StatisticsItem 模型
   - 按筛选器分组组织字段
   - 添加注释说明分组

2. ✅ `backend/src/modules/statistics/service.py`
   - 更新数据填充逻辑
   - 按筛选器分组组织数据
   - 添加 gangwon_industry_sub 字段

## 验证清单

- [ ] 表格列顺序与筛选器完全一致
- [ ] 所有表格列都有对应的筛选器维度
- [ ] 后端返回所有必需字段
- [ ] 翻译文件包含所有列的翻译
- [ ] 数据库字段映射正确
- [ ] 列宽设置合理
- [ ] 对齐方式正确（文本居中，数字右对齐）

## 注意事项

1. **exportAmount** 虽然筛选器中没有对应的筛选条件，但作为重要的经营指标保留在表格中
2. **江原主导产业中分类** 新增字段，对应筛选器中的 gangwonIndustrySubCodes
3. **列宽优化**：产业分类相关列设置为 150px，以容纳较长的分类名称
4. **分组注释**：代码中添加了清晰的分组注释，便于维护

## 后续优化建议

1. **列可见性控制**：实现用户自定义显示/隐藏列的功能
2. **列固定**：固定企业名称列，方便横向滚动
3. **响应式优化**：在小屏幕上优化列的显示
4. **导出功能**：确保导出时包含所有列
5. **排序功能**：支持按任意列排序
