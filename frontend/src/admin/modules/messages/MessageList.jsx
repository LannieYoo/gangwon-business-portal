/**
 * Message List Component - Admin Portal
 * 站内信列表
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Badge, Alert, Pagination, Modal, ModalFooter } from '@shared/components';
import { messageService } from '@shared/services';

export default function MessageList() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState('success');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, messageId: null });

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const params = {
      page: currentPage,
      pageSize: pageSize,
      isRead: filter === 'read' ? true : filter === 'unread' ? false : undefined,
    };
    
    const response = await messageService.getMessages(params);
    setMessages(response.items || []);
    setTotalCount(response.total || 0);
    setUnreadCount(response.unreadCount || 0);
    setLoading(false);
  }, [currentPage, filter, pageSize, t]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMessageClick = (msg) => {
    setSelectedMessage(msg);
    // Mark as read if unread - update locally without reloading
    if (!msg.isRead) {
      handleMarkAsRead(msg.id, msg);
    }
  };

  const handleMarkAsRead = async (messageId, messageData = null) => {
    // Update locally first for instant UI feedback
    if (messageData) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isRead: true, readAt: new Date().toISOString() }
          : msg
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : null);
      }
    }
    
    // Update on server in background (don't wait for it)
    messageService.updateMessage(messageId, { isRead: true }).catch(() => {
      // Revert on error
      if (messageData) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? messageData : msg
        ));
        setUnreadCount(prev => prev + 1);
      }
    });
  };

  const handleDelete = (messageId) => {
    setDeleteConfirm({ open: true, messageId });
  };

  const confirmDelete = async () => {
    const { messageId } = deleteConfirm;
    await messageService.deleteMessage(messageId);
    await loadMessages();
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
    setDeleteConfirm({ open: false, messageId: null });
    setMessageVariant('success');
    setMessage(t('admin.messages.deleted', '删除成功'));
    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      {message && (
        <Alert variant={messageVariant} className="mb-4">
          {message}
        </Alert>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 m-0 mb-1">
              {t('admin.messages.list.title', '消息列表')}
            </h2>
            <p className="text-gray-600 text-sm m-0">
              {t('admin.messages.list.description', '查看和管理所有站内信消息。')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Badge variant="error" className="text-sm">
                {t('admin.messages.unreadCount', '未读')}: {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            {t('admin.messages.filters.all', '全部')}
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            {t('admin.messages.filters.unread', '未读')}
          </Button>
          <Button
            variant={filter === 'read' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('read')}
          >
            {t('admin.messages.filters.read', '已读')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message list */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">{t('common.loading', '加载中...')}</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {t('admin.messages.empty', '暂无消息')}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {messages.map((msg) => (
                    <li
                      key={msg.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === msg.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      } ${!msg.isRead ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleMessageClick(msg)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-sm truncate ${!msg.isRead ? 'font-semibold' : ''}`}>
                              {msg.subject}
                            </span>
                            {msg.isImportant && (
                              <Badge variant="error" size="sm">{t('admin.messages.important', '重要')}</Badge>
                            )}
                            {!msg.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {msg.recipientName || t('admin.messages.recipient', '收件人')}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {totalCount > 0 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  current={currentPage}
                  total={totalCount}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {selectedMessage ? (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedMessage.subject}
                        </h2>
                        {selectedMessage.isImportant && (
                          <Badge variant="error">{t('admin.messages.important', '重要')}</Badge>
                        )}
                        {!selectedMessage.isRead && (
                          <Badge variant="info">{t('admin.messages.unread', '未读')}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">{t('admin.messages.from', '发件人')}:</span>{' '}
                          {selectedMessage.senderName || t('admin.messages.system', '系统')}
                        </p>
                        <p>
                          <span className="font-medium">{t('admin.messages.to', '收件人')}:</span>{' '}
                          {selectedMessage.recipientName || '-'}
                        </p>
                        <p>
                          <span className="font-medium">{t('admin.messages.date', '时间')}:</span>{' '}
                          {formatDate(selectedMessage.createdAt)}
                        </p>
                        {selectedMessage.readAt && (
                          <p>
                            <span className="font-medium">{t('admin.messages.readAt', '已读时间')}:</span>{' '}
                            {formatDate(selectedMessage.readAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {selectedMessage.content}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
                  {!selectedMessage.isRead && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkAsRead(selectedMessage.id, selectedMessage)}
                    >
                      {t('admin.messages.markAsRead', '标记为已读')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    {t('common.delete', '删除')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                {t('admin.messages.selectMessage', '请选择一条消息查看详情')}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, messageId: null })}
        title={t('admin.messages.confirmDelete', '确定要删除这条消息吗？')}
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-600">
            {t('admin.messages.deleteWarning', '此操作不可撤销，确定要继续吗？')}
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirm({ open: false, messageId: null })}
          >
            {t('common.cancel', '取消')}
          </Button>
          <Button
            variant="primary"
            onClick={confirmDelete}
          >
            {t('common.delete', '删除')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

