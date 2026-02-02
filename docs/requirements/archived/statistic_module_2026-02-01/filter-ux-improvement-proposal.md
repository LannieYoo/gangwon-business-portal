# 筛选条件 UX 改进建议

**日期**: 2026-02-01  
**提出人**: 用户反馈  
**优先级**: P1 (高优先级 - 用户体验改进)

---

## 问题描述

当前统计报告模块的筛选条件中，以下字段使用的是**自由输入数字**的方式：

1. **年营收** (Annual Revenue) - Min/Max 输入框
2. **员工人数** (Employee Count) - Min/Max 输入框  
3. **年龄段** (Age Range) - Min/Max 输入框

### 当前实现的问题

❌ **用户体验不佳**:
- 用户需要自己输入具体数字，不知道合理的范围
- 容易输入错误或不合理的值
- 没有提供常用的区间选项

❌ **数据分析不便**:
- 不同管理员可能使用不同的区间划分
- 难以进行标准化的统计分析
- 无法快速选择常用的筛选条件

❌ **与其他筛选不一致**:
- 投资金额筛选提供了预设区间（1000万以上、5000万以上等）
- 专利数量筛选提供了预设区间（1个以上、3个以上等）
- 但年营收、员工数、年龄段却没有预设区间

---

## 改进建议

### 方案：使用预设区间 + 自定义选项

为年营收、员工人数、年龄段提供**预设区间下拉选择**，同时保留**自定义区间**选项。

---

## 详细设计

### 1. 年营收区间 (Annual Revenue Range)

#### 预设区间选项

根据韩国中小企业标准和实际业务需求，建议以下区间：

| 选项 | 区间范围 | 说明 |
|------|---------|------|
| 全部 | 无限制 | 不筛选 |
| 1亿以下 | < 100,000,000 | 微型企业 |
| 1亿 - 5亿 | 100,000,000 - 500,000,000 | 小型企业 |
| 5亿 - 10亿 | 500,000,000 - 1,000,000,000 | 中小型企业 |
| 10亿 - 50亿 | 1,000,000,000 - 5,000,000,000 | 中型企业 |
| 50亿 - 100亿 | 5,000,000,000 - 10,000,000,000 | 大型企业 |
| 100亿以上 | > 10,000,000,000 | 超大型企业 |
| 自定义区间 | 用户输入 | 灵活筛选 |

**单位**: 韩元 (₩)

#### UI 设计

```jsx
<Select
  label="年营收"
  value={revenueRange}
  options={[
    { value: "all", label: "全部" },
    { value: "under_100m", label: "1亿以下" },
    { value: "100m_500m", label: "1亿 - 5亿" },
    { value: "500m_1b", label: "5亿 - 10亿" },
    { value: "1b_5b", label: "10亿 - 50亿" },
    { value: "5b_10b", label: "50亿 - 100亿" },
    { value: "over_10b", label: "100亿以上" },
    { value: "custom", label: "自定义区间" }
  ]}
  onChange={handleRevenueRangeChange}
/>

{revenueRange === 'custom' && (
  <div className="flex items-center gap-2 mt-2">
    <Input type="number" placeholder="最小值" />
    <span>~</span>
    <Input type="number" placeholder="最大值" />
    <span className="text-xs text-gray-400">万元</span>
  </div>
)}
```

---

### 2. 员工人数区间 (Employee Count Range)

#### 预设区间选项

根据企业规模标准，建议以下区间：

| 选项 | 区间范围 | 说明 |
|------|---------|------|
| 全部 | 无限制 | 不筛选 |
| 5人以下 | < 5 | 微型企业 |
| 5 - 10人 | 5 - 10 | 小微企业 |
| 10 - 30人 | 10 - 30 | 小型企业 |
| 30 - 50人 | 30 - 50 | 中小型企业 |
| 50 - 100人 | 50 - 100 | 中型企业 |
| 100 - 300人 | 100 - 300 | 大型企业 |
| 300人以上 | > 300 | 超大型企业 |
| 自定义区间 | 用户输入 | 灵活筛选 |

#### UI 设计

