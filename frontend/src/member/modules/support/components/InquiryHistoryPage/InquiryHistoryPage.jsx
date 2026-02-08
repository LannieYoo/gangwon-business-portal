/**
 * 咨询历史页面组件 (内容组件)
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, Badge, Pagination } from "@shared/components";
import { PageContainer } from "@member/layouts";
import { useEnumTranslation } from "@shared/hooks";
import ThreadDetailModal from "@shared/components/ThreadDetailModal";
import { supportService } from "../../services/support.service";

import InquiryHistoryFilter from "./InquiryHistoryFilter";
import InquiryHistoryTable from "./InquiryHistoryTable";

/**
 * 咨询历史页面主体渲染组件 (内容)
 */
export default function InquiryHistoryPage(props) {
  const { t } = useTranslation();
  const { translateInquiryStatus, translateInquiryCategory } =
    useEnumTranslation();
  const {
    allThreads,
    filteredThreads,
    loading,
    selectedThreadId,
    statusFilter,
    setStatusFilter,
    handleFilterChange,
    openDetailModal,
    closeDetailModal,
    loadThreads,
    navigate,
    // 分页相关
    total,
    currentPage,
    totalPages,
    onPageChange,
  } = props;

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("common.all") },
      { value: "open", label: t("member.support.status.open") },
      { value: "resolved", label: t("member.support.status.resolved") },
      { value: "closed", label: t("member.support.status.closed") },
    ],
    [t],
  );

  const getStatusBadge = (status) => {
    const variants = {
      open: "success",
      resolved: "info",
      closed: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {translateInquiryStatus(status)}
      </Badge>
    );
  };

  const getCategoryBadge = (category) => {
    if (!category) return null;
    const categoryVariants = {
      support: "info",
      performance: "warning",
      general: "secondary",
    };
    return (
      <Badge variant={categoryVariants[category] || "secondary"} size="sm">
        {translateInquiryCategory(category)}
      </Badge>
    );
  };

  const filterColumns = useMemo(
    () => [
      { key: "subject", render: (value) => value || "" },
      {
        key: "category",
        render: (value) => (value ? translateInquiryCategory(value) : "-"),
      },
      { key: "status", render: (value) => translateInquiryStatus(value) },
    ],
    [translateInquiryStatus, translateInquiryCategory],
  );

  return (
    <PageContainer className="pb-8">
      <div className="w-full">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("member.support.inquiryHistory")}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {t(
              "member.support.inquiryHistoryDetails.description",
              "1:1 문의 내역 및 답변 확인",
            )}
          </p>
        </div>

        <InquiryHistoryFilter
          allThreads={allThreads}
          columns={filterColumns}
          handleFilterChange={handleFilterChange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
        />

        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              {t("common.resultsCount", "총 {{count}}건", { count: total })}
            </p>
            <InquiryHistoryTable
              loading={loading}
              filteredThreads={filteredThreads}
              allThreads={allThreads}
              openDetailModal={openDetailModal}
              navigate={navigate}
              getStatusBadge={getStatusBadge}
              getCategoryBadge={getCategoryBadge}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      <ThreadDetailModal
        threadId={selectedThreadId}
        isOpen={selectedThreadId !== null}
        onClose={closeDetailModal}
        onMessageSent={loadThreads}
        services={{
          getThread: supportService.getMemberThread,
          createMessage: supportService.createMemberThreadMessage,
        }}
      />
    </PageContainer>
  );
}
