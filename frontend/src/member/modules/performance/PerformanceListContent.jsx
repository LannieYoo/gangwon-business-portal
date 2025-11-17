/**
 * Performance List Content - Member Portal
 * 成果查询页面内容组件
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Select from '@shared/components/Select';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@shared/components/Table';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import { SearchIcon, DownloadIcon, EditIcon, TrashIcon } from '@shared/components/Icons';
import './Performance.css';

export default function PerformanceListContent() {
  const { t } = useTranslation();
  const [performances, setPerformances] = useState([]);
  const [filteredPerformances, setFilteredPerformances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    year: '',
    quarter: '',
    status: ''
  });

  useEffect(() => {
    loadPerformances();
  }, []);

  useEffect(() => {
    filterPerformances();
  }, [performances, searchFilters]);

  const loadPerformances = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/member/performance`);
      if (response.records) {
        const formatted = response.records.map(r => ({
          id: r.id,
          year: r.year,
          quarter: r.quarter,
          type: r.quarter ? 'quarterly' : 'annual',
          status: r.status,
          submittedDate: r.submittedAt ? new Date(r.submittedAt).toISOString().split('T')[0] : null,
          approvedDate: r.reviewedAt ? new Date(r.reviewedAt).toISOString().split('T')[0] : null,
          documentType: r.type || '成果报告',
          fileName: r.fileName || `成果报告_${r.year}_${r.quarter || '年度'}.pdf`,
          fileUrl: r.fileUrl || null,
          isOwnUpload: r.isOwnUpload !== false, // 默认true，表示该企业直接上传的
          attachments: r.attachments || []
        }));
        setPerformances(formatted);
      }
    } catch (error) {
      console.error('Failed to load performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPerformances = () => {
    let filtered = [...performances];

    if (searchFilters.year) {
      filtered = filtered.filter(p => p.year.toString() === searchFilters.year);
    }

    if (searchFilters.quarter) {
      filtered = filtered.filter(p => p.quarter?.toString() === searchFilters.quarter);
    }

    if (searchFilters.status) {
      filtered = filtered.filter(p => p.status === searchFilters.status);
    }

    setFilteredPerformances(filtered);
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete', '确定要删除这条记录吗？'))) {
      return;
    }

    try {
      await apiService.delete(`${API_PREFIX}/member/performance/${id}`);
      alert(t('message.deleteSuccess', '删除成功'));
      loadPerformances();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert(t('message.deleteFailed', '删除失败'));
    }
  };

  const handleEdit = (id) => {
    window.location.hash = `input#edit-${id}`;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      // TODO: 实现文件下载
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download:', error);
      alert(t('message.downloadFailed', '下载失败'));
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      draft: 'badge-secondary',
      submitted: 'badge-info',
      needSupplement: 'badge-warning',
      approved: 'badge-success'
    };
    return `badge ${classes[status] || ''}`;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: t('performance.status.draft', '草稿'),
      submitted: t('performance.status.submitted', '已提交'),
      needSupplement: t('performance.status.needSupplement', '需补充'),
      approved: t('performance.status.approved', '已批准')
    };
    return labels[status] || status;
  };

  // 生成年度选项
  const yearOptions = [
    { value: '', label: t('common.all', '全部') },
    ...Array.from({ length: 5 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: year.toString(), label: year.toString() };
    })
  ];

  // 季度选项
  const quarterOptions = [
    { value: '', label: t('common.all', '全部') },
    { value: '1', label: t('performance.quarter1', '第一季度') },
    { value: '2', label: t('performance.quarter2', '第二季度') },
    { value: '3', label: t('performance.quarter3', '第三季度') },
    { value: '4', label: t('performance.quarter4', '第四季度') }
  ];

  // 状态选项
  const statusOptions = [
    { value: '', label: t('common.all', '全部') },
    { value: 'submitted', label: t('performance.status.submitted', '已提交') },
    { value: 'needSupplement', label: t('performance.status.needSupplement', '需补充') },
    { value: 'approved', label: t('performance.status.approved', '已批准') }
  ];

  return (
    <div className="performance-list-content">
      <div className="page-header">
        <h1>{t('performance.query', '成果查询')}</h1>
        <div className="header-actions">
          <Button
            onClick={() => {
              window.location.hash = 'input';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }}
            variant="primary"
          >
            + {t('performance.input', '成果输入')}
          </Button>
        </div>
      </div>

      {/* 提示文字 */}
      <Card className="info-card">
        <p className="info-text">
          {t('performance.approvalNotice', '管理员批准前只有管理员批准后才会在画面显示')}
        </p>
      </Card>

      {/* 搜索筛选 */}
      <Card>
        <h2>{t('common.search', '搜索')}</h2>
        <div className="search-filters">
          <div className="form-group">
            <label>{t('performance.year', '年度')}</label>
            <Select
              value={searchFilters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              options={yearOptions}
            />
          </div>
          <div className="form-group">
            <label>{t('performance.quarter', '季度')}</label>
            <Select
              value={searchFilters.quarter}
              onChange={(e) => handleFilterChange('quarter', e.target.value)}
              options={quarterOptions}
            />
          </div>
          <div className="form-group">
            <label>{t('performance.documentStatus', '文档状态')}</label>
            <Select
              value={searchFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>
      </Card>

      {/* 成果列表 */}
      <Card>
        <div className="results-info">
          <p>{t('performance.resultsCount', '共{{count}}条记录', { count: filteredPerformances.length })}</p>
        </div>

        {loading ? (
          <div className="loading">
            <p>{t('common.loading', '加载中...')}</p>
          </div>
        ) : filteredPerformances.length === 0 ? (
          <div className="no-data">
            <p>{t('common.noData', '暂无数据')}</p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>{t('performance.documentType', '文档类型')}</TableHeader>
                <TableHeader>{t('performance.fileName', '文件名')}</TableHeader>
                <TableHeader>{t('performance.documentStatus', '文档状态')}</TableHeader>
                <TableHeader>{t('performance.documentConfirm', '文档确认')}</TableHeader>
                <TableHeader>{t('common.actions', '操作')}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPerformances.map((perf) => (
                <TableRow key={perf.id}>
                  <TableCell>
                    {perf.year}{t('common.year', '年')} {perf.quarter ? `Q${perf.quarter}` : t('performance.annual', '年度')}
                  </TableCell>
                  <TableCell>{perf.fileName}</TableCell>
                  <TableCell>
                    <span className={getStatusBadgeClass(perf.status)}>
                      {getStatusLabel(perf.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {perf.status === 'approved' && perf.fileUrl ? (
                      <Button
                        onClick={() => handleDownload(perf.fileUrl, perf.fileName)}
                        variant="secondary"
                        size="small"
                      >
                        <DownloadIcon className="w-4 h-4" style={{ marginRight: '0.25rem' }} />
                        {t('performance.download', '下载')}
                      </Button>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons">
                      {perf.isOwnUpload && perf.status !== 'approved' && (
                        <>
                          <Button
                            onClick={() => handleEdit(perf.id)}
                            variant="text"
                            size="small"
                            title={t('performance.modify', '修改')}
                          >
                            <EditIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(perf.id)}
                            variant="text"
                            size="small"
                            title={t('performance.delete', '删除')}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* 底部成果输入按钮 */}
      <div className="bottom-actions">
        <Button
          onClick={() => {
            window.location.hash = 'input';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }}
          variant="primary"
          size="large"
        >
          + {t('performance.input', '成果输入')}
        </Button>
      </div>
    </div>
  );
}
