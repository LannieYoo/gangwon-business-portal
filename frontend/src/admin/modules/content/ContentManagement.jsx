/**
 * Content Management Component - Admin Portal
 * 内容管理（横幅、弹窗、公告）
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TabContainer } from '@shared/components';
import BannerManagement from './BannerManagement';
import NoticeManagement from './NoticeManagement';
import FAQManagement from './FAQManagement';
import SystemInfoManagement from './SystemInfoManagement';
import LegalContentManagement from './LegalContentManagement';

export default function ContentManagement() {
  const { t } = useTranslation();

  // 使用 useMemo 缓存 tabs 配置
  const tabs = useMemo(() => [
    { 
      key: 'banners', 
      label: t('admin.content.tabs.banners'),
      content: <BannerManagement />
    },
    { 
      key: 'notices', 
      label: t('admin.content.tabs.notices'),
      content: <NoticeManagement />
    },
    { 
      key: 'faq', 
      label: t('admin.content.tabs.faq'),
      content: <FAQManagement />
    },
    { 
      key: 'systemInfo', 
      label: t('admin.content.tabs.systemInfo'),
      content: <SystemInfoManagement />
    },
    { 
      key: 'legal', 
      label: t('admin.content.tabs.legal', '약관관리'),
      content: <LegalContentManagement />
    }
  ], [t]);

  return (
    <TabContainer
      tabs={tabs}
      defaultTab="banners"
      title={t('admin.content.title')}
      lazy={true}
    />
  );
}
