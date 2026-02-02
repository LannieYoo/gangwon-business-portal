/**
 * 通知历史业务逻辑 Hook
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supportService } from "../services/support.service";

/**
 * 通知历史逻辑控制 Hook
 */
export function useNotificationHistory() {
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readFilter, setReadFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(async (page = 1, size = 10) => {
    console.log('🔄 [useNotificationHistory] fetchNotifications 开始, page:', page, 'size:', size);
    setLoading(true);
    setError(null);
    try {
      const response = await supportService.getMemberMessages({
        page,
        pageSize: size,
        messageType: 'direct', // 只获取直接消息
      });
      const items = response.items || [];
      const total = response.total || 0;
      
      console.log('📦 [useNotificationHistory] 获取到数据:', items.length, '条, 总数:', total);
      console.log('📊 [useNotificationHistory] 未读数量:', items.filter(n => !n.isRead).length);
      
      setAllNotifications(items);
      setTotalCount(total);
      setCurrentPage(page);
      setPageSize(size);
      
      // 应用当前的已读筛选
      let filtered = items;
      if (readFilter === 'unread') {
        filtered = items.filter(n => !n.isRead);
      } else if (readFilter === 'read') {
        filtered = items.filter(n => n.isRead);
      }
      console.log('🔍 [useNotificationHistory] 筛选后数据:', filtered.length, '条 (filter:', readFilter, ')');
      setFilteredNotifications(filtered);
      
      return items;
    } catch (err) {
      setError(err);
      console.error('Failed to fetch notifications:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [readFilter]);

  // 初始加载
  useEffect(() => {
    fetchNotifications(1, pageSize);
  }, []);

  // 当 readFilter 改变时，重新应用筛选
  useEffect(() => {
    console.log('🔄 [useNotificationHistory] readFilter 改变:', readFilter);
    let filtered = allNotifications;
    if (readFilter === 'unread') {
      filtered = allNotifications.filter(n => !n.isRead);
    } else if (readFilter === 'read') {
      filtered = allNotifications.filter(n => n.isRead);
    }
    console.log('🔍 [useNotificationHistory] 重新筛选后:', filtered.length, '条');
    setFilteredNotifications(filtered);
  }, [readFilter, allNotifications]);

  const handlePageChange = useCallback((page) => {
    fetchNotifications(page, pageSize);
  }, [fetchNotifications, pageSize]);

  const handlePageSizeChange = useCallback((size) => {
    fetchNotifications(1, size);
  }, [fetchNotifications]);

  const handleFilterChange = useCallback((filtered) => {
    console.log('🔍 [useNotificationHistory] handleFilterChange 被调用, 数据量:', filtered.length);
    // 应用已读筛选
    let finalFiltered = filtered;
    if (readFilter === 'unread') {
      finalFiltered = filtered.filter(n => !n.isRead);
    } else if (readFilter === 'read') {
      finalFiltered = filtered.filter(n => n.isRead);
    }
    console.log('🔍 [useNotificationHistory] 应用 readFilter 后:', finalFiltered.length, '条');
    setFilteredNotifications(finalFiltered);
  }, [readFilter]);

  const openDetailModal = async (notification) => {
    console.log('📖 [useNotificationHistory] openDetailModal 被调用');
    console.log('📋 [useNotificationHistory] 通知 ID:', notification.id, '已读状态:', notification.isRead);
    setSelectedNotification(notification);
    
    // Mark as read (静默标记，不刷新UI)
    if (!notification.isRead) {
      console.log('✍️ [useNotificationHistory] 标记为已读...');
      try {
        await supportService.markMessageAsRead(notification.id);
        console.log('✅ [useNotificationHistory] 标记成功');
      } catch (error) {
        console.error('❌ [useNotificationHistory] 标记失败:', error);
      }
    } else {
      console.log('ℹ️ [useNotificationHistory] 已经是已读状态，跳过标记');
    }
  };

  const closeDetailModal = () => {
    console.log('🚪 [useNotificationHistory] closeDetailModal 被调用');
    setSelectedNotification(null);
    
    // 重新获取数据
    console.log('🔄 [useNotificationHistory] 准备重新获取数据...');
    fetchNotifications(currentPage, pageSize).then(() => {
      console.log('✅ [useNotificationHistory] 数据刷新完成');
    });
    
    // 触发全局事件，通知铃铛刷新
    console.log('🔔 [useNotificationHistory] 触发 notification-read 事件');
    window.dispatchEvent(new CustomEvent('notification-read'));
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
    handlePageChange,
    handlePageSizeChange,
  };
}
