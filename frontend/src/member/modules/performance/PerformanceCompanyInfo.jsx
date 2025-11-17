/**
 * Performance Company Info - Member Portal
 * 成果管理 - 企业信息页面
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@shared/hooks';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Textarea from '@shared/components/Textarea';
import Select from '@shared/components/Select';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import { UserIcon } from '@shared/components/Icons';
import './Performance.css';

export default function PerformanceCompanyInfo() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/member/profile`);
      if (response.member) {
        const m = response.member;
        setCompanyData({
          companyName: m.companyName || '',
          businessLicense: m.businessLicense || '',
          corporationNumber: m.corporationNumber || '',
          establishedDate: m.establishedDate || '',
          representativeName: m.representativeName || '',
          phone: m.phone || '',
          address: m.address || '',
          region: m.region || '',
          category: m.category || '',
          industry: m.industry || '',
          description: m.description || '',
          website: m.website || '',
          logo: m.logo || null
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await apiService.put(`${API_PREFIX}/member/profile`, companyData);
      setIsEditing(false);
      alert(t('message.saveSuccess') || '保存成功');
      loadProfile();
    } catch (error) {
      console.error('Failed to save:', error);
      alert(t('message.saveFailed') || '保存失败');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile(); // 恢复原始数据
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: 文件上传处理
      console.log('Uploading logo:', file);
    }
  };

  const regionOptions = [
    { value: '춘천시', label: t('profile.regions.춘천시', '춘천시') },
    { value: '원주시', label: t('profile.regions.원주시', '원주시') },
    { value: '강릉시', label: t('profile.regions.강릉시', '강릉시') },
    { value: '동해시', label: t('profile.regions.동해시', '동해시') },
    { value: '태백시', label: t('profile.regions.태백시', '태백시') },
    { value: '속초시', label: t('profile.regions.속초시', '속초시') },
    { value: '삼척시', label: t('profile.regions.삼척시', '삼척시') }
  ];

  const categoryOptions = [
    { value: 'tech', label: t('profile.categories.tech', '技术') },
    { value: 'manufacturing', label: t('profile.categories.manufacturing', '制造业') },
    { value: 'service', label: t('profile.categories.service', '服务业') },
    { value: 'retail', label: t('profile.categories.retail', '零售') },
    { value: 'other', label: t('profile.categories.other', '其他') }
  ];

  const industryOptions = [
    { value: 'software', label: t('profile.industries.software', '软件') },
    { value: 'hardware', label: t('profile.industries.hardware', '硬件') },
    { value: 'biotechnology', label: t('profile.industries.biotechnology', '生物技术') },
    { value: 'healthcare', label: t('profile.industries.healthcare', '医疗保健') },
    { value: 'education', label: t('profile.industries.education', '教育') },
    { value: 'finance', label: t('profile.industries.finance', '金融') },
    { value: 'other', label: t('profile.industries.other', '其他') }
  ];

  // 未登录用户显示提示信息
  if (!isAuthenticated) {
    return (
      <div className="performance-company-info">
        <div className="page-header">
          <h1>{t('performance.companyInfo', '企业信息')}</h1>
        </div>
        
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <UserIcon className="w-16 h-16" style={{ color: '#6b7280' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
              {t('profile.loginRequired') || '需要登录'}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1rem' }}>
              {t('profile.loginRequiredDesc') || '要查看和管理企业信息，请先登录。'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/login">
                <Button variant="primary" style={{ padding: '0.75rem 2rem' }}>
                  {t('common.login') || '登录'}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" style={{ padding: '0.75rem 2rem' }}>
                  {t('common.register') || '注册'}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="performance-company-info">
      <div className="page-header">
        <h1>{t('performance.companyInfo', '企业信息')}</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="primary">
            {t('common.edit', '编辑')}
          </Button>
        ) : (
          <div className="button-group">
            <Button onClick={handleSave} variant="primary">
              {t('common.save', '保存')}
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              {t('common.cancel', '取消')}
            </Button>
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <Card>
        <h2>{t('profile.sections.basicInfo', '基本信息')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('member.companyName', '企业名称')} *</label>
            <Input
              value={companyData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.businessLicense', '营业执照号')} *</label>
            <Input
              value={companyData.businessLicense}
              disabled={true}
              title={t('profile.businessLicenseNotEditable', '营业执照号不可修改')}
            />
            <small className="form-hint">
              {t('profile.businessLicenseHint', '营业执照号不可修改')}
            </small>
          </div>

          <div className="form-group">
            <label>{t('member.corporationNumber', '法人号码')}</label>
            <Input
              value={companyData.corporationNumber}
              onChange={(e) => handleChange('corporationNumber', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>{t('member.establishedDate', '成立日期')} *</label>
            <Input
              type="date"
              value={companyData.establishedDate}
              onChange={(e) => handleChange('establishedDate', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.representativeName', '代表姓名')} *</label>
            <Input
              value={companyData.representativeName}
              onChange={(e) => handleChange('representativeName', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('member.phone', '电话')} *</label>
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
        <h2>{t('profile.sections.addressInfo', '地址信息')}</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>{t('member.address', '地址')} *</label>
            <Input
              value={companyData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>

          <Select
            label={t('member.region', '地区')}
            value={companyData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            options={regionOptions}
            disabled={!isEditing}
            required
          />
        </div>
      </Card>

      {/* 业务信息 */}
      <Card>
        <h2>{t('profile.sections.businessInfo', '业务信息')}</h2>
        <div className="form-grid">
          <Select
            label={t('member.category', '类别')}
            value={companyData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            options={categoryOptions}
            disabled={!isEditing}
            required
          />

          <Select
            label={t('member.industry', '行业')}
            value={companyData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            options={industryOptions}
            disabled={!isEditing}
            required
          />

          <div className="form-group full-width">
            <label>{t('member.website', '网站')}</label>
            <Input
              type="url"
              value={companyData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              disabled={!isEditing}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group full-width">
            <label>{t('member.description', '描述')}</label>
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
        <h2>{t('profile.sections.logo', 'Logo')}</h2>
        <div className="logo-upload">
          {companyData.logo ? (
            <div className="logo-preview">
              <img src={companyData.logo} alt="Company Logo" />
            </div>
          ) : (
            <div className="logo-placeholder">
              {t('profile.noLogo', '无Logo')}
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
                {t('common.upload', '上传')}
              </Button>
              <small className="form-hint">
                {t('profile.logoHint', '支持 JPG, PNG 格式，最大 5MB')}
              </small>
            </div>
          )}
        </div>
      </Card>

      {/* 审批状态 */}
      <Card>
        <h2>{t('profile.sections.approvalStatus', '审批状态')}</h2>
        <div className="approval-status">
          <div className="status-badge status-approved">
            {t('member.approved', '已批准')}
          </div>
          <p className="status-description">
            {t('profile.approvalStatusDesc', '您的企业信息已通过审核')}
          </p>
        </div>
      </Card>
    </div>
  );
}