```jsx
<Select
  label="员工人数"
  value={employeeRange}
  options={[
    { value: "all", label: "全部" },
    { value: "under_5", label: "5人以下" },
    { value: "5_10", label: "5 - 10人" },
    { value: "10_30", label: "10 - 30人" },
    { value: "30_50", label: "30 - 50人" },
    { value: "50_100", label: "50 - 100人" },
    { value: "100_300", label: "100 - 300人" },
    { value: "over_300", label: "300人以上" },
    { value: "custom", label: "自定义区间" }
  ]}
  onChange={handleEmployeeRangeChange}
/>

{employeeRange === 'custom' && (
  <div className="flex items-center gap-2 mt-2">
    <Input type="number" placeholder="最小值" />
    <span>~</span>
    <Input type="number" placeholder="最大值" />
    <span className="text-xs text-gray-400">人</span>
  </div>
)}
```

---

### 3. 年龄段区间 (Age Range)

#### 预设区间选项

根据创业者年龄分布，建议以下区间：

| 选项 | 区间范围 | 说明 |
|------|---------|------|
| 全部 | 无限制 | 不筛选 |
| 20岁以下 | < 20 | 青少年创业 |
| 20 - 29岁 | 20 - 29 | 青年创业 |
| 30 - 39岁 | 30 - 39 | 青壮年创业 |
| 40 - 49岁 | 40 - 49 | 中年创业 |
| 50 - 59岁 | 50 - 59 | 中老年创业 |
| 60岁以上 | > 60 | 老年创业 |
| 自定义区间 | 用户输入 | 灵活筛选 |

#### UI 设计

```jsx
<Select
  label="代表者年龄"
  value={ageRange}
  options={[
    { value: "all", label: "全部" },
    { value: "under_20", label: "20岁以下" },
    { value: "20_29", label: "20 - 29岁" },
    { value: "30_39", label: "30 - 39岁" },
    { value: "40_49", label: "40 - 49岁" },
    { value: "50_59", label: "50 - 59岁" },
    { value: "over_60", label: "60岁以上" },
    { value: "custom", label: "自定义区间" }
  ]}
  onChange={handleAgeRangeChange}
/>

{ageRange === 'custom' && (
  <div className="flex items-center gap-2 mt-2">
    <Input type="number" placeholder="最小年龄" />
    <span>~</span>
    <Input type="number" placeholder="最大年龄" />
    <span className="text-xs text-gray-400">岁</span>
  </div>
)}
```

---

## 实现方案

### 前端实现

#### 1. 更新枚举定义 (`enum.js`)

```javascript
// 年营收区间选项
export const REVENUE_RANGE_OPTIONS = [
  { value: "all", labelKey: "statistics.filters.quantitive.revenueRange.all" },
  { value: "under_100m", labelKey: "statistics.filters.quantitive.revenueRange.under100m", min: null, max: 100000000 },
  { value: "100m_500m", labelKey: "statistics.filters.quantitive.revenueRange.100m500m", min: 100000000, max: 500000000 },
  { value: "500m_1b", labelKey: "statistics.filters.quantitive.revenueRange.500m1b", min: 500000000, max: 1000000000 },
  { value: "1b_5b", labelKey: "statistics.filters.quantitive.revenueRange.1b5b", min: 1000000000, max: 5000000000 },
  { value: "5b_10b", labelKey: "statistics.filters.quantitive.revenueRange.5b10b", min: 5000000000, max: 10000000000 },
  { value: "over_10b", labelKey: "statistics.filters.quantitive.revenueRange.over10b", min: 10000000000, max: null },
  { value: "custom", labelKey: "statistics.filters.quantitive.revenueRange.custom" }
];

// 员工人数区间选项
export const EMPLOYEE_RANGE_OPTIONS = [
  { value: "all", labelKey: "statistics.filters.quantitive.employeeRange.all" },
  { value: "under_5", labelKey: "statistics.filters.quantitive.employeeRange.under5", min: null, max: 5 },
  { value: "5_10", labelKey: "statistics.filters.quantitive.employeeRange.5to10", min: 5, max: 10 },
  { value: "10_30", labelKey: "statistics.filters.quantitive.employeeRange.10to30", min: 10, max: 30 },
  { value: "30_50", labelKey: "statistics.filters.quantitive.employeeRange.30to50", min: 30, max: 50 },
  { value: "50_100", labelKey: "statistics.filters.quantitive.employeeRange.50to100", min: 50, max: 100 },
  { value: "100_300", labelKey: "statistics.filters.quantitive.employeeRange.100to300", min: 100, max: 300 },
  { value: "over_300", labelKey: "statistics.filters.quantitive.employeeRange.over300", min: 300, max: null },
  { value: "custom", labelKey: "statistics.filters.quantitive.employeeRange.custom" }
];

// 年龄段区间选项
export const AGE_RANGE_OPTIONS = [
  { value: "all", labelKey: "statistics.filters.representative.ageRange.all" },
  { value: "under_20", labelKey: "statistics.filters.representative.ageRange.under20", min: null, max: 20 },
  { value: "20_29", labelKey: "statistics.filters.representative.ageRange.20to29", min: 20, max: 29 },
  { value: "30_39", labelKey: "statistics.filters.representative.ageRange.30to39", min: 30, max: 39 },
  { value: "40_49", labelKey: "statistics.filters.representative.ageRange.40to49", min: 40, max: 49 },
  { value: "50_59", labelKey: "statistics.filters.representative.ageRange.50to59", min: 50, max: 59 },
  { value: "over_60", labelKey: "statistics.filters.representative.ageRange.over60", min: 60, max: null },
  { value: "custom", labelKey: "statistics.filters.representative.ageRange.custom" }
];
```

