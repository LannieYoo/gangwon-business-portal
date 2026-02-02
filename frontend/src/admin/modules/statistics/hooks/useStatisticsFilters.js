/**
 * useStatisticsFilters Hook - 统计报告筛选条件管理
 *
 * 功能:
 * - 管理筛选条件 UI 状态
 * - 处理预设范围选择
 * - 验证筛选条件
 */

import { useState, useCallback } from "react";
import {
  FULL_FILTER_PARAMS,
  INVESTMENT_RANGES,
  PATENT_RANGES,
  WORK_YEARS,
} from "../enum";

export const useStatisticsFilters = (initialFilters = {}) => {
  // 筛选条件状态 (使用完整的 UI 筛选参数，包含后端参数 + UI 扩展参数)
  const [filters, setFilters] = useState({
    ...FULL_FILTER_PARAMS,
    ...initialFilters,
  });

  // 投资范围选择状态
  const [investmentRangeType, setInvestmentRangeType] = useState("RANGE_1000");

  // 专利范围选择状态
  const [patentRangeType, setPatentRangeType] = useState("RANGE_1");

  // 工龄范围选择状态
  const [workYearsType, setWorkYearsType] = useState("UNDER_3");

  /**
   * 更新单个筛选字段
   */
  const updateFilter = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * 批量更新筛选条件
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  /**
   * 重置筛选条件
   */
  const resetFilters = useCallback(() => {
    setFilters({ ...FULL_FILTER_PARAMS });
    setInvestmentRangeType("RANGE_1000");
    setPatentRangeType("RANGE_1");
    setWorkYearsType("UNDER_3");
  }, []);

  /**
   * 选择投资范围
   */
  const selectInvestmentRange = useCallback((rangeType) => {
    setInvestmentRangeType(rangeType);

    if (rangeType === "CUSTOM") {
      setFilters((prev) => ({ ...prev }));
    } else {
      const range = INVESTMENT_RANGES[rangeType];
      setFilters((prev) => ({
        ...prev,
        minInvestment: range.min,
        maxInvestment: range.max,
      }));
    }
  }, []);

  /**
   * 选择专利范围
   */
  const selectPatentRange = useCallback((rangeType) => {
    setPatentRangeType(rangeType);

    if (rangeType === "CUSTOM") {
      setFilters((prev) => ({ ...prev }));
    } else {
      const range = PATENT_RANGES[rangeType];
      setFilters((prev) => ({
        ...prev,
        minPatents: range.min,
        maxPatents: range.max,
      }));
    }
  }, []);

  /**
   * 切换政策关联标签
   */
  const togglePolicyTag = useCallback((tag) => {
    setFilters((prev) => {
      const tags = prev.policyTags || [];
      const exists = tags.includes(tag);

      return {
        ...prev,
        policyTags: exists ? tags.filter((t) => t !== tag) : [...tags, tag],
      };
    });
  }, []);

  /**
   * 切换创业阶段
   */
  const toggleStage = useCallback((stage) => {
    setFilters((prev) => {
      const stages = prev.startupStages || [];
      const exists = stages.includes(stage);

      return {
        ...prev,
        startupStages: exists
          ? stages.filter((s) => s !== stage)
          : [...stages, stage],
      };
    });
  }, []);

  /**
   * 设置时间维度
   */
  const setTimeDimension = useCallback((year, quarter = null, month = null) => {
    setFilters((prev) => ({
      ...prev,
      year,
      quarter,
      month,
    }));
  }, []);

  /**
   * 设置投资筛选
   */
  const setInvestmentFilters = useCallback((status, min = null, max = null) => {
    setFilters((prev) => ({
      ...prev,
      investmentReceived: status,
      investmentMin: min,
      investmentMax: max,
    }));
  }, []);

  /**
   * 设置专利筛选
   */
  const setPatentFilters = useCallback((min = null, max = null) => {
    setFilters((prev) => ({
      ...prev,
      minPatents: min,
      maxPatents: max,
    }));
  }, []);

  /**
   * 选择工龄范围
   */
  const selectWorkYears = useCallback((type) => {
    setWorkYearsType(type);
    const range = WORK_YEARS[type];
    setFilters((prev) => ({
      ...prev,
      minWorkYears: range.min,
      maxWorkYears: range.max,
    }));
  }, []);

  /**
   * 获取当前激活的筛选条件数量
   */
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;

    if (filters.quarter !== null) count++;
    if (filters.month !== null) count++;
    if (filters.majorIndustryCodes?.length > 0) count++;
    if (filters.gangwonIndustryCodes?.length > 0) count++;
    if (filters.policyTags?.length > 0) count++;
    if (filters.hasInvestment !== null) count++;
    if (filters.minInvestment !== null || filters.maxInvestment !== null)
      count++;
    if (filters.minPatents !== null || filters.maxPatents !== null) count++;
    if (filters.gender !== null) count++;
    if (filters.minAge !== null || filters.maxAge !== null) count++;
    if (filters.searchQuery) count++;
    if (filters.minRevenue !== null || filters.maxRevenue !== null) count++;
    if (filters.minEmployees !== null || filters.maxEmployees !== null) count++;

    return count;
  }, [filters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = useCallback(() => {
    return getActiveFiltersCount() > 0;
  }, [getActiveFiltersCount]);

  /**
   * 获取筛选条件摘要 (用于显示) - 每个筛选条件一个胶囊
   * 返回格式: [{ label: string, filterKey: string, value: any }]
   * 注意：此函数需要在组件中使用 t 函数调用，因为 hook 中无法直接使用 useTranslation
   */
  const getFiltersSummary = useCallback(
    (t) => {
      const summary = [];

      // 时间范围
      if (filters.year) {
        let timeSummary = `${t("statistics.filters.time.title")}: ${filters.year}년`;
        if (filters.quarter) timeSummary += ` Q${filters.quarter}`;
        if (filters.month) timeSummary += ` ${filters.month}월`;
        summary.push({
          label: timeSummary,
          filterKey: "year",
          value: filters.year,
        });
      }

      // 标准产业（大分类）- 显示名称而不是代码
      if (filters.majorIndustryCodes?.length > 0) {
        filters.majorIndustryCodes.forEach((code) => {
          const labelKey = `industryClassification.ksicMajor.${code}`;
          const name = t(labelKey, code);
          summary.push({
            label: `${t("statistics.filters.industry.major")}: ${name}`,
            filterKey: "majorIndustryCodes",
            value: code,
          });
        });
      }

      // 标准产业（中分类）- 显示名称而不是代码
      if (filters.subIndustryCodes?.length > 0) {
        filters.subIndustryCodes.forEach((code) => {
          const labelKey = `industryClassification.ksicSub.${code}`;
          const name = t(labelKey, code);
          summary.push({
            label: `${t("statistics.filters.industry.medium")}: ${name}`,
            filterKey: "subIndustryCodes",
            value: code,
          });
        });
      }

      // 江原主导产业（大分类）- 显示名称而不是代码
      if (filters.gangwonIndustryCodes?.length > 0) {
        filters.gangwonIndustryCodes.forEach((code) => {
          const labelKey = `industryClassification.mainIndustryKsic.${code}`;
          const name = t(labelKey, code);
          summary.push({
            label: `${t("member.mainIndustryKsicMajor")}: ${name}`,
            filterKey: "gangwonIndustryCodes",
            value: code,
          });
        });
      }

      // 江原主导产业（中分类）- 显示名称而不是代码
      if (filters.gangwonIndustrySubCodes?.length > 0) {
        filters.gangwonIndustrySubCodes.forEach((code) => {
          const labelKey = `industryClassification.mainIndustryKsicCodes.${code}`;
          const name = t(labelKey, code);
          summary.push({
            label: `${t("member.mainIndustryKsicCodes")}: ${name}`,
            filterKey: "gangwonIndustrySubCodes",
            value: code,
          });
        });
      }

      // 江原道7大未来产业 - 单选，只显示一个胶囊
      if (filters.gangwonFutureIndustries?.length > 0) {
        const industry = filters.gangwonFutureIndustries[0];
        const labelKey = `industryClassification.gangwonIndustry.${industry}`;
        const name = t(labelKey, industry);
        summary.push({
          label: `${t("statistics.filters.industry.gangwonFuture", "江原道7大未来产业")}: ${name}`,
          filterKey: "gangwonFutureIndustries",
          value: industry,
        });
      }

      // 未来有望新技术 - 单选，只显示一个胶囊
      if (filters.futureTechnologies?.length > 0) {
        const tech = filters.futureTechnologies[0];
        const labelKey = `industryClassification.futureTech.${tech}`;
        const name = t(labelKey, tech);
        summary.push({
          label: `${t("statistics.filters.industry.futureTech", "未来有望新技术")}: ${name}`,
          filterKey: "futureTechnologies",
          value: tech,
        });
      }

      // 创业阶段 - 每个阶段一个胶囊，显示名称
      if (filters.startupStages?.length > 0) {
        filters.startupStages.forEach((stage) => {
          const labelKey = `statistics.filters.stage.${stage === "pre_startup" ? "preStartup" : stage === "re_startup" ? "reStartup" : stage}`;
          const name = t(labelKey, stage);
          summary.push({
            label: `${t("statistics.filters.stage.title")}: ${name}`,
            filterKey: "startupStages",
            value: stage,
          });
        });
      }

      // 从业年限
      if (filters.minWorkYears !== null || filters.maxWorkYears !== null) {
        let label = "";
        if (filters.minWorkYears && filters.maxWorkYears) {
          label = `${t("statistics.filters.workYears.title")}: ${filters.minWorkYears}-${filters.maxWorkYears}년`;
        } else if (filters.minWorkYears) {
          label = `${t("statistics.filters.workYears.title")}: ${filters.minWorkYears}년 이상`;
        } else if (filters.maxWorkYears) {
          label = `${t("statistics.filters.workYears.title")}: ${filters.maxWorkYears}년 이하`;
        }
        summary.push({
          label,
          filterKey: "workYears",
          value: null,
        });
      }

      // 所在地区 - 显示名称
      if (filters.region) {
        const labelKey = `statistics.filters.location.${filters.region}`;
        const name = t(labelKey, filters.region);
        summary.push({
          label: `${t("statistics.filters.location.title")}: ${name}`,
          filterKey: "region",
          value: filters.region,
        });
      }

      // 政策标签 - 每个标签一个胶囊，显示名称
      if (filters.policyTags?.length > 0) {
        filters.policyTags.forEach((tag) => {
          const labelKey = `statistics.filters.programs.${
            tag === "startup_university" ? "startupUniversity" : 
            tag === "global_glocal" ? "globalGlocal" : 
            "rise"
          }`;
          const name = t(labelKey, tag);
          summary.push({
            label: `${t("statistics.filters.programs.title")}: ${name}`,
            filterKey: "policyTags",
            value: tag,
          });
        });
      }

      // 投资情况
      if (filters.hasInvestment !== null) {
        const status = filters.hasInvestment
          ? t("statistics.filters.investment.yes")
          : t("statistics.filters.investment.no");
        summary.push({
          label: `${t("statistics.filters.investment.title")}: ${status}`,
          filterKey: "hasInvestment",
          value: filters.hasInvestment,
        });
      }

      // 投资金额范围
      if (filters.minInvestment !== null || filters.maxInvestment !== null) {
        let label = "";
        if (filters.minInvestment && filters.maxInvestment) {
          label = `${t("statistics.filters.investment.title")}: ${filters.minInvestment}-${filters.maxInvestment}만원`;
        } else if (filters.minInvestment) {
          label = `${t("statistics.filters.investment.title")}: ${filters.minInvestment}만원 이상`;
        } else if (filters.maxInvestment) {
          label = `${t("statistics.filters.investment.title")}: ${filters.maxInvestment}만원 이하`;
        }
        summary.push({
          label,
          filterKey: "investmentAmount",
          value: null,
        });
      }

      // 年营收 - 显示名称
      if (filters.revenueRange && filters.revenueRange !== "all") {
        // 转换枚举值到翻译键：under_100m -> under100m, 100m_500m -> 100m500m
        const translationKey = filters.revenueRange.replace(/_/g, "");
        const labelKey = `statistics.filters.quantitive.revenueRange.${translationKey}`;
        const name = t(labelKey, filters.revenueRange);
        summary.push({
          label: `${t("statistics.filters.quantitive.revenue")}: ${name}`,
          filterKey: "revenueRange",
          value: filters.revenueRange,
        });
      }

      // 员工人数 - 显示名称
      if (filters.employeeRange && filters.employeeRange !== "all") {
        // 转换枚举值到翻译键：under_5 -> under5, 5_10 -> 5to10
        let translationKey = filters.employeeRange;
        if (translationKey.includes("_")) {
          // under_5 -> under5
          if (translationKey.startsWith("under_")) {
            translationKey = translationKey.replace("_", "");
          }
          // over_300 -> over300
          else if (translationKey.startsWith("over_")) {
            translationKey = translationKey.replace("_", "");
          }
          // 5_10 -> 5to10, 10_30 -> 10to30, etc.
          else {
            translationKey = translationKey.replace("_", "to");
          }
        }
        const labelKey = `statistics.filters.quantitive.employeeRange.${translationKey}`;
        const name = t(labelKey, filters.employeeRange);
        summary.push({
          label: `${t("statistics.filters.quantitive.employees")}: ${name}`,
          filterKey: "employeeRange",
          value: filters.employeeRange,
        });
      }

      // 专利
      if (filters.minPatents !== null || filters.maxPatents !== null) {
        let label = "";
        if (filters.minPatents && filters.maxPatents) {
          label = `${t("statistics.filters.patent.title")}: ${filters.minPatents}-${filters.maxPatents}개`;
        } else if (filters.minPatents) {
          label = `${t("statistics.filters.patent.title")}: ${filters.minPatents}개 이상`;
        } else if (filters.maxPatents) {
          label = `${t("statistics.filters.patent.title")}: ${filters.maxPatents}개 이하`;
        }
        summary.push({
          label,
          filterKey: "patents",
          value: null,
        });
      }

      // 性别 - 显示名称
      if (filters.gender) {
        const genderName = t(
          `statistics.filters.representative.${filters.gender === "male" ? "male" : "female"}`,
        );
        summary.push({
          label: `${t("statistics.filters.representative.gender")}: ${genderName}`,
          filterKey: "gender",
          value: filters.gender,
        });
      }

      // 年龄 - 只显示一个胶囊
      if (filters.ageRange && filters.ageRange !== "all") {
        // 如果选择了预设年龄段，显示年龄段名称
        // 转换枚举值到翻译键：under_20 -> under20, 20_29 -> 20to29
        let translationKey = filters.ageRange;
        if (translationKey.includes("_")) {
          // under_20 -> under20
          if (translationKey.startsWith("under_")) {
            translationKey = translationKey.replace("_", "");
          }
          // over_60 -> over60
          else if (translationKey.startsWith("over_")) {
            translationKey = translationKey.replace("_", "");
          }
          // 20_29 -> 20to29, 30_39 -> 30to39, etc.
          else {
            translationKey = translationKey.replace("_", "to");
          }
        }
        const labelKey = `statistics.filters.representative.ageRange.${translationKey}`;
        const name = t(labelKey, filters.ageRange);
        summary.push({
          label: `${t("statistics.filters.representative.ageRangeLabel")}: ${name}`,
          filterKey: "ageRange",
          value: filters.ageRange,
        });
      } else if (!filters.ageRange || filters.ageRange === "all") {
        // 只有在没有选择预设年龄段时，才检查自定义年龄范围
        if (filters.minAge !== null || filters.maxAge !== null) {
          let label = "";
          if (filters.minAge && filters.maxAge) {
            label = `${t("statistics.filters.representative.ageRangeLabel")}: ${filters.minAge}-${filters.maxAge}세`;
          } else if (filters.minAge) {
            label = `${t("statistics.filters.representative.ageRangeLabel")}: ${filters.minAge}세 이상`;
          } else if (filters.maxAge) {
            label = `${t("statistics.filters.representative.ageRangeLabel")}: ${filters.maxAge}세 이하`;
          }
          summary.push({
            label,
            filterKey: "age",
            value: null,
          });
        }
      }

      // 关键词搜索
      if (filters.searchQuery) {
        summary.push({
          label: `${t("statistics.filters.keyword.title")}: "${filters.searchQuery}"`,
          filterKey: "searchQuery",
          value: filters.searchQuery,
        });
      }

      return summary;
    },
    [filters],
  );

  return {
    // 筛选条件
    filters,

    // 范围选择类型
    investmentRangeType,
    patentRangeType,
    workYearsType,

    // 基础操作
    updateFilter,
    updateFilters,
    resetFilters,

    // 范围选择
    selectInvestmentRange,
    selectPatentRange,
    selectWorkYears,

    // 特殊操作
    togglePolicyTag,
    setTimeDimension,
    setInvestmentFilters: (hasInv, min = null, max = null) => {
      setFilters((prev) => ({
        ...prev,
        hasInvestment: hasInv,
        minInvestment: min,
        maxInvestment: max,
      }));
    },
    setPatentFilters: (min = null, max = null) => {
      setFilters((prev) => ({
        ...prev,
        minPatents: min,
        maxPatents: max,
      }));
    },

    // 辅助方法
    getActiveFiltersCount,
    hasActiveFilters,
    getFiltersSummary,
  };
};
