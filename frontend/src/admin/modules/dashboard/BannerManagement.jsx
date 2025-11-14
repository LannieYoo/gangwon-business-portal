/**
 * BannerManagement Component - 横幅管理
 * 管理主横幅和4个主菜单的下级横幅图片
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input, Loading } from '@shared/components';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './Dashboard.css';

export default function BannerManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState({
    main: { image: null, url: '' },
    systemIntro: { image: null, url: '' },
    projects: { image: null, url: '' },
    performance: { image: null, url: '' },
    support: { image: null, url: '' }
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_PREFIX}/admin/banners`);
      if (response && response.banners) {
        setBanners(response.banners);
      }
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (bannerKey, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBanners(prev => ({
          ...prev,
          [bannerKey]: {
            ...prev[bannerKey],
            image: e.target.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (bannerKey, url) => {
    setBanners(prev => ({
      ...prev,
      [bannerKey]: {
        ...prev[bannerKey],
        url
      }
    }));
  };

  const handleSave = async (bannerKey) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const banner = banners[bannerKey];
      
      // TODO: 实现文件上传和URL保存
      console.log('Saving banner:', bannerKey, banner);
      
      // await apiService.post(`${API_PREFIX}/admin/banners/${bannerKey}`, formData);
    } catch (error) {
      console.error('Failed to save banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const bannerConfig = [
    { key: 'main', label: t('admin.dashboard.banner.mainBanner') },
    { key: 'systemIntro', label: t('admin.dashboard.banner.systemIntro') },
    { key: 'projects', label: t('admin.dashboard.banner.projects') },
    { key: 'performance', label: t('admin.dashboard.banner.performance') },
    { key: 'support', label: t('admin.dashboard.banner.support') }
  ];

  return (
    <div className="banner-management">
      <div className="dashboard-header">
        <h2 className="page-title">{t('admin.dashboard.banner.title')}</h2>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="banner-list">
          {bannerConfig.map(({ key, label }) => (
            <Card key={key} className="banner-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <h3 className="section-title">{label}</h3>
              
              <div className="banner-form">
                <div className="banner-item">
                  <label>{t('admin.dashboard.banner.image')}</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {banners[key].image && (
                      <img 
                        src={banners[key].image} 
                        alt={label}
                        style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageChange(key, e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                      id={`banner-${key}-file`}
                    />
                    <label htmlFor={`banner-${key}-file`} style={{ cursor: 'pointer' }}>
                      <Button variant="outline" type="button">
                        {t('admin.dashboard.banner.upload')}
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="banner-item" style={{ marginTop: '1rem' }}>
                  <label>{t('admin.dashboard.banner.url')} ({t('admin.dashboard.banner.optional')})</label>
                  <Input
                    type="text"
                    value={banners[key].url}
                    onChange={(e) => handleUrlChange(key, e.target.value)}
                    placeholder={t('admin.dashboard.banner.urlPlaceholder')}
                  />
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <Button onClick={() => handleSave(key)}>
                    {t('admin.dashboard.banner.save')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

