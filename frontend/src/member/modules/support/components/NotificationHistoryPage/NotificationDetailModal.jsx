/**
 * 通知详情模态框组件
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@shared/components";
import { format } from "date-fns";
import { ko, zhCN } from "date-fns/locale";
import { 
  parseNotification, 
  getNotificationTranslationKey,
  formatNotificationParams 
} from "@shared/utils/notificationParser";

/**
 * 通知详情模态框
 */
export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
}) {
  const { t, i18n } = useTranslation();

  if (!notification) return null;

  const getLocale = () => {
    return i18n.language === "ko" ? ko : zhCN;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PPpp", { locale: getLocale() });
    } catch (error) {
      return dateString;
    }
  };

  // 解析并翻译通知内容
  const { translatedSubject, translatedContent } = useMemo(() => {
    const data = parseNotification(notification.subject, notification.content);
    
    if (data) {
      // 获取翻译键
      const subjectKey = getNotificationTranslationKey(data, 'subject');
      const contentKey = getNotificationTranslationKey(data, 'content');
      
      // 格式化参数
      const params = formatNotificationParams(data);
      
      return {
        translatedSubject: subjectKey ? t(subjectKey, params) : notification.subject,
        translatedContent: contentKey ? t(contentKey, params) : notification.content,
      };
    }
    
    // 如果不是 JSON 格式，直接返回原始内容
    return {
      translatedSubject: notification.subject,
      translatedContent: notification.content,
    };
  }, [notification, t]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {translatedSubject}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              {t("support.sender")}: {notification.senderName || "System"}
            </span>
            <span>{formatDate(notification.createdAt)}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {translatedContent}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
