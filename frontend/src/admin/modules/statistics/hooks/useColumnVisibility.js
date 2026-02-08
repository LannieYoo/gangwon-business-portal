/**
 * useColumnVisibility Hook - 表格列可见性管理
 *
 * 功能：
 * - 管理表格列的显示/隐藏状态
 * - 持久化到 localStorage
 * - 提供预设配置（全部、核心、最小）
 */

import { useState, useEffect, useCallback } from "react";
import { TABLE_COLUMNS } from "../enum";

// 存储键
const STORAGE_KEY = "statistics_column_visibility";

/**
 * 默认可见列（核心列）
 */
const DEFAULT_VISIBLE_COLUMNS = [
  TABLE_COLUMNS.BUSINESS_REG_NO,
  TABLE_COLUMNS.ENTERPRISE_NAME,
  TABLE_COLUMNS.KSIC_MAJOR,
  TABLE_COLUMNS.REGION,
  TABLE_COLUMNS.STARTUP_STAGE,
  TABLE_COLUMNS.ANNUAL_REVENUE,
  TABLE_COLUMNS.EMPLOYEE_COUNT,
  TABLE_COLUMNS.POLICY_TAGS,
];

/**
 * 最小可见列（必须显示）
 */
const MINIMUM_VISIBLE_COLUMNS = [
  TABLE_COLUMNS.BUSINESS_REG_NO,
  TABLE_COLUMNS.ENTERPRISE_NAME,
];

/**
 * 列分组配置
 */
export const COLUMN_GROUPS = {
  BASIC: {
    key: "basic",
    labelKey: "admin.statistics.columnGroups.basic",
    columns: [
      TABLE_COLUMNS.YEAR,
      TABLE_COLUMNS.QUARTER,
      TABLE_COLUMNS.MONTH,
      TABLE_COLUMNS.BUSINESS_REG_NO,
      TABLE_COLUMNS.ENTERPRISE_NAME,
    ],
  },
  QUICK_FILTERS: {
    key: "quickFilters",
    labelKey: "admin.statistics.columnGroups.quickFilters",
    columns: [TABLE_COLUMNS.POLICY_TAGS],
  },
  COMPANY_PROFILE: {
    key: "companyProfile",
    labelKey: "admin.statistics.columnGroups.companyProfile",
    columns: [
      TABLE_COLUMNS.KSIC_MAJOR,
      TABLE_COLUMNS.KSIC_SUB,
      TABLE_COLUMNS.GANGWON_INDUSTRY,
      TABLE_COLUMNS.GANGWON_INDUSTRY_SUB,
      TABLE_COLUMNS.GANGWON_FUTURE_INDUSTRY,
      TABLE_COLUMNS.FUTURE_TECH,
      TABLE_COLUMNS.WORK_YEARS,
      TABLE_COLUMNS.STARTUP_STAGE,
      TABLE_COLUMNS.REGION,
    ],
  },
  BUSINESS_METRICS: {
    key: "businessMetrics",
    labelKey: "admin.statistics.columnGroups.businessMetrics",
    columns: [
      TABLE_COLUMNS.TOTAL_INVESTMENT,
      TABLE_COLUMNS.ANNUAL_REVENUE,
      TABLE_COLUMNS.EXPORT_AMOUNT,
      TABLE_COLUMNS.EMPLOYEE_COUNT,
      TABLE_COLUMNS.PATENT_COUNT,
    ],
  },
  REPRESENTATIVE: {
    key: "representative",
    labelKey: "admin.statistics.columnGroups.representative",
    columns: [
      TABLE_COLUMNS.REPRESENTATIVE_GENDER,
      TABLE_COLUMNS.REPRESENTATIVE_AGE,
    ],
  },
};

/**
 * 预设配置
 */
export const COLUMN_PRESETS = {
  ALL: {
    key: "all",
    labelKey: "admin.statistics.columnPresets.all",
    columns: Object.values(TABLE_COLUMNS),
  },
  CORE: {
    key: "core",
    labelKey: "admin.statistics.columnPresets.core",
    columns: DEFAULT_VISIBLE_COLUMNS,
  },
  MINIMUM: {
    key: "minimum",
    labelKey: "admin.statistics.columnPresets.minimum",
    columns: MINIMUM_VISIBLE_COLUMNS,
  },
};

