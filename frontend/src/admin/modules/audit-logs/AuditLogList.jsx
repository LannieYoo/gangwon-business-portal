/**
 * Audit Log List Component - Admin Portal
 * 审计日志列表
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Pagination, Select, Input } from '@shared/components';
import { adminService } from '@shared/services';
import './AuditLogList.css';

export default function AuditLogList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        resourceType: resourceTypeFilter !== 'all' ? resourceTypeFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const response = await adminService.listAuditLogs(params);
      if (response.logs) {
        setLogs(response.logs);
        setTotalCount(response.total || 0);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      const errorMessage = error.response?.data?.detail || error.message || t('admin.auditLogs.loadFailed', '加载审计日志失败');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, actionFilter, resourceTypeFilter, startDate, endDate, t]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilter = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setActionFilter('all');
    setResourceTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  }, []);

  const handleViewDetail = useCallback((logId) => {
    navigate(`/admin/audit-logs/${logId}`);
  }, [navigate]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  const getActionBadgeVariant = useCallback((action) => {
    if (action?.includes('create') || action?.includes('register')) {
      return 'success';
    }
    if (action?.includes('update') || action?.includes('approve')) {
      return 'info';
    }
    if (action?.includes('delete') || action?.includes('reject')) {
      return 'danger';
    }
    if (action?.includes('login') || action?.includes('logout')) {
      return 'primary';
    }
    return 'secondary';
  }, []);

  // Action options
  const actionOptions = useMemo(() => [
    { value: 'all', label: t('admin.auditLogs.filters.allActions', '所有操作') },
    { value: 'login', label: t('admin.auditLogs.filters.login', '登录') },
    { value: 'logout', label: t('admin.auditLogs.filters.logout', '登出') },
    { value: 'create', label: t('admin.auditLogs.filters.create', '创建') },
    { value: 'update', label: t('admin.auditLogs.filters.update', '更新') },
    { value: 'delete', label: t('admin.auditLogs.filters.delete', '删除') },
    { value: 'approve', label: t('admin.auditLogs.filters.approve', '批准') },
    { value: 'reject', label: t('admin.auditLogs.filters.reject', '拒绝') },
    { value: 'upload', label: t('admin.auditLogs.filters.upload', '上传') },
    { value: 'download', label: t('admin.auditLogs.filters.download', '下载') },
  ], [t]);

  // Resource type options
  const resourceTypeOptions = useMemo(() => [
    { value: 'all', label: t('admin.auditLogs.filters.allResources', '所有资源') },
    { value: 'member', label: t('admin.auditLogs.filters.member', '会员') },
    { value: 'performance', label: t('admin.auditLogs.filters.performance', '绩效') },
    { value: 'project', label: t('admin.auditLogs.filters.project', '项目') },
    { value: 'content', label: t('admin.auditLogs.filters.content', '内容') },
    { value: 'support', label: t('admin.auditLogs.filters.support', '支持') },
    { value: 'user', label: t('admin.auditLogs.filters.user', '用户') },
  ], [t]);

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'createdAt',
      label: t('admin.auditLogs.table.time', '时间'),
      render: (log) => formatDate(log.createdAt)
    },
    {
      key: 'userEmail',
      label: t('admin.auditLogs.table.user', '用户'),
      render: (log) => log.userEmail || log.userCompanyName || '-'
    },
    {
      key: 'action',
      label: t('admin.auditLogs.table.action', '操作'),
      render: (log) => (
        <Badge variant={getActionBadgeVariant(log.action)}>
          {log.action}
        </Badge>
      )
    },
    {
      key: 'resourceType',
      label: t('admin.auditLogs.table.resourceType', '资源类型'),
      render: (log) => log.resourceType || '-'
    },
    {
      key: 'ipAddress',
      label: t('admin.auditLogs.table.ipAddress', 'IP地址'),
      render: (log) => log.ipAddress || '-'
    },
    {
      key: 'actions',
      label: t('admin.auditLogs.table.actions', '操作'),
      render: (log) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetail(log.id)}
        >
          {t('admin.auditLogs.viewDetail', '查看详情')}
        </Button>
      )
    }
  ], [t, formatDate, getActionBadgeVariant, handleViewDetail]);

  return (
    <div className="admin-audit-log-list">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.auditLogs.title', '审计日志')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('admin.auditLogs.description', '查看系统操作审计日志，用于合规性和安全追踪')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.auditLogs.filters.action', '操作类型')}
            </label>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              options={actionOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.auditLogs.filters.resourceType', '资源类型')}
            </label>
            <Select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              options={resourceTypeOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.auditLogs.filters.startDate', '开始日期')}
            </label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.auditLogs.filters.endDate', '结束日期')}
            </label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleFilter} variant="primary">
            {t('admin.auditLogs.filter', '筛选')}
          </Button>
          <Button onClick={handleResetFilters} variant="outline">
            {t('admin.auditLogs.reset', '重置')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage={t('admin.auditLogs.noLogs', '暂无审计日志')}
        />
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {t('admin.auditLogs.pagination.info', '共 {{total}} 条记录，第 {{page}} / {{totalPages}} 页', {
                total: totalCount,
                page: currentPage,
                totalPages: totalPages
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

