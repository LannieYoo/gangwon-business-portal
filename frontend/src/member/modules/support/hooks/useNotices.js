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
import { useApiCache } from "@shared/hooks/useApiCache";

/**
 * 获取公告列表的 Hook
 */
export function useNotices(pageSize = 20) {
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
        total: formattedNotices.length
      };
    }
    
    return {
      notices: [],
      total: 0
    };
  }, [i18n.language]);

  const { data, loading, error, refresh } = useApiCache(
    fetchNotices,
    `notices-list`,
    {
      cacheDuration: 1 * 60 * 1000, // 1分钟缓存（公告更新较频繁）
      enabled: true,
      deps: []
    }
  );

  // 根据重要性筛选
  const importanceFilteredNotices = useMemo(() => {
    if (!data?.notices) return [];
    if (!importanceFilter) return data.notices;
    
    if (importanceFilter === "important") {
      return data.notices.filter(n => n.important);
    } else if (importanceFilter === "normal") {
      return data.notices.filter(n => !n.important);
    }
    return data.notices;
  }, [data?.notices, importanceFilter]);

  const handleFilterChange = useCallback((filtered) => {
    setFilteredNotices(filtered);
  }, []);

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

  // 最终显示的公告：先按重要性筛选，再按搜索筛选
  const displayNotices = filteredNotices.length > 0 ? filteredNotices : importanceFilteredNotices;

  return {
    notices: displayNotices,
    allNotices: importanceFilteredNotices, // 传递给 SearchInput 的数据已经过重要性筛选
    loading,
    error: error ? t('common.error', '오류') : null,
    total: displayNotices.length,
    importanceFilter,
    setImportanceFilter,
    importanceOptions,
    handleFilterChange,
    handleNoticeClick,
    loadNotices: refresh,
  };
}
