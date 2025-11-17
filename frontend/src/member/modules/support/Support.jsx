/**
 * Support Page - Member Portal
 * 支持页面容器组件
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Banner, Submenu } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import ConsultationForm from './ConsultationForm';
import ConsultationHistory from './ConsultationHistory';
import FAQList from './FAQList';
import './Support.css';

// 选项卡类型
const TAB_TYPES = {
  INQUIRY: 'inquiry',
  FAQ: 'faq'
};

export default function Support() {
  const { t } = useTranslation();
  
  // 从 URL hash 获取当前激活的选项卡
  const getActiveTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && Object.values(TAB_TYPES).includes(hash)) {
      return hash;
    }
    // 默认显示第一个选项卡
    return TAB_TYPES.INQUIRY;
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromHash);

  // 监听 URL hash 变化，更新激活的选项卡
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getActiveTabFromHash();
      setActiveTab(newTab);
    };

    // 初始设置
    handleHashChange();

    // 监听 hash 变化
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSubmitSuccess = () => {
    // 刷新咨询历史
    window.location.reload();
  };

  // 获取 submenu 配置
  const getSubmenuItems = () => {
    return [
      {
        key: 'support-inquiry',
        hash: 'inquiry',
        label: t('support.inquiry', '1:1 咨询'),
        isTab: true,
        basePath: '/member/support'
      },
      {
        key: 'support-faq',
        hash: 'faq',
        label: t('support.faq', '常见问题'),
        isTab: true,
        basePath: '/member/support'
      }
    ];
  };

  return (
    <div className="support">
      <Banner
        bannerType={BANNER_TYPES.SUPPORT}
        sectionClassName="member-banner-section"
      />
      <Submenu
        items={getSubmenuItems()}
        className="support-submenu"
        headerSelector=".member-header"
      />

      <div className="page-header">
      </div>

      {/* 1:1 咨询 */}
      {activeTab === TAB_TYPES.INQUIRY && (
        <div className="tab-content">
          <div className="support-grid">
            {/* 咨询表单 */}
            <ConsultationForm onSubmitSuccess={handleSubmitSuccess} />

            {/* 咨询历史 */}
            <ConsultationHistory />
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeTab === TAB_TYPES.FAQ && (
        <div className="tab-content">
          <FAQList />
        </div>
      )}
    </div>
  );
}
