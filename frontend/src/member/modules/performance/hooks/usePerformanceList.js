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

export const usePerformanceList = () => {
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
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchPerformances = useCallback(async () => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (filters.year) params.year = filters.year;
    if (filters.quarter) params.quarter = filters.quarter;
    if (filters.status) params.status = filters.status;

    const response = await performanceService.listRecords(params);
    
    setPagination((prev) => ({
      ...prev,
      page: response.page || pagination.page,
      total: response.total || 0,
      totalPages: response.totalPages || 0,
    }));
    
    return response.items || [];
  }, [filters, pagination.page, pagination.pageSize]);

  const { data: performances, loading, error, refresh: loadPerformances } = useApiCache(
    fetchPerformances,
    `performance-list-${pagination.page}-${filters.year}-${filters.quarter}-${filters.status}`,
    {
      cacheDuration: 1 * 60 * 1000, // 1分钟缓存
      enabled: true,
      deps: [pagination.page, filters]
    }
  );

  // 使用 useMemo 确保返回稳定的数组引用
  const stablePerformances = useMemo(() => performances ?? [], [performances]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const confirmDelete = async () => {
    try {
      await performanceService.deleteRecord(deleteConfirm.id);
      setMessageVariant("success");
      setMessage(t("message.deleteSuccess", "删除成功"));
      setDeleteConfirm({ open: false, id: null });
      // 清除缓存并刷新
      clearCache(`performance-list-${pagination.page}-${filters.year}-${filters.quarter}-${filters.status}`);
      loadPerformances();
    } catch (error) {
      console.error("Delete performance error:", error);
      setMessageVariant("error");
      setMessage(t("message.deleteFailed", "删除失败"));
    }
  };

  const getLatestReviewComments = (record) => {
    if (!record.reviewComments) return [];
    return [{
      comments: record.reviewComments,
      reviewedAt: record.reviewedAt
    }];
  };

  const showComments = (record) => {
    const reviews = getLatestReviewComments(record) || [];
    setCommentModal({ open: true, comments: reviews, status: record.status });
  };

  const setFilterField = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
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
    pagination,
    handlePageChange,
    confirmDelete,
    showComments,
    getLatestReviewComments,
    navigate,
  };
};
