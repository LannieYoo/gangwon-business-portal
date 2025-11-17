/**
 * Project List Page - Member Portal
 * 程序公告列表页面 - 支持搜索、分页、程序申请
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner, Submenu, Modal } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Select from '@shared/components/Select';
import { Pagination } from '@shared/components';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import { SearchIcon, PaperclipIcon, XIcon, DocumentIcon } from '@shared/components/Icons';
import useAuthStore from '@shared/stores/authStore';
import './Projects.css';

export default function ProjectList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [applicationFiles, setApplicationFiles] = useState([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

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
      formData.append('announcementId', selectedAnnouncement.id);
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
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert(t('message.submitFailed', '提交失败'));
    }
  };

  const handleViewDetail = (announcement) => {
    navigate(`/member/projects/${announcement.id}`);
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
                  <SearchIcon className="w-5 h-5" />
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
              {paginatedAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="announcement-card">
                  <div className="announcement-header">
                    <h2 
                      className="announcement-title"
                      onClick={() => handleViewDetail(announcement)}
                    >
                      {announcement.title}
                    </h2>
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
                      {t('projects.apply', '创业者申请')}
                    </Button>
                  </div>
                </Card>
              ))}
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
      </div>

      {/* 创业者申请弹窗 */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={t('projects.apply', '创业者申请')}
      >
        {selectedAnnouncement && (
          <div className="application-modal">
            <div className="announcement-info">
              <h3>{selectedAnnouncement.title}</h3>
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

