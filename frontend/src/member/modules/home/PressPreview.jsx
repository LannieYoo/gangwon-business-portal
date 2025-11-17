import './PressPreview.css';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@shared/components/Card';
import { apiService } from '@shared/services';
import { API_PREFIX, ROUTES } from '@shared/utils/constants';

function PressPreview() {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const params = {
          page: 1,
          page_size: 1,
          category: 'news'
        };
        const response = await apiService.get(`${API_PREFIX}/content/notices`, params);
        
        if (response.notices && response.notices.length > 0) {
          const newsItem = response.notices[0];
          setNews({
            id: newsItem.id,
            title: newsItem.title,
            thumbnailUrl: newsItem.thumbnailUrl,
            publishedAt: new Date(newsItem.publishedAt).toISOString().split('T')[0]
          });
        } else {
          setNews(null);
        }
      } catch (error) {
        console.error('Failed to load news:', error);
        setNews(null);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [i18n.language]);

  return (
    <section className="news-section">
      <div className="section-header">
        <h2>{t('home.news.title')}</h2>
        <Link to={ROUTES.MEMBER_PRESS} className="view-all">
          {t('common.viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>{t('common.loading')}</p>
        </div>
      ) : news ? (
        <Card className="news-card">
          <Link to={ROUTES.MEMBER_PRESS} className="news-card-link">
            <div className="news-card-thumbnail">
              <img 
                src={news.thumbnailUrl || '/uploads/banners/news.png'} 
                alt={news.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  // 如果图片加载失败，使用默认占位图
                  if (e.target.src !== '/uploads/banners/news.png') {
                    e.target.src = '/uploads/banners/news.png';
                  }
                }}
              />
            </div>
            <div className="news-card-content">
              <h3 className="news-card-title">{news.title}</h3>
              <span className="news-card-date">{news.publishedAt}</span>
            </div>
          </Link>
        </Card>
      ) : (
        <Card className="empty-state">
          <p>{t('home.news.empty')}</p>
        </Card>
      )}
    </section>
  );
}

export default PressPreview;

