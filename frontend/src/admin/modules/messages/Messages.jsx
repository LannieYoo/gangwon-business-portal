/**
 * Messages Component - Admin Portal
 * 1对1咨询管理 + 通知历史
 */

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Card, Tabs } from "@shared/components";
import ThreadList from "./ThreadList";
import MessageAnalytics from "./MessageAnalytics";
import NotificationHistory from "./NotificationHistory";

export default function Messages() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // 从 URL 参数读取初始 tab，默认为 'threads'
  const initialTab = searchParams.get("tab") || "threads";
  const [activeTab, setActiveTab] = useState(initialTab);

  // 当 URL 参数变化时更新 activeTab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["threads", "notifications", "analytics"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = useMemo(
    () => [
      { key: "threads", label: t("admin.messages.tabs.threads") },
      { key: "notifications", label: t("admin.messages.tabs.notifications") },
      { key: "analytics", label: t("admin.messages.tabs.analytics") },
    ],
    [t],
  );

  return (
    <div className="admin-messages">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 m-0">
          {t("admin.messages.title")}
        </h1>
      </div>

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="tab-content mt-6 p-6">
          {activeTab === "threads" && <ThreadList />}
          {activeTab === "notifications" && <NotificationHistory />}
          {activeTab === "analytics" && <MessageAnalytics />}
        </div>
      </Card>
    </div>
  );
}




