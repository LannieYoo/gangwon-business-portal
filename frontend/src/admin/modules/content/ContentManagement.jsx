/**
 * Content Management Component - Admin Portal
 * 内容管理（横幅、弹窗、公告、新闻资料）
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Tabs } from '@shared/components';
import './ContentManagement.css';

export default function ContentManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('banners');

  const tabs = [
    { key: 'banners', label: t('admin.content.tabs.banners') },
    { key: 'popups', label: t('admin.content.tabs.popups') },
    { key: 'notices', label: t('admin.content.tabs.notices') },
    { key: 'news', label: t('admin.content.tabs.news') }
  ];

  return (
    <div className="admin-content-management">
      <div className="page-header">
        <h1 className="page-title">{t('admin.content.title')}</h1>
      </div>

      <Card>
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab}
        />
        
        <div className="tab-content">
          {activeTab === 'banners' && (
            <div className="banner-management">
              <h2>{t('admin.content.banners.title')}</h2>
              <p>{t('admin.content.banners.placeholder')}</p>
            </div>
          )}
          
          {activeTab === 'popups' && (
            <div className="popup-management">
              <h2>{t('admin.content.popups.title')}</h2>
              <p>{t('admin.content.popups.placeholder')}</p>
            </div>
          )}
          
          {activeTab === 'notices' && (
            <div className="notice-management">
              <h2>{t('admin.content.notices.title')}</h2>
              <p>{t('admin.content.notices.placeholder')}</p>
            </div>
          )}
          
          {activeTab === 'news' && (
            <div className="news-management">
              <h2>{t('admin.content.news.title')}</h2>
              <p>{t('admin.content.news.placeholder')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

