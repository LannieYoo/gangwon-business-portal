/**
 * Settings Component - Admin Portal
 * 系统配置管理
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Tabs } from '@shared/components';
import './Settings.css';

export default function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('business');

  const tabs = [
    { key: 'business', label: t('admin.settings.tabs.business') },
    { key: 'terms', label: t('admin.settings.tabs.terms') },
    { key: 'system', label: t('admin.settings.tabs.system') }
  ];

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1 className="page-title">{t('admin.settings.title')}</h1>
      </div>

      <Card>
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab}
        />
        
        <div className="tab-content">
          {activeTab === 'business' && (
            <div className="business-settings">
              <h2>{t('admin.settings.business.title')}</h2>
              <p>{t('admin.settings.business.placeholder')}</p>
            </div>
          )}
          
          {activeTab === 'terms' && (
            <div className="terms-settings">
              <h2>{t('admin.settings.terms.title')}</h2>
              <p>{t('admin.settings.terms.placeholder')}</p>
            </div>
          )}
          
          {activeTab === 'system' && (
            <div className="system-settings">
              <h2>{t('admin.settings.system.title')}</h2>
              <p>{t('admin.settings.system.placeholder')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

