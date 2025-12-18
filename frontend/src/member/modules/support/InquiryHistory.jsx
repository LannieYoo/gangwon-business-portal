/**
 * Inquiry History Component - Member Portal
 * 咨询历史记录组件 - 表格布局，与其他模块保持一致
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@shared/utils/format';
import { useNavigate } from 'react-router-dom';
import Card, { CardBody } from '@shared/components/Card';
import { Badge, Pagination } from '@shared/components';
import Button from '@shared/components/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@shared/components/Table';
import { messagesService } from '@shared/services';
import { SearchIcon } from '@shared/components/Icons';
import ThreadDetailModal from '@shared/components/ThreadDetailModal';

export default function InquiryHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  
  // 搜索和过滤状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  const loadThreads = useCallback(async (page = 1) => {
    setLoading(true);
    const response = await messagesService.getMemberThreads({
      page,
      pageSize: pagination.pageSize,
      status: statusFilter || undefined
    });
    setThreads(response.items || []);
    setPagination(prev => ({
      ...prev,
      page: response.page || page,
      total: response.total || 0,
      totalPages: response.totalPages || Math.ceil((response.total || 0) / prev.pageSize)
    }));
    setLoading(false);
  }, [pagination.pageSize, statusFilter]);

  useEffect(() => {
    loadThreads(1);
  }, [loadThreads]);

  const handlePageChange = (newPage) => {
    loadThreads(newPage);
  };

  // 过滤后的线程列表（客户端搜索）
  const filteredThreads = useMemo(() => {
    return threads.filter(thread => {
      // 关键词搜索（标题）
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const subject = (thread.subject || '').toLowerCase();
        if (!subject.includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [threads, searchKeyword]);

  // 状态选项
  const statusOptions = [
    { value: '', label: t('common.all') },
    { value: 'open', label: t('support.status.open') },
    { value: 'resolved', label: t('support.status.resolved') },
    { value: 'closed', label: t('support.status.closed') }
  ];

  // 状态徽章
  const getStatusBadge = (status) => {
    const variants = {
      open: 'success',
      resolved: 'info',
      closed: 'secondary'
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {t(`support.status.${status}`, status)}
      </Badge>
    );
  };

  // 获取分类显示文本
  const getCategoryLabel = (category) => {
    if (!category) return '-';
    return t(`support.category.${category}`, category);
  };

  // 获取分类标签
  const getCategoryBadge = (category) => {
    if (!category) return null;
    const categoryMap = {
      support: { variant: 'info', label: t('support.category.support') },
      performance: { variant: 'warning', label: t('support.category.performance') },
      general: { variant: 'secondary', label: t('support.category.general') }
    };
    const config = categoryMap[category] || categoryMap.general;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  // 打开详情模态框
  const openDetailModal = (threadId) => {
    setSelectedThreadId(threadId);
  };

  // 关闭详情模态框
  const closeDetailModal = () => {
    setSelectedThreadId(null);
    // 刷新列表
    loadThreads(pagination.page);
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 lg:mb-10 min-h-[48px] flex items-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 m-0">
          {t('support.inquiryHistory')}
        </h1>
      </div>

      {/* 搜索和筛选 */}
      <Card className="p-4 sm:p-5 lg:p-6 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t('support.searchPlaceholder')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-48 sm:flex-shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 列表 */}
      <Card>
        <CardBody>

          {loading ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-base text-gray-500 m-0">{t('common.loading')}</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-base text-gray-500 m-0 mb-4">
                {threads.length === 0 ? t('support.noInquiries') : t('support.noMatchingInquiries')}
              </p>
              {threads.length === 0 && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/member/support/inquiry')}
                >
                  {t('support.createFirstInquiry')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>{t('support.subject')}</TableHeader>
                    <TableHeader>{t('support.categoryLabel')}</TableHeader>
                    <TableHeader>{t('support.statusLabel')}</TableHeader>
                    <TableHeader>{t('support.createdDate')}</TableHeader>
                    <TableHeader>{t('support.lastReply')}</TableHeader>
                    <TableHeader>{t('support.messageCount')}</TableHeader>
                    <TableHeader>{t('common.actions')}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredThreads.map((thread) => (
                    <TableRow key={thread.id}>
                      <TableCell>
                        <span className="font-medium">{thread.subject}</span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {getCategoryLabel(thread.category)}
                      </TableCell>
                      <TableCell>{getStatusBadge(thread.status)}</TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {thread.createdAt ? formatDateTime(thread.createdAt) : '-'}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {thread.lastMessageAt ? formatDateTime(thread.lastMessageAt) : '-'}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {thread.messageCount || 0}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => openDetailModal(thread.id)}
                          className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                        >
                          {t('common.view')}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {t('common.total')} {pagination.total} {t('common.items')}
                    </div>
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* 详情模态框 */}
      <ThreadDetailModal
        threadId={selectedThreadId}
        isOpen={selectedThreadId !== null}
        onClose={closeDetailModal}
        onMessageSent={() => loadThreads(pagination.page)}
      />
    </div>
  );
}

