/**
 * Project List Page - Member Portal
 * 项目列表（公告列表）
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Select from '@shared/components/Select';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';

export default function ProjectList() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      };
      const response = await apiService.get(`${API_PREFIX}/projects`, params);
      if (response.projects) {
        const formattedProjects = response.projects.map(p => ({
          id: p.id,
          title: p.title,
          type: p.type,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          budget: p.budget,
          description: p.description,
          attachments: p.attachments?.length || 0,
          views: p.views || 0
        }));
        setProjects(formattedProjects);
        setFilteredProjects(formattedProjects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [statusFilter, typeFilter, searchTerm]);

  const statusOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'recruiting', label: t('projects.status.recruiting') },
    { value: 'ongoing', label: t('projects.status.ongoing') },
    { value: 'closed', label: t('projects.status.closed') }
  ];

  const typeOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'startup', label: t('projects.types.startup') },
    { value: 'rd', label: t('projects.types.rd') },
    { value: 'export', label: t('projects.types.export') },
    { value: 'investment', label: t('projects.types.investment') }
  ];

  const getStatusBadgeClass = (status) => {
    const classes = {
      recruiting: 'badge-success',
      ongoing: 'badge-info',
      closed: 'badge-secondary'
    };
    return `badge ${classes[status] || ''}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  return (
    <div className="project-list">
      <div className="page-header">
        <h1>{t('projects.title')}</h1>
        <p className="subtitle">{t('projects.subtitle')}</p>
      </div>

      {/* 搜索和过滤 */}
      <Card className="filter-card">
        <div className="filter-row">
          <div className="search-box">
            <Input
              type="search"
              placeholder={t('projects.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
            />
          </div>
        </div>
      </Card>

      {/* 项目列表 */}
      <div className="projects-container">
        <div className="results-info">
          <p>{t('projects.resultsCount', { count: filteredProjects.length })}</p>
        </div>

        {filteredProjects.length === 0 ? (
          <Card>
            <div className="no-data">
              <p>{t('common.noData')}</p>
            </div>
          </Card>
        ) : (
          <div className="projects-list">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-title-section">
                    <Link to={`/member/projects/${project.id}`}>
                      <h3>{project.title}</h3>
                    </Link>
                    <span className={getStatusBadgeClass(project.status)}>
                      {t(`projects.status.${project.status}`)}
                    </span>
                  </div>
                  <div className="project-meta">
                    <span className="views">👁 {project.views}</span>
                    <span className="attachments">📎 {project.attachments}</span>
                  </div>
                </div>

                <div className="project-body">
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-details">
                    <div className="detail-item">
                      <span className="label">{t('project.type')}:</span>
                      <span className="value">{t(`projects.types.${project.type}`)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t('project.budget')}:</span>
                      <span className="value">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t('common.date')}:</span>
                      <span className="value">
                        {project.startDate} ~ {project.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="project-footer">
                  <Link to={`/member/projects/${project.id}`}>
                    <Button variant="secondary">
                      {t('common.details')}
                    </Button>
                  </Link>
                  
                  {project.status === 'recruiting' && (
                    <Link to={`/member/projects/${project.id}/apply`}>
                      <Button variant="primary">
                        {t('projects.apply')}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

