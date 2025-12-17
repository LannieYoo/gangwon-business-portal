/**
 * Member List Component - Admin Portal
 * 企业会员列表
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Pagination } from '@shared/components';
import { adminService } from '@shared/services';
import { formatDate } from '@shared/utils/format';

export default function MemberList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLanguage = i18n.language === 'zh' ? 'zh' : 'ko';
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('companyName');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const params = {
      page: currentPage,
      pageSize: pageSize,
      approvalStatus: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined
    };
    const response = await adminService.listMembers(params);
    
    if (response) {
      if (response.members && Array.isArray(response.members)) {
        setMembers(response.members);
        const total = response.pagination?.total || response.total || 0;
        setTotalCount(total);
      } else {
        setMembers([]);
        setTotalCount(response.pagination?.total || response.total || 0);
      }
    } else {
      setMembers([]);
      setTotalCount(0);
    }
    setLoading(false);
  }, [currentPage, pageSize, statusFilter, searchTerm, t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleExport = useCallback(async (format = 'excel') => {
    setLoading(true);
    const params = {
      format,
      approvalStatus: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined
    };
    await adminService.exportMembers(params);
    setLoading(false);
  }, [statusFilter, searchTerm, t]);

  const handleApprove = useCallback(async (memberId) => {
    await adminService.approveMember(memberId);
    loadMembers();
  }, [loadMembers, t]);

  const handleViewDetail = useCallback((memberId) => {
    navigate(`/admin/members/${memberId}`);
  }, [navigate]);



  // 使用 useMemo 缓存 columns 配置，避免每次渲染都重新创建
  const columns = useMemo(() => {
    return [
      {
        key: 'companyName',
        label: t('admin.members.table.companyName'),
        sortable: true,
        width: '200px',
        align: 'left',
        cellClassName: 'text-left'
      },
      {
        key: 'representative',
        label: t('admin.members.table.representative'),
        sortable: true,
        width: '120px'
      },
      {
        key: 'businessNumber',
        label: t('admin.members.table.businessNumber'),
        sortable: true,
        width: '150px'
      },
      {
        key: 'address',
        label: t('admin.members.table.address'),
        wrap: true,
        width: '250px',
        render: (value) => (
          <div className="max-w-xs truncate" title={value || ''}>
            {value || '-'}
          </div>
        )
      },
      {
        key: 'industry',
        label: t('admin.members.table.industry'),
        width: '120px'
      },
      {
        key: 'createdAt',
        label: t('admin.members.table.createdAt'),
        sortable: true,
        width: '140px',
        render: (value) => formatDate(value, 'yyyy-MM-dd', currentLanguage)
      },
      {
        key: 'approvalStatus',
        label: t('admin.members.table.status'),
        width: '100px',
        render: (value) => (
          <Badge 
            variant={value === 'approved' ? 'success' : value === 'pending' ? 'warning' : 'danger'}
          >
            {t(`admin.members.status.${value}`)}
          </Badge>
        )
      },
      {
        key: 'actions',
        label: '',
        width: '120px',
        render: (_, row) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(row.id);
              }}
              className="text-primary-600 hover:text-primary-900 font-medium text-sm"
            >
              {t('common.view')}
            </button>
            {row.approvalStatus === 'pending' && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(row.id);
                  }}
                  className="text-green-600 hover:text-green-900 font-medium text-sm"
                >
                  {t('admin.members.approve')}
                </button>
              </>
            )}
          </div>
        )
      }
    ];
  }, [t, handleViewDetail, handleApprove]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">{t('admin.members.title')}</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t('admin.members.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 md:ml-4 w-full md:w-auto">
            <Button 
              onClick={() => handleExport('excel')} 
              variant="outline"
              disabled={loading}
            >
              {t('admin.members.exportExcel')}
            </Button>
            <Button 
              onClick={() => handleExport('csv')} 
              variant="outline"
              disabled={loading}
            >
              {t('admin.members.exportCsv')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {(() => {
          if (loading) {
            return <div className="p-12 text-center text-gray-500">{t('common.loading')}</div>;
          }
          if (members.length === 0) {
            return (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-2">{t('admin.members.noMembers') || '暂无会员数据'}</p>
                <p className="text-sm text-gray-400">
                  {totalCount === 0 
                    ? '请检查数据库是否已生成测试数据，或尝试刷新页面'
                    : '当前筛选条件下没有匹配的会员'}
                </p>
              </div>
            );
          }
          return (
            <>
              <div className="overflow-x-auto -mx-4 px-4">
                <Table 
                  columns={columns} 
                  data={members}
                />
              </div>
              {totalCount > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 md:flex-nowrap">
                  <div className="flex items-center text-sm text-gray-700 w-full md:w-auto text-center md:text-left">
                    <span>
                      {t('common.showing', { 
                        start: ((currentPage - 1) * pageSize) + 1, 
                        end: Math.min(currentPage * pageSize, totalCount), 
                        total: totalCount 
                      }) || `显示 ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, totalCount)} 共 ${totalCount} 条`}
                    </span>
                  </div>
                  <div className="w-full md:w-auto flex justify-center">
                    <Pagination
                      current={currentPage}
                      total={totalCount}
                      pageSize={pageSize}
                      onChange={setCurrentPage}
                    />
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

