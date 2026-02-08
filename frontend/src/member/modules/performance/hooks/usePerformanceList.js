/**
 * Performance List Hook
 *
 * 处理成果列表的业务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { performanceService } from "../services/performance.service";
import { useApiCache, clearCache } from "@shared/hooks/useApiCache";
import { DEFAULT_PAGE_SIZE } from "@shared/utils/constants";

export const usePerformanceList = (pageSize = DEFAULT_PAGE_SIZE) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState("success");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [filters, setFilters] = useState({ year: "", quarter: "", status: "" });
  const [commentModal, setCommentModal] = useState({
    open: false,
    comments: [],
    status: "",
  });

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const fetchPerformances = useCallback(async () => {
    const params = {
      page: currentPage,
      pageSize: pageSize,
    };
    if (filters.year) params.year = filters.year;
    if (filters.quarter) params.quarter = filters.quarter;
    if (filters.status) params.status = filters.status;

    const response = await performanceService.listRecords(params);

    setTotalCount(response.total || 0);

    return response.items || [];
  }, [filters, currentPage, pageSize]);

  const {
    data: performances,
    loading,
    error,
    refresh: loadPerformances,
  } = useApiCache(
    fetchPerformances,
    `performance-list-${currentPage}-${filters.year}-${filters.quarter}-${filters.status}`,
    {
      cacheDuration: 1 * 60 * 1000, // 1分钟缓存
      enabled: true,
      deps: [currentPage, filters],
    },
  );

  // 使用 useMemo 确保返回稳定的数组引用
  const stablePerformances = useMemo(() => performances ?? [], [performances]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const confirmDelete = async () => {
    try {
      await performanceService.deleteRecord(deleteConfirm.id);
      setMessageVariant("success");
      setMessage(t("message.deleteSuccess", "삭제되었습니다"));
      setDeleteConfirm({ open: false, id: null });
      // 清除缓存并刷新
      clearCache(
        `performance-list-${currentPage}-${filters.year}-${filters.quarter}-${filters.status}`,
      );
      loadPerformances();
    } catch (error) {
      console.error("Delete performance error:", error);
      setMessageVariant("error");
      setMessage(t("message.deleteFailed", "삭제에 실패했습니다"));
    }
  };

  const getLatestReviewComments = (record) => {
    if (!record.reviewComments) return [];
    return [
      {
        comments: record.reviewComments,
        reviewedAt: record.reviewedAt,
      },
    ];
  };

  const showComments = (record) => {
    const reviews = getLatestReviewComments(record) || [];
    setCommentModal({ open: true, comments: reviews, status: record.status });
  };

  const setFilterField = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); // 筛选改变时重置到第一页
  };

  return {
    performances: stablePerformances,
    loading,
    message,
    setMessage,
    messageVariant,
    deleteConfirm,
    setDeleteConfirm,
    filters,
    setFilterField,
    commentModal,
    setCommentModal,
    // 分页相关 - 统一接口
    pagination: {
      currentPage,
      page: currentPage,
      pageSize,
      total: totalCount,
      totalPages,
    },
    currentPage,
    totalPages,
    totalCount,
    onPageChange: handlePageChange,
    handlePageChange,
    confirmDelete,
    showComments,
    getLatestReviewComments,
    navigate,
  };
};
