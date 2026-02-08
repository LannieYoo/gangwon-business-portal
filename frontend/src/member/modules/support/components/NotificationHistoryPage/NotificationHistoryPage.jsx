/**
 * 通知历史页面组件 (内容组件)
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, Badge } from "@shared/components";
import { PageContainer } from "@member/layouts";
import {
  parseNotification,
  getNotificationCategory,
} from "@shared/utils/notificationParser";

import NotificationHistoryFilter from "./NotificationHistoryFilter";
import NotificationHistoryTable from "./NotificationHistoryTable";
import NotificationDetailModal from "./NotificationDetailModal";

/**
 * 通知历史页面主体渲染组件 (内容)
 */
export default function NotificationHistoryPage(props) {
  const { t } = useTranslation();
  const {
    allNotifications,
    filteredNotifications,
    loading,
    selectedNotification,
    readFilter,
    setReadFilter,
    handleFilterChange,
    openDetailModal,
    closeDetailModal,
    handleNotificationClick,
    currentPage,
    totalCount,
    totalPages,
    onPageChange,
  } = props;

  const readOptions = useMemo(
    () => [
      { value: "", label: t("common.all") },
      { value: "unread", label: t("notifications.unread") },
      { value: "read", label: t("member.support.read") },
    ],
    [t],
  );

  const getReadBadge = (isRead) => {
    return (
      <Badge variant={isRead ? "secondary" : "success"}>
        {isRead ? t("member.support.read") : t("notifications.unread")}
      </Badge>
    );
  };

  const getCategoryBadge = (subject, content) => {
    // 尝试解析 JSON 格式的通知
    const data = parseNotification(subject, content);

    if (data) {
      // 使用解析后的类型判断分类
      const category = getNotificationCategory(data);

      const categoryMap = {
        performance: {
          variant: "warning",
          label: t("member.support.category.performance"),
        },
        project: {
          variant: "info",
          label: t("member.support.category.project"),
        },
        member: {
          variant: "primary",
          label: t("member.support.category.member"),
        },
        system: {
          variant: "secondary",
          label: t("notifications.systemNotifications"),
        },
      };

      const config = categoryMap[category] || categoryMap.system;
      return (
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
      );
    }

    // 兼容旧格式：基于文本内容判断
    if (!subject) return null;

    if (subject.includes("[실적 관리") || subject.includes("实绩管理")) {
      return (
        <Badge variant="warning" size="sm">
          {t("member.support.category.performance")}
        </Badge>
      );
    } else if (subject.includes("[사업 관리") || subject.includes("项目管理")) {
      return (
        <Badge variant="info" size="sm">
          {t("member.support.category.project")}
        </Badge>
      );
    } else if (subject.includes("[회원 관리") || subject.includes("会员管理")) {
      return (
        <Badge variant="primary" size="sm">
          {t("member.support.category.member")}
        </Badge>
      );
    }

    // 系统通知（没有特定分类标签的通知）
    return (
      <Badge variant="secondary" size="sm">
        {t("notifications.systemNotifications")}
      </Badge>
    );
  };

  const filterColumns = useMemo(
    () => [
      { key: "subject", render: (value) => value || "" },
      { key: "content", render: (value) => value || "" },
    ],
    [],
  );

  return (
    <PageContainer className="pb-8">
      <div className="w-full">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("member.support.notificationHistory")}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {t(
              "member.support.notificationHistoryDetails.description",
              "시스템 알림 및 공지 확인",
            )}
          </p>
        </div>

        <NotificationHistoryFilter
          allNotifications={allNotifications}
          columns={filterColumns}
          handleFilterChange={handleFilterChange}
          readFilter={readFilter}
          setReadFilter={setReadFilter}
          readOptions={readOptions}
        />

        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              {t("common.resultsCount", "총 {{count}}건", {
                count: totalCount,
              })}
            </p>
            <NotificationHistoryTable
              loading={loading}
              filteredNotifications={filteredNotifications}
              allNotifications={allNotifications}
              openDetailModal={openDetailModal}
              getReadBadge={getReadBadge}
              getCategoryBadge={getCategoryBadge}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </Card>
      </div>

      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          isOpen={selectedNotification !== null}
          onClose={closeDetailModal}
        />
      )}
    </PageContainer>
  );
}
