/**
 * 项目状态 Hook
 *
 * 提供项目状态的翻译和样式映射。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { ProjectStatus } from "../enums";

export function useProjectStatus() {
  const { t } = useTranslation();

  const getStatusInfo = useCallback(
    (status) => {
      const statusMap = {
        [ProjectStatus.ACTIVE]: {
          label: t("member.projects.status.active", "진행중"),
          variant: "success",
        },
        [ProjectStatus.INACTIVE]: {
          label: t("member.projects.status.inactive", "비활성"),
          variant: "gray",
        },
        [ProjectStatus.ARCHIVED]: {
          label: t("member.projects.status.archived", "보관됨"),
          variant: "gray",
        },
        [ProjectStatus.RECRUITING]: {
          label: t("member.projects.status.recruiting", "모집중"),
          variant: "success",
        },
        [ProjectStatus.ONGOING]: {
          label: t("member.projects.status.ongoing", "진행중"),
          variant: "primary",
        },
        [ProjectStatus.CLOSED]: {
          label: t("member.projects.status.closed", "마감"),
          variant: "gray",
        },
      };
      return statusMap[status] || { label: status, variant: "gray" };
    },
    [t],
  );

  return { getStatusInfo };
}
