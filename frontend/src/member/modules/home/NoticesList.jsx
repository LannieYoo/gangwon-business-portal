/**
 * Notices List Page - Member Portal
 * 公告列表页面
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import Card from '@shared/components/Card';
import { formatDateTime } from '@shared/utils';
import { Badge, Banner, Modal } from '@shared/components';
import { PageContainer } from '@member/layouts';
import { apiService, contentService } from '@shared/services';
import { API_PREFIX, BANNER_TYPES } from '@shared/utils/constants';

function NoticesList() {
  const { t, i18n } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 详情模态框状态
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = {
      page: 1,
      page_size: 100  // 获取所有公告，不分页
    };
    const response = await apiService.get(`${API_PREFIX}/notices`, params);
    
    // 处理后端返回的数据格式
    const noticesData = response.items || [];
    if (Array.isArray(noticesData)) {
      const formattedNotices = noticesData.map(n => ({
        id: n.id,
        title: n.title,
        date: (n.createdAt || n.created_at) ? formatDateTime((n.createdAt || n.created_at), 'yyyy-MM-dd HH:mm', i18n.language) : '',
        important: (n.boardType || n.board_type) === 'notice'
      }));
      setNotices(formattedNotices);
    } else {
      setNotices([]);
    }
    setLoading(false);
  }, [i18n.language]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  // 点击公告查看详情
  const handleNoticeClick = async (noticeId) => {
    setDetailLoading(true);
    const detail = await contentService.getNotice(noticeId);
    if (detail) {
      setSelectedNotice({
        id: detail.id,
        title: detail.title,
        contentHtml: detail.contentHtml || detail.content_html || '',
        date: detail.createdAt || detail.created_at,
        important: (detail.boardType || detail.board_type) === 'notice',
        viewCount: detail.viewCount || detail.view_count || 0
      });
    }
    setDetailLoading(false);
  };

  const handleCloseModal = () => {
    setSelectedNotice(null);
  };

  return (
    <div className="notices-list w-full flex flex-col">
      <Banner
        bannerType={BANNER_TYPES.MAIN_PRIMARY}
        sectionClassName="mb-16"
        height="400px"
        fullWidth={true}
      />
      <PageContainer className="pb-8" fullWidth={false}>
        <div className="w-full">
          <div className="mb-6 sm:mb-8 lg:mb-10 min-h-[48px] flex items-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 m-0">{t('home.notices.title', '最新公告')}</h1>
          </div>

          {loading && notices.length === 0 ? (
            <div className="text-center py-12 px-8">
              <p className="text-base text-gray-500 m-0">{t('common.loading', '加载中...')}</p>
            </div>
          ) : error ? (
            <Card className="text-center py-12 px-8 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-base text-red-600 mb-4 m-0">{error}</p>
              <button 
                className="px-6 py-2 bg-red-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-red-700" 
                onClick={loadNotices}
              >
                {t('common.retry', '重试')}
              </button>
            </Card>
          ) : notices.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-md:grid-cols-2 max-sm:grid-cols-1 gap-5 max-md:gap-4">
              {notices.map((notice) => (
                <Card 
                  key={notice.id} 
                  className="h-full flex flex-col rounded-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  onClick={() => handleNoticeClick(notice.id)}
                >
                  <div className="flex flex-col p-5 no-underline text-inherit h-full flex-1">
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <Badge variant={notice.important ? "danger" : "secondary"}>
                        {notice.important ? t('home.notices.important', '重要') : t('home.notices.normal', '一般')}
                      </Badge>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {notice.date || '-'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 m-0 leading-normal flex-1 line-clamp-2">{notice.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 px-8">
              <p className="text-base text-gray-500 m-0">{t('home.notices.empty', '暂无公告')}</p>
            </Card>
          )}

          {/* 公告详情模态框 */}
          <Modal
            isOpen={!!selectedNotice || detailLoading}
            onClose={handleCloseModal}
            title={selectedNotice?.title || t('common.loading', '加载中...')}
            size="lg"
          >
            {detailLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('common.loading', '加载中...')}</p>
              </div>
            ) : selectedNotice ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-500 border-b pb-3">
                  <Badge variant={selectedNotice.important ? "danger" : "secondary"}>
                    {selectedNotice.important ? t('home.notices.important', '重要') : t('home.notices.normal', '一般')}
                  </Badge>
                  <span>{selectedNotice.date ? formatDateTime(selectedNotice.date, 'yyyy-MM-dd HH:mm', i18n.language) : '-'}</span>
                  <span>{t('admin.content.notices.views', '浏览')}: {selectedNotice.viewCount}</span>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedNotice.contentHtml }}
                />
              </div>
            ) : null}
          </Modal>
        </div>
      </PageContainer>
    </div>
  );
}

export default NoticesList;
