/**
 * Profile Page - Member Portal
 * 企业信息管理
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Textarea from '@shared/components/Textarea';
import Select from '@shared/components/Select';

export default function Profile() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: '',
    businessLicense: '',
    corporationNumber: '',
    establishedDate: '',
    representativeName: '',
    phone: '',
    address: '',
    region: '',
    category: '',
    industry: '',
    description: '',
    website: '',
    logo: null
  });

  useEffect(() => {
    // TODO: 从 API 获取企业信息
    // Mock data for development
    setCompanyData({
      companyName: '강원테크',
      businessLicense: '123-45-67890',
      corporationNumber: '110111-1234567',
      establishedDate: '2020-03-15',
      representativeName: '김철수',
      phone: '033-123-4567',
      address: '강원특별자치도 춘천시 중앙로 1',
      region: '춘천시',
      category: 'tech',
      industry: 'software',
      description: '혁신적인 소프트웨어 솔루션을 제공하는 기업입니다.',
      website: 'https://gangwontech.com',
      logo: null
    });
  }, []);

  const handleChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: API 호출하여 데이터 저장
      console.log('Saving company data:', companyData);
      setIsEditing(false);
      // 성功 메시지 표시
      alert(t('message.saveSuccess'));
    } catch (error) {
      console.error('Failed to save:', error);
      alert(t('message.saveFailed'));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: 원래 데이터로 복원
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: 파일 업로드 처리
      console.log('Uploading logo:', file);
    }
  };

  const regionOptions = [
    { value: '춘천시', label: '춘천시' },
    { value: '원주시', label: '원주시' },
    { value: '강릉시', label: '강릉시' },
    { value: '동해시', label: '동해시' },
    { value: '태백시', label: '태백시' },
    { value: '속초시', label: '속초시' },
    { value: '삼척시', label: '삼척시' }
  ];

  const categoryOptions = [
    { value: 'tech', label: t('profile.categories.tech') },
    { value: 'manufacturing', label: t('profile.categories.manufacturing') },
    { value: 'service', label: t('profile.categories.service') },
    { value: 'retail', label: t('profile.categories.retail') },
    { value: 'other', label: t('profile.categories.other') }
  ];

  const industryOptions = [
    { value: 'software', label: t('profile.industries.software') },
    { value: 'hardware', label: t('profile.industries.hardware') },
    { value: 'biotechnology', label: t('profile.industries.biotechnology') },
    { value: 'healthcare', label: t('profile.industries.healthcare') },
    { value: 'education', label: t('profile.industries.education') },
    { value: 'finance', label: t('profile.industries.finance') },
    { value: 'other', label: t('profile.industries.other') }
  ];

  return (
    <div className="profile">
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="primary">
            {t('common.edit')}
          </Button>
        ) : (
          <div className="button-group">
            <Button onClick={handleSave} variant="primary">
              {t('common.save')}
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              {t('common.cancel')}
            </Button>
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <Card>
        <h2>{t('profile.sections.basicInfo')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('member.companyName')} *</label>
            <Input
              value={companyData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.businessLicense')} *</label>
            <Input
              value={companyData.businessLicense}
              disabled={true}
              title={t('profile.businessLicenseNotEditable')}
            />
            <small className="form-hint">{t('profile.businessLicenseHint')}</small>
          </div>

          <div className="form-group">
            <label>{t('member.corporationNumber')}</label>
            <Input
              value={companyData.corporationNumber}
              onChange={(e) => handleChange('corporationNumber', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>{t('member.establishedDate')} *</label>
            <Input
              type="date"
              value={companyData.establishedDate}
              onChange={(e) => handleChange('establishedDate', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.representativeName')} *</label>
            <Input
              value={companyData.representativeName}
              onChange={(e) => handleChange('representativeName', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.phone')} *</label>
            <Input
              type="tel"
              value={companyData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>
        </div>
      </Card>

      {/* 地址信息 */}
      <Card>
        <h2>{t('profile.sections.addressInfo')}</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>{t('member.address')} *</label>
            <Input
              value={companyData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.region')} *</label>
            <Select
              value={companyData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              options={regionOptions}
              disabled={!isEditing}
              required
            />
          </div>
        </div>
      </Card>

      {/* 业务信息 */}
      <Card>
        <h2>{t('profile.sections.businessInfo')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('member.category')} *</label>
            <Select
              value={companyData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={categoryOptions}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.industry')} *</label>
            <Select
              value={companyData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              options={industryOptions}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>{t('member.website')}</label>
            <Input
              type="url"
              value={companyData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              disabled={!isEditing}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group full-width">
            <label>{t('member.description')}</label>
            <Textarea
              value={companyData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={!isEditing}
              rows={5}
              maxLength={500}
            />
            <small className="form-hint">
              {companyData.description.length}/500
            </small>
          </div>
        </div>
      </Card>

      {/* Logo */}
      <Card>
        <h2>{t('profile.sections.logo')}</h2>
        <div className="logo-upload">
          {companyData.logo ? (
            <div className="logo-preview">
              <img src={companyData.logo} alt="Company Logo" />
            </div>
          ) : (
            <div className="logo-placeholder">
              {t('profile.noLogo')}
            </div>
          )}
          
          {isEditing && (
            <div className="upload-actions">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <Button
                onClick={() => document.getElementById('logo-upload').click()}
                variant="secondary"
              >
                {t('common.upload')}
              </Button>
              <small className="form-hint">
                {t('profile.logoHint')}
              </small>
            </div>
          )}
        </div>
      </Card>

      {/* 审批状态 */}
      <Card>
        <h2>{t('profile.sections.approvalStatus')}</h2>
        <div className="approval-status">
          <div className="status-badge status-approved">
            {t('member.approved')}
          </div>
          <p className="status-description">
            {t('profile.approvalStatusDesc')}
          </p>
        </div>
      </Card>
    </div>
  );
}

