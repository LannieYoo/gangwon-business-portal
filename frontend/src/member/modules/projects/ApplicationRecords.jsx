/**
 * Application Records Page - Member Portal
 * 申请记录查询页面 - 显示会员的项目申请记录
 * Requirements: 7.1-7.14
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge, Button, Input, Card, Pagination, Modal } from '@shared/components';
import { formatDate } from '@shared/utils';
import { SearchIcon, CloseIcon } from '@shared/components/Icons';
import { projectService } from '@shared/services';

export default function ApplicationRecords() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [supplementFiles, setSupplementFiles] = useState([]);
  const [supplementLoading, setSupplementLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    const params = {
      page: currentPage,
      pageSize: pageSize,
      search: searchKeyword || undefined,
    };
    const response = await projectService.getMyApplications(params);
    if (response && response.records) {
      setApplications(response.records);
      setTotalPages(response.pagination?.totalPages || 0);
      setTotal(response.pagination?.total || 0);
    }
    setLoading(false);
  }, [currentPage, pageSize, searchKeyword]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadApplications();
  }, [loadApplications]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setCurrentPage(1);
      loadApplications();
    }
  }, [loadApplications]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (value === '') {
      setCurrentPage(1);
    }
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getStatusInfo = useCallback((status) => {
    const statusMap = {
      pending: { label: t('projects.applicationRecords.status.pending', '접수 대기'), variant: 'warning', canCancel: true },
      submitted: { label: t('projects.applicationRecords.status.submitted', '접수 완료'), variant: 'info', canCancel: true },
      under_review: { label: t('projects.applicationRecords.status.under_review', '심사중'), variant: 'primary', canCancel: true },
      reviewing: { label: t('projects.applicationRecords.status.reviewing', '심사중'), variant: 'primary', canCancel: true },
      needs_supplement: { label: t('projects.applicationRecords.status.needs_supplement', '보완 필요'), variant: 'warning', needsSupplement: true, canCancel: false },
      approved: { label: t('projects.applicationRecords.status.approved', '승인'), variant: 'success', canCancel: false },
      rejected: { label: t('projects.applicationRecords.status.rejected', '거절'), variant: 'danger', canCancel: false, showRejectionReason: true },
      cancelled: { label: t('projects.applicationRecords.status.cancelled', '취소'), variant: 'gray', canCancel: false }
    };
    return statusMap[status] || { label: status, variant: 'gray', canCancel: false };
  }, [t]);

  const handleCancelClick = useCallback((application) => {
    setSelectedApplication(application);
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!selectedApplication) return;
    setCancelLoading(true);
    const response = await projectService.cancelApplication(selectedApplication.id);
    setCancelLoading(false);
    if (response) {
      setShowCancelModal(false);
      setSelectedApplication(null);
      loadApplications();
    }
  }, [selectedApplication, loadApplications]);

  const handleViewRejectionReason = useCallback((application) => {
    setSelectedApplication(application);
    setShowRejectionModal(true);
  }, []);

  const handleSupplement = useCallback((application) => {
    setSelectedApplication(application);
    setSupplementFiles([]);
    setShowSupplementModal(true);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(t('projects.applicationRecords.fileTooLarge', '파일 크기가 너무 큽니다. (최대 10MB)'));
        return false;
      }
      return true;
    });
    setSupplementFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [t]);

  const handleRemoveFile = useCallback((index) => {
    setSupplementFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024;
      return file.size <= maxSize;
    });
    setSupplementFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleSubmitSupplement = useCallback(async () => {
    if (supplementFiles.length === 0) {
      alert(t('projects.applicationRecords.noFilesSelected', '파일을 선택해주세요.'));
      return;
    }
    setSupplementLoading(true);
    // TODO: Implement actual file upload API
    setTimeout(() => {
      setSupplementLoading(false);
      alert(t('projects.applicationRecords.featureComingSoon', '기능 준비 중입니다'));
      setShowSupplementModal(false);
      setSupplementFiles([]);
    }, 500);
  }, [supplementFiles, t]);

  const renderActionButtons = useCallback((application, isMobile = false) => {
    const statusInfo = getStatusInfo(application.status);
    const buttonClass = isMobile ? 'w-full' : '';
    const buttons = [];

    if (statusInfo.canCancel) {
      buttons.push(
        <Button
          key="cancel"
          variant="danger"
          size="sm"
          className={buttonClass}
          onClick={() => handleCancelClick(application)}
        >
          {t('projects.applicationRecords.cancelApplication', '신청 취소')}
        </Button>
      );
    }

    if (statusInfo.showRejectionReason) {
      buttons.push(
        <Button
          key="rejection"
          variant="secondary"
          size="sm"
          className={buttonClass}
          onClick={() => handleViewRejectionReason(application)}
        >
          {t('projects.applicationRecords.viewReason', '사유 확인')}
        </Button>
      );
    }

    if (statusInfo.needsSupplement) {
      buttons.push(
        <Button
          key="supplement"
          variant="outline"
          size="sm"
          className={buttonClass}
          onClick={() => handleSupplement(application)}
        >
          {t('projects.applicationRecords.submitMaterials', '자료 제출')}
        </Button>
      );
    }

    if (buttons.length === 0) {
      return <div className="flex justify-center"><span className="text-gray-400 text-sm">-</span></div>;
    }

    return (
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-2`}>
        {buttons}
      </div>
    );
  }, [getStatusInfo, handleCancelClick, handleViewRejectionReason, handleSupplement, t]);


  return (
    <div className="flex flex-col min-h-[calc(100vh-300px)]">
      <div className="mb-6 sm:mb-8 lg:mb-10 min-h-[48px] flex items-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 m-0">
          {t('projects.applicationRecords.title', '신청 기록')}
        </h1>
      </div>

      <Card className="p-4 sm:p-5 lg:p-6 mb-4">
        <form onSubmit={handleSearch} className="flex gap-3 items-center max-w-[600px]">
          <Input
            type="text"
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={t('projects.applicationRecords.searchPlaceholder', '사업명으로 검색')}
            inline={true}
            className="w-full flex-1"
          />
          <Button type="submit" variant="primary">
            <SearchIcon className="w-5 h-5" />
            {t('projects.applicationRecords.search', '검색')}
          </Button>
        </form>
      </Card>

      {loading ? (
        <Card>
          <div className="text-center py-12 px-4">
            <p className="text-base text-gray-500 m-0">{t('projects.applicationRecords.loading', '로딩중...')}</p>
          </div>
        </Card>
      ) : applications.length === 0 ? (
        <Card>
          <div className="text-center py-12 px-4">
            <p className="text-base text-gray-500 m-0">
              {t('projects.applicationRecords.noRecords', '신청 기록이 없습니다.')}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      {t('projects.applicationRecords.projectName', '사업명')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      {t('projects.applicationRecords.applicationDate', '신청일')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      {t('projects.applicationRecords.progressStatus', '진행 상태')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      {t('projects.applicationRecords.processedDate', '처리일')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      {t('projects.applicationRecords.action', '작업')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((application) => {
                    const statusInfo = getStatusInfo(application.status);
                    return (
                      <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 font-medium">
                            {application.projectTitle || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {application.submittedAt ? formatDate(application.submittedAt) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {application.reviewedAt ? formatDate(application.reviewedAt) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {renderActionButtons(application)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="md:hidden flex flex-col gap-4">
            {applications.map((application) => {
              const statusInfo = getStatusInfo(application.status);
              return (
                <Card key={application.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-gray-900 flex-1 pr-2">
                      {application.projectTitle || application.projectName || '-'}
                    </h3>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>{t('projects.applicationRecords.applicationDate', '신청일')}:</span>
                      <span>{application.applicationDate ? formatDate(application.applicationDate) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('projects.applicationRecords.processedDate', '처리일')}:</span>
                      <span>{application.reviewedAt ? formatDate(application.reviewedAt) : '-'}</span>
                    </div>
                  </div>
                  {renderActionButtons(application, true)}
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="sticky bottom-0 mt-auto py-3">
              <div className="flex justify-between items-center px-1 sm:px-0">
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {t('projects.applicationRecords.total', '총')}: {total}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Cancel Application Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t('projects.applicationRecords.cancelConfirm.title', '신청 취소')}
      >
        <div className="p-4">
          <p className="text-gray-700 mb-2">
            {t('projects.applicationRecords.cancelConfirm.message', '정말로 이 신청을 취소하시겠습니까?')}
          </p>
          <p className="text-sm text-red-500 mb-4">
            {t('projects.applicationRecords.cancelConfirm.warning', '취소 후에는 복구할 수 없습니다.')}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelLoading}
            >
              {t('projects.applicationRecords.cancelConfirm.cancel', '돌아가기')}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? t('projects.applicationRecords.loading', '로딩중...') : t('projects.applicationRecords.cancelConfirm.confirm', '취소하기')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title={t('projects.applicationRecords.rejectionReason.title', '거절 사유')}
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            {selectedApplication?.rejectionReason || t('projects.applicationRecords.rejectionReason.noReason', '거절 사유가 제공되지 않았습니다.')}
          </p>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowRejectionModal(false)}
            >
              {t('projects.applicationRecords.rejectionReason.close', '닫기')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Supplement Materials Modal */}
      <Modal
        isOpen={showSupplementModal}
        onClose={() => {
          setShowSupplementModal(false);
          setSupplementFiles([]);
        }}
        title={t('projects.applicationRecords.supplementTitle', '추가 자료 제출')}
      >
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('projects.applicationRecords.requestedMaterials', '요청된 자료')}
            </h4>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
              {selectedApplication?.supplementMessage || t('projects.applicationRecords.supplementDefaultMessage', '관리자가 요청한 추가 자료를 제출해 주세요.')}
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors"
            onClick={handleDropZoneClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p className="text-gray-500 text-sm">
              {t('projects.applicationRecords.uploadArea', '파일을 여기에 드래그하거나 클릭하여 업로드')}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {t('projects.applicationRecords.uploadHint', 'PDF, DOC, XLS 형식 지원, 최대 10MB')}
            </p>
          </div>

          {supplementFiles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('projects.applicationRecords.selectedFiles', '선택된 파일')} ({supplementFiles.length})
              </h4>
              <ul className="space-y-2">
                {supplementFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                    <span className="text-gray-700 truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSupplementModal(false);
                setSupplementFiles([]);
              }}
              disabled={supplementLoading}
            >
              {t('projects.applicationRecords.cancel', '취소')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitSupplement}
              disabled={supplementLoading || supplementFiles.length === 0}
            >
              {supplementLoading ? t('projects.applicationRecords.loading', '로딩중...') : t('projects.applicationRecords.submit', '제출')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

}
