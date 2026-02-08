/**
 * 申请状态 Hook
 *
 * 提供申请状态的翻译和样式映射。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { ApplicationStatus } from "../enums";

export function useApplicationStatus() {
  const { t } = useTranslation();

  const getStatusInfo = useCallback(
    (status) => {
      const statusMap = {
        [ApplicationStatus.PENDING]: {
          label: t("member.projects.applicationRecords.status.pending", "접수 대기"),
          variant: "warning",
          canCancel: true,
        },
        [ApplicationStatus.SUBMITTED]: {
          label: t("member.projects.applicationRecords.status.submitted", "접수 완료"),
          variant: "info",
          canCancel: true,
        },
        [ApplicationStatus.UNDER_REVIEW]: {
          label: t("member.projects.applicationRecords.status.under_review", "심사중"),
          variant: "primary",
          canCancel: true,
        },
        [ApplicationStatus.REVIEWING]: {
          label: t("member.projects.applicationRecords.status.reviewing", "심사중"),
          variant: "primary",
          canCancel: true,
        },
        [ApplicationStatus.NEEDS_SUPPLEMENT]: {
          label: t(
            "projects.applicationRecords.status.needs_supplement",
            "보완 필요",
          ),
          variant: "warning",
          needsSupplement: true,
          canCancel: false,
        },
        [ApplicationStatus.APPROVED]: {
          label: t("member.projects.applicationRecords.status.approved", "승인"),
          variant: "success",
          canCancel: false,
        },
        [ApplicationStatus.REJECTED]: {
          label: t("member.projects.applicationRecords.status.rejected", "거절"),
          variant: "danger",
          canCancel: false,
          showRejectionReason: true,
        },
        [ApplicationStatus.CANCELLED]: {
          label: t("member.projects.applicationRecords.status.cancelled", "취소"),
          variant: "gray",
          canCancel: false,
        },
      };

      return (
        statusMap[status] || {
          label: status,
          variant: "gray",
          canCancel: false,
        }
      );
    },
    [t],
  );

  return { getStatusInfo };
}
