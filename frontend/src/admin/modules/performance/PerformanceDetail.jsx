/**
 * Performance Detail Component - Admin Portal (Refactored)
 * 业绩详情页面 - 使用 TabContainer 重构
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Loading, Modal, Textarea, Alert, TabContainer } from '@shared/components';
import { adminService, uploadService } from '@shared/services';
import { useDateFormatter, useMessage } from '@shared/hooks';
import { SalesEmploymentTab, GovernmentSupportTab, IntellectualPropertyTab } from './components';

export default function PerformanceDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const currentLanguage = i18n.language === 'zh' ? 'zh' : 'ko';
  const { formatDateTime, formatDate: formatDateOnly, formatNumber, formatValue } = useDateFormatter();
  const { message, messageVariant, showSuccess, showError, showWarning, clearMessage } = useMessage();
  
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [member, setMember] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    loadPerformanceDetail();
  }, [id]);

  const loadPerformanceDetail = async () => {
    setLoading(true);
    const recordData = await adminService.getPerformanceRecord(id);
    if (recordData) {
      setRecord(recordData);
      
      if (recordData.memberId) {
        const memberData = await adminService.getMemberDetail(recordData.memberId);
        setMember(memberData);
      }
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    await adminService.approvePerformance(id);
    showSuccess(t('admin.performance.approveSuccess', '批准成功'));
    loadPerformanceDetail();
  };

  const handleRequestRevision = async () => {
    if (!reviewComment.trim()) {
      showWarning(t('admin.performance.revisionCommentRequired', '请输入修改意见'));
      return;
    }

    await adminService.requestPerformanceRevision(id, reviewComment);
    showSuccess(t('admin.performance.revisionSuccess', '修改请求已发送'));
    setShowReviewModal(false);
    setReviewComment('');
    loadPerformanceDetail();
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      showWarning(t('admin.performance.rejectCommentRequired', '请输入驳回原因'));
      return;
    }

    await adminService.rejectPerformance(id, rejectComment);
    showSuccess(t('admin.performance.rejectSuccess', '驳回成功'));
    setShowRejectModal(false);
    setRejectComment('');
    loadPerformanceDetail();
  };

  const handleDownload = async (fileId, filename = null) => {
    if (!fileId) {
      showError(t('admin.performance.detail.fileNotFound', '文件不存在'));
      return;
    }

    await uploadService.downloadFile(fileId, filename);
  };

  const handleDownloadByUrl = async (fileUrl, filename = null) => {
    if (!fileUrl) {
      showError(t('admin.performance.detail.fileNotFound', '文件不存在'));
      return;
    }

    await uploadService.downloadFileByUrl(fileUrl, filename);
  };

  const getStatusVariant = (status) => {
    const variantMap = {
      approved: 'success',
      submitted: 'info',
      pending: 'warning',
      revision_requested: 'warning',
      revision_required: 'warning',
      draft: 'secondary',
      rejected: 'danger'
    };
    return variantMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusLabelMap = {
      approved: t('performance.status.approved', '已批准'),
      submitted: t('performance.status.submitted', '已提交'),
      pending: t('performance.status.submitted', '已提交'),
      revision_requested: t('performance.status.revisionRequested', '需修改'),
      revision_required: t('performance.status.revisionRequested', '需修改'),
      draft: t('performance.status.draft', '草稿'),
      rejected: t('performance.status.rejected', '已驳回')
    };
    return statusLabelMap[status] || status;
  };

  // 使用 useMemo 缓存 tabs 配置
  const tabs = useMemo(() => {
    if (!record) return [];
    
    return [
      {
        key: 'salesEmployment',
        label: t('performance.tabs.salesEmployment', '销售雇佣'),
        content: (
          <SalesEmploymentTab
            record={record}
            currentLanguage={currentLanguage}
            onDownload={handleDownload}
            onDownloadByUrl={handleDownloadByUrl}
          />
        )
      },
      {
        key: 'governmentSupport',
        label: t('performance.tabs.governmentSupport', '政府支持受惠历史'),
        content: (
          <GovernmentSupportTab
            record={record}
            currentLanguage={currentLanguage}
            onDownload={handleDownload}
            onDownloadByUrl={handleDownloadByUrl}
          />
        )
      },
      {
        key: 'intellectualProperty',
        label: t('performance.tabs.intellectualProperty', '知识产权'),
        content: (
          <IntellectualPropertyTab
            record={record}
            onDownload={handleDownload}
            onDownloadByUrl={handleDownloadByUrl}
          />
        )
      }
    ];
  }, [record, currentLanguage, t]);

  if (loading) {
    return <Loading />;
  }

  if (!record) {
    return (
      <div className="p-12 text-center text-red-600">
        <p className="mb-6">{t('admin.performance.detail.notFound', '业绩记录不存在')}</p>
        <Button onClick={() => navigate('/admin/performance')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const canApprove = record.status === 'submitted' || record.status === 'pending';

  return (
    <div className="w-full">
      {message && (
        <Alert variant={messageVariant} className="mb-4" onClose={clearMessage}>
          {message}
        </Alert>
      )}
      
      {/* 顶部操作按钮 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/performance')}>
            {t('common.back')}
          </Button>
        </div>
        {canApprove && (
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewModal(true)}
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
            >
              {t('admin.performance.requestRevision')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectModal(true)}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              {t('admin.performance.reject', '驳回')}
            </Button>
            <Button onClick={handleApprove}>
              {t('admin.performance.approve')}
            </Button>
          </div>
        )}
      </div>

      {/* 基本信息卡片 */}
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 m-0">
            {t('admin.performance.detail.basicInfo', '基本信息')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {member && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  {t('admin.performance.table.memberName', '企业名称')}
                </label>
                <span className="text-base text-gray-900">
                  {member.companyName || member.businessNumber || '-'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  {t('admin.members.detail.businessNumber', '营业执照号')}
                </label>
                <span className="text-base text-gray-900">
                  {member.businessNumber || '-'}
                </span>
              </div>
            </>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('admin.performance.table.year', '年度')}
            </label>
            <span className="text-base text-gray-900">{record.year || '-'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('admin.performance.table.quarter', '季度')}
            </label>
            <span className="text-base text-gray-900">
              {record.quarter ? `Q${record.quarter}` : t('performance.annual', '年度')}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('admin.performance.table.companyPhone', '公司电话')}
            </label>
            <span className="text-base text-gray-900">{record.memberPhone || '-'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('admin.performance.table.submittedAt', '提交时间')}
            </label>
            <span className="text-base text-gray-900">{formatDateTime(record.submittedAt)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('admin.performance.detail.createdAt', '创建时间')}
            </label>
            <span className="text-base text-gray-900">{formatDateTime(record.createdAt)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('admin.performance.detail.updatedAt', '更新时间')}
            </label>
            <span className="text-base text-gray-900">{formatDateTime(record.updatedAt)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('admin.performance.statusLabel')}
            </label>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(record.status)}>
                {getStatusLabel(record.status)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* 业绩数据 - 使用 TabContainer */}
      <TabContainer
        tabs={tabs}
        defaultTab="salesEmployment"
        withCard={true}
        cardClassName="mb-6"
        contentClassName="p-0"
      />

      {/* 补正请求模态框 */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewComment('');
        }}
        title={t('admin.performance.revisionModal.title')}
      >
        <div className="flex flex-col gap-3 md:gap-4">
          <p>{t('admin.performance.revisionModal.description')}</p>
          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder={t('admin.performance.revisionModal.placeholder')}
            rows={5}
          />
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowReviewModal(false);
                setReviewComment('');
              }}
              className="w-full md:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleRequestRevision}
              className="w-full md:w-auto"
            >
              {t('admin.performance.requestRevision')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 驳回模态框 */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectComment('');
        }}
        title={t('admin.performance.rejectModal.title', '驳回业绩记录')}
      >
        <div className="flex flex-col gap-3 md:gap-4">
          <p>{t('admin.performance.rejectModal.description', '请输入驳回原因。')}</p>
          <Textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder={t('admin.performance.rejectModal.placeholder', '请输入驳回原因...')}
            rows={5}
          />
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectModal(false);
                setRejectComment('');
              }}
              className="w-full md:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleReject}
              variant="outline"
              className="w-full md:w-auto border-red-600 text-red-600 hover:bg-red-50"
            >
              {t('admin.performance.reject', '驳回')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
