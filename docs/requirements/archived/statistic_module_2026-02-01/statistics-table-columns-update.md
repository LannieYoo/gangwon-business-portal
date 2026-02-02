# 统计报表表格列更新

## 更新目标

将统计报表的表格列完全匹配筛选器的所有维度，确保用户可以看到所有筛选条件对应的数据。

## 更新内容

### 1. 前端表格列配置 (frontend/src/admin/modules/statistics/enum.js)

#### 新增列：
1. **region** - 所在地
2. **ksicMajor** - 标准产业(大分类) - 替换原 industryType
3. **ksicSub** - 标准产业(中分类)
4. **gangwonIndustry** - 江原主导产业
5. **gangwonFutureIndustry** - 江原7大未来产业
6. **futureTech** - 未来有望新技术
7. **startupType** - 创业类型
8. **businessField** - 业务领域
9. **cooperationField** - 合作领域
10. **representativeGender** - 代表者性别
11. **representativeAge** - 代表者年龄

#### 保留列：
- businessRegNo - 企业注册号
- enterpriseName - 企业名
- startupStage - 创业阶段
- workYears - 成立年限
- annualRevenue - 年营收
- exportAmount - 出口额
- totalInvestment - 投资额
- patentCount - 专利数
- employeeCount - 员工数
- policyTags - 政府项目

### 2. 后端数据模型 (backend/src/modules/statistics/schemas.py)

更新 `StatisticsItem` 模型，添加所有新字段：

```python
class StatisticsItem(BaseModel):
    business_reg_no: str
    enterprise_name: str
    region: Optional[str] = None
    ksic_major: Optional[str] = None
    ksic_sub: Optional[str] = None
    gangwon_industry: Optional[str] = None
    gangwon_future_industry: Optional[str] = None
    future_tech: Optional[str] = None
    startup_type: Optional[str] = None
    business_field: Optional[str] = None
    cooperation_field: Optional[str] = None
    startup_stage: Optional[str] = None
    work_years: Optional[int] = None
    representative_gender: Optional[str] = None
    representative_age: Optional[int] = None
    policy_tags: List[str] = Field(default_factory=list)
    total_investment: float = 0.0
    patent_count: int = 0
    annual_revenue: float = 0.0
    export_amount: float = 0.0
    employee_count: int = 0
```

### 3. 后端服务 (backend/src/modules/statistics/service.py)

更新数据填充逻辑：

```python
items.append({
    "business_reg_no": row.get("business_number"),
    "enterprise_name": row.get("company_name"),
    "region": row.get("region"),
    "ksic_major": row.get("ksic_major"),
    "ksic_sub": row.get("ksic_sub"),
    "gangwon_industry": row.get("main_industry_ksic_major"),
    "gangwon_future_industry": row.get("gangwon_industry"),
    "future_tech": row.get("future_tech"),
    "startup_type": row.get("startup_type"),
    "business_field": row.get("business_field"),
    "cooperation_field": row.get("cooperation_fields"),
    "startup_stage": row.get("startup_stage"),
    "work_years": work_years,
    "representative_gender": row.get("representative_gender"),
    "representative_age": representative_age,
    "policy_tags": ensure_list(row.get("participation_programs")),
    "total_investment": perf_data["total_investment"],
    "patent_count": perf_data["patent_count"],
    "annual_revenue": annual_revenue,
    "export_amount": perf_data["export_amount"],
    "employee_count": ensure_int(row.get("employee_count")),
})
```

添加代表者年龄计算逻辑。

### 4. 翻译文件

#### 韩语 (ko.json)
```json
{
  "table": {
    "region": "소재지",
    "ksicMajor": "표준산업(대분류)",
    "ksicSub": "표준산업(중분류)",
    "gangwonIndustry": "강원주도산업",
    "gangwonFutureIndustry": "강원7대미래산업",
    "futureTech": "미래유망신기술",
    "startupType": "창업유형",
    "businessField": "사업분야",
    "cooperationField": "협력분야",
    "representativeGender": "대표자 성별",
    "representativeAge": "대표자 나이"
  }
}
```

#### 中文 (zh.json)
```json
{
  "table": {
    "region": "所在地",
    "ksicMajor": "标准产业(大类)",
    "ksicSub": "标准产业(中类)",
    "gangwonIndustry": "江原主导产业",
    "gangwonFutureIndustry": "江原7大未来产业",
    "futureTech": "未来有望新技术",
    "startupType": "创业类型",
    "businessField": "业务领域",
    "cooperationField": "合作领域",
    "representativeGender": "代表人性别",
    "representativeAge": "代表人年龄"
  }
}
```

## 筛选器与表格列对应关系

| 筛选器维度 | 表格列 | 字段名 |
|-----------|--------|--------|
| 时间维度 (year, quarter, month) | - | 不显示在表格中 |
| 标准产业大分类 (majorIndustryCodes) | 表准产业(大分类) | ksicMajor |
| 标准产业中分类 (subIndustryCodes) | 标准产业(中分类) | ksicSub |
| 江原道主导产业 (gangwonIndustryCodes) | 江原主导产业 | gangwonIndustry |
| 江原道7大未来产业 (gangwonFutureIndustries) | 江原7大未来产业 | gangwonFutureIndustry |
| 未来有望新技术 (futureTechnologies) | 未来有望新技术 | futureTech |
| 创业类型 (startupTypes) | 创业类型 | startupType |
| 业务领域 (businessFields) | 业务领域 | businessField |
| 合作领域 (cooperationFields) | 合作领域 | cooperationField |
| 政策关联 (policyTags) | 政府项目 | policyTags |
| 投资筛选 (hasInvestment, min/max) | 投资额 | totalInvestment |
| 专利筛选 (min/max) | 专利数 | patentCount |
| 代表者性别 (gender) | 代表者性别 | representativeGender |
| 代表者年龄 (min/max) | 代表者年龄 | representativeAge |
| 创业阶段 (startupStages) | 创业阶段 | startupStage |
| 企业工龄 (min/max) | 成立年限 | workYears |
| 年营收 (min/max) | 年营收 | annualRevenue |
| 员工数 (min/max) | 员工数 | employeeCount |
| 所在地 (region) | 所在地 | region |

## 数据来源映射

| 表格字段 | 数据库字段 | 来源表 |
|---------|-----------|--------|
| ksicMajor | ksic_major | members |
| ksicSub | ksic_sub | members |
| gangwonIndustry | main_industry_ksic_major | members |
| gangwonFutureIndustry | gangwon_industry | members |
| futureTech | future_tech | members |
| startupType | startup_type | members |
| businessField | business_field | members |
| cooperationField | cooperation_fields | members |
| representativeGender | representative_gender | members |
| representativeAge | 计算自 representative_birth_date | members |

## 注意事项

1. **表格列顺序**：按照逻辑分组排列（基本信息 → 产业分类 → 企业特征 → 经营数据）
2. **列宽设置**：根据内容长度合理设置，产业分类列较宽（150px）
3. **数据格式化**：
   - 金额字段右对齐
   - 分类字段居中对齐
   - 数值字段居中对齐
4. **空值处理**：所有可选字段都使用 `Optional` 类型
5. **性能考虑**：表格列较多，建议实现列显示/隐藏功能

## 后续优化建议

1. **列可见性控制**：允许用户选择显示/隐藏特定列
2. **列排序**：支持按任意列排序
3. **列固定**：固定企业名称列，方便横向滚动查看
4. **数据导出**：确保导出功能包含所有新增列
5. **响应式设计**：在小屏幕上优化显示
