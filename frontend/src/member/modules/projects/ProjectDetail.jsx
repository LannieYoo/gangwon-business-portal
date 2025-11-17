/**
 * Project Detail Page - Member Portal
 * 程序公告详情页面 - 包含程序申请弹窗
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Banner, Submenu, Modal } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import { PaperclipIcon, XIcon, DocumentIcon, ArrowLeftIcon } from '@shared/components/Icons';
import useAuthStore from '@shared/stores/authStore';
import './Projects.css';

export default function ProjectDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationFiles, setApplicationFiles] = useState([]);

  useEffect(() => {
    if (id) {
      loadAnnouncementDetail();
    }
  }, [id]);

  const loadAnnouncementDetail = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/member/announcements/${id}`);
      if (response.record) {
        setAnnouncement(response.record);
      }
    } catch (error) {
      console.error('Failed to load announcement detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setApplicationFiles([]);
    setShowApplicationModal(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - applicationFiles.length);
    setApplicationFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setApplicationFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitApplication = async () => {
    if (!user?.id) {
      alert(t('common.loginRequired', '请先登录'));
      return;
    }

    if (applicationFiles.length === 0) {
      alert(t('projects.uploadAtLeastOneFile', '请至少上传一个附件'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('announcementId', announcement.id);
      formData.append('memberId', user.id);
      applicationFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      await apiService.post(`${API_PREFIX}/member/project-applications`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(t('message.submitSuccess', '提交成功'));
      setShowApplicationModal(false);
      setApplicationFiles([]);
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert(t('message.submitFailed', '提交失败'));
    }
  };

  return (
    <div className="projects">
      <Banner
        bannerType={BANNER_TYPES.PROJECTS}
        sectionClassName="member-banner-section"
      />
      <Submenu
        items={[{
          key: 'projects-list',
          path: '/member/projects',
          label: t('projects.title', '项目'),
          exact: true
        }]}
        className="projects-submenu"
        headerSelector=".member-header"
      />

      <div className="projects-content">
        <div className="page-header">
          <Button
            onClick={() => navigate('/member/projects')}
            variant="text"
            className="back-button"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {t('common.back', '返回')}
          </Button>
          <h1>{t('projects.detail', '项目详情')}</h1>
        </div>

        {loading ? (
          <Card>
            <div className="loading">
              <p>{t('common.loading', '加载中...')}</p>
            </div>
          </Card>
        ) : announcement ? (
          <Card className="announcement-detail-card">
            <div className="announcement-detail-header">
              <h2>{announcement.title}</h2>
              <span className="announcement-date">
                {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : ''}
              </span>
            </div>
            <div className="announcement-detail-content">
              <div dangerouslySetInnerHTML={{ __html: announcement.content || '' }} />
            </div>
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="announcement-attachments">
                <h3>{t('projects.attachments', '附件')}</h3>
                <ul>
                  {announcement.attachments.map((attachment, index) => (
                    <li key={index}>
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        {attachment.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="announcement-detail-footer">
              <Button
                onClick={handleApply}
                variant="primary"
              >
                {t('projects.apply', '创业者申请')}
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="no-data">
              <p>{t('common.noData', '暂无数据')}</p>
            </div>
          </Card>
        )}
      </div>

      {/* 创业者申请弹窗 */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={t('projects.apply', '创业者申请')}
      >
        {announcement && (
          <div className="application-modal">
            <div className="announcement-info">
              <h3>{announcement.title}</h3>
            </div>

            <div className="form-section">
              <label>{t('projects.uploadFiles', '上传附件')} (最多5个) *</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="application-files"
                  multiple
                  onChange={handleFileUpload}
                  disabled={applicationFiles.length >= 5}
                  style={{ display: 'none' }}
                />
                <Button
                  onClick={() => document.getElementById('application-files').click()}
                  variant="secondary"
                  disabled={applicationFiles.length >= 5}
                >
                  <PaperclipIcon className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
                  {t('common.upload', '上传')}
                </Button>
                <small className="form-hint">
                  {t('projects.maxFiles', '最多可上传5个文件')} ({applicationFiles.length}/5)
                </small>
              </div>

              {applicationFiles.length > 0 && (
                <div className="uploaded-files">
                  {applicationFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <DocumentIcon className="w-4 h-4" />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <Button
                        onClick={() => handleRemoveFile(index)}
                        variant="text"
                        size="small"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <Button
                onClick={() => setShowApplicationModal(false)}
                variant="secondary"
              >
                {t('common.cancel', '取消')}
              </Button>
              <Button
                onClick={handleSubmitApplication}
                variant="primary"
                disabled={applicationFiles.length === 0}
              >
                {t('common.submit', '提交')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

