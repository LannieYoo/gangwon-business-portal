/**
 * 通知历史视图
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React from "react";
import { useNotificationHistory } from "../hooks/useNotificationHistory";
import NotificationHistoryPage from "../components/NotificationHistoryPage/NotificationHistoryPage";
import { Banner } from "@shared/components";
import { BANNER_TYPES } from "@shared/utils/constants";
import SupportSubmenu from "../components/SupportSubmenu";

/**
 * 通知历史视图组件
 */
export default function NotificationHistoryView() {
  const historyData = useNotificationHistory();

  return (
    <div className="flex flex-col w-full">
      <Banner
        bannerType={BANNER_TYPES.SUPPORT}
        sectionClassName="member-banner-section"
      />
      <SupportSubmenu />
      <NotificationHistoryPage {...historyData} />
    </div>
  );
}
