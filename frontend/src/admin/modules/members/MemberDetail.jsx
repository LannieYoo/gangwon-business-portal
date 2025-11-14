/**
 * Member Detail Component - Admin Portal
 * 企业会员详情
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Loading } from '@shared/components';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './MemberDetail.css';

export default function MemberDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);

  useEffect(() => {
    loadMemberDetail();
  }, [id]);

  const loadMemberDetail = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/admin/members/${id}`);
      if (response.member) {
        setMember(response.member);
      }
    } catch (error) {
      console.error('Failed to load member detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await apiService.patch(`${API_PREFIX}/admin/members/${id}/status`, {
        approvalStatus: 'approved'
      });
      loadMemberDetail();
    } catch (error) {
      console.error('Failed to approve member:', error);
      alert(t('admin.members.approveFailed'));
    }
  };

  const handleReject = async () => {
    try {
      await apiService.patch(`${API_PREFIX}/admin/members/${id}/status`, {
        approvalStatus: 'rejected'
      });
      loadMemberDetail();
    } catch (error) {
      console.error('Failed to reject member:', error);
      alert(t('admin.members.rejectFailed'));
    }
  };

  const handleSearchNiceDnb = () => {
    // TODO: 调用 Nice D&B API
    console.log('Searching Nice D&B for:', member?.businessNumber);
  };

  const handleViewPerformance = () => {
    navigate(`/admin/performance?memberId=${id}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (!member) {
    return (
      <div className="error-message">
        <p>{t('admin.members.detail.notFound')}</p>
        <Button onClick={() => navigate('/admin/members')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-member-detail">
      <div className="page-header">
        <Button variant="outline" onClick={() => navigate('/admin/members')}>
          {t('common.back')}
        </Button>
        <div className="header-actions">
          {member.approvalStatus === 'pending' && (
            <>
              <Button variant="outline" onClick={handleReject}>
                {t('admin.members.reject')}
              </Button>
              <Button onClick={handleApprove}>
                {t('admin.members.approve')}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="member-info-card">
        <div className="card-header">
          <h2>{t('admin.members.detail.basicInfo')}</h2>
          <Badge 
            variant={member.approvalStatus === 'approved' ? 'success' : member.approvalStatus === 'pending' ? 'warning' : 'danger'}
          >
            {t(`members.status.${member.approvalStatus}`)}
          </Badge>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>{t('admin.members.detail.businessNumber')}</label>
            <span>{member.businessLicense}</span>
          </div>
          <div className="info-item">
            <label>{t('admin.members.detail.companyName')}</label>
            <span>{member.companyName}</span>
          </div>
          <div className="info-item">
            <label>{t('admin.members.detail.representative')}</label>
            <span>{member.representative}</span>
          </div>
          <div className="info-item">
            <label>{t('admin.members.detail.legalNumber')}</label>
            <span>{member.legalNumber}</span>
          </div>
          <div className="info-item">
            <label>{t('admin.members.detail.address')}</label>
            <span>{member.address}</span>
          </div>
          <div className="info-item">
            <label>{t('admin.members.detail.industry')}</label>
            <span>{member.industry}</span>
          </div>
          <div className="info-item">
            <label>{t('admin.members.detail.phone')}</label>
            <span>{member.phone}</span>
          </div>
          <div className="info-item">
            <label>{t('admin.members.detail.email')}</label>
            <span>{member.email}</span>
          </div>
        </div>

        <div className="action-buttons">
          <Button variant="outline" onClick={handleSearchNiceDnb}>
            {t('admin.members.detail.searchNiceDnb')}
          </Button>
          <Button variant="outline" onClick={handleViewPerformance}>
            {t('admin.members.detail.viewPerformance')}
          </Button>
        </div>
      </Card>

      {/* Nice D&B 信息卡片 */}
      <Card className="nicednb-card">
        <h2>{t('admin.members.detail.nicednbInfo')}</h2>
        <div className="nicednb-placeholder">
          <p>{t('admin.members.detail.nicednbPlaceholder')}</p>
          <Button onClick={handleSearchNiceDnb}>
            {t('admin.members.detail.searchNiceDnb')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

