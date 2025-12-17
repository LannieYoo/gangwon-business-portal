/**
 * Project List Component - Admin Portal
 * 项目管理列表
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Badge, Pagination } from '@shared/components';
import { apiService, adminService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';

export default function ProjectList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadProjects();
  }, [currentPage, pageSize]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // 搜索时重置到第一页
      loadProjects();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const loadProjects = async () => {
    setLoading(true);
    const params = {
      page: currentPage,
      page_size: pageSize,
      search: searchKeyword.trim() || undefined
    };
    const response = await apiService.get(`${API_PREFIX}/admin/projects`, { params });
    
    if (response.items) {
      setProjects(response.items);
      setTotalCount(response.total || response.items.length);
    } else {
      setProjects([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    navigate('/admin/projects/new');
  };

  const handleEdit = (projectId) => {
    navigate(`/admin/projects/${projectId}/edit`);
  };

  const handleViewDetail = (projectId) => {
    navigate(`/admin/projects/${projectId}`);
  };

  const handleDelete = async (projectId) => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      return;
    }
    await apiService.delete(`${API_PREFIX}/admin/projects/${projectId}`);
    loadProjects();
  };

  const handleExport = async (format = 'excel') => {
    setLoading(true);
    await adminService.exportProjects({ format });
    setLoading(false);
  };

  const columns = [
    {
      key: 'title',
      label: t('admin.projects.table.title')
    },
    {
      key: 'target_company_name',
      label: t('admin.projects.table.targetCompanyName', '목표 기업명'),
      render: (value, row) => {
        if (!value && !row.target_business_number) {
          return <span className="text-gray-400">공개 모집</span>;
        }
        return value || '-';
      }
    },
    {
      key: 'target_business_number',
      label: t('admin.projects.table.targetBusinessNumber', '사업자등록번호'),
      render: (value) => {
        return value || '-';
      }
    },
    {
      key: 'start_date',
      label: t('admin.projects.table.startDate')
    },
    {
      key: 'end_date',
      label: t('admin.projects.table.endDate')
    },
    {
      key: 'status',
      label: t('admin.projects.table.status'),
      render: (value) => {
        const getStatusVariant = (status) => {
          switch (status) {
            case 'active':
              return 'success';
            case 'inactive':
              return 'warning';
            case 'archived':
              return 'secondary';
            default:
              return 'default';
          }
        };
        
        return (
          <Badge variant={getStatusVariant(value)}>
            {t(`admin.projects.status.${value}`, value)}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(row.id);
            }}
            className="text-blue-600 hover:text-blue-900 font-medium text-sm"
          >
            {t('common.view')}
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.id);
            }}
            className="text-primary-600 hover:text-primary-900 font-medium text-sm"
          >
            {t('common.edit')}
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-600 hover:text-red-900 font-medium text-sm"
          >
            {t('common.delete')}
          </button>
        </div>
      )
    }
  ];

  return (
    <div>

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
          {t('admin.projects.title')}
        </h1>
        
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
                placeholder={t('admin.projects.searchPlaceholder', '请输入项目名称、申请对象等关键词')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 md:ml-4 w-full md:w-auto">
            <Button 
              onClick={() => handleExport('excel')} 
              variant="outline"
              disabled={loading}
            >
              {t('admin.projects.exportExcel', '导出 Excel')}
            </Button>
            <Button 
              onClick={() => handleExport('csv')} 
              variant="outline"
              disabled={loading}
            >
              {t('admin.projects.exportCsv', '导出 CSV')}
            </Button>
            <Button onClick={handleCreate}>
              {t('admin.projects.create')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">{t('common.loading')}</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">{t('admin.projects.noProjects', '暂无项目数据')}</p>
            <p className="text-sm text-gray-400">
              {totalCount === 0 
                ? '请创建第一个项目，或尝试刷新页面'
                : '当前筛选条件下没有匹配的项目'}
            </p>
          </div>
        ) : (
          <>
            <Table 
              columns={columns} 
              data={projects}
            />
            {totalCount > pageSize && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    {t('common.showing', { 
                      start: ((currentPage - 1) * pageSize) + 1, 
                      end: Math.min(currentPage * pageSize, totalCount), 
                      total: totalCount 
                    }) || `显示 ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, totalCount)} 共 ${totalCount} 条`}
                  </span>
                </div>
                <Pagination
                  current={currentPage}
                  total={totalCount}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

