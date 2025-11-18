/**
 * Project Detail Page - Member Portal
 * 程序公告详情页面 - 包含程序申请弹窗
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import { ArrowLeftIcon } from '@shared/components/Icons';
import ApplicationModal from './ApplicationModal';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadAnnouncementDetail();
    }
  }, [id, i18n.language]); // Reload data when language changes

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
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    // 可以在这里执行成功后的操作，比如刷新数据
  };

  return (
    <>
      <div className="page-header">
        <Button
          onClick={() => navigate('/member/programs')}
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
              <Button onClick={handleApply} variant="primary">
                {t('projects.apply', '程序申请')}
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

      {/* 程序申请弹窗 */}
      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        announcement={announcement}
        onSuccess={handleApplicationSuccess}
      />
    </>
  );
}

