import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '@shared/components/Card';
import LazyImage from '@shared/components/LazyImage';
import { contentService } from '@shared/services';
import { formatDate } from '@shared/utils/format';
import { ROUTES } from '@shared/utils/constants';

// 新闻卡片颜色配置（与后端 generate_news_images.py 保持一致）
const NEWS_COLORS = [
  'bg-blue-700',      // 0: 数字化转型
  'bg-emerald-600',   // 1: 生物产业
  'bg-violet-600',    // 2: IT海外进出
  'bg-red-600',       // 3: 支援实绩
  'bg-orange-600',    // 4: 投资诱致
  'bg-green-600',     // 5: 环保能源
  'bg-cyan-600',      // 6: 医疗器械
  'bg-pink-700',      // 7: 观光数字化
];

// 生成占位符图片
const generatePlaceholderImage = (width = 400, height = 250) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
        News
      </text>
    </svg>
  `.trim();
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

function PressPreview() {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadNews = useCallback(async () => {
    setLoading(true);
    // 使用 contentService 获取最新1条新闻稿
    const newsItem = await contentService.getLatestPressRelease();
    
    if (newsItem) {
      setNews({
        id: newsItem.id,
        title: newsItem.title,
        thumbnailUrl: newsItem.imageUrl || newsItem.image_url || null,
        publishedAt: (newsItem.createdAt || newsItem.created_at) ? formatDate((newsItem.createdAt || newsItem.created_at), 'yyyy-MM-dd', i18n.language) : ''
      });
    } else {
      setNews(null);
    }
    setLoading(false);
  }, [i18n.language]);

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]); // 直接依赖 i18n.language，避免 loadNews 变化导致重复请求

  return (
    <section className="news-section w-full flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 flex-shrink-0 max-md:flex-col max-md:items-start max-md:gap-2 max-md:mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 m-0">{t('home.news.title')}</h2>
        <Link to={ROUTES.MEMBER_PRESS} className="text-blue-600 no-underline text-sm font-medium transition-colors hover:text-blue-500 hover:underline">
          {t('common.viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          <p>{t('common.loading')}</p>
        </div>
      ) : news ? (
        <Card className="overflow-hidden flex-1 flex flex-col">
          <Link to={ROUTES.MEMBER_PRESS} className="flex flex-col p-0 text-inherit no-underline h-full transition-transform hover:-translate-y-0.5">
            <div className={`w-full h-[200px] overflow-hidden rounded-t-lg relative flex-shrink-0 ${NEWS_COLORS[0]}`}>
              <LazyImage 
                src={news.thumbnailUrl || generatePlaceholderImage()} 
                alt={news.title}
                placeholder={generatePlaceholderImage()}
                className="!block !w-full !h-full flex-shrink-0 object-cover object-center"
              />
              {/* 文字叠加层 */}
              <div className="absolute inset-0 flex items-center justify-center p-4"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))' }}>
                <h3 className="text-lg font-bold text-white text-center m-0 leading-snug line-clamp-3"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                  {news.title}
                </h3>
              </div>
            </div>
            <div className="flex flex-col p-4 gap-2">
              <h3 className="text-base font-semibold text-gray-900 m-0 leading-snug line-clamp-2">{news.title}</h3>
              <span className="text-sm text-gray-400">{news.publishedAt}</span>
            </div>
          </Link>
        </Card>
      ) : (
        <Card className="p-8 text-center text-gray-500">
          <p>{t('home.news.empty')}</p>
        </Card>
      )}
    </section>
  );
}

export default PressPreview;

