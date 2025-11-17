/**
 * Home Page - Member Portal
 * 企业会员首页
 * 
 * 按照文档要求，首页包含：
 * 1. 主横幅(1) - 大尺寸图片（点击时如有URL则跳转）
 * 2. 公告事项 - 最近5条
 * 3. 新闻稿 - 最近1条缩略图（点击时跳转到相应公告板）
 * 4. 主横幅(2) - 小尺寸
 */

import { useTranslation } from 'react-i18next';
import { Banner } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import { PageContainer } from '@member/layouts';
import NoticesPreview from './NoticesPreview';
import PressPreview from './PressPreview';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home">
      {/* 主横幅(1) - 大尺寸 */}
      <Banner
        bannerType={BANNER_TYPES.MAIN_PRIMARY}
        sectionClassName="member-banner-section"
        height="500px"
      />
      
      {/* 公告事项 - 最近5条 */}
      <PageContainer>
        <NoticesPreview />
        
        {/* 新闻稿 - 最近1条缩略图 */}
        <PressPreview />
      </PageContainer>
      
      {/* 主横幅(2) - 小尺寸 */}
      <Banner
        bannerType={BANNER_TYPES.MAIN_SECONDARY}
        sectionClassName="secondary-banner-section"
        height="200px"
      />
    </div>
  );
}

