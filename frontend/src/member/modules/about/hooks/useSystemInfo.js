/**
 * 系统介绍 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { aboutService } from "../services/about.service";
import { useApiCache } from "@shared/hooks/useApiCache";

/**
 * 获取系统介绍信息的 Hook
 */
export function useSystemInfo() {
  const { t, i18n } = useTranslation();

  const fetchSystemInfo = useCallback(async () => {
    const data = await aboutService.getSystemInfo();
    if (data && data.contentHtml) {
      return data.contentHtml;
    }
    return "";
  }, []);

  const { data: htmlContent, loading, error: apiError } = useApiCache(
    fetchSystemInfo,
    `system-info-${i18n.language}`,
    {
      cacheDuration: 10 * 60 * 1000, // 10分钟缓存（系统信息很少更新）
      enabled: true,
      deps: [i18n.language]
    }
  );

  const error = apiError ? t("about.fetchError", "Failed to fetch content") : null;

  return { 
    htmlContent: htmlContent || "", 
    loading, 
    error 
  };
}
