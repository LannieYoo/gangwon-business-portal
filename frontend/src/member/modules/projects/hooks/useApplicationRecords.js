/**
 * 申请记录业务逻辑 Hook
 *
 * 处理申请记录获取、筛选、搜索、取消申请、补充资料及弹窗状态。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@shared/utils";
import { usePagination } from "@shared/hooks";
import { useMyApplications } from "./useMyApplications";
import { useApplicationStatus } from "./useApplicationStatus";

export function useApplicationRecords(pageSize = 10) {
  const { t } = useTranslation();
  const {
    applications: allApplications,
    loading,
    refresh,
    cancelApplication,
  } = useMyApplications();

  const [filteredApplications, setFilteredApplications] =
    useState(allApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [supplementFiles, setSupplementFiles] = useState([]);
  const [supplementLoading, setSupplementLoading] = useState(false);

  // Initialize filtered applications when data loads
  useEffect(() => {
    setFilteredApplications(allApplications);
  }, [allApplications]);

  // 使用共享的分页 hook
  const pagination = usePagination({ items: filteredApplications, pageSize });

  const handleFilterChange = useCallback(
    (filtered) => {
      setFilteredApplications(filtered);
      pagination.resetPage();
    },
    [pagination],
  );

  const { getStatusInfo } = useApplicationStatus();

  const handleCancelClick = useCallback((application) => {
    setSelectedApplication(application);
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!selectedApplication) return;
    setCancelLoading(true);
    const success = await cancelApplication(selectedApplication.id);
    setCancelLoading(false);
    if (success) {
      setShowCancelModal(false);
      setSelectedApplication(null);
    }
  }, [selectedApplication, cancelApplication]);

  const handleViewRejectionReason = useCallback((application) => {
    setSelectedApplication(application);
    setShowRejectionModal(true);
  }, []);

  const handleSupplement = useCallback((application) => {
    setSelectedApplication(application);
    setSupplementFiles([]);
    setShowSupplementModal(true);
  }, []);

  const handleFileSelect = useCallback(
    (files) => {
      const validFiles = files.filter((file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(
            t(
              "projects.applicationRecords.fileTooLarge",
              "파일 크기가 너무 큽니다.",
            ),
          );
          return false;
        }
        return true;
      });
      setSupplementFiles((prev) => [...prev, ...validFiles]);
    },
    [t],
  );

  const handleRemoveFile = useCallback((index) => {
    setSupplementFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitSupplement = useCallback(async () => {
    if (supplementFiles.length === 0) {
      alert(
        t(
          "member.projects.applicationRecords.noFilesSelected",
          "파일을 선택해주세요.",
        ),
      );
      return;
    }
    setSupplementLoading(true);
    // TODO: Implement actual file upload in hook
    setTimeout(() => {
      setSupplementLoading(false);
      alert(
        t(
          "member.projects.applicationRecords.featureComingSoon",
          "기능 준비 중입니다",
        ),
      );
      setShowSupplementModal(false);
      setSupplementFiles([]);
    }, 500);
  }, [supplementFiles, t]);

  const columns = [
    {
      key: "projectTitle",
      label: t("member.projects.applicationRecords.projectName", "사업명"),
      render: (value) => value || "-",
    },
    {
      key: "submittedAt",
      label: t("member.projects.applicationRecords.applicationDate", "신청일"),
      render: (value) => (value ? formatDate(value) : "-"),
    },
    {
      key: "status",
      label: t(
        "member.projects.applicationRecords.progressStatus",
        "진행 상태",
      ),
      render: (value) => {
        const statusInfo = getStatusInfo(value);
        return statusInfo.label;
      },
    },
    {
      key: "reviewedAt",
      label: t("member.projects.applicationRecords.processedDate", "처리일"),
      render: (value) => (value ? formatDate(value) : "-"),
    },
  ];

  return {
    allApplications,
    filteredApplications: pagination.paginatedItems,
    loading,
    selectedApplication,
    showCancelModal,
    showRejectionModal,
    showSupplementModal,
    cancelLoading,
    supplementFiles,
    supplementLoading,
    columns,
    getStatusInfo,
    handleFilterChange,
    handleCancelClick,
    handleConfirmCancel,
    handleViewRejectionReason,
    handleSupplement,
    handleFileSelect,
    handleRemoveFile,
    handleSubmitSupplement,
    setShowCancelModal,
    setShowRejectionModal,
    setShowSupplementModal,
    // 分页相关
    total: pagination.total,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageSize: pagination.pageSize,
    onPageChange: pagination.onPageChange,
  };
}
