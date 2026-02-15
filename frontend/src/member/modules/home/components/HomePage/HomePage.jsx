/**
 * 首页页面组件 (页面内容布局)
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React, { memo } from "react";
import { Banner } from "@shared/components";
import { BANNER_TYPES } from "@shared/utils/constants";
import { PageContainer } from "@member/layouts";
import NoticesPreview from "../NoticesPreview";
import ProjectPreview from "../ProjectPreview";

/**
 * 首页内容布局组件
 */
const HomePage = memo(function HomePage() {
  return (
    <PageContainer className="pb-8 overflow-hidden" fullWidth={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full">
        {/* 项目公告 */}
        <div className="flex h-full">
          <ProjectPreview />
        </div>

        {/* 公告事项 */}
        <div className="flex h-full">
          <NoticesPreview />
        </div>

        {/* 主横幅(2) - 小尺寸，不全宽 */}
        <div className="flex min-h-[380px] lg:col-span-2 xl:col-span-1">
          <Banner
            bannerType={BANNER_TYPES.MAIN_SECONDARY}
            sectionClassName="h-full w-full rounded-lg overflow-hidden"
            height="100%"
            fullWidth={false}
          />
        </div>
      </div>
    </PageContainer>
  );
});

export default HomePage;
