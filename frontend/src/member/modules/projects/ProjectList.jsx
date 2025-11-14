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

export default function ProjectList() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    // TODO: 从 API 获取项目列表
    // Mock data for development
    const mockProjects = [
      {
        id: 1,
        title: '2025 창업기업 지원 사업',
        type: 'startup',
        status: 'recruiting',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        budget: '50000000',
        description: '신규 창업 기업을 위한 종합 지원 프로그램',
        attachments: 3,
        views: 234
      },
      {
        id: 2,
        title: '기술개발 R&D 지원',
        type: 'rd',
        status: 'recruiting',
        startDate: '2025-02-01',
        endDate: '2025-11-30',
        budget: '100000000',
        description: '기술 혁신을 위한 R&D 프로젝트 지원',
        attachments: 5,
        views: 456
      },
      {
        id: 3,
        title: '수출 지원 프로그램',
        type: 'export',
        status: 'closed',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        budget: '30000000',
        description: '해외 시장 진출을 위한 지원',
        attachments: 2,
        views: 123
      }
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(project => project.type === typeFilter);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, typeFilter, projects]);

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

