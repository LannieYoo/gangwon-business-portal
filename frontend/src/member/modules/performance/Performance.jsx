/**
 * Performance Page - Member Portal
 * 成果管理主页面 - 使用独立路由
 */

import { useTranslation } from 'react-i18next';
import { useLocation, Outlet } from 'react-router-dom';
import { Banner, Submenu } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import { PageContainer } from '@member/layouts';
import './Performance.css';

export default function Performance() {
  const { t } = useTranslation();
  const location = useLocation();

  // Submenu 配置 - 按照文档要求：企业信息、成果查询、成果输入
  const submenuItems = [
    {
      key: 'company-info',
      label: t('performance.companyInfo', '企业信息'),
      path: '/member/performance/company-info',
      isTab: true
    },
    {
      key: 'performance-query',
      label: t('performance.query', '成果查询'),
      path: '/member/performance/list',
      isTab: true
    },
    {
      key: 'performance-input',
      label: t('performance.input', '成果输入'),
      path: '/member/performance/edit',
      isTab: true
    }
  ];

  return (
    <div className="performance">
      <Banner
        bannerType={BANNER_TYPES.PERFORMANCE}
        sectionClassName="member-banner-section"
      />
      
      <Submenu items={submenuItems} renderLeft={() => null} />
      
      <PageContainer>
        <div className="performance-tab-content">
          <Outlet />
        </div>
      </PageContainer>
    </div>
  );
}

