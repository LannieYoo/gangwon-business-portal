/**
 * Project List Page - Member Portal
 * 程序公告列表页面 - 支持搜索、分页、程序申请、详情查看
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@shared/components';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Select from '@shared/components/Select';
import { Pagination } from '@shared/components';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import { SearchIcon } from '@shared/components/Icons';
import ApplicationModal from './ApplicationModal';
import './ProjectList.css';

export default function ProjectList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, [i18n.language]); // Reload data when language changes

  useEffect(() => {
    filterAndPaginate();
  }, [announcements, searchKeyword, currentPage, pageSize]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/member/announcements`);
      if (response.records) {
        setAnnouncements(response.records);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginate = () => {
    let filtered = [...announcements];

    // 搜索过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(ann => 
        ann.title?.toLowerCase().includes(keyword) ||
        ann.content?.toLowerCase().includes(keyword)
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    filterAndPaginate();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleApply = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    setSelectedAnnouncement(null);
    // 可以在这里刷新列表或其他操作
  };

  // 处理查看详情的回调
  const handleViewDetail = (announcement) => {
    navigate(`/member/programs/${announcement.id}`);
  };

  // 计算分页
  const totalPages = Math.ceil(filteredAnnouncements.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  const pageSizeOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '30', label: '30' },
    { value: '50', label: '50' }
  ];

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

  // 显示列表
  return (
    <>
      <div className="page-header">
        <h1>{t('projects.title', '项目')}</h1>
      </div>

        {/* 搜索和分页设置 */}
        <Card>
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <Input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t('projects.searchPlaceholder', '按标题/内容搜索')}
                  className="search-input"
                />
                <Button type="submit" variant="primary">
                  <SearchIcon className="project-icon-search" />
                  {t('common.search', '搜索')}
                </Button>
              </div>
            </form>
            <div className="page-size-selector">
              <label>{t('projects.itemsPerPage', '每页显示')}:</label>
              <Select
                value={pageSize.toString()}
                onChange={handlePageSizeChange}
                options={pageSizeOptions}
              />
            </div>
          </div>
        </Card>

        {/* 公告列表 */}
        {loading ? (
          <Card>
            <div className="loading">
              <p>{t('common.loading', '加载中...')}</p>
            </div>
          </Card>
        ) : paginatedAnnouncements.length === 0 ? (
          <Card>
            <div className="no-data">
              <p>{t('common.noData', '暂无数据')}</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="announcements-list">
              {paginatedAnnouncements.map((announcement) => {
                const statusInfo = announcement.status ? getStatusInfo(announcement.status) : null;
                const typeLabel = announcement.type ? getTypeLabel(announcement.type) : null;
                
                return (
                  <Card key={announcement.id} className="announcement-card">
                    <div className="announcement-header">
                      <div className="announcement-title-section">
                        <h2 
                          className="announcement-title"
                          onClick={() => handleViewDetail(announcement)}
                        >
                          {announcement.title}
                        </h2>
                        <div className="announcement-meta">
                          {typeLabel && (
                            <Badge variant="primary" className="announcement-type">
                              {typeLabel}
                            </Badge>
                          )}
                          {statusInfo && (
                            <Badge variant={statusInfo.variant} className="announcement-status">
                              {statusInfo.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="announcement-date">
                        {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="announcement-content">
                      <p>{announcement.summary || announcement.content?.substring(0, 200)}...</p>
                    </div>
                    <div className="announcement-footer">
                      <Button
                        onClick={() => handleApply(announcement)}
                        variant="primary"
                      >
                        {t('projects.apply', '程序申请')}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="pagination-section">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

      {/* 程序申请弹窗 */}
      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        announcement={selectedAnnouncement}
        onSuccess={handleApplicationSuccess}
      />
    </>
  );
}

