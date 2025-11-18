/**
 * Application Modal Component
 * 程序申请弹窗组件 - 可在列表和详情页面复用
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Modal, Badge, Button } from '@shared/components';
import { PaperclipIcon, XIcon, DocumentIcon } from '@shared/components/Icons';
import useAuthStore from '@shared/stores/authStore';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './ApplicationModal.css';

export default function ApplicationModal({ 
  isOpen, 
  onClose, 
  announcement,
  onSuccess 
}) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [applicationFiles, setApplicationFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 获取状态显示文本和样式
  const getStatusInfo = (status) => {
    const statusMap = {
      recruiting: {
        label: t('projects.status.recruiting', '모집중'),
        variant: 'success'
      },
      ongoing: {
        label: t('projects.status.ongoing', '진행중'),
        variant: 'primary'
      },
      closed: {
        label: t('projects.status.closed', '마감'),
        variant: 'gray'
      }
    };
    return statusMap[status] || { label: status, variant: 'gray' };
  };

  // 获取类型显示文本
  const getTypeLabel = (type) => {
    const typeMap = {
      startup: t('projects.types.startup', '창업 지원'),
      rd: t('projects.types.rd', 'R&D 지원'),
      export: t('projects.types.export', '수출 지원'),
      investment: t('projects.types.investment', '투자 유치')
    };
    return typeMap[type] || type;
  };

  // 处理文件上传
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - applicationFiles.length;
    if (remainingSlots > 0) {
      const filesToAdd = files.slice(0, remainingSlots);
      setApplicationFiles(prev => [...prev, ...filesToAdd]);
    }
    // 重置 input，允许重复选择同一文件
    e.target.value = '';
  };

  // 处理拖拽上传
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (applicationFiles.length < 5 && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).slice(0, 5 - applicationFiles.length);
      setApplicationFiles(prev => [...prev, ...files]);
    }
  };

  // 处理拖拽悬停
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 移除文件
  const handleRemoveFile = (index) => {
    setApplicationFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 提交申请
  const handleSubmitApplication = async () => {
    if (!user?.id) {
      alert(t('common.loginRequired', '请先登录'));
      return;
    }

    if (applicationFiles.length === 0) {
      alert(t('projects.uploadAtLeastOneFile', '请至少上传一个附件'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('announcementId', announcement.id);
      formData.append('memberId', user.id);
      applicationFiles.forEach((file) => {
        formData.append('files', file);
      });

      await apiService.post(`${API_PREFIX}/member/project-applications`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(t('message.submitSuccess', '提交成功'));
      
      // 清空文件列表
      setApplicationFiles([]);
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
      
      // 关闭弹窗
      onClose();
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert(t('message.submitFailed', '提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  // 关闭时清空文件
  const handleClose = () => {
    setApplicationFiles([]);
    onClose();
  };

  if (!announcement) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('projects.apply', '程序申请')}
    >
      <div className="application-modal">
        {/* 项目信息卡片 */}
        <div className="announcement-info-card">
          <div className="announcement-info-header">
            <div className="announcement-info-icon">
              <DocumentIcon className="project-icon-document-large" />
            </div>
            <div className="announcement-info-content">
              <h3 className="announcement-info-title">{announcement.title}</h3>
              <div className="announcement-info-badges">
                {announcement.type && (
                  <Badge variant="primary" className="announcement-type">
                    {getTypeLabel(announcement.type)}
                  </Badge>
                )}
                {announcement.status && (
                  <Badge 
                    variant={getStatusInfo(announcement.status).variant} 
                    className="announcement-status"
                  >
                    {getStatusInfo(announcement.status).label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 企业信息卡片 */}
        {user && (
          <div className="company-info-card">
            <div className="company-info-header">
              <h4 className="company-info-title">
                <svg className="company-info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t('projects.companyInfo', '企业信息')}
              </h4>
            </div>
            <div className="company-info-grid">
              <div className="info-item">
                <label className="info-label">{t('projects.companyId', '企业ID')}</label>
                <span className="info-value">{user.businessLicense || user.id}</span>
              </div>
              <div className="info-item">
                <label className="info-label">{t('projects.companyName', '企业名')}</label>
                <span className="info-value">{user.companyName || t('common.notSet', '未设置')}</span>
              </div>
              <div className="info-item">
                <label className="info-label">{t('projects.contactPerson', '负责人')}</label>
                <span className="info-value">{user.name || t('common.notSet', '未设置')}</span>
              </div>
            </div>
          </div>
        )}

        {/* 文件上传区域 */}
        <div className="form-section">
          <label className="form-label">
            {t('projects.uploadFiles', '上传附件')}
            <span className="form-required">*</span>
          </label>
          <div className="file-upload-container">
            <input
              type="file"
              id="application-files"
              multiple
              onChange={handleFileUpload}
              disabled={applicationFiles.length >= 5}
              style={{ display: 'none' }}
            />
            <div 
              className={`file-upload-dropzone ${applicationFiles.length >= 5 ? 'disabled' : ''}`}
              onClick={() => !(applicationFiles.length >= 5) && document.getElementById('application-files').click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="file-upload-icon">
                <PaperclipIcon className="project-icon-attach-large" />
              </div>
              <div className="file-upload-text">
                <p className="file-upload-primary">
                  {t('projects.clickOrDrag', '点击或拖拽文件到此处上传')}
                </p>
                <p className="file-upload-hint">
                  {t('projects.maxFiles', '最多可上传5个文件')} ({applicationFiles.length}/5)
                </p>
              </div>
            </div>
          </div>

          {/* 已上传文件列表 */}
          {applicationFiles.length > 0 && (
            <div className="uploaded-files-list">
              <h5 className="uploaded-files-title">{t('projects.uploadedFiles', '已上传文件')}</h5>
              <div className="uploaded-files-grid">
                {applicationFiles.map((file, index) => (
                  <div key={index} className="file-item-card">
                    <div className="file-item-icon">
                      <DocumentIcon className="project-icon-document" />
                    </div>
                    <div className="file-item-info">
                      <span className="file-name" title={file.name}>{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      className="file-item-remove"
                      onClick={() => handleRemoveFile(index)}
                      type="button"
                      aria-label={t('common.remove', '删除')}
                    >
                      <XIcon className="project-icon-close" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="modal-actions">
          <Button
            onClick={handleClose}
            variant="secondary"
            disabled={submitting}
          >
            {t('common.cancel', '取消')}
          </Button>
          <Button
            onClick={handleSubmitApplication}
            variant="primary"
            disabled={applicationFiles.length === 0 || submitting}
          >
            {submitting ? t('common.submitting', '提交中...') : t('common.submit', '提交')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

