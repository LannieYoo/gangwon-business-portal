/**
 * Performance Page - Member Portal
 * 成果管理主页面
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Banner, Submenu } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import PerformanceCompanyInfo from './PerformanceCompanyInfo';
import PerformanceListContent from './PerformanceListContent';
import PerformanceFormContent from './PerformanceFormContent';
import './Performance.css';

export default function Performance() {
  const { t } = useTranslation();
  const [currentHash, setCurrentHash] = useState(() => window.location.hash.replace('#', ''));

  // 监听 hash 变化
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.replace('#', ''));
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Submenu 配置 - 按照文档要求：企业信息、成果查询、成果输入
  const submenuItems = [
    {
      key: 'company-info',
      label: t('performance.companyInfo', '企业信息'),
      hash: 'company-info',
      isTab: true
    },
    {
      key: 'performance-query',
      label: t('performance.query', '成果查询'),
      hash: 'query',
      isTab: true
    },
    {
      key: 'performance-input',
      label: t('performance.input', '成果输入'),
      hash: 'input',
      isTab: true
    }
  ];

  // 渲染当前激活的内容
  const renderContent = () => {
    const hash = currentHash || 'company-info';
    switch (hash) {
      case 'company-info':
        return <PerformanceCompanyInfo />;
      case 'query':
        return <PerformanceListContent />;
      case 'input':
        return <PerformanceFormContent />;
      default:
        return <PerformanceCompanyInfo />;
    }
  };

  return (
    <div className="performance">
      <Banner
        bannerType={BANNER_TYPES.PERFORMANCE}
        sectionClassName="member-banner-section"
      />
      
      <Submenu items={submenuItems} renderLeft={() => null} />
      
      <div className="performance-tab-content">
        {renderContent()}
      </div>
    </div>
  );
}

