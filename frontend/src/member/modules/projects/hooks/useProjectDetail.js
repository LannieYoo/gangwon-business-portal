/**
 * 获取项目详情 Hook
 *
 * 封装获取单个项目详情的业务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback } from "react";
import { projectService } from "../services/project.service";
import { useTranslation } from "react-i18next";
import { useApiCache } from "@shared/hooks/useApiCache";

export function useProjectDetail(id) {
  const { t } = useTranslation();

  const fetchProject = useCallback(async () => {
    if (!id) return null;
    
    const detail = await projectService.getProject(id);
    if (!detail) {
      throw new Error(t("common.notFound", "未找到该公告"));
    }
    return detail;
  }, [id, t]);

  const { data: project, loading, error, refresh } = useApiCache(
    fetchProject,
    `project-detail-${id}`,
    {
      cacheDuration: 2 * 60 * 1000, // 2分钟缓存（详情页更新较少）
      enabled: !!id,
      deps: [id]
    }
  );

  return {
    project,
    loading,
    error: error ? t('common.error', '오류') : null,
    refresh,
  };
}
