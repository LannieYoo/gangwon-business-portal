/**
 * Project List Component - Admin Portal
 * 项目管理列表
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Badge } from '@shared/components';
import { apiService } from '@shared/services';
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
      const response = await apiService.get(`${API_PREFIX}/admin/projects`);
      if (response.projects) {
        setProjects(response.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
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
      await apiService.delete(`${API_PREFIX}/admin/projects/${projectId}`);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert(t('admin.projects.deleteFailed'));
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
      label: t('admin.projects.table.actions'),
      render: (_, row) => (
        <div className="action-buttons">
          <Button 
            size="small" 
            variant="outline"
            onClick={() => handleEdit(row.id)}
          >
            {t('common.edit')}
          </Button>
          <Button 
            size="small" 
            variant="outline"
            onClick={() => handleDelete(row.id)}
          >
            {t('common.delete')}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-project-list">
      <div className="page-header">
        <h1 className="page-title">{t('admin.projects.title')}</h1>
        <Button onClick={handleCreate}>
          {t('admin.projects.create')}
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="loading-placeholder">{t('common.loading')}</div>
        ) : (
          <Table columns={columns} data={projects} />
        )}
      </Card>
    </div>
  );
}

