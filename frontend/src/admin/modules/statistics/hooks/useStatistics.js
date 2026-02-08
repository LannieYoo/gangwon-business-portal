/**
 * useStatistics Hook - 统计报告业务逻辑
 *
 * 功能:
 * - 管理筛选条件状态
 * - 执行查询和分页
 * - 处理 Excel 导出（前端生成，支持完整国际化）
 * - 处理加载和错误状态
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import statisticsService from "../services/statistics.service";
import {
  DEFAULT_QUERY_PARAMS,
  PAGINATION_CONFIG,
  TABLE_COLUMN_CONFIGS,
} from "../enum";
import { useEnumTranslation } from "@/shared/hooks/useEnumTranslation";
import {
  exportToExcel as exportExcel,
  exportToCsv as exportCsv,
  generateExportFilename,
} from "@shared/utils/excelExporter";

export const useStatistics = (initialParams = {}) => {
  const { t } = useTranslation();
  const { translateFieldValue } = useEnumTranslation();

  // 筛选参数状态
  const [params, setParams] = useState({
    ...DEFAULT_QUERY_PARAMS,
    ...initialParams,
  });

  // 查询结果状态
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_LIMIT,
  });

  // 加载和错误状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 导出状态
  const [exporting, setExporting] = useState(false);

  /**
   * 执行查询
   */
  const fetchData = useCallback(
    async (queryParams = params) => {
      setLoading(true);
      setError(null);

      try {
        // 验证参数
        const validation = statisticsService.validateParams(queryParams);
        if (!validation.valid) {
          const errorMessages = validation.errors
            .map((key) => t(key))
            .join(", ");
          throw new Error(errorMessages);
        }

        // 执行查询
        const response = await statisticsService.queryCompanies(queryParams);

        setData({
          items: response.items || [],
          total: response.total || 0,
          page: response.page || 1,
          pageSize: response.pageSize || PAGINATION_CONFIG.DEFAULT_LIMIT,
        });

        return response;
      } catch (err) {
        const errorMessage =
          err.message || t("admin.statistics.messages.queryError");
        setError(errorMessage);
        console.error("[useStatistics] fetchData error:", err);
      } finally {
        setLoading(false);
      }
    },
    [params, t],
  );

  /**
   * 更新筛选参数
   */
  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      // 更新筛选条件时重置到第一页
      page: newParams.page !== undefined ? newParams.page : 1,
    }));
  }, []);

  /**
   * 重置筛选条件
   */
  const resetParams = useCallback(() => {
    setParams({ ...DEFAULT_QUERY_PARAMS });
  }, []);

  /**
   * 应用筛选条件并查询
   */
  const applyFilters = useCallback(
    async (filters = {}) => {
      const newParams = {
        ...params,
        ...filters,
        page: 1, // 应用新筛选条件时重置到第一页
      };
      setParams(newParams);
      await fetchData(newParams);
    },
    [params, fetchData],
  );

  /**
   * 翻页
   */
  const changePage = useCallback(
    async (newPage) => {
      const newParams = { ...params, page: newPage };
      setParams(newParams);
      await fetchData(newParams);
    },
    [params, fetchData],
  );

  /**
   * 改变每页数量
   */
  const changePageSize = useCallback(
    async (newPageSize) => {
      const newParams = { ...params, pageSize: newPageSize, page: 1 };
      setParams(newParams);
      await fetchData(newParams);
    },
    [params, fetchData],
  );

  /**
   * 排序
   */
  const changeSort = useCallback(
    async (sortBy, sortOrder = "asc") => {
      const newParams = { ...params, sortBy, sortOrder };
      setParams(newParams);
      await fetchData(newParams);
    },
    [params, fetchData],
  );

  /**
   * 导出 Excel（前端生成，支持完整国际化）
   * 使用分页循环获取所有数据（后端限制 pageSize 最大 100）
   */
  const exportToExcel = useCallback(
    async (customFilename = null) => {
      setExporting(true);

      try {
        // 1. 验证参数
        const validation = statisticsService.validateParams(params);
        if (!validation.valid) {
          const errorMessages = validation.errors
            .map((key) => t(key))
            .join(", ");
          throw new Error(errorMessages);
        }

        // 2. 使用分页循环获取全部数据（后端限制 pageSize 最大 100）
        const allItems = [];
        const batchSize = 100; // 后端允许的最大 pageSize
        let currentPage = 1;
        let totalFetched = 0;
        let totalCount = 0;

        do {
          const response = await statisticsService.queryCompanies({
            ...params,
            page: currentPage,
            pageSize: batchSize,
          });

          const items = response.items || [];
          allItems.push(...items);
          totalFetched += items.length;
          totalCount = response.total || 0;
          currentPage++;

          // 防止无限循环：如果返回的数据少于请求的数量，说明已经到最后一页
        } while (totalFetched < totalCount && allItems.length < totalCount);

        // 3. 生成文件名
        const filename =
          customFilename ||
          generateExportFilename(t("admin.statistics.export.filename"), {
            year: params.year || new Date().getFullYear(),
          });

        // 4. 使用共享导出工具（前端生成 Excel）
        await exportExcel({
          data: allItems,
          columns: TABLE_COLUMN_CONFIGS,
          t,
          filename,
          sheetName: t("admin.statistics.export.sheetName"),
          valueTranslator: (key, value) => translateFieldValue(key, value),
        });

        return { success: true, filename };
      } catch (err) {
        const errorMessage =
          err.message || t("admin.statistics.messages.exportError");
        setError(errorMessage);
        console.error("[useStatistics] exportToExcel error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setExporting(false);
      }
    },
    [params, t, translateFieldValue],
  );

  /**
   * 导出 CSV（前端生成，支持完整国际化）
   * 使用分页循环获取所有数据（后端限制 pageSize 最大 100）
   */
  const exportToCsv = useCallback(
    async (customFilename = null) => {
      setExporting(true);

      try {
        // 1. 验证参数
        const validation = statisticsService.validateParams(params);
        if (!validation.valid) {
          const errorMessages = validation.errors
            .map((key) => t(key))
            .join(", ");
          throw new Error(errorMessages);
        }

        // 2. 使用分页循环获取全部数据（后端限制 pageSize 最大 100）
        const allItems = [];
        const batchSize = 100; // 后端允许的最大 pageSize
        let currentPage = 1;
        let totalFetched = 0;
        let totalCount = 0;

        do {
          const response = await statisticsService.queryCompanies({
            ...params,
            page: currentPage,
            pageSize: batchSize,
          });

          const items = response.items || [];
          allItems.push(...items);
          totalFetched += items.length;
          totalCount = response.total || 0;
          currentPage++;

          // 防止无限循环：如果返回的数据少于请求的数量，说明已经到最后一页
        } while (totalFetched < totalCount && allItems.length < totalCount);

        // 3. 生成文件名
        const filename =
          customFilename ||
          generateExportFilename(t("admin.statistics.export.filename"), {
            year: params.year || new Date().getFullYear(),
          });

        // 4. 使用共享导出工具（前端生成 CSV）
        await exportCsv({
          data: allItems,
          columns: TABLE_COLUMN_CONFIGS,
          t,
          filename,
          sheetName: t("admin.statistics.export.sheetName"),
          valueTranslator: (key, value) => translateFieldValue(key, value),
        });

        return { success: true, filename };
      } catch (err) {
        const errorMessage =
          err.message || t("admin.statistics.messages.exportError");
        setError(errorMessage);
        console.error("[useStatistics] exportToCsv error:", err);
        return { success: false, error: errorMessage };
      } finally {
        setExporting(false);
      }
    },
    [params, t, translateFieldValue],
  );

  /**
   * 初始化时自动查询
   */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  return {
    // 数据
    data,
    params,
    loading,
    error,
    exporting,

    // 方法
    fetchData,
    updateParams,
    resetParams,
    applyFilters,
    changePage: async (newPage) => {
      await changePage(newPage);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    changePageSize,
    changeSort,
    exportToExcel,
    exportToCsv,

    // 辅助信息
    hasData: data.items.length > 0,
    isEmpty: !loading && data.items.length === 0,
    totalItems: data.total,
    currentPage: data.page,
    totalPages: Math.ceil(data.total / data.pageSize),
  };
};
