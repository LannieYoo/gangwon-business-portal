/**
 * Notices Preview Component - Member Portal
 * 公告预览组件 - 显示最近5条公告
 */

import './NoticesPreview.css';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@shared/components/Card';
import { apiService } from '@shared/services';
import { API_PREFIX, ROUTES } from '@shared/utils/constants';

function NoticesPreview() {
  const { t, i18n } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true);
      try {
        const params = {
          page: 1,
          page_size: 5, // 只加载最近5条
          category: 'announcement' // 只加载公告，不包括新闻
        };
        const response = await apiService.get(`${API_PREFIX}/content/notices`, params);
        
        // 处理不同的响应格式
        const noticesData = response.notices || response.data || [];
        if (Array.isArray(noticesData)) {
          const formattedNotices = noticesData.slice(0, 5).map(n => ({
            id: n.id,
            title: n.title,
            date: n.publishedAt ? new Date(n.publishedAt).toISOString().split('T')[0] : (n.date || ''),
            important: n.category === 'announcement' && (n.isImportant || false)
          }));
          setNotices(formattedNotices);
        } else {
          setNotices([]);
        }
      } catch (error) {
        console.error('Failed to load notices:', error);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, [i18n.language]);

  return (
    <section className="notices-section">
      <div className="section-header">
        <h2>{t('home.notices.title', '最新公告')}</h2>
        <Link to={ROUTES.MEMBER_NOTICES} className="view-all">
          {t('common.viewAll', '查看全部')}
        </Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>{t('common.loading', '加载中...')}</p>
        </div>
      ) : notices.length > 0 ? (
        <div className="notices-grid">
          {notices.map((notice) => (
            <Card key={notice.id} className="notice-card">
              <div className="notice-card-link">
                <div className="notice-card-header">
                  {notice.important && (
                    <span className="badge badge-danger">
                      {t('home.notices.important', '重要')}
                    </span>
                  )}
                  <span className="notice-card-date">{notice.date}</span>
                </div>
                <h3 className="notice-card-title">{notice.title}</h3>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="empty-state">
          <p className="notice-card-empty">
            {t('home.notices.empty', '暂无公告')}
          </p>
        </Card>
      )}
    </section>
  );
}

export default NoticesPreview;

