/**
 * 最新公告预览 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "@shared/utils";
import { homeService } from "../services/home.service";
import { ROUTES } from "@shared/utils/constants";
import { useApiCache } from "@shared/hooks/useApiCache";

/**
 * 处理最新公告预览逻辑的 Hook
 */
export function useNoticesPreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetchNotices = useCallback(async () => {
    const response = await homeService.getLatestNotices();
    const noticesData = Array.isArray(response)
      ? response
      : response.items || [];

    if (Array.isArray(noticesData) && noticesData.length > 0) {
      return noticesData.slice(0, 4).map((n) => ({
        id: n.id,
        title: n.title,
        date: n.createdAt ? formatDate(n.createdAt) : "",
        important: n.boardType === "notice",
        attachments: n.attachments || [],
      }));
    }
    return [];
  }, []);

  const {
    data: notices,
    loading,
    error,
    refresh,
  } = useApiCache(fetchNotices, "notices-preview", {
    cacheDuration: 1 * 60 * 1000, // 1分钟缓存
    enabled: true,
  });

  const getBadgeInfo = useCallback(
    (notice) => {
      return {
        variant: notice.important ? "danger" : "gray",
        text: notice.important
          ? t("member.home.notices.important", "중요")
          : t("member.home.notices.normal", "일반"),
      };
    },
    [t],
  );

  const handleNoticeClick = useCallback(
    (noticeId) => {
      navigate(`${ROUTES.MEMBER_SUPPORT_NOTICES}/${noticeId}`);
    },
    [navigate],
  );

  return {
    notices: notices || [],
    loading,
    getBadgeInfo,
    handleNoticeClick,
    t,
  };
}
