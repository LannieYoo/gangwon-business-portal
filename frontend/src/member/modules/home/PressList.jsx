/**
 * Press List Page - Member Portal
 * 新闻/보도자료列表页面
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import Card from '@shared/components/Card';
import LazyImage from '@shared/components/LazyImage';
import { Banner } from '@shared/components';
import { PageContainer } from '@member/layouts';
import { formatDate } from '@shared/utils/format';
import { contentService } from '@shared/services';
import { BANNER_TYPES } from '@shared/utils/constants';

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

function PressList() {
  const { t, i18n } = useTranslation();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await contentService.listPressReleases({
        page: 1,
        pageSize: 100  // 获取所有新闻，不分页
      });
      
      if (response.items) {
        const formattedNews = response.items.map(n => ({
          id: n.id,
          title: n.title,
          thumbnailUrl: n.imageUrl || n.image_url || null,
          publishedAt: (n.createdAt || n.created_at) ? formatDate((n.createdAt || n.created_at), 'yyyy-MM-dd', i18n.language) : ''
        }));
        setNewsList(formattedNews);
      }
    } catch (error) {
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  return (
    <div className="press-list w-full flex flex-col">
      <Banner
        bannerType={BANNER_TYPES.MAIN_PRIMARY}
        sectionClassName="mb-16"
        height="400px"
        fullWidth={true}
      />
      <PageContainer className="pb-8" fullWidth={false}>
        <div className="w-full">
          <div className="mb-6 sm:mb-8 lg:mb-10 min-h-[48px] flex items-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 m-0">{t('home.news.title', '新闻资料')}</h1>
          </div>

          {loading && newsList.length === 0 ? (
            <div className="text-center py-12 px-8">
              <p className="text-base text-gray-500 m-0">{t('common.loading', '加载中...')}</p>
            </div>
          ) : newsList.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-md:grid-cols-2 max-sm:grid-cols-1 gap-6 max-md:gap-4">
              {newsList.map((news, index) => {
                const bgColor = NEWS_COLORS[index % NEWS_COLORS.length];
                return (
                  <Card key={news.id} className="overflow-hidden flex-1 flex flex-col">
                    <div className="flex flex-col p-0 text-inherit no-underline h-full transition-transform hover:-translate-y-0.5">
                      <div className={`w-full h-[200px] overflow-hidden rounded-t-lg relative flex-shrink-0 ${bgColor}`}>
                        <LazyImage 
                          src={news.thumbnailUrl || generatePlaceholderImage()} 
                          alt={news.title}
                          placeholder={generatePlaceholderImage()}
                          className="!block !w-full !h-full flex-shrink-0 object-cover object-center"
                        />
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
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12 px-8">
              <p className="text-base text-gray-500 m-0">{t('home.news.empty', '暂无新闻资料')}</p>
            </Card>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

export default PressList;

