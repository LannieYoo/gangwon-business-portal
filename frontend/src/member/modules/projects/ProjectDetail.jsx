/**
 * Project Detail Page - Member Portal
 * 项目详情
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';

export default function ProjectDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectDetail();
  }, [id]);

  const loadProjectDetail = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/projects/${id}`);
      if (response.project) {
        const p = response.project;
        setProject({
          id: p.id,
          title: p.title,
          type: p.type,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          applicationDeadline: p.recruitmentEndDate,
          budget: p.budget,
          description: p.description,
          objectives: p.objectives || [],
          eligibility: p.scope ? [p.scope] : [],
          supportDetails: [],
          requiredDocuments: [],
          contactPerson: p.manager,
          contactPhone: p.managerPhone,
          contactEmail: p.managerEmail,
          attachments: p.attachments || [],
          views: p.views || 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        });
      }
    } catch (error) {
      console.error('Failed to load project detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-container">
        <p>{t('common.noData')}</p>
        <Button onClick={() => navigate('/member/projects')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

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
    <div className="project-detail">
      {/* 返回按钮 */}
      <div className="breadcrumb">
        <Link to="/member/projects">{t('projects.title')}</Link>
        <span> / </span>
        <span>{project.title}</span>
      </div>

      {/* 项目标题 */}
      <div className="page-header">
        <div className="title-section">
          <h1>{project.title}</h1>
          <span className={getStatusBadgeClass(project.status)}>
            {t(`projects.status.${project.status}`)}
          </span>
        </div>
        <div className="meta-info">
          <span>👁 {project.views} {t('support.views')}</span>
          <span>📅 {project.updatedAt}</span>
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <h2>{t('projects.detail.basicInfo')}</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">{t('project.type')}</span>
            <span className="value">{t(`projects.types.${project.type}`)}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('project.budget')}</span>
            <span className="value">{formatCurrency(project.budget)}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('projects.detail.duration')}</span>
            <span className="value">{project.startDate} ~ {project.endDate}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('projects.detail.applicationDeadline')}</span>
            <span className="value highlight">{project.applicationDeadline}</span>
          </div>
        </div>
      </Card>

      {/* 项目说明 */}
      <Card>
        <h2>{t('project.description')}</h2>
        <p>{project.description}</p>
      </Card>

      {/* 项目目标 */}
      <Card>
        <h2>{t('project.objectives')}</h2>
        <ul className="list-styled">
          {project.objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </Card>

      {/* 申请资格 */}
      <Card>
        <h2>{t('projects.detail.eligibility')}</h2>
        <ul className="list-styled">
          {project.eligibility.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card>

      {/* 支持内容 */}
      <Card>
        <h2>{t('projects.detail.supportDetails')}</h2>
        <ul className="list-styled">
          {project.supportDetails.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card>

      {/* 所需文件 */}
      <Card>
        <h2>{t('projects.detail.requiredDocuments')}</h2>
        <ul className="list-styled">
          {project.requiredDocuments.map((doc, index) => (
            <li key={index}>{doc}</li>
          ))}
        </ul>
      </Card>

      {/* 附件下载 */}
      <Card>
        <h2>{t('project.attachments')}</h2>
        <div className="attachments-list">
          {project.attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              <div className="attachment-info">
                <span className="attachment-icon">📎</span>
                <span className="attachment-name">{attachment.name}</span>
                <span className="attachment-size">({attachment.size})</span>
              </div>
              <Button variant="secondary" size="small">
                {t('common.download')}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* 联系方式 */}
      <Card>
        <h2>{t('projects.detail.contact')}</h2>
        <div className="contact-info">
          <p><strong>{t('projects.detail.contactPerson')}:</strong> {project.contactPerson}</p>
          <p><strong>{t('projects.detail.contactPhone')}:</strong> {project.contactPhone}</p>
          <p><strong>{t('projects.detail.contactEmail')}:</strong> {project.contactEmail}</p>
        </div>
      </Card>

      {/* 操作按钮 */}
      <div className="action-buttons">
        <Button 
          onClick={() => navigate('/member/projects')}
          variant="secondary"
        >
          {t('common.back')}
        </Button>
        
        {project.status === 'recruiting' && (
          <Button 
            onClick={() => navigate(`/member/projects/${project.id}/apply`)}
            variant="primary"
          >
            {t('projects.apply')}
          </Button>
        )}
      </div>
    </div>
  );
}

