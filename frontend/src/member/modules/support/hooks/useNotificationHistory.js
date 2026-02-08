/**
 * 通知历史业务逻辑 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supportService } from "../services/support.service";

/**
 * 通知历史逻辑控制 Hook
 */
export function useNotificationHistory(defaultPageSize = 10) {
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readFilter, setReadFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  const [totalCount, setTotalCount] = useState(0);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const fetchNotifications = useCallback(
    async (page = 1, size = defaultPageSize) => {
      setLoading(true);
      setError(null);
      try {
        const response = await supportService.getMemberMessages({
          page,
          pageSize: size,
          messageType: "direct",
        });
        const items = response.items || [];
        const total = response.total || 0;

        setAllNotifications(items);
        setTotalCount(total);
        setCurrentPage(page);

        // 应用当前的已读筛选
        let filtered = items;
        if (readFilter === "unread") {
          filtered = items.filter((n) => !n.isRead);
        } else if (readFilter === "read") {
          filtered = items.filter((n) => n.isRead);
        }
        setFilteredNotifications(filtered);

        return items;
      } catch (err) {
        setError(err);
        console.error("Failed to fetch notifications:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [readFilter, defaultPageSize],
  );

  // 初始加载
  useEffect(() => {
    fetchNotifications(1, pageSize);
  }, []);

  // 当 readFilter 改变时，重新应用筛选
  useEffect(() => {
    let filtered = allNotifications;
    if (readFilter === "unread") {
      filtered = allNotifications.filter((n) => !n.isRead);
    } else if (readFilter === "read") {
      filtered = allNotifications.filter((n) => n.isRead);
    }
    setFilteredNotifications(filtered);
  }, [readFilter, allNotifications]);

  const handlePageChange = useCallback(
    (page) => {
      fetchNotifications(page, pageSize);
    },
    [fetchNotifications, pageSize],
  );

  const handleFilterChange = useCallback(
    (filtered) => {
      // 应用已读筛选
      let finalFiltered = filtered;
      if (readFilter === "unread") {
        finalFiltered = filtered.filter((n) => !n.isRead);
      } else if (readFilter === "read") {
        finalFiltered = filtered.filter((n) => n.isRead);
      }
      setFilteredNotifications(finalFiltered);
    },
    [readFilter],
  );

  const openDetailModal = async (notification) => {
    setSelectedNotification(notification);

    // Mark as read
    if (!notification.isRead) {
      try {
        await supportService.markMessageAsRead(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const closeDetailModal = () => {
    setSelectedNotification(null);

    // 重新获取数据
    fetchNotifications(currentPage, pageSize);

    // 触发全局事件，通知铃铛刷新
    window.dispatchEvent(new CustomEvent("notification-read"));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      supportService.markMessageAsRead(notification.id);
    }

    // Navigate based on subject prefix
    const subject = notification.subject || "";
    if (subject.includes("[실적 관리]")) {
      navigate("/member/performance");
    } else if (subject.includes("[사업 관리]")) {
      navigate("/member/projects");
    } else if (subject.includes("[회원 관리]")) {
      navigate("/member/profile");
    }
  };

  return {
    allNotifications,
    filteredNotifications,
    loading,
    error,
    selectedNotification,
    readFilter,
    setReadFilter,
    handleFilterChange,
    openDetailModal,
    closeDetailModal,
    handleNotificationClick,
    loadNotifications: fetchNotifications,
    navigate,
    // 分页相关
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    onPageChange: handlePageChange,
  };
}
