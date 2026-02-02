/**
 * 获取项目列表 Hook
 *
 * 封装获取项目列表的业务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback, useMemo } from "react";
import { projectService } from "../services/project.service";
import { useApiCache } from "@shared/hooks/useApiCache";

export function useProjects() {
  const fetchProjects = useCallback(async () => {
    const params = {
      page: 1,
      pageSize: 100,
      status: "active",
    };

    const response = await projectService.listProjects(params);
    return response && response.items ? response.items : [];
  }, []);

  const { data: projects, loading, error, refresh } = useApiCache(
    fetchProjects,
    'projects-list',
    {
      cacheDuration: 1 * 60 * 1000, // 1分钟缓存
      enabled: true
    }
  );

  // 使用 useMemo 确保返回稳定的数组引用
  const stableProjects = useMemo(() => projects ?? [], [projects]);

  return {
    projects: stableProjects,
    loading,
    error,
    refresh,
  };
}
