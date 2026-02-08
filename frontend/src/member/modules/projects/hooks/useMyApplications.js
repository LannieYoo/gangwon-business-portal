/**
 * 获取我的申请记录 Hook
 *
 * 封装获取用户申请记录的业务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback, useMemo } from "react";
import { projectService } from "../services/project.service";
import { useApiCache, clearCache } from "@shared/hooks/useApiCache";

export function useMyApplications() {
  const fetchApplications = useCallback(async () => {
    const params = {
      page: 1,
      pageSize: 100,
    };
    const response = await projectService.getMyApplications(params);
    return response && response.items ? response.items : [];
  }, []);

  const { data: applications, loading, error, refresh } = useApiCache(
    fetchApplications,
    'my-applications',
    {
      cacheDuration: 1 * 60 * 1000, // 1分钟缓存
      enabled: true
    }
  );

  const cancelApplication = useCallback(
    async (applicationId) => {
      try {
        await projectService.cancelApplication(applicationId);
        // 清除缓存并刷新
        clearCache('my-applications');
        await refresh();
        return true;
      } catch (error) {
        console.error("Failed to cancel application:", error);
        return false;
      }
    },
    [refresh],
  );

  // 使用 useMemo 确保返回稳定的数组引用
  const stableApplications = useMemo(() => applications ?? [], [applications]);

  return {
    applications: stableApplications,
    loading,
    error: error ? "Failed to load applications" : null,
    refresh,
    cancelApplication,
  };
}
