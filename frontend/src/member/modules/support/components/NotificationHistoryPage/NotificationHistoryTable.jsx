/**
 * 通知历史表格组件
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ko, zhCN } from "date-fns/locale";
import { Pagination } from "@shared/components";
import {
  parseNotification,
  getNotificationTranslationKey,
  formatNotificationParams,
} from "@shared/utils/notificationParser";

/**
 * 通知历史表格
 */
export default function NotificationHistoryTable({
  loading,
  filteredNotifications,
  allNotifications,
  openDetailModal,
  getReadBadge,
  getCategoryBadge,
  // 分页相关
  currentPage,
  totalPages,
  onPageChange,
}) {
  const { t, i18n } = useTranslation();

  const getLocale = () => {
    return i18n.language === "ko" ? ko : zhCN;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: getLocale(),
      });
    } catch (error) {
      return dateString;
    }
  };

  // 翻译通知内容
  const translateNotification = (notification) => {
    const data = parseNotification(notification.subject, notification.content);

    if (data) {
      const subjectKey = getNotificationTranslationKey(data, "subject");
      const contentKey = getNotificationTranslationKey(data, "content");
      const params = formatNotificationParams(data);

      return {
        subject: subjectKey ? t(subjectKey, params) : notification.subject,
        content: contentKey ? t(contentKey, params) : notification.content,
      };
    }

    return {
      subject: notification.subject,
      content: notification.content,
    };
  };

  if (!allNotifications || allNotifications.length === 0) {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-500">{t("common.loading")}</p>
        </div>
      );
    }
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">{t("notifications.empty")}</p>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">{t("common.noSearchResults")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("member.support.category.label")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.title")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("member.support.readStatus")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.date")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const translated = translateNotification(notification);

              return (
                <tr
                  key={notification.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(
                      notification.subject,
                      notification.content,
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {translated.subject}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {translated.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getReadBadge(notification.isRead)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(notification.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openDetailModal(notification)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {t("common.view")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredNotifications.map((notification) => {
          const translated = translateNotification(notification);

          return (
            <div
              key={notification.id}
              onClick={() => openDetailModal(notification)}
              className={`p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-blue-200 transition-all ${
                !notification.isRead ? "bg-blue-50" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getCategoryBadge(notification.subject, notification.content)}
                {getReadBadge(notification.isRead)}
              </div>
              <h3 className="text-base font-medium text-gray-900 m-0 mb-1">
                {translated.subject}
              </h3>
              <p className="text-sm text-gray-500 m-0 mb-2 line-clamp-2">
                {translated.content}
              </p>
              <div className="text-sm text-gray-400">
                {formatDate(notification.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
