/**
 * Projects Page - Member Portal
 * 项目页面 - 显示项目列表
 */

import { Banner } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import ProjectList from './ProjectList';

export default function Projects() {
  return (
    <div className="projects w-full flex flex-col">
      <Banner
        bannerType={BANNER_TYPES.PROJECTS}
        sectionClassName="mb-16"
        height="400px"
        fullWidth={true}
      />
      <ProjectList />
    </div>
  );
}
