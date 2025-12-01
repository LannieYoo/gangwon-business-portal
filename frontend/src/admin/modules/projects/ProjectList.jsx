/**
 * Project List Component - Admin Portal
 * 项目管理列表
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Badge } from '@shared/components';
import { apiService, adminService, loggerService, exceptionService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './ProjectList.css';

export default function ProjectList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      loggerService.info('Loading projects', {
        module: 'ProjectList',
        function: 'loadProjects'
      });
      const response = await apiService.get(`${API_PREFIX}/admin/projects`);
      if (response.projects) {
        setProjects(response.projects);
        loggerService.info('Projects loaded successfully', {
          module: 'ProjectList',
          function: 'loadProjects',
          count: response.projects.length
        });
      }
    } catch (error) {
      loggerService.error('Failed to load projects', {
        module: 'ProjectList',
        function: 'loadProjects',
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_path: window.location.pathname,
        error_code: 'LOAD_PROJECTS_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/projects/new');
  };

  const handleEdit = (projectId) => {
    navigate(`/admin/projects/${projectId}/edit`);
  };

  const handleDelete = async (projectId) => {
    if (!confirm(t('admin.projects.confirmDelete'))) {
      return;
    }
    try {
      loggerService.info('Deleting project', {
        module: 'ProjectList',
        function: 'handleDelete',
        project_id: projectId
      });
      await apiService.delete(`${API_PREFIX}/admin/projects/${projectId}`);
      loggerService.info('Project deleted successfully', {
        module: 'ProjectList',
        function: 'handleDelete',
        project_id: projectId
      });
      loadProjects();
    } catch (error) {
      loggerService.error('Failed to delete project', {
        module: 'ProjectList',
        function: 'handleDelete',
        project_id: projectId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_path: window.location.pathname,
        error_code: 'DELETE_PROJECT_ERROR'
      });
      alert(t('admin.projects.deleteFailed'));
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      setLoading(true);
      const params = {
        format
      };
      loggerService.info('Exporting projects', {
        module: 'ProjectList',
        function: 'handleExport',
        format: format
      });
      await adminService.exportProjects(params);
      loggerService.info('Projects exported successfully', {
        module: 'ProjectList',
        function: 'handleExport',
        format: format
      });
      alert(t('admin.projects.exportSuccess', '导出成功') || '导出成功');
    } catch (error) {
      loggerService.error('Failed to export projects', {
        module: 'ProjectList',
        function: 'handleExport',
        format: format,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_path: window.location.pathname,
        error_code: 'EXPORT_PROJECTS_ERROR'
      });
      const errorMessage = error.response?.data?.detail || error.message || t('admin.projects.exportFailed', '导出失败');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: t('admin.projects.table.title')
    },
    {
      key: 'target',
      label: t('admin.projects.table.target')
    },
    {
      key: 'startDate',
      label: t('admin.projects.table.startDate')
    },
    {
      key: 'endDate',
      label: t('admin.projects.table.endDate')
    },
    {
      key: 'status',
      label: t('admin.projects.table.status'),
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'default'}>
          {t(`projects.status.${value}`)}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
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
    <div className="admin-project-list">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">{t('admin.projects.title')}</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t('common.search')}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
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
        ) : (
          <Table 
            columns={columns} 
            data={projects}
            selectable={true}
            selectedRows={[]}
            onSelectRow={() => {}}
            onSelectAll={() => {}}
          />
        )}
      </div>
    </div>
  );
}

