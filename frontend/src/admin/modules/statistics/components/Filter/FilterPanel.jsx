/*
 * FilterPanel - 统计报告大筛选面板
 */
import { useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { Card, Input, FormRow, Select } from "@shared/components";
import { GENDER_OPTIONS } from "../../enum";
import { TimeFilters } from "./TimeFilters";
import { StandardIndustryFilters } from "./StandardIndustryFilters";
import { IndustryFilters } from "./IndustryFilters";
import { StartupTypeFilters } from "./StartupTypeFilters";
import { BusinessFieldFilters } from "./BusinessFieldFilters";
import { WorkYearsFilters } from "./WorkYearsFilters";
import { ProgramFilters } from "./ProgramFilters";
import { CooperationFilters } from "./CooperationFilters";
import { StageFilters } from "./StageFilters";
import { LocationFilters } from "./LocationFilters";
import { InvestmentFilters } from "./InvestmentFilters";
import { PatentFilters } from "./PatentFilters";
import { RevenueFilters } from "./RevenueFilters";
import { EmployeeFilters } from "./EmployeeFilters";
import { GenderFilters } from "./GenderFilters";
import { AgeFilters } from "./AgeFilters";
import { GangwonFutureIndustryFilters } from "./GangwonFutureIndustryFilters";
import { FutureTechnologyFilters } from "./FutureTechnologyFilters";

const FilterPanelComponent = ({
  filters,
  onFilterChange,
  onReset,
  onApply,
  loading,
}) => {
  const { t } = useTranslation();

  // 每个分组的展开状态 - 默认全部展开
  const [expandedGroups, setExpandedGroups] = useState({
    quick: true, // 快速筛选
    company: true, // 企业特征
    metrics: true, // 经营指标
    representative: true, // 代表者信息
  });

  // 切换分组展开状态
  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const labelWidth = "w-32";

  // 渲染栏目标题（带展开/收起功能）
  const GroupTitle = ({ titleKey, groupKey }) => {
    const isExpanded = expandedGroups[groupKey];

    return (
      <div className="col-span-1 lg:col-span-2 pt-6 first:pt-0 mb-3 border-t-2 border-gray-100 first:border-0">
        <button
          type="button"
          onClick={() => toggleGroup(groupKey)}
          className="flex items-center justify-between w-full text-left group"
        >
          <h3 className="text-sm font-semibold text-gray-900">{t(titleKey)}</h3>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <Card className="p-6 sm:p-8 bg-white border-gray-200 shadow-sm rounded-2xl ring-1 ring-gray-200/50">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          {t("statistics.filters.title", "筛选条件")}
        </h2>
      </div>

      {/* 筛选条件内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-3.5">
        {/* 1. 快速筛选 - Quick Filters */}
        <GroupTitle titleKey="statistics.groups.quick" groupKey="quick" />

        {expandedGroups.quick && (
          <>
            <FormRow
              label={t("statistics.filters.time.title")}
              labelWidthClassName={labelWidth}
            >
              <TimeFilters
                year={filters.year}
                quarter={filters.quarter}
                month={filters.month}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.programs.title")}
              labelWidthClassName={labelWidth}
            >
              <ProgramFilters
                tags={filters.policyTags}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.keyword.title")}
              labelWidthClassName={labelWidth}
            >
              <Input
                placeholder={t("statistics.filters.keyword.placeholder")}
                value={filters.searchQuery || ""}
                onChange={(e) => onFilterChange("searchQuery", e.target.value)}
                className="w-full sm:w-80 h-9 bg-white border-gray-300"
                containerClassName="mb-0"
              />
            </FormRow>
          </>
        )}

        {/* 2. 企业特征 - Company Profile */}
        <GroupTitle titleKey="statistics.groups.company" groupKey="company" />

        {expandedGroups.company && (
          <>
            <div className="col-span-1 lg:col-span-2">
              <FormRow
                label={t("statistics.filters.industry.major")}
                labelWidthClassName={labelWidth}
              >
                <StandardIndustryFilters
                  codes={filters.majorIndustryCodes}
                  subCodes={filters.subIndustryCodes}
                  onChange={onFilterChange}
                />
              </FormRow>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <FormRow
                label={t("statistics.filters.industry.gangwon")}
                labelWidthClassName={labelWidth}
              >
                <IndustryFilters
                  codes={filters.gangwonIndustryCodes}
                  subCodes={filters.gangwonIndustrySubCodes}
                  onChange={onFilterChange}
                />
              </FormRow>
            </div>

            <FormRow
              label={t(
                "statistics.filters.industry.gangwonFuture",
                "江原道7大未来产业",
              )}
              labelWidthClassName={labelWidth}
            >
              <GangwonFutureIndustryFilters
                industries={filters.gangwonFutureIndustries}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t(
                "statistics.filters.industry.futureTech",
                "未来有望新技术",
              )}
              labelWidthClassName={labelWidth}
            >
              <FutureTechnologyFilters
                technologies={filters.futureTechnologies}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.workYears.title")}
              labelWidthClassName={labelWidth}
            >
              <WorkYearsFilters
                minWorkYears={filters.minWorkYears}
                maxWorkYears={filters.maxWorkYears}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.stage.title")}
              labelWidthClassName={labelWidth}
            >
              <StageFilters
                stages={filters.startupStages}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.location.title")}
              labelWidthClassName={labelWidth}
            >
              <LocationFilters
                region={filters.region}
                onChange={onFilterChange}
              />
            </FormRow>
          </>
        )}

        {/* 3. 经营指标 - Business Metrics */}
        <GroupTitle titleKey="statistics.groups.metrics" groupKey="metrics" />

        {expandedGroups.metrics && (
          <>
            <FormRow
              label={t("statistics.filters.investment.title")}
              labelWidthClassName={labelWidth}
            >
              <InvestmentFilters
                hasInvestment={filters.hasInvestment}
                minInvestment={filters.minInvestment}
                maxInvestment={filters.maxInvestment}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.quantitive.revenue")}
              labelWidthClassName={labelWidth}
            >
              <RevenueFilters
                revenueRange={filters.revenueRange}
                minRevenue={filters.minRevenue}
                maxRevenue={filters.maxRevenue}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.quantitive.employees")}
              labelWidthClassName={labelWidth}
            >
              <EmployeeFilters
                employeeRange={filters.employeeRange}
                minEmployees={filters.minEmployees}
                maxEmployees={filters.maxEmployees}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.patent.title")}
              labelWidthClassName={labelWidth}
            >
              <PatentFilters
                minPatents={filters.minPatents}
                maxPatents={filters.maxPatents}
                onChange={onFilterChange}
              />
            </FormRow>
          </>
        )}

        {/* 4. 代表者信息 - Representative */}
        <GroupTitle
          titleKey="statistics.groups.representative"
          groupKey="representative"
        />

        {expandedGroups.representative && (
          <>
            <FormRow
              label={t("statistics.filters.representative.gender")}
              labelWidthClassName={labelWidth}
            >
              <GenderFilters
                gender={filters.gender}
                onChange={onFilterChange}
              />
            </FormRow>

            <FormRow
              label={t("statistics.filters.representative.ageRangeLabel")}
              labelWidthClassName={labelWidth}
            >
              <AgeFilters
                ageRange={filters.ageRange}
                minAge={filters.minAge}
                maxAge={filters.maxAge}
                onChange={onFilterChange}
              />
            </FormRow>
          </>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("statistics.filters.reset", "重置")}
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-700 hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("statistics.filters.apply", "查询")}
        </button>
      </div>
    </Card>
  );
};

// 使用 React.memo 优化，避免不必要的重新渲染
export const FilterPanel = memo(FilterPanelComponent);
