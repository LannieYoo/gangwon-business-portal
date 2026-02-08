/**
 * 咨询历史业务逻辑 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supportService } from "../services/support.service";
import { useApiCache, usePagination } from "@shared/hooks";

/**
 * 咨询历史逻辑控制 Hook
 */
export function useInquiryHistory(pageSize = 10) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchThreads = useCallback(async () => {
    const response = await supportService.getMemberThreads({
      page: 1,
      pageSize: 1000,
      status: statusFilter || undefined,
    });
    return response.items || [];
  }, [statusFilter]);

  const {
    data: allThreads,
    loading,
    error,
    refresh: loadThreads,
  } = useApiCache(fetchThreads, `inquiry-history-${statusFilter}`, {
    cacheDuration: 30 * 1000, // 30秒缓存（用户自己的数据，更新较频繁）
    enabled: true,
    deps: [statusFilter],
  });

  // 使用 useMemo 确保返回稳定的数组引用
  const stableAllThreads = useMemo(() => allThreads ?? [], [allThreads]);

  // 最终过滤后的数据
  const allFilteredThreads =
    filteredThreads.length > 0 ? filteredThreads : stableAllThreads;

  // 使用共享的分页 hook
  const pagination = usePagination({ items: allFilteredThreads, pageSize });

  const handleFilterChange = useCallback(
    (filtered) => {
      setFilteredThreads(filtered);
      pagination.resetPage();
    },
    [pagination],
  );

  // 状态筛选改变时重置页码
  const handleStatusFilterChange = useCallback(
    (value) => {
      setStatusFilter(value);
      pagination.resetPage();
    },
    [pagination],
  );

  const openDetailModal = (threadId) => {
    setSelectedThreadId(threadId);
  };

  const closeDetailModal = () => {
    setSelectedThreadId(null);
    loadThreads();
  };

  return {
    allThreads: stableAllThreads,
    filteredThreads: pagination.paginatedItems,
    loading,
    selectedThreadId,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    handleFilterChange,
    openDetailModal,
    closeDetailModal,
    loadThreads,
    navigate,
    // 分页相关
    total: pagination.total,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageSize: pagination.pageSize,
    onPageChange: pagination.onPageChange,
  };
}
