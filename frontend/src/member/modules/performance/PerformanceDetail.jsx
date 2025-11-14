/**
 * Performance Detail Page - Member Portal
 * 绩效数据详情
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';

export default function PerformanceDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 从 API 获取绩效详情
    // Mock data for development
    setTimeout(() => {
      setPerformance({
        id: id,
        year: 2024,
        quarter: 4,
        type: 'quarterly',
        status: 'approved',
        submittedDate: '2024-12-15',
        approvedDate: '2024-12-20',
        sales: 50000000,
        employment: 15,
        governmentSupport: 10000000,
        intellectualProperty: {
          patents: 1,
          trademarks: 1,
          copyrights: 0,
          certifications: 0
        },
        proofDocuments: [
          { id: 1, name: '매출 증빙서류.pdf', size: '2.3MB', downloadUrl: '#' },
          { id: 2, name: '고용 증명서.pdf', size: '1.5MB', downloadUrl: '#' }
        ],
        notes: '4분기 실적이 전년 대비 20% 증가했습니다.',
        reviewer: '김관리자',
        reviewComments: '검토 완료. 승인합니다.'
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

  if (!performance) {
    return (
      <div className="error-container">
        <p>{t('common.noData')}</p>
        <Button onClick={() => navigate('/member/performance')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      draft: 'badge-secondary',
      submitted: 'badge-info',
      needSupplement: 'badge-warning',
      approved: 'badge-success'
    };
    return `badge ${classes[status] || ''}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalIP = Object.values(performance.intellectualProperty).reduce(
    (sum, val) => sum + (val || 0), 0
  );

  return (
    <div className="performance-detail">
      {/* 返回按钮 */}
      <div className="breadcrumb">
        <Link to="/member/performance">{t('performance.title')}</Link>
        <span> / </span>
        <span>
          {performance.year}{t('common.year')} {performance.quarter ? `Q${performance.quarter}` : t('performance.annual')}
        </span>
      </div>

      {/* 标题和状态 */}
      <div className="page-header">
        <div className="title-section">
          <h1>
            {performance.year}{t('common.year')} {performance.quarter ? `Q${performance.quarter}` : t('performance.annual')}
          </h1>
          <span className={getStatusBadgeClass(performance.status)}>
            {t(`performance.status.${performance.status}`)}
          </span>
        </div>
        <div className="meta-info">
          {performance.submittedDate && (
            <span>📅 {t('performance.submittedDate')}: {performance.submittedDate}</span>
          )}
          {performance.approvedDate && (
            <span>✅ {t('performance.approvedDate')}: {performance.approvedDate}</span>
          )}
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <h2>{t('performance.sections.basicInfo')}</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">{t('performance.year')}</span>
            <span className="value">{performance.year}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('performance.quarter')}</span>
            <span className="value">
              {performance.quarter ? `Q${performance.quarter}` : t('performance.annual')}
            </span>
          </div>
          <div className="info-item">
            <span className="label">{t('performance.type')}</span>
            <span className="value">
              {performance.quarter ? t('performance.quarterly') : t('performance.annual')}
            </span>
          </div>
        </div>
      </Card>

      {/* 销售和雇佣 */}
      <Card>
        <h2>{t('performance.sections.salesEmployment')}</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">{t('performance.sales')}</span>
            <span className="value highlight">{formatCurrency(performance.sales)}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('performance.employment')}</span>
            <span className="value highlight">{performance.employment} {t('performance.people')}</span>
          </div>
        </div>
      </Card>

      {/* 政府支持 */}
      <Card>
        <h2>{t('performance.sections.governmentSupport')}</h2>
        <div className="info-item">
          <span className="label">{t('performance.governmentSupport')}</span>
          <span className="value">{formatCurrency(performance.governmentSupport)}</span>
        </div>
      </Card>

      {/* 知识产权 */}
      <Card>
        <h2>{t('performance.sections.intellectualProperty')}</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">{t('performance.patent')}</span>
            <span className="value">{performance.intellectualProperty.patents} {t('performance.items')}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('performance.trademark')}</span>
            <span className="value">{performance.intellectualProperty.trademarks} {t('performance.items')}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('performance.copyright')}</span>
            <span className="value">{performance.intellectualProperty.copyrights} {t('performance.items')}</span>
          </div>
          <div className="info-item">
            <span className="label">{t('performance.certification')}</span>
            <span className="value">{performance.intellectualProperty.certifications} {t('performance.items')}</span>
          </div>
        </div>
        <div className="ip-summary">
          <strong>{t('performance.totalIP')}: {totalIP} {t('performance.items')}</strong>
        </div>
      </Card>

      {/* 证明文件 */}
      {performance.proofDocuments && performance.proofDocuments.length > 0 && (
        <Card>
          <h2>{t('performance.sections.proofDocuments')}</h2>
          <div className="attachments-list">
            {performance.proofDocuments.map((doc) => (
              <div key={doc.id} className="attachment-item">
                <div className="attachment-info">
                  <span className="attachment-icon">📎</span>
                  <span className="attachment-name">{doc.name}</span>
                  <span className="attachment-size">({doc.size})</span>
                </div>
                <Button variant="secondary" size="small">
                  {t('common.download')}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 备注 */}
      {performance.notes && (
        <Card>
          <h2>{t('performance.sections.notes')}</h2>
          <p>{performance.notes}</p>
        </Card>
      )}

      {/* 审核信息 */}
      {performance.status === 'approved' && performance.reviewer && (
        <Card>
          <h2>{t('performance.sections.reviewInfo')}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">{t('performance.reviewer')}</span>
              <span className="value">{performance.reviewer}</span>
            </div>
            {performance.reviewComments && (
              <div className="info-item full-width">
                <span className="label">{t('performance.reviewComments')}</span>
                <span className="value">{performance.reviewComments}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="action-buttons">
        <Button 
          onClick={() => navigate('/member/performance')}
          variant="secondary"
        >
          {t('common.back')}
        </Button>
        
        {performance.status === 'draft' && (
          <Button 
            onClick={() => navigate(`/member/performance/${performance.id}/edit`)}
            variant="primary"
          >
            {t('common.edit')}
          </Button>
        )}
        
        {performance.status === 'needSupplement' && (
          <Button 
            onClick={() => navigate(`/member/performance/${performance.id}/edit`)}
            variant="warning"
          >
            {t('performance.supplement')}
          </Button>
        )}
      </div>
    </div>
  );
}

