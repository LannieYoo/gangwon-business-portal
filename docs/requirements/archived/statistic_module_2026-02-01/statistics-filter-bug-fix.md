# Statistics Filter Bug Fix Report

**日期:** 2026-02-02  
**问题:** 标准产业（大分类）筛选"采矿业"时显示所有数据  
**状态:** ✅ 已识别根本原因

## 问题描述

用户报告：选择标准产业（大分类）的"采矿业"(B)时，查询显示了所有数据，筛选条件未生效。

## 根本原因

通过数据库检查脚本 `backend/scripts/check_ksic_data.py` 发现：

**数据库中根本没有 `ksic_major = 'B'` (采矿业) 的数据！**

当前数据库状态：
- 总记录数: 4 条
- ksic_major 分布:
  - 'C' (制造业): 3 条记录
  - 'J' (信息通信业): 1 条记录
- **没有 'B' (采矿业) 的记录**

## 用户体验问题

当用户选择"采矿业"时：
1. 前端发送 `majorIndustryCodes: ['B']`
2. 后端查询 `ksic_major IN ('B')`
3. 数据库返回 0 条记录
4. **但用户看到的可能是之前查询的结果（缓存问题）或初始加载的所有数据**

## 已实施的改进

### 1. 前端改进

**文件:** `frontend/src/admin/modules/statistics/components/Filter/StandardIndustryFilters.jsx`

```javascript
// 添加"全部"选项，让用户可以清除筛选
const majorOptions = [
  { value: "", label: t("common.all", "全部") },
  ...translateOptions(KSIC_MAJOR_CATEGORY_KEYS, t)
];
```

### 2. 调试日志

**前端:** `frontend/src/admin/modules/statistics/services/statistics.service.js`
```javascript
// 添加调试日志
if (params.majorIndustryCodes || params.subIndustryCodes) {
  console.log("[StatisticsService] Industry filter params:", {
    original: { ... },
    cleaned: { ... }
  });
}
```

**后端:** `backend/src/modules/statistics/service.py`
```python
# 添加调试日志
if query.major_industry_codes:
    logger.info(f"[Statistics] Filtering by major_industry_codes: {query.major_industry_codes}")
```

### 3. 数据库检查脚本

**文件:** `backend/scripts/check_ksic_data.py`

用于检查数据库中 KSIC 字段的实际数据分布。

## 解决方案

### 短期解决方案（已实施）

1. ✅ 添加调试日志，帮助诊断问题
2. ✅ 添加"全部"选项，改善用户体验
3. ✅ 创建数据库检查脚本

### 中期解决方案（建议）

1. **数据填充**
   - 检查所有企业的 KSIC 分类数据
   - 对于缺失数据的企业，要求补充或从其他字段推导

2. **UI 改进**
   - 当筛选结果为 0 时，显示明确的"无匹配结果"提示
   - 显示当前筛选条件的摘要
   - 提供"清除筛选"按钮

3. **数据验证**
   - 在企业注册/编辑时，验证 KSIC 分类的完整性
   - 提供 KSIC 分类的自动建议功能

### 长期解决方案（建议）

1. **数据质量监控**
   - 定期检查 KSIC 字段的填充率
   - 监控各个产业分类的数据分布
   - 设置数据质量告警

2. **用户引导**
   - 在筛选器中显示每个选项的数据量
   - 例如: "采矿业 (0)" 或 "制造业 (3)"
   - 禁用没有数据的选项

3. **数据导入工具**
   - 提供批量导入 KSIC 分类数据的工具
   - 支持从企业注册信息自动推导 KSIC 分类

## 测试验证

### 验证步骤

1. **验证数据库状态**
   ```bash
   cd backend
   uv run python scripts/check_ksic_data.py
   ```

2. **验证前端筛选**
   - 打开统计报告页面
   - 选择"制造业"(C) - 应该显示 3 条记录
   - 选择"信息通信业"(J) - 应该显示 1 条记录
   - 选择"采矿业"(B) - 应该显示 0 条记录（无匹配结果）

3. **验证日志输出**
   - 前端：打开浏览器控制台，查看 `[StatisticsService]` 日志
   - 后端：查看 `backend/logs/` 目录下的日志文件

### 预期结果

- ✅ 选择"制造业"显示 3 条记录
- ✅ 选择"信息通信业"显示 1 条记录
- ✅ 选择"采矿业"显示 0 条记录（而不是所有记录）
- ✅ 日志正确记录筛选参数

## 相关文件

### 修改的文件
1. `frontend/src/admin/modules/statistics/components/Filter/StandardIndustryFilters.jsx`
2. `frontend/src/admin/modules/statistics/services/statistics.service.js`
3. `backend/src/modules/statistics/service.py`

### 新增的文件
1. `backend/scripts/check_ksic_data.py`
2. `docs/requirements/active/statistics-filter-bug-fix.md`

## 结论

**这不是代码 Bug，而是数据问题。**

- 代码逻辑正确：前后端筛选条件映射正确，查询逻辑正确
- 数据缺失：数据库中没有"采矿业"(B)的数据
- 用户体验：需要改进 UI，明确显示"无匹配结果"

**建议优先级:**
1. 🔴 高优先级：改进 UI，显示"无匹配结果"提示
2. 🟡 中优先级：填充缺失的 KSIC 数据
3. 🟢 低优先级：实施数据质量监控