#### 2. 更新组件 (`QuantitiveFilters.jsx`)

```jsx
import { Select, Input } from "@shared/components";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { REVENUE_RANGE_OPTIONS, EMPLOYEE_RANGE_OPTIONS } from "../../enum";

export const QuantitiveFilters = ({
  revenueRange,
  minRevenue,
  maxRevenue,
  employeeRange,
  minEmployees,
  maxEmployees,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleRevenueRangeChange = (value) => {
    const option = REVENUE_RANGE_OPTIONS.find(opt => opt.value === value);
    
    if (value === 'all') {
      onChange('revenueRange', 'all');
      onChange('minRevenue', null);
      onChange('maxRevenue', null);
    } else if (value === 'custom') {
      onChange('revenueRange', 'custom');
    } else if (option) {
      onChange('revenueRange', value);
      onChange('minRevenue', option.min);
      onChange('maxRevenue', option.max);
    }
  };

  const handleEmployeeRangeChange = (value) => {
    const option = EMPLOYEE_RANGE_OPTIONS.find(opt => opt.value === value);
    
    if (value === 'all') {
      onChange('employeeRange', 'all');
      onChange('minEmployees', null);
      onChange('maxEmployees', null);
    } else if (value === 'custom') {
      onChange('employeeRange', 'custom');
    } else if (option) {
      onChange('employeeRange', value);
      onChange('minEmployees', option.min);
      onChange('maxEmployees', option.max);
    }
  };

  return (
    <div className="space-y-4">
      {/* 年营收 */}
      <div>
        <Select
          label={t("statistics.filters.quantitive.revenue")}
          value={revenueRange || 'all'}
          options={REVENUE_RANGE_OPTIONS.map(opt => ({
            value: opt.value,
            label: t(opt.labelKey)
          }))}
          onChange={(e) => handleRevenueRangeChange(e.target.value)}
          className="w-48"
        />
        
        {revenueRange === 'custom' && (
          <div className="flex items-center gap-2 mt-2 ml-4">
            <Input
              type="number"
              placeholder="最小值"
              value={minRevenue || ""}
              onChange={(e) => onChange('minRevenue', e.target.value ? parseInt(e.target.value) : null)}
              className="w-32"
            />
            <span>~</span>
            <Input
              type="number"
              placeholder="最大值"
              value={maxRevenue || ""}
              onChange={(e) => onChange('maxRevenue', e.target.value ? parseInt(e.target.value) : null)}
              className="w-32"
            />
            <span className="text-xs text-gray-400">韩元</span>
          </div>
        )}
      </div>

      {/* 员工人数 */}
      <div>
        <Select
          label={t("statistics.filters.quantitive.employees")}
          value={employeeRange || 'all'}
          options={EMPLOYEE_RANGE_OPTIONS.map(opt => ({
            value: opt.value,
            label: t(opt.labelKey)
          }))}
          onChange={(e) => handleEmployeeRangeChange(e.target.value)}
          className="w-48"
        />
        
        {employeeRange === 'custom' && (
          <div className="flex items-center gap-2 mt-2 ml-4">
            <Input
              type="number"
              placeholder="最小值"
              value={minEmployees || ""}
              onChange={(e) => onChange('minEmployees', e.target.value ? parseInt(e.target.value) : null)}
              className="w-32"
            />
            <span>~</span>
            <Input
              type="number"
              placeholder="最大值"
              value={maxEmployees || ""}
              onChange={(e) => onChange('maxEmployees', e.target.value ? parseInt(e.target.value) : null)}
              className="w-32"
            />
            <span className="text-xs text-gray-400">人</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### 3. 更新国际化文件

**中文 (`zh.json`)**:
```json
{
  "statistics": {
    "filters": {
      "quantitive": {
        "revenueRange": {
          "all": "全部",
          "under100m": "1亿以下",
          "100m500m": "1亿 - 5亿",
          "500m1b": "5亿 - 10亿",
          "1b5b": "10亿 - 50亿",
          "5b10b": "50亿 - 100亿",
          "over10b": "100亿以上",
          "custom": "自定义区间"
        },
        "employeeRange": {
          "all": "全部",
          "under5": "5人以下",
          "5to10": "5 - 10人",
          "10to30": "10 - 30人",
          "30to50": "30 - 50人",
          "50to100": "50 - 100人",
          "100to300": "100 - 300人",
          "over300": "300人以上",
          "custom": "自定义区间"
        }
      },
      "representative": {
        "ageRange": {
          "all": "全部",
          "under20": "20岁以下",
          "20to29": "20 - 29岁",
          "30to39": "30 - 39岁",
          "40to49": "40 - 49岁",
          "50to59": "50 - 59岁",
          "over60": "60岁以上",
          "custom": "自定义区间"
        }
      }
    }
  }
}
```

**韩文 (`ko.json`)**:
```json
{
  "statistics": {
    "filters": {
      "quantitive": {
        "revenueRange": {
          "all": "전체",
          "under100m": "1억 이하",
          "100m500m": "1억 - 5억",
          "500m1b": "5억 - 10억",
          "1b5b": "10억 - 50억",
          "5b10b": "50억 - 100억",
          "over10b": "100억 이상",
          "custom": "사용자 정의"
        },
        "employeeRange": {
          "all": "전체",
          "under5": "5명 이하",
          "5to10": "5 - 10명",
          "10to30": "10 - 30명",
          "30to50": "30 - 50명",
          "50to100": "50 - 100명",
          "100to300": "100 - 300명",
          "over300": "300명 이상",
          "custom": "사용자 정의"
        }
      },
      "representative": {
        "ageRange": {
          "all": "전체",
          "under20": "20세 이하",
          "20to29": "20 - 29세",
          "30to39": "30 - 39세",
          "40to49": "40 - 49세",
          "50to59": "50 - 59세",
          "over60": "60세 이상",
          "custom": "사용자 정의"
        }
      }
    }
  }
}
```

---

## 优势分析

### ✅ 用户体验改进

1. **更直观**: 用户可以快速选择常用的区间，无需思考具体数字
2. **更快捷**: 一次点击即可完成筛选，无需输入两个数字
3. **更准确**: 减少输入错误的可能性
4. **更标准**: 统一的区间划分便于数据分析和对比

### ✅ 数据分析改进

1. **标准化**: 所有管理员使用相同的区间标准
2. **可比性**: 不同时间段的统计结果可以直接对比
3. **报表友好**: 导出的数据可以按标准区间分组

### ✅ 灵活性保留

1. **自定义选项**: 保留自定义区间功能，满足特殊需求
2. **向后兼容**: API 仍然接收 min/max 参数，无需修改后端

---

## 实施计划

### Phase 1: 前端实现 (2小时)
1. 更新 `enum.js` 添加区间选项
2. 重构 `QuantitiveFilters.jsx` 组件
3. 重构 `DemographicFilters.jsx` 组件
4. 更新国际化文件

### Phase 2: 测试验证 (1小时)
1. 测试预设区间选择
2. 测试自定义区间输入
3. 测试区间切换逻辑
4. 测试国际化显示

### Phase 3: 文档更新 (0.5小时)
1. 更新 PRD 文档
2. 更新用户手册
3. 更新测试用例

---

## 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 区间划分不合理 | 中 | 低 | 基于实际数据分布调整 |
| 用户习惯改变 | 低 | 中 | 保留自定义选项 |
| 国际化遗漏 | 低 | 低 | 完整的翻译检查 |

---

## 总结

这个改进建议将显著提升统计报告模块的用户体验，使筛选操作更加直观、快捷和标准化。同时保留了自定义区间的灵活性，满足特殊需求。

建议**优先实施**此改进，预计可以在 3-4 小时内完成开发和测试。

---

**提出人**: 用户反馈  
**审核状态**: 待评审  
**预计工时**: 3.5 小时  
**优先级**: P1 (高)

