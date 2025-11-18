/**
 * Projects Page - Member Portal
 * 项目页面 - 显示项目列表
 */

import { Banner } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import ProjectList from './ProjectList';
import './Projects.css';

export default function Projects() {
  return (
    <div className="projects">
      <Banner
        bannerType={BANNER_TYPES.PROJECTS}
        sectionClassName="member-banner-section"
      />
      <div className="projects-content">
        <ProjectList />
      </div>
    </div>
  );
}
