/**
 * 通用分页 Hook
 *
 * 支持两种使用模式：
 * 1. 前端分页：传入 items 数组，自动处理切片
 * 2. 服务端分页：不传 items，只管理页码状态
 *
 * 使用方式1 - 前端分页：
 * const { paginatedItems, currentPage, totalPages, goToPage } = usePagination({
 *   items: dataArray,
 *   pageSize: 10,
 * });
 *
 * 使用方式2 - 服务端分页：
 * const { page, pageSize, goToPage, reset } = usePagination({
 *   pageSize: 10,
 *   total: 100,  // 服务端返回的总数
 * });
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { DEFAULT_PAGE_SIZE } from "@shared/utils/constants";

/**
 * @param {Object} options - 配置选项
 * @param {Array} options.items - 要分页的数据数组（可选，用于前端分页）
 * @param {number} options.pageSize - 每页显示的条数，默认为 DEFAULT_PAGE_SIZE
 * @param {number} options.total - 总条数（可选，用于服务端分页）
 * @param {number} options.initialPage - 初始页码，默认为 1
 * @param {boolean} options.scrollToTop - 翻页时是否滚动到顶部，默认为 true
 */
export function usePagination(options = {}) {
  const {
    items,
    pageSize = DEFAULT_PAGE_SIZE,
    total: externalTotal,
    initialPage = 1,
    scrollToTop = false, // 默认不滚动
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // 判断是否为前端分页模式
  const isClientSidePagination = Array.isArray(items);

  // 计算总条数
  const total = isClientSidePagination ? items.length : externalTotal || 0;

  // 当数据源变化时，重置到第一页（仅前端分页模式）
  useEffect(() => {
    if (isClientSidePagination) {
      setCurrentPage(1);
    }
  }, [items?.length, isClientSidePagination]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / currentPageSize));
  }, [total, currentPageSize]);

  // 计算当前页的数据（仅前端分页模式）
  const paginatedItems = useMemo(() => {
    if (!isClientSidePagination) return [];
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, currentPageSize, isClientSidePagination]);

  // 跳转到指定页
  const goToPage = useCallback(
    (page) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, scrollToTop],
  );

  // 重置到第一页
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // 下一页
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  // 上一页
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // 修改每页条数
  const changePageSize = useCallback((newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // 重置所有状态
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setCurrentPageSize(pageSize);
  }, [initialPage, pageSize]);

  return {
    // 分页后的数据（前端分页模式）
    paginatedItems,
    // 当前页码
    currentPage,
    // 别名，保持向后兼容
    page: currentPage,
    // 总页数
    totalPages,
    // 每页条数
    pageSize: currentPageSize,
    // 总条数
    total,
    // 操作方法
    goToPage,
    resetPage,
    nextPage,
    prevPage,
    changePageSize,
    reset,
    // 别名，方便与 Pagination 组件配合使用
    onPageChange: goToPage,
  };
}
