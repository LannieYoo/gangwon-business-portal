/*
 * StatisticsReportView - 统计报告主视图
 */
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@shared/components";
import { useStatistics } from "../hooks/useStatistics";
import { useStatisticsFilters } from "../hooks/useStatisticsFilters";
import { useColumnVisibility } from "../hooks/useColumnVisibility";
import { FilterPanel } from "../components/Filter/FilterPanel";
import { FilterSummary } from "../components/Filter/FilterSummary";
import { ReportHeader } from "../components/Header/ReportHeader";
import { StatisticsTable } from "../components/Report/StatisticsTable";
import { ColumnVisibilityPanel } from "../components/Report/ColumnVisibilityPanel";
import { ReportError } from "../components/Report/ReportError";

export const StatisticsReportView = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState("success");

  // 1. 业务数据 Hooks
  const {
    data,
    params,
    loading,
    error,
    exporting,
    applyFilters,
    resetParams,
    changePage,
    changePageSize,
    changeSort,
    exportToExcel,
    totalItems,
    currentPage,
    totalPages,
  } = useStatistics();

  // 2. 筛选条件 UI Hooks
  const { filters, updateFilter, resetFilters, getFiltersSummary } =
    useStatisticsFilters();

  // 3. 列可见性控制 Hooks
  const columnVisibility = useColumnVisibility();

  // 获取筛选条件摘要（传入 t 函数）- 使用 useMemo 缓存
  const filtersSummary = useMemo(
    () => getFiltersSummary(t),
    [filters, t, getFiltersSummary],
  );

  // 4. 交互处理器 - 使用 useCallback 避免不必要的重新渲染
  const handleApply = useCallback(() => {
    applyFilters(filters);
  }, [applyFilters, filters]);

  const handleReset = useCallback(() => {
    resetFilters();
    resetParams();
  }, [resetFilters, resetParams]);

  const handleRemoveFilter = useCallback(
    (filterKey, value) => {
      switch (filterKey) {
        case "year":
          updateFilter("year", null);
          updateFilter("quarter", null);
          updateFilter("month", null);
          break;
        case "majorIndustryCodes":
          updateFilter(
            "majorIndustryCodes",
            filters.majorIndustryCodes.filter((c) => c !== value),
          );
          break;
        case "subIndustryCodes":
          updateFilter(
            "subIndustryCodes",
            filters.subIndustryCodes.filter((c) => c !== value),
          );
          break;
        case "gangwonIndustryCodes":
          updateFilter(
            "gangwonIndustryCodes",
            filters.gangwonIndustryCodes.filter((c) => c !== value),
          );
          break;
        case "gangwonIndustrySubCodes":
          updateFilter(
            "gangwonIndustrySubCodes",
            filters.gangwonIndustrySubCodes.filter((c) => c !== value),
          );
          break;
        case "gangwonFutureIndustries":
          // 单选：直接清空
          updateFilter("gangwonFutureIndustries", []);
          break;
        case "futureTechnologies":
          // 单选：直接清空
          updateFilter("futureTechnologies", []);
          break;
        case "startupStages":
          updateFilter(
            "startupStages",
            filters.startupStages.filter((s) => s !== value),
          );
          break;
        case "workYears":
          updateFilter("minWorkYears", null);
          updateFilter("maxWorkYears", null);
          break;
        case "region":
          updateFilter("region", null);
          break;
        case "policyTags":
          updateFilter(
            "policyTags",
            filters.policyTags.filter((t) => t !== value),
          );
          break;
        case "hasInvestment":
          updateFilter("hasInvestment", null);
          break;
        case "investmentAmount":
          updateFilter("minInvestment", null);
          updateFilter("maxInvestment", null);
          break;
        case "revenueRange":
          updateFilter("revenueRange", "all");
          updateFilter("minRevenue", null);
          updateFilter("maxRevenue", null);
          break;
        case "employeeRange":
          updateFilter("employeeRange", "all");
          updateFilter("minEmployees", null);
          updateFilter("maxEmployees", null);
          break;
        case "patents":
          updateFilter("minPatents", null);
          updateFilter("maxPatents", null);
          break;
        case "gender":
          updateFilter("gender", null);
          break;
        case "ageRange":
          // 清除年龄段选择和自定义年龄范围
          updateFilter("ageRange", "all");
          updateFilter("minAge", null);
          updateFilter("maxAge", null);
          break;
        case "age":
          // 清除自定义年龄范围和年龄段选择
          updateFilter("ageRange", "all");
          updateFilter("minAge", null);
          updateFilter("maxAge", null);
          break;
        case "searchQuery":
          updateFilter("searchQuery", "");
          break;
        default:
          break;
      }
    },
    [filters, updateFilter],
  );

  const handleExport = useCallback(async () => {
    const success = await exportToExcel();
    if (success) {
      setMessageVariant("success");
      setMessage(t("admin.statistics.messages.exportSuccess"));
      setTimeout(() => setMessage(null), 3000);
    }
  }, [exportToExcel, t]);

  return (
    <div className="w-full">
      {message && (
        <Alert
          variant={messageVariant}
          className="mb-4"
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}
      {/* 1. 页头：参照标准行政管理页头 */}
      <ReportHeader
        loading={loading}
        exporting={exporting}
        onExport={handleExport}
      />

      <main className="w-full space-y-5">
        {/* 2. 筛选面板：高度整合的紧凑卡片 */}
        <FilterPanel
          filters={filters}
          onFilterChange={updateFilter}
          onReset={handleReset}
          onApply={handleApply}
          loading={loading}
        />

        {/* 3. 结果汇总与表格 */}
        <div className="space-y-3">
          {/* 这里模仿业绩管理的“统计信息/摘要”条 */}
          <div className="min-h-[32px] flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <FilterSummary
                summary={filtersSummary}
                onRemove={handleRemoveFilter}
              />
            </div>

            {/* 列可见性控制面板 */}
            <div className="flex-shrink-0">
              <ColumnVisibilityPanel
                visibleColumns={columnVisibility.visibleColumns}
                onToggleColumn={columnVisibility.toggleColumn}
                onToggleGroup={columnVisibility.toggleGroup}
                onApplyPreset={columnVisibility.applyPreset}
                onShowAll={columnVisibility.showAll}
                onHideAll={columnVisibility.hideAll}
                isColumnVisible={columnVisibility.isColumnVisible}
                isColumnToggleable={columnVisibility.isColumnToggleable}
                isGroupVisible={columnVisibility.isGroupVisible}
                isGroupPartiallyVisible={
                  columnVisibility.isGroupPartiallyVisible
                }
              />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <ReportError
              message={error}
              onRetry={() => applyFilters(filters)}
            />

            {!error && (
              <StatisticsTable
                data={data.items}
                loading={loading}
                error={error}
                sortBy={params.sortBy}
                sortOrder={params.sortOrder}
                onSort={changeSort}
                page={currentPage}
                pageSize={params.pageSize}
                total={totalItems}
                totalPages={totalPages}
                onPageChange={changePage}
                onPageSizeChange={changePageSize}
                visibleColumns={columnVisibility.visibleColumns}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