/**
 * 从 localStorage 加载列可见性配置
 */
const loadColumnVisibility = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 确保至少包含最小可见列
      const columns = new Set([...MINIMUM_VISIBLE_COLUMNS, ...parsed]);
      return Array.from(columns);
    }
  } catch (error) {
    console.warn("Failed to load column visibility:", error);
  }
  return DEFAULT_VISIBLE_COLUMNS;
};

/**
 * 保存列可见性配置到 localStorage
 */
const saveColumnVisibility = (visibleColumns) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  } catch (error) {
    console.warn("Failed to save column visibility:", error);
  }
};

/**
 * useColumnVisibility Hook
 */
export const useColumnVisibility = () => {
  const [visibleColumns, setVisibleColumns] = useState(loadColumnVisibility);

  // 保存到 localStorage
  useEffect(() => {
    saveColumnVisibility(visibleColumns);
  }, [visibleColumns]);

  /**
   * 切换单个列的可见性
   */
  const toggleColumn = useCallback((columnKey) => {
    setVisibleColumns((prev) => {
      // 不允许隐藏最小可见列
      if (MINIMUM_VISIBLE_COLUMNS.includes(columnKey)) {
        return prev;
      }

      if (prev.includes(columnKey)) {
        return prev.filter((key) => key !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  }, []);

  /**
   * 切换整个分组的可见性
   */
  const toggleGroup = useCallback((groupKey) => {
    const group = Object.values(COLUMN_GROUPS).find((g) => g.key === groupKey);
    if (!group) return;

    setVisibleColumns((prev) => {
      const groupColumns = group.columns;
      const allVisible = groupColumns.every((col) => prev.includes(col));

      if (allVisible) {
        // 隐藏整个分组（保留最小可见列）
        return prev.filter(
          (col) =>
            !groupColumns.includes(col) ||
            MINIMUM_VISIBLE_COLUMNS.includes(col),
        );
      } else {
        // 显示整个分组
        const newColumns = new Set([...prev, ...groupColumns]);
        return Array.from(newColumns);
      }
    });
  }, []);

  /**
   * 应用预设配置
   */
  const applyPreset = useCallback((presetKey) => {
    const preset = Object.values(COLUMN_PRESETS).find(
      (p) => p.key === presetKey,
    );
    if (preset) {
      setVisibleColumns(preset.columns);
    }
  }, []);

  /**
   * 重置为默认配置
   */
  const resetToDefault = useCallback(() => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  }, []);

  /**
   * 显示所有列
   */
  const showAll = useCallback(() => {
    setVisibleColumns(Object.values(TABLE_COLUMNS));
  }, []);

  /**
   * 隐藏所有可选列（保留最小可见列）
   */
  const hideAll = useCallback(() => {
    setVisibleColumns(MINIMUM_VISIBLE_COLUMNS);
  }, []);

  /**
   * 检查列是否可见
   */
  const isColumnVisible = useCallback(
    (columnKey) => visibleColumns.includes(columnKey),
    [visibleColumns],
  );

  /**
   * 检查列是否可切换（最小可见列不可切换）
   */
  const isColumnToggleable = useCallback(
    (columnKey) => !MINIMUM_VISIBLE_COLUMNS.includes(columnKey),
    [],
  );

  /**
   * 检查分组是否全部可见
   */
  const isGroupVisible = useCallback(
    (groupKey) => {
      const group = Object.values(COLUMN_GROUPS).find(
        (g) => g.key === groupKey,
      );
      if (!group) return false;
      return group.columns.every((col) => visibleColumns.includes(col));
    },
    [visibleColumns],
  );

  /**
   * 检查分组是否部分可见
   */
  const isGroupPartiallyVisible = useCallback(
    (groupKey) => {
      const group = Object.values(COLUMN_GROUPS).find(
        (g) => g.key === groupKey,
      );
      if (!group) return false;
      const visibleCount = group.columns.filter((col) =>
        visibleColumns.includes(col),
      ).length;
      return visibleCount > 0 && visibleCount < group.columns.length;
    },
    [visibleColumns],
  );

  return {
    visibleColumns,
    toggleColumn,
    toggleGroup,
    applyPreset,
    resetToDefault,
    showAll,
    hideAll,
    isColumnVisible,
    isColumnToggleable,
    isGroupVisible,
    isGroupPartiallyVisible,
  };
};
