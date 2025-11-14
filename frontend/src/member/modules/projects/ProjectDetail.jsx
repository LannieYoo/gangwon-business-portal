/**
 * Project Detail Page - Member Portal
 * 项目详情
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';

export default function ProjectDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 从 API 获取项目详情
    // Mock data for development
    setTimeout(() => {
      setProject({
        id: id,
        title: '2025 창업기업 지원 사업',
        type: 'startup',
        status: 'recruiting',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        applicationDeadline: '2025-02-28',
        budget: '50000000',
        description: '신규 창업 기업을 위한 종합 지원 프로그램입니다.',
        objectives: [
          '창업 초기 기업의 안정적 성장 지원',
          '혁신 기술 개발 및 사업화 촉진',
          '지역 경제 활성화 및 일자리 창출'
        ],
        eligibility: [
          '강원특별자치도 내 소재 기업',
          '창업 7년 이내 기업',
          '상시 근로자 수 50명 이하'
        ],
        supportDetails: [
          '사업화 자금: 최대 3천만원',
          '컨설팅 및 멘토링 지원',
          '네트워킹 및 마케팅 지원'
        ],
        requiredDocuments: [
          '사업계획서',
          '사업자등록증 사본',
          '재무제표 (최근 2년)',
          '기타 증빙 서류'
        ],
        contactPerson: '김담당',
        contactPhone: '033-123-4567',
        contactEmail: 'support@gangwonbiz.or.kr',
        attachments: [
          { id: 1, name: '사업 공고문.pdf', size: '1.2MB', downloadUrl: '#' },
          { id: 2, name: '신청서 양식.docx', size: '245KB', downloadUrl: '#' },
          { id: 3, name: '사업계획서 작성 가이드.pdf', size: '3.5MB', downloadUrl: '#' }
        ],
        views: 234,
        createdAt: '2024-12-01',
        updatedAt: '2024-12-15'
      });
      setLoading(false);
    }, 500);
  }, [id]);

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

