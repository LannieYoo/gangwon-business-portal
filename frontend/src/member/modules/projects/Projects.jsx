/**
 * Projects Page - Member Portal
 * 项目页面 - 显示项目列表和申请记录
 * Requirements: 7.1, 7.2
 */

import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Banner, Submenu } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import { PageContainer } from '@member/layouts';

export default function Projects() {
  const { t } = useTranslation();

  // Submenu 配置：项目列表、申请记录
  // Requirements: 7.1 - 在业务管理页面添加申请记录菜单
  const submenuItems = [
    {
      key: 'project-list',
      label: t('projects.tabs.projectList', '사업 목록'),
      path: '/member/programs',
      exact: true,
      isTab: true
    },
    {
      key: 'application-records',
      label: t('projects.tabs.applicationRecords', '신청 기록'),
      path: '/member/programs/applications',
      isTab: true
    }
  ];

  return (
    <div className="projects w-full max-w-full flex flex-col p-0 m-0 overflow-x-hidden relative">
      <Banner
        bannerType={BANNER_TYPES.PROJECTS}
        sectionClassName="member-banner-section"
      />
      
      <Submenu items={submenuItems} renderLeft={() => null} />
      
      <PageContainer>
        <div className="w-full">
          <Outlet />
        </div>
      </PageContainer>
    </div>
  );
}
