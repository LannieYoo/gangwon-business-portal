/**
 * Messages 模块服务 (管理员端)
 *
 * 遵循 dev-frontend_patterns skill 规范。
 * 整合了管理员端消息、线程、广播相关的 API 调用。
 */

import apiService from "@shared/services/api.service";
import { API_PREFIX } from "@shared/utils/constants";

const BASE_URL = `${API_PREFIX}/admin/messages`;

class MessagesService {
  // --- 直接消息 (Direct Messages) ---

  /**
   * 获取消息列表（管理员）
   */
  async getMessages(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };
    if (params.isRead !== undefined) queryParams.is_read = params.isRead;
    if (params.isImportant !== undefined)
      queryParams.is_important = params.isImportant;
    if (params.messageType !== undefined)
      queryParams.message_type = params.messageType;

    const response = await apiService.get(BASE_URL, queryParams);

    if (response && response.items) {
      return {
        items: response.items,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      };
    }

    throw new Error("Invalid response format");
  }

  /**
   * 获取消息列表（管理员）- 别名方法
   */
  async getAdminMessages(params) {
    return this.getMessages(params);
  }

  /**
   * 获取未读数量（管理员）
   */
  async getUnreadCount() {
    const response = await apiService.get(`${BASE_URL}/unread-count`);
    return response.unreadCount;
  }

  /**
   * 获取消息详情（管理员）
   */
  async getMessage(messageId) {
    const response = await apiService.get(`${BASE_URL}/${messageId}`);
    return response;
  }

  /**
   * 标记消息为已读（管理员）
   */
  async markMessageAsRead(messageId) {
    const response = await apiService.put(`${BASE_URL}/${messageId}`, {
      is_read: true,
    });
    return response;
  }

  /**
   * 创建消息（管理员发送给会员）
   */
  async createMessage(data) {
    const payload = {
      recipient_id: data.recipientId,
      subject: data.subject,
      content: data.content,
      is_important: data.isImportant,
    };
    const response = await apiService.post(BASE_URL, payload);
    return response;
  }

  /**
   * 更新消息（管理员）
   */
  async updateMessage(messageId, data) {
    const payload = {};
    if (data.isRead !== undefined) payload.is_read = data.isRead;
    if (data.isImportant !== undefined) payload.is_important = data.isImportant;

    const response = await apiService.put(`${BASE_URL}/${messageId}`, payload);
    return response;
  }

  /**
   * 删除消息（管理员）
   */
  async deleteMessage(messageId) {
    return await apiService.delete(`${BASE_URL}/${messageId}`);
  }

  // --- 线程消息 (Thread Messages) ---

  /**
   * 获取会话列表（管理员）
   */
  async getThreads(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };
    if (params.status) queryParams.status = params.status;
    if (params.hasUnread !== undefined)
      queryParams.has_unread = params.hasUnread;

    const response = await apiService.get(`${BASE_URL}/threads`, queryParams);

    if (response && response.items) {
      return {
        items: response.items,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      };
    }

    throw new Error("Invalid response format");
  }

  /**
   * 获取会话列表（管理员）- 别名方法
   */
  async getAdminThreads(params) {
    return this.getThreads(params);
  }

  /**
   * 获取会话详情（管理员）
   */
  async getThread(threadId) {
    const response = await apiService.get(`${BASE_URL}/threads/${threadId}`);
    return response;
  }

  /**
   * 更新会话（管理员）
   */
  async updateThread(threadId, data) {
    const payload = {};
    if (data.status !== undefined) payload.status = data.status;

    const response = await apiService.put(
      `${BASE_URL}/threads/${threadId}`,
      payload,
    );
    return response;
  }

  /**
   * 在会话中创建消息（管理员）
   */
  async createThreadMessage(threadId, data) {
    const payload = {
      content: data.content,
      is_important: data.isImportant,
      attachments: data.attachments,
    };
    const response = await apiService.post(
      `${BASE_URL}/threads/${threadId}/messages`,
      payload,
    );
    return response;
  }

  // --- 广播消息 (Broadcast Messages) ---

  /**
   * 创建广播消息
   */
  async createBroadcast(data) {
    const payload = {
      subject: data.subject,
      content: data.content,
      is_important: data.isImportant,
      category: data.category,
      send_to_all: data.sendToAll,
      recipient_ids: data.recipientIds,
      attachments: data.attachments,
    };
    const response = await apiService.post(`${BASE_URL}/broadcast`, payload);
    return response;
  }

  // --- 分析数据 (Analytics) ---

  /**
   * 获取消息分析数据
   */
  async getAnalytics(params) {
    const queryParams = {};
    if (params?.timeRange) queryParams.time_range = params.timeRange;

    const response = await apiService.get(`${BASE_URL}/analytics`, queryParams);
    return response;
  }
}

export const messagesService = new MessagesService();
export default messagesService;




