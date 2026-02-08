/**
 * Notification Bell Component
 * 右上角通知图标组件 - 下拉框形式
 *
 * 会员：只显示管理员回复的thread消息，点击弹出modal
 * 管理员：只显示会员发送的thread消息，点击跳转页面
 *
 * 遵循 dev-frontend_patterns skill 规范 - 通过 props 接收服务方法
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@shared/components";
import { formatDateTime } from "@shared/utils";
import {
  parseNotification,
  getNotificationTranslationKey,
  formatNotificationParams,
} from "@shared/utils/notificationParser";
import { EnvelopeIcon, EnvelopeOpenIcon } from "@shared/components/Icons";
import ThreadDetailModal from "./ThreadDetailModal";

export default function NotificationBell({
  userType = "member",
  variant = "light",
  services, // 通过 props 接收服务方法
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef(null);
  const dropdownRef = useRef(null);

  // Modal 状态（会员端使用）
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  const viewAllPath =
    userType === "admin"
      ? "/admin/messages"
      : "/member/support/inquiry-history";
  const iconColorClass =
    variant === "dark"
      ? "text-white hover:text-yellow-100"
      : "text-[#002244] hover:text-blue-600";

  /**
   * 翻译通知内容
   */
  const translateNotification = (msg) => {
    // 尝试解析 JSON 格式的通知
    const parsedData = parseNotification(msg.subject, msg.content);

    if (parsedData) {
      // 是结构化通知，使用翻译
      const subjectKey = getNotificationTranslationKey(parsedData, "subject");
      const contentKey = getNotificationTranslationKey(parsedData, "content");
      const params = formatNotificationParams(parsedData);

      return {
        subject: subjectKey ? t(subjectKey, params) : msg.subject,
        content: contentKey ? t(contentKey, params) : msg.content,
      };
    }

    // 不是结构化通知，直接返回原文
    return {
      subject: msg.subject,
      content: msg.content,
    };
  };

  const loadUnreadCount = async () => {
    if (!services?.getUnreadCount) return;

    try {
      const count = await services.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // 401 错误表示用户未登录，静默处理
      const status = error?.status || error?.response?.status;
      if (status === 401) {
        setUnreadCount(0);
        return;
      }
      console.error("Failed to load unread count:", error);
    }
  };

  const loadNotifications = async () => {
    if (!services?.getThreads || !services?.getMessages) return;

    setLoading(true);

    try {
      // 获取线程消息和直接消息
      const [threadsResponse, messagesResponse] = await Promise.all([
        services.getThreads({ page: 1, pageSize: 50 }),
        services.getMessages({ page: 1, pageSize: 10, isRead: false }),
      ]);

      if (userType === "admin") {
        // 管理员端：筛选出有未读消息的线程
        const threadNotifications = (threadsResponse.items || [])
          .filter((thread) => thread.adminUnreadCount > 0)
          .map((thread) => ({
            id: thread.id,
            subject: thread.subject,
            content: t("components.notification.fromMember", {
              name: thread.memberName || t("common.member"),
            }),
            isRead: false,
            isImportant: false,
            createdAt: thread.lastMessageAt || thread.createdAt,
            isThread: true,
            unreadCount: thread.adminUnreadCount,
          }));

        // 直接消息（系统通知）- 使用翻译
        const directNotifications = (messagesResponse.items || [])
          .filter(
            (msg) =>
              !msg.isRead &&
              (msg.messageType === "direct" || msg.message_type === "direct"),
          )
          .map((msg) => {
            const translated = translateNotification(msg);
            return {
              id: msg.id,
              subject: translated.subject,
              content: translated.content,
              isRead: false,
              isImportant: msg.isImportant,
              createdAt: msg.createdAt,
              isThread: false,
              isDirect: true,
              messageType: msg.messageType || msg.message_type,
            };
          });

        // 合并并排序
        const allNotifications = [
          ...threadNotifications,
          ...directNotifications,
        ]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setNotifications(allNotifications);
      } else {
        // 会员端：显示线程消息 + 直接消息（系统通知）
        // 线程通知
        const threadNotifications = (threadsResponse.items || [])
          .filter((thread) => thread.unreadCount > 0)
          .map((thread) => ({
            id: thread.id,
            subject: thread.subject,
            content: t("components.notification.adminReplied"),
            isRead: false,
            isImportant: false,
            createdAt: thread.lastMessageAt || thread.createdAt,
            isThread: true,
            unreadCount: thread.unreadCount,
          }));

        // 直接消息（系统通知）- 使用翻译
        const directNotifications = (messagesResponse.items || [])
          .filter(
            (msg) =>
              !msg.isRead &&
              (msg.messageType === "direct" || msg.message_type === "direct"),
          )
          .map((msg) => {
            const translated = translateNotification(msg);
            return {
              id: msg.id,
              subject: translated.subject,
              content: translated.content,
              isRead: false,
              isImportant: msg.isImportant,
              createdAt: msg.createdAt,
              isThread: false,
              isDirect: true,
              messageType: msg.messageType || msg.message_type,
            };
          });

        // 合并并排序
        const allNotifications = [
          ...threadNotifications,
          ...directNotifications,
        ]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setNotifications(allNotifications);
      }
    } catch (error) {
      // 401 错误表示用户未登录，静默处理
      const status = error?.status || error?.response?.status;
      if (status === 401) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      console.error("Failed to load notifications:", error);
    }

    setLoading(false);
  };

  // 组件加载时立即获取未读数量
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUnreadCount(0);
      return;
    }
    loadUnreadCount();

    // 设置定时刷新未读数量（每1分钟）
    const interval = setInterval(loadUnreadCount, 60000);
    intervalRef.current = interval;

    // 监听全局通知已读事件
    const handleNotificationRead = () => {
      loadUnreadCount();
    };
    window.addEventListener("notification-read", handleNotificationRead);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("notification-read", handleNotificationRead);
    };
  }, [userType]);

  // 点击打开时加载通知列表
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);

    if (userType === "admin") {
      if (notification.isThread) {
        // 线程消息：跳转到消息页面
        navigate(`/admin/messages?threadId=${notification.id}`);
      } else if (notification.isDirect) {
        // 直接消息：标记为已读并跳转到系统通知Tab
        if (services?.markAsRead) {
          try {
            await services.markAsRead(notification.id);
            loadUnreadCount();
          } catch (error) {
            console.error("Failed to mark message as read:", error);
          }
        }
        // 直接消息 -> 跳转到系统通知Tab
        navigate("/admin/messages?tab=notifications");
      }
    } else if (notification.isThread) {
      // 会员端线程消息：打开对话框
      setSelectedThreadId(notification.id);
    } else if (notification.isDirect) {
      // 会员端直接消息：标记为已读并跳转到通知历史
      if (services?.markAsRead) {
        try {
          await services.markAsRead(notification.id);
          loadUnreadCount();
        } catch (error) {
          console.error("Failed to mark message as read:", error);
        }
      }

      // 直接消息 -> 跳转到通知历史页面
      navigate("/member/support/notifications");
    }
  };

  const handleModalClose = () => {
    setSelectedThreadId(null);
    loadUnreadCount();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 ${iconColorClass} transition-colors cursor-pointer border-none bg-transparent outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md`}
          aria-label={t("common.notifications")}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-semibold text-white bg-red-600 rounded-full border-2 border-white shadow-md">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {t("common.notifications")}
              </h3>
              {unreadCount > 0 && (
                <Badge variant="error" size="sm">
                  {unreadCount} {t("components.notification.unread")}
                </Badge>
              )}
            </div>

            <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">{t("common.loading")}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">
                    {t("components.notification.empty")}
                  </p>
                </div>
              ) : (
                <div>
                  {/* 线程消息区域 */}
                  {notifications.filter((n) => n.isThread).length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 uppercase">
                          {userType === "admin"
                            ? t("components.notification.memberInquiries")
                            : t("components.notification.adminReplies")}
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications
                          .filter((n) => n.isThread)
                          .map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? "bg-blue-50/50" : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {notification.isRead ? (
                                    <EnvelopeOpenIcon className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4
                                      className={`text-sm truncate ${!notification.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                                    >
                                      {notification.subject}
                                    </h4>
                                    {notification.isImportant && (
                                      <Badge variant="error" size="sm">
                                        {t("components.notification.important")}
                                      </Badge>
                                    )}
                                    {!notification.isRead && (
                                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                    )}
                                  </div>
                                  {notification.content && (
                                    <p className="text-xs text-gray-500 truncate mb-1">
                                      {notification.content.length > 80
                                        ? `${notification.content.substring(0, 80)}...`
                                        : notification.content}
                                    </p>
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {formatDateTime(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 直接消息区域 */}
                  {notifications.filter((n) => n.isDirect).length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 uppercase">
                          {t("components.notification.systemNotifications")}
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications
                          .filter((n) => n.isDirect)
                          .map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? "bg-blue-50/50" : ""}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {notification.isRead ? (
                                    <EnvelopeOpenIcon className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4
                                      className={`text-sm truncate ${!notification.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                                    >
                                      {notification.subject}
                                    </h4>
                                    {notification.isImportant && (
                                      <Badge variant="error" size="sm">
                                        {t("components.notification.important")}
                                      </Badge>
                                    )}
                                    {!notification.isRead && (
                                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                    )}
                                  </div>
                                  {notification.content && (
                                    <p className="text-xs text-gray-500 truncate mb-1">
                                      {notification.content.length > 80
                                        ? `${notification.content.substring(0, 80)}...`
                                        : notification.content}
                                    </p>
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {formatDateTime(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-200 space-y-2">
              {/* 当同时有线程消息和直接消息时，分别显示两个按钮 */}
              {notifications.filter((n) => n.isThread).length > 0 &&
              notifications.filter((n) => n.isDirect).length > 0 ? (
                <>
                  {/* 线程消息查看全部 */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(
                        userType === "admin"
                          ? "/admin/messages"
                          : "/member/support/inquiry-history",
                      );
                    }}
                    className="block w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium bg-transparent border-none cursor-pointer"
                  >
                    {t("components.notification.viewAllInquiries")}
                  </button>

                  {/* 直接消息查看全部 */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(
                        userType === "admin"
                          ? "/admin/messages?tab=notifications"
                          : "/member/support/notifications",
                      );
                    }}
                    className="block w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium bg-transparent border-none cursor-pointer"
                  >
                    {t("components.notification.viewAllNotifications")}
                  </button>
                </>
              ) : notifications.length > 0 ? (
                /* 只有一种类型时，显示统一的查看全部按钮 */
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // 根据存在的通知类型决定跳转路径
                    if (notifications.some((n) => n.isThread)) {
                      navigate(
                        userType === "admin"
                          ? "/admin/messages"
                          : "/member/support/inquiry-history",
                      );
                    } else {
                      navigate(
                        userType === "admin"
                          ? "/admin/messages?tab=notifications"
                          : "/member/support/notifications",
                      );
                    }
                  }}
                  className="block w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium bg-transparent border-none cursor-pointer"
                >
                  {t("components.notification.viewAll")}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* 会员端消息详情 Modal */}
      {userType === "member" && (
        <ThreadDetailModal
          threadId={selectedThreadId}
          isOpen={selectedThreadId !== null}
          onClose={handleModalClose}
          onMessageSent={loadUnreadCount}
          services={services}
        />
      )}
    </>
  );
}
