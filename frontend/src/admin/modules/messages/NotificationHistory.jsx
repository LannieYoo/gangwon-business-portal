/**
 * Notification History Component - Admin Portal
 * 管理员通知历史
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, SearchInput } from '@shared/components';
import { messagesService } from './services/messages.service';
import { formatDistanceToNow } from 'date-fns';
import { ko, zhCN } from 'date-fns/locale';
import { 
  parseNotification, 
  getNotificationTranslationKey,
  formatNotificationParams,
  getNotificationCategory 
} from '@shared/utils/notificationParser';

export default function NotificationHistory() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readFilter, setReadFilter] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, notificationId: null });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const getLocale = () => {
    return i18n.language === 'ko' ? ko : zhCN;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: getLocale(),
      });
    } catch (error) {
      return dateString;
    }
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await messagesService.getMessages({
        page: 1,
        pageSize: 100,
        messageType: 'direct', // 只查询直接消息（系统通知）
      });
      
      setNotifications(response.items || []);
      setFilteredNotifications(response.items || []);
    } catch (error) {
      console.error('[NotificationHistory] Failed to load notifications:', error);
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleFilterChange = useCallback((filtered) => {
    setFilteredNotifications(filtered);
  }, []);

  // 翻译通知内容
  const translateNotification = useCallback((notification) => {
    const data = parseNotification(notification.subject, notification.content);
    
    if (data) {
      const subjectKey = getNotificationTranslationKey(data, 'subject', 'admin.messages');
      const contentKey = getNotificationTranslationKey(data, 'content', 'admin.messages');
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
  }, [t]);

  const getCategoryBadge = useCallback((subject, content) => {
    // 尝试解析 JSON 格式的通知
    const data = parseNotification(subject, content);
    
    if (data) {
      // 使用解析后的类型判断分类
      const category = getNotificationCategory(data);
      
      const categoryMap = {
        performance: {
          variant: "warning",
          label: t("admin.messages.category.performance"),
        },
        project: {
          variant: "info",
          label: t("admin.messages.category.project"),
        },
        member: {
          variant: "primary",
          label: t("admin.messages.category.member"),
        },
        system: {
          variant: "secondary",
          label: t("admin.messages.category.system"),
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
    
    // 支持双语格式
    if (subject.includes('[회원 관리') || subject.includes('会员管理')) {
      return (
        <Badge variant="primary" size="sm">
          {t('admin.messages.category.member')}
        </Badge>
      );
    } else if (subject.includes('[실적 관리') || subject.includes('实绩管理')) {
      return (
        <Badge variant="warning" size="sm">
          {t('admin.messages.category.performance')}
        </Badge>
      );
    } else if (subject.includes('[사업 관리') || subject.includes('项目管理')) {
      return (
        <Badge variant="info" size="sm">
          {t('admin.messages.category.project')}
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" size="sm">
        {t('admin.messages.category.system')}
      </Badge>
    );
  }, [t]);

  const getReadBadge = (isRead) => {
    return (
      <Badge variant={isRead ? 'secondary' : 'success'}>
        {isRead ? t('admin.messages.read') : t('admin.messages.unread')}
      </Badge>
    );
  };

  const handleViewNotification = async (notification) => {
    setSelectedNotification(notification);
    
    // 标记为已读（静默，不刷新）
    if (!notification.isRead) {
      try {
        await messagesService.markMessageAsRead(notification.id);
        // 不在这里刷新，等关闭模态框时再刷新
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
    // 关闭模态框时刷新数据
    loadNotifications();
    // 触发全局事件，通知小铃铛刷新未读数量
    window.dispatchEvent(new Event('notification-read'));
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation(); // 防止触发行点击事件
    
    // 打开删除确认模态框
    setDeleteConfirmModal({ isOpen: true, notificationId });
  };

  const confirmDelete = async () => {
    const { notificationId } = deleteConfirmModal;
    
    try {
      await messagesService.deleteMessage(notificationId);
      // 删除成功后刷新列表
      setDeleteConfirmModal({ isOpen: false, notificationId: null });
      loadNotifications();
      // 触发全局事件，通知小铃铛刷新未读数量
      window.dispatchEvent(new Event('notification-read'));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setDeleteConfirmModal({ isOpen: false, notificationId: null });
      setErrorModal({ isOpen: true, message: t('admin.messages.deleteFailed') });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, notificationId: null });
  };

  const readOptions = useMemo(
    () => [
      { value: '', label: t('common.all') },
      { value: 'unread', label: t('admin.messages.unread') },
      { value: 'read', label: t('admin.messages.read') },
    ],
    [t]
  );

  const filterColumns = useMemo(
    () => [
      { key: 'subject', render: (value) => value || '' },
      { key: 'content', render: (value) => value || '' },
    ],
    []
  );

  // 应用阅读状态过滤
  const displayNotifications = useMemo(() => {
    if (!readFilter) return filteredNotifications;
    if (readFilter === 'unread') {
      return filteredNotifications.filter(n => !n.isRead);
    }
    if (readFilter === 'read') {
      return filteredNotifications.filter(n => n.isRead);
    }
    return filteredNotifications;
  }, [filteredNotifications, readFilter]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-sm text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="notification-history">
      {/* 筛选器 */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <SearchInput
          data={notifications}
          columns={filterColumns}
          onFilter={handleFilterChange}
          placeholder={t('admin.messages.searchNotifications')}
          className="flex-1 min-w-[200px] max-w-md"
        />
        <div className="w-full sm:w-48 sm:flex-shrink-0">
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {readOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 通知列表 */}
      {displayNotifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            {notifications.length === 0
              ? t('admin.messages.noNotifications')
              : t('common.noSearchResults')}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.messages.category.label')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.messages.readStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(notification.subject, notification.content)}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const translated = translateNotification(notification);
                      return (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {translated.subject}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {translated.content}
                          </div>
                        </>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getReadBadge(notification.isRead)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(notification.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewNotification(notification)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('common.view')}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 详情模态框 */}
      {selectedNotification && (() => {
        const translated = translateNotification(selectedNotification);
        return (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {translated.subject}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {t('admin.messages.sender')}: {selectedNotification.senderName || 'System'}
                    </span>
                    <span>{formatDate(selectedNotification.createdAt)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {translated.content}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 删除确认模态框 */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('admin.messages.confirmDelete')}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {t('admin.messages.deleteWarning')}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示模态框 */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                {t('common.error')}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {errorModal.message}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setErrorModal({ isOpen: false, message: '' })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
