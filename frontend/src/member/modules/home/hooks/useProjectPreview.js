/**
 * 支援事业预览 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { homeService } from "../services/home.service";
import { formatDate } from "@shared/utils";
import { ROUTES } from "@shared/utils/constants";
import { useApiCache } from "@shared/hooks/useApiCache";

/**
 * 处理支援事业预览逻辑的 Hook
 */
export function useProjectPreview() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    const response = await homeService.listProjects({
      page: 1,
      pageSize: 4,
    });

    if (response.items) {
      return response.items.map((p) => ({
        id: p.id,
        title: p.title,
        date: formatDate(p.createdAt, "yyyy-MM-dd", i18n.language),
        status: p.status || "active",
        imageUrl: p.imageUrl,
        attachments: p.attachments || [],
      }));
    }
    return [];
  }, [i18n.language]);

  const {
    data: projects,
    loading,
    error,
    refresh,
  } = useApiCache(fetchProjects, "projects-preview", {
    cacheDuration: 1 * 60 * 1000, // 1分钟缓存
    enabled: true,
    deps: [i18n.language],
  });

  const getBadgeInfo = useCallback(
    (project) => {
      const statusMap = {
        active: {
          text: t("member.projects.status.active", "진행중"),
          variant: "success",
        },
        inactive: {
          text: t("member.projects.status.inactive", "비활성"),
          variant: "secondary",
        },
        archived: {
          text: t("member.projects.status.archived", "보관됨"),
          variant: "secondary",
        },
      };
      return statusMap[project.status] || statusMap.active;
    },
    [t],
  );

  const handleProjectClick = useCallback(
    (projectId) => {
      navigate(`${ROUTES.MEMBER_PROJECTS}/${projectId}`);
    },
    [navigate],
  );

  return {
    projects: projects || [],
    loading,
    getBadgeInfo,
    handleProjectClick,
    t,
  };
}
