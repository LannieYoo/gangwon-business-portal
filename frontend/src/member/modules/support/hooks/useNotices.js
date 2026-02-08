/**
 * 公告列表业务逻辑 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportService } from "../services/support.service";
import { ROUTES } from "@shared/utils/constants";
import { formatDateTime } from "@shared/utils";
import { useApiCache, usePagination } from "@shared/hooks";

/**
 * 获取公告列表的 Hook
 */
export function useNotices(pageSize = 10) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [importanceFilter, setImportanceFilter] = useState("");

  const fetchNotices = useCallback(async () => {
    const response = await supportService.listNotices({
      page: 1,
      pageSize: 1000, // 获取所有数据用于前端过滤
    });

    const noticesData = response.items || [];
    if (Array.isArray(noticesData)) {
      const formattedNotices = noticesData.map((n) => ({
        id: n.id,
        title: n.title,
        date: n.createdAt
          ? formatDateTime(n.createdAt, "yyyy-MM-dd HH:mm", i18n.language)
          : "",
        important: n.boardType === "notice",
        attachments: n.attachments || [],
      }));

      return {
        notices: formattedNotices,
        total: formattedNotices.length,
      };
    }

    return {
      notices: [],
      total: 0,
    };
  }, [i18n.language]);

  const { data, loading, error, refresh } = useApiCache(
    fetchNotices,
    `notices-list`,
    {
      cacheDuration: 1 * 60 * 1000, // 1分钟缓存（公告更新较频繁）
      enabled: true,
      deps: [],
    },
  );

  // 根据重要性筛选
  const importanceFilteredNotices = useMemo(() => {
    if (!data?.notices) return [];
    if (!importanceFilter) return data.notices;

    if (importanceFilter === "important") {
      return data.notices.filter((n) => n.important);
    } else if (importanceFilter === "normal") {
      return data.notices.filter((n) => !n.important);
    }
    return data.notices;
  }, [data?.notices, importanceFilter]);

  // 最终过滤后的公告：先按重要性筛选，再按搜索筛选
  const allFilteredNotices =
    filteredNotices.length > 0 ? filteredNotices : importanceFilteredNotices;

  // 使用共享的分页 hook
  const pagination = usePagination({ items: allFilteredNotices, pageSize });

  const handleFilterChange = useCallback(
    (filtered) => {
      setFilteredNotices(filtered);
      pagination.resetPage();
    },
    [pagination],
  );

  // 重要性筛选改变时重置页码
  const handleImportanceFilterChange = useCallback(
    (value) => {
      setImportanceFilter(value);
      pagination.resetPage();
    },
    [pagination],
  );

  const handleNoticeClick = (noticeId) => {
    navigate(`${ROUTES.MEMBER_SUPPORT_NOTICES}/${noticeId}`);
  };

  const importanceOptions = useMemo(
    () => [
      { value: "", label: t("common.all", "전체") },
      { value: "important", label: t("home.notices.important", "중요") },
      { value: "normal", label: t("home.notices.normal", "일반") },
    ],
    [t],
  );

  return {
    notices: pagination.paginatedItems,
    allNotices: importanceFilteredNotices, // 传递给 SearchInput 的数据已经过重要性筛选
    loading,
    error: error ? t("common.error", "오류") : null,
    total: pagination.total,
    // 分页相关
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageSize: pagination.pageSize,
    onPageChange: pagination.onPageChange,
    // 筛选相关
    importanceFilter,
    setImportanceFilter: handleImportanceFilterChange,
    importanceOptions,
    handleFilterChange,
    handleNoticeClick,
    loadNotices: refresh,
  };
}
