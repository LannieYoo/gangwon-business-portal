/**
 * Message Thread Component - Admin Portal
 * 消息会话详情 - 支持会话式消息交流
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Alert, Loading } from '@shared/components';
import { messageService } from '@shared/services';
import MessageComposer from './MessageComposer';

export default function MessageThread() {
  const { t, i18n } = useTranslation();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState('success');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThread = useCallback(async () => {
    if (!threadId) return;
    
    setLoading(true);
    const response = await messageService.getThread(threadId);
    setThread(response.thread);
    setMessages(response.messages || []);
    
    // Mark unread messages as read
    const unreadMessages = response.messages?.filter(msg => !msg.isRead && msg.senderType !== 'admin') || [];
    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map(msg => messageService.updateMessage(msg.id, { isRead: true }))
      );
    }
    setLoading(false);
  }, [threadId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageData) => {
    const newMessage = await messageService.createThreadMessage(threadId, messageData);
    setMessages(prev => [...prev, newMessage]);
    setShowComposer(false);
    setMessageVariant('success');
    setMessage(t('admin.messages.thread.messageSent', '消息发送成功'));
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCloseThread = async () => {
    if (!window.confirm(t('admin.messages.thread.confirmClose', '确定要关闭这个会话吗？'))) {
      return;
    }
    
    await messageService.updateThread(threadId, { status: 'closed' });
    setThread(prev => ({ ...prev, status: 'closed' }));
    setMessageVariant('success');
    setMessage(t('admin.messages.thread.closed', '会话已关闭'));
  };

  const handleReopenThread = async () => {
    await messageService.updateThread(threadId, { status: 'open' });
    setThread(prev => ({ ...prev, status: 'open' }));
    setMessageVariant('success');
    setMessage(t('admin.messages.thread.reopened', '会话已重新打开'));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'ko-KR';
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { variant: 'success', label: t('admin.messages.thread.status.open', '进行中') },
      resolved: { variant: 'info', label: t('admin.messages.thread.status.resolved', '已解决') },
      closed: { variant: 'secondary', label: t('admin.messages.thread.status.closed', '已关闭') }
    };
    
    const config = statusMap[status] || statusMap.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category) => {
    const categoryMap = {
      support: { variant: 'info', label: t('admin.messages.category.support', '技术支持') },
      performance: { variant: 'warning', label: t('admin.messages.category.performance', '绩效咨询') },
      general: { variant: 'secondary', label: t('admin.messages.category.general', '一般问题') }
    };
    
    const config = categoryMap[category] || categoryMap.general;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  if (loading) {
    return <Loading />;
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('admin.messages.thread.notFound', '会话不存在')}</p>
          <Button onClick={() => navigate('/admin/messages')}>
            {t('admin.messages.thread.backToList', '返回消息列表')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/messages')}
            >
              ← {t('admin.messages.thread.back', '返回')}
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 m-0 mb-1">
                {thread.subject}
              </h2>
              <p className="text-gray-600 text-sm m-0">
                {t('admin.messages.thread.description', '查看和管理消息会话详情。')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getCategoryBadge(thread.category)}
            {getStatusBadge(thread.status)}
          </div>
        </div>

        {/* Thread Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">
                {t('admin.messages.thread.member', '会员')}:
              </span>
              <span className="ml-2 text-gray-900">{thread.memberName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                {t('admin.messages.thread.created', '创建时间')}:
              </span>
              <span className="ml-2 text-gray-900">{formatDate(thread.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                {t('admin.messages.thread.lastMessage', '最后消息')}:
              </span>
              <span className="ml-2 text-gray-900">{formatDate(thread.lastMessageAt)}</span>
            </div>
          </div>
        </div>

        {message && (
          <Alert variant={messageVariant} className="mb-4">
            {message}
          </Alert>
        )}
      </div>

      {/* Messages */}
      <Card className="mb-6">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              {t('admin.messages.thread.noMessages', '暂无消息')}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.senderType === 'admin'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {msg.senderType === 'admin' ? t('admin.messages.thread.admin', '管理员') : thread.memberName}
                    </span>
                    <span className={`text-xs ${msg.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {msg.content}
                  </div>
                      {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      {msg.attachments.map((attachment, idx) => (
                        <div key={idx} className="text-xs">
                          {t('common.attachment', '📎')} {attachment.fileName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {thread.status === 'open' ? (
            <>
              <Button
                variant="primary"
                onClick={() => setShowComposer(true)}
              >
                {t('admin.messages.thread.reply', '回复')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseThread}
              >
                {t('admin.messages.thread.close', '关闭会话')}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={handleReopenThread}
            >
              {t('admin.messages.thread.reopen', '重新打开')}
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {t('admin.messages.thread.messageCount', '共 {{count}} 条消息', { count: messages.length })}
        </div>
      </div>

      {/* Message Composer Modal */}
      {showComposer && (
        <MessageComposer
          threadId={threadId}
          recipientName={thread.memberName}
          onSend={handleSendMessage}
          onCancel={() => setShowComposer(false)}
        />
      )}
    </div>
  );
}