/**
 * 申请记录页面视图
 *
 * 作为 Orchestrator，组合业务逻辑和展示组件。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback } from "react";
import { useApplicationRecords } from "../hooks/useApplicationRecords";
import { ProjectBanner } from "../components/ProjectBanner";
import { ProjectSubmenu } from "../components/ProjectSubmenu";
import { ProjectPageContainer } from "../components/ProjectPageContainer";
import { ApplicationRecordsHeader } from "../components/ApplicationRecords/ApplicationRecordsHeader";
import { ApplicationRecordsFilter } from "../components/ApplicationRecords/ApplicationRecordsFilter";
import { ApplicationRecordsList } from "../components/ApplicationRecords/ApplicationRecordsList";
import ApplicationActionButtons from "../components/ApplicationRecords/ApplicationActionButtons";
import CancelApplicationModal from "../components/ApplicationRecords/CancelApplicationModal";
import RejectionReasonModal from "../components/ApplicationRecords/RejectionReasonModal";
import SupplementMaterialsModal from "../components/ApplicationRecords/SupplementMaterialsModal";
import { Pagination } from "@shared/components";

export default function ApplicationRecordsView() {
  const {
    allApplications,
    filteredApplications,
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
    total,
    currentPage,
    totalPages,
    onPageChange,
  } = useApplicationRecords();

  const renderActionButtons = useCallback(
    (application) => (
      <ApplicationActionButtons
        application={application}
        onCancel={handleCancelClick}
        onViewReason={handleViewRejectionReason}
        onSupplement={handleSupplement}
      />
    ),
    [handleCancelClick, handleViewRejectionReason, handleSupplement],
  );

  return (
    <div className="application-records-view w-full flex flex-col">
      <ProjectBanner sectionClassName="member-banner-section" />
      <ProjectSubmenu />

      <ProjectPageContainer>
        <div className="flex flex-col min-h-[calc(100vh-280px)]">
          <ApplicationRecordsHeader />

          <ApplicationRecordsFilter
            allApplications={allApplications}
            columns={columns}
            onFilterChange={handleFilterChange}
            resultsCount={total}
          />

          <ApplicationRecordsList
            applications={filteredApplications}
            loading={loading}
            hasApplications={allApplications.length > 0}
            getStatusInfo={getStatusInfo}
            renderActionButtons={renderActionButtons}
          />

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </ProjectPageContainer>

      <CancelApplicationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelLoading}
      />

      <RejectionReasonModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        reason={selectedApplication?.reviewNote}
      />

      <SupplementMaterialsModal
        isOpen={showSupplementModal}
        onClose={() => {
          setShowSupplementModal(false);
          // TODO: Files in hook state might need manual reset if not handled by useEffect or onClose
        }}
        onSubmit={handleSubmitSupplement}
        supplementMessage={selectedApplication?.materialRequest}
        files={supplementFiles}
        onFilesSelected={handleFileSelect}
        onFileRemove={handleRemoveFile}
        loading={supplementLoading}
      />
    </div>
  );
}
