/**
 * PopupManagement Component - 弹窗管理
 * 管理弹窗的开放日期、结束日期、图片、内容和链接
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input, Loading } from '@shared/components';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './Dashboard.css';

export default function PopupManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    startDate: '',
    endDate: '',
    image: null,
    content: '',
    link: '',
    enabled: false
  });

  useEffect(() => {
    loadPopup();
  }, []);

  const loadPopup = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/admin/popup`);
      if (response && response.popup) {
        setPopup(response.popup);
      }
    } catch (error) {
      console.error('Failed to load popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPopup(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setPopup(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // TODO: 实现弹窗保存
      console.log('Saving popup:', popup);
      
      // await apiService.post(`${API_PREFIX}/admin/popup`, formData);
    } catch (error) {
      console.error('Failed to save popup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-management">
      <div className="dashboard-header">
        <h2 className="page-title">{t('admin.dashboard.popup.title')}</h2>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Card className="banner-section">
          <div className="banner-form">
            {/* 启用状态 */}
            <div className="banner-item">
              <label>
                <input
                  type="checkbox"
                  checked={popup.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                {t('admin.dashboard.popup.enabled')}
              </label>
            </div>

            {/* 开放日期 */}
            <div className="banner-item">
              <label>{t('admin.dashboard.popup.startDate')}</label>
              <Input
                type="date"
                value={popup.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>

            {/* 结束日期 */}
            <div className="banner-item">
              <label>{t('admin.dashboard.popup.endDate')}</label>
              <Input
                type="date"
                value={popup.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>

            {/* 弹窗图片 */}
            <div className="banner-item">
              <label>{t('admin.dashboard.popup.image')}</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {popup.image && (
                  <img 
                    src={popup.image} 
                    alt="Popup"
                    style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageChange(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="popup-image-file"
                />
                <label htmlFor="popup-image-file" style={{ cursor: 'pointer' }}>
                  <Button variant="outline" type="button">
                    {t('admin.dashboard.popup.upload')}
                  </Button>
                </label>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="banner-item">
              <label>{t('admin.dashboard.popup.content')}</label>
              <textarea
                value={popup.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder={t('admin.dashboard.popup.contentPlaceholder')}
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                {t('admin.dashboard.popup.contentNote')}
              </p>
            </div>

            {/* 点击链接 */}
            <div className="banner-item">
              <label>{t('admin.dashboard.popup.link')} ({t('admin.dashboard.banner.optional')})</label>
              <Input
                type="text"
                value={popup.link}
                onChange={(e) => handleChange('link', e.target.value)}
                placeholder={t('admin.dashboard.popup.linkPlaceholder')}
              />
            </div>

            {/* 保存按钮 */}
            <div style={{ marginTop: '1.5rem' }}>
              <Button onClick={handleSave}>
                {t('admin.dashboard.popup.save')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

