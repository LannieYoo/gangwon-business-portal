/**
 * Content Service
 * 内容管理服务 - 封装公告、新闻稿、横幅、系统信息等 API
 */

import { apiService } from './index';
import loggerService from './logger.service';
import exceptionService from './exception.service';
import { API_PREFIX } from '@shared/utils/constants';

/**
 * 转换后端 snake_case 到前端 camelCase
 */
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(value);
  }
  return result;
}

/**
 * 转换前端 camelCase 到后端 snake_case
 */
function toSnakeCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(value);
  }
  return result;
}

const contentService = {
  // ========== 公告 (Notices) ==========
  
  /**
   * 获取公告列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认：1）
   * @param {number} params.pageSize - 每页数量（默认：20）
   * @param {string} params.search - 搜索关键词（可选）
   * @returns {Promise<Object>} 公告列表响应
   */
  async listNotices(params = {}) {
    try {
      loggerService.info('List notices', {
        module: 'ContentService',
        function: 'listNotices',
        request_path: `${API_PREFIX}/notices`
      });

      const { page = 1, pageSize = 20, search } = params;
      const queryParams = {
        page,
        page_size: pageSize,
        ...(search && { search })
      };
      
      const response = await apiService.get(`${API_PREFIX}/notices`, queryParams);
      
      // 转换响应格式
      const result = {
        items: (response.items || []).map(toCamelCase),
        total: response.total || 0,
        page: response.page || page,
        pageSize: response.page_size || response.pageSize || pageSize,
        totalPages: response.total_pages || response.totalPages || 0
      };
      
      loggerService.info('List notices successful', {
        module: 'ContentService',
        function: 'listNotices',
        total: result.total,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('List notices failed', {
        module: 'ContentService',
        function: 'listNotices',
        request_path: `${API_PREFIX}/notices`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/notices`,
        error_code: error.code || 'LIST_NOTICES_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 获取最新5条公告（用于首页）
   * @returns {Promise<Array>} 公告列表
   */
  async getLatestNotices() {
    try {
      loggerService.info('Get latest notices', {
        module: 'ContentService',
        function: 'getLatestNotices',
        request_path: `${API_PREFIX}/notices/latest5`
      });

      const response = await apiService.get(`${API_PREFIX}/notices/latest5`);
      const result = (response || []).map(toCamelCase);
      
      loggerService.info('Get latest notices successful', {
        module: 'ContentService',
        function: 'getLatestNotices',
        count: result.length,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Get latest notices failed', {
        module: 'ContentService',
        function: 'getLatestNotices',
        request_path: `${API_PREFIX}/notices/latest5`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/notices/latest5`,
        error_code: error.code || 'GET_LATEST_NOTICES_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 获取公告详情
   * @param {string} noticeId - 公告ID
   * @returns {Promise<Object>} 公告详情
   */
  async getNotice(noticeId) {
    try {
      loggerService.info('Get notice', {
        module: 'ContentService',
        function: 'getNotice',
        request_path: `${API_PREFIX}/notices/${noticeId}`,
        notice_id: noticeId
      });

      const response = await apiService.get(`${API_PREFIX}/notices/${noticeId}`);
      const result = toCamelCase(response);
      
      loggerService.info('Get notice successful', {
        module: 'ContentService',
        function: 'getNotice',
        notice_id: noticeId,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Get notice failed', {
        module: 'ContentService',
        function: 'getNotice',
        request_path: `${API_PREFIX}/notices/${noticeId}`,
        notice_id: noticeId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/notices/${noticeId}`,
        error_code: error.code || 'GET_NOTICE_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 创建公告（管理员）
   * @param {Object} data - 公告数据
   * @param {string} data.title - 标题
   * @param {string} data.contentHtml - HTML 内容
   * @param {string} data.boardType - 公告类型（可选，默认：'notice'）
   * @returns {Promise<Object>} 创建的公告
   */
  async createNotice(data) {
    try {
      loggerService.info('Create notice', {
        module: 'ContentService',
        function: 'createNotice',
        request_path: `${API_PREFIX}/admin/content/notices`
      });

      const payload = toSnakeCase({
        title: data.title,
        contentHtml: data.contentHtml,
        boardType: data.boardType || 'notice'
      });
      
      const response = await apiService.post(`${API_PREFIX}/admin/content/notices`, payload);
      const result = toCamelCase(response);
      
      loggerService.info('Create notice successful', {
        module: 'ContentService',
        function: 'createNotice',
        notice_id: result.id,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Create notice failed', {
        module: 'ContentService',
        function: 'createNotice',
        request_path: `${API_PREFIX}/admin/content/notices`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/admin/content/notices`,
        error_code: error.code || 'CREATE_NOTICE_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 更新公告（管理员）
   * @param {string} noticeId - 公告ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的公告
   */
  async updateNotice(noticeId, data) {
    try {
      loggerService.info('Update notice', {
        module: 'ContentService',
        function: 'updateNotice',
        request_path: `${API_PREFIX}/admin/content/notices/${noticeId}`,
        notice_id: noticeId
      });

      const payload = toSnakeCase(data);
      const response = await apiService.put(`${API_PREFIX}/admin/content/notices/${noticeId}`, payload);
      const result = toCamelCase(response);
      
      loggerService.info('Update notice successful', {
        module: 'ContentService',
        function: 'updateNotice',
        notice_id: noticeId,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Update notice failed', {
        module: 'ContentService',
        function: 'updateNotice',
        request_path: `${API_PREFIX}/admin/content/notices/${noticeId}`,
        notice_id: noticeId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'PUT',
        request_path: `${API_PREFIX}/admin/content/notices/${noticeId}`,
        error_code: error.code || 'UPDATE_NOTICE_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 删除公告（管理员）
   * @param {string} noticeId - 公告ID
   * @returns {Promise<void>}
   */
  async deleteNotice(noticeId) {
    try {
      loggerService.info('Delete notice', {
        module: 'ContentService',
        function: 'deleteNotice',
        request_path: `${API_PREFIX}/admin/content/notices/${noticeId}`,
        notice_id: noticeId
      });

      await apiService.delete(`${API_PREFIX}/admin/content/notices/${noticeId}`);
      
      loggerService.info('Delete notice successful', {
        module: 'ContentService',
        function: 'deleteNotice',
        notice_id: noticeId,
        response_status: 200
      });
    } catch (error) {
      loggerService.error('Delete notice failed', {
        module: 'ContentService',
        function: 'deleteNotice',
        request_path: `${API_PREFIX}/admin/content/notices/${noticeId}`,
        notice_id: noticeId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'DELETE',
        request_path: `${API_PREFIX}/admin/content/notices/${noticeId}`,
        error_code: error.code || 'DELETE_NOTICE_FAILED'
      });
      throw error;
    }
  },
  
  // ========== 新闻稿 (Press Releases) ==========
  
  /**
   * 获取新闻稿列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认：1）
   * @param {number} params.pageSize - 每页数量（默认：20）
   * @returns {Promise<Object>} 新闻稿列表响应
   */
  async listPressReleases(params = {}) {
    try {
      loggerService.info('List press releases', {
        module: 'ContentService',
        function: 'listPressReleases',
        request_path: `${API_PREFIX}/press`
      });

      const { page = 1, pageSize = 20 } = params;
      const queryParams = {
        page,
        page_size: pageSize
      };
      
      const response = await apiService.get(`${API_PREFIX}/press`, queryParams);
      
      // 转换响应格式
      const result = {
        items: (response.items || []).map(toCamelCase),
        total: response.total || 0,
        page: response.page || page,
        pageSize: response.page_size || response.pageSize || pageSize,
        totalPages: response.total_pages || response.totalPages || 0
      };
      
      loggerService.info('List press releases successful', {
        module: 'ContentService',
        function: 'listPressReleases',
        total: result.total,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('List press releases failed', {
        module: 'ContentService',
        function: 'listPressReleases',
        request_path: `${API_PREFIX}/press`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/press`,
        error_code: error.code || 'LIST_PRESS_RELEASES_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 获取最新1条新闻稿（用于首页）
   * @returns {Promise<Object|null>} 新闻稿详情或 null
   */
  async getLatestPressRelease() {
    try {
      loggerService.info('Get latest press release', {
        module: 'ContentService',
        function: 'getLatestPressRelease',
        request_path: `${API_PREFIX}/press/latest1`
      });

      const response = await apiService.get(`${API_PREFIX}/press/latest1`);
      const result = response ? toCamelCase(response) : null;
      
      loggerService.info('Get latest press release successful', {
        module: 'ContentService',
        function: 'getLatestPressRelease',
        has_result: !!result,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Get latest press release failed', {
        module: 'ContentService',
        function: 'getLatestPressRelease',
        request_path: `${API_PREFIX}/press/latest1`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/press/latest1`,
        error_code: error.code || 'GET_LATEST_PRESS_RELEASE_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 获取新闻稿详情
   * @param {string} pressId - 新闻稿ID
   * @returns {Promise<Object>} 新闻稿详情
   */
  async getPressRelease(pressId) {
    try {
      loggerService.info('Get press release', {
        module: 'ContentService',
        function: 'getPressRelease',
        request_path: `${API_PREFIX}/press/${pressId}`,
        press_id: pressId
      });

      const response = await apiService.get(`${API_PREFIX}/press/${pressId}`);
      const result = toCamelCase(response);
      
      loggerService.info('Get press release successful', {
        module: 'ContentService',
        function: 'getPressRelease',
        press_id: pressId,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Get press release failed', {
        module: 'ContentService',
        function: 'getPressRelease',
        request_path: `${API_PREFIX}/press/${pressId}`,
        press_id: pressId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/press/${pressId}`,
        error_code: error.code || 'GET_PRESS_RELEASE_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 创建新闻稿（管理员）
   * @param {Object} data - 新闻稿数据
   * @param {string} data.title - 标题
   * @param {string} data.imageUrl - 图片URL
   * @returns {Promise<Object>} 创建的新闻稿
   */
  async createPressRelease(data) {
    try {
      loggerService.info('Create press release', {
        module: 'ContentService',
        function: 'createPressRelease',
        request_path: `${API_PREFIX}/admin/content/press`
      });

      const payload = toSnakeCase({
        title: data.title,
        imageUrl: data.imageUrl
      });
      
      const response = await apiService.post(`${API_PREFIX}/admin/content/press`, payload);
      const result = toCamelCase(response);
      
      loggerService.info('Create press release successful', {
        module: 'ContentService',
        function: 'createPressRelease',
        press_id: result.id,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Create press release failed', {
        module: 'ContentService',
        function: 'createPressRelease',
        request_path: `${API_PREFIX}/admin/content/press`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/admin/content/press`,
        error_code: error.code || 'CREATE_PRESS_RELEASE_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 更新新闻稿（管理员）
   * @param {string} pressId - 新闻稿ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的新闻稿
   */
  async updatePressRelease(pressId, data) {
    try {
      loggerService.info('Update press release', {
        module: 'ContentService',
        function: 'updatePressRelease',
        request_path: `${API_PREFIX}/admin/content/press/${pressId}`,
        press_id: pressId
      });

      const payload = toSnakeCase(data);
      const response = await apiService.put(`${API_PREFIX}/admin/content/press/${pressId}`, payload);
      const result = toCamelCase(response);
      
      loggerService.info('Update press release successful', {
        module: 'ContentService',
        function: 'updatePressRelease',
        press_id: pressId,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Update press release failed', {
        module: 'ContentService',
        function: 'updatePressRelease',
        request_path: `${API_PREFIX}/admin/content/press/${pressId}`,
        press_id: pressId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'PUT',
        request_path: `${API_PREFIX}/admin/content/press/${pressId}`,
        error_code: error.code || 'UPDATE_PRESS_RELEASE_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 删除新闻稿（管理员）
   * @param {string} pressId - 新闻稿ID
   * @returns {Promise<void>}
   */
  async deletePressRelease(pressId) {
    try {
      loggerService.info('Delete press release', {
        module: 'ContentService',
        function: 'deletePressRelease',
        request_path: `${API_PREFIX}/admin/content/press/${pressId}`,
        press_id: pressId
      });

      await apiService.delete(`${API_PREFIX}/admin/content/press/${pressId}`);
      
      loggerService.info('Delete press release successful', {
        module: 'ContentService',
        function: 'deletePressRelease',
        press_id: pressId,
        response_status: 200
      });
    } catch (error) {
      loggerService.error('Delete press release failed', {
        module: 'ContentService',
        function: 'deletePressRelease',
        request_path: `${API_PREFIX}/admin/content/press/${pressId}`,
        press_id: pressId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'DELETE',
        request_path: `${API_PREFIX}/admin/content/press/${pressId}`,
        error_code: error.code || 'DELETE_PRESS_RELEASE_FAILED'
      });
      throw error;
    }
  },
  
  // ========== 横幅 (Banners) ==========
  
  /**
   * 获取活跃横幅（公开）
   * @param {Object} params - 查询参数
   * @param {string} params.bannerType - 横幅类型（可选：MAIN, INTRO, PROGRAM, PERFORMANCE, SUPPORT）
   * @returns {Promise<Array>} 横幅列表
   */
  async getBanners(params = {}) {
    try {
      loggerService.info('Get banners', {
        module: 'ContentService',
        function: 'getBanners',
        request_path: `${API_PREFIX}/banners`
      });

      const { bannerType } = params;
      const queryParams = bannerType ? { banner_type: bannerType } : {};
      
      const response = await apiService.get(`${API_PREFIX}/banners`, queryParams);
      const result = (response.items || []).map(toCamelCase);
      
      loggerService.info('Get banners successful', {
        module: 'ContentService',
        function: 'getBanners',
        count: result.length,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Get banners failed', {
        module: 'ContentService',
        function: 'getBanners',
        request_path: `${API_PREFIX}/banners`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/banners`,
        error_code: error.code || 'GET_BANNERS_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 获取所有横幅（管理员）
   * @returns {Promise<Array>} 横幅列表
   */
  async getAllBanners() {
    try {
      loggerService.info('Get all banners', {
        module: 'ContentService',
        function: 'getAllBanners',
        request_path: `${API_PREFIX}/admin/content/banners`
      });

      const response = await apiService.get(`${API_PREFIX}/admin/content/banners`);
      const result = (response.items || []).map(toCamelCase);
      
      loggerService.info('Get all banners successful', {
        module: 'ContentService',
        function: 'getAllBanners',
        count: result.length,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Get all banners failed', {
        module: 'ContentService',
        function: 'getAllBanners',
        request_path: `${API_PREFIX}/admin/content/banners`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/admin/content/banners`,
        error_code: error.code || 'GET_ALL_BANNERS_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 创建横幅（管理员）
   * @param {Object} data - 横幅数据
   * @param {string} data.bannerType - 横幅类型
   * @param {string} data.imageUrl - 图片URL
   * @param {string} data.linkUrl - 链接URL（可选）
   * @param {boolean} data.isActive - 是否活跃（默认：true）
   * @param {number} data.displayOrder - 显示顺序（默认：0）
   * @returns {Promise<Object>} 创建的横幅
   */
  async createBanner(data) {
    try {
      loggerService.info('Create banner', {
        module: 'ContentService',
        function: 'createBanner',
        request_path: `${API_PREFIX}/admin/content/banners`
      });

      const payload = toSnakeCase({
        bannerType: data.bannerType,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: data.displayOrder || 0
      });
      
      const response = await apiService.post(`${API_PREFIX}/admin/content/banners`, payload);
      const result = toCamelCase(response);
      
      loggerService.info('Create banner successful', {
        module: 'ContentService',
        function: 'createBanner',
        banner_id: result.id,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Create banner failed', {
        module: 'ContentService',
        function: 'createBanner',
        request_path: `${API_PREFIX}/admin/content/banners`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/admin/content/banners`,
        error_code: error.code || 'CREATE_BANNER_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 更新横幅（管理员）
   * @param {string} bannerId - 横幅ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的横幅
   */
  async updateBanner(bannerId, data) {
    try {
      loggerService.info('Update banner', {
        module: 'ContentService',
        function: 'updateBanner',
        request_path: `${API_PREFIX}/admin/content/banners/${bannerId}`,
        banner_id: bannerId
      });

      const payload = toSnakeCase(data);
      const response = await apiService.put(`${API_PREFIX}/admin/content/banners/${bannerId}`, payload);
      const result = toCamelCase(response);
      
      loggerService.info('Update banner successful', {
        module: 'ContentService',
        function: 'updateBanner',
        banner_id: bannerId,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Update banner failed', {
        module: 'ContentService',
        function: 'updateBanner',
        request_path: `${API_PREFIX}/admin/content/banners/${bannerId}`,
        banner_id: bannerId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'PUT',
        request_path: `${API_PREFIX}/admin/content/banners/${bannerId}`,
        error_code: error.code || 'UPDATE_BANNER_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 删除横幅（管理员）
   * @param {string} bannerId - 横幅ID
   * @returns {Promise<void>}
   */
  async deleteBanner(bannerId) {
    try {
      loggerService.info('Delete banner', {
        module: 'ContentService',
        function: 'deleteBanner',
        request_path: `${API_PREFIX}/admin/content/banners/${bannerId}`,
        banner_id: bannerId
      });

      await apiService.delete(`${API_PREFIX}/admin/content/banners/${bannerId}`);
      
      loggerService.info('Delete banner successful', {
        module: 'ContentService',
        function: 'deleteBanner',
        banner_id: bannerId,
        response_status: 200
      });
    } catch (error) {
      loggerService.error('Delete banner failed', {
        module: 'ContentService',
        function: 'deleteBanner',
        request_path: `${API_PREFIX}/admin/content/banners/${bannerId}`,
        banner_id: bannerId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'DELETE',
        request_path: `${API_PREFIX}/admin/content/banners/${bannerId}`,
        error_code: error.code || 'DELETE_BANNER_FAILED'
      });
      throw error;
    }
  },
  
  // ========== 系统信息 (System Info) ==========
  
  /**
   * 获取系统信息（公开）
   * @returns {Promise<Object|null>} 系统信息或 null
   */
  async getSystemInfo() {
    try {
      loggerService.info('Get system info', {
        module: 'ContentService',
        function: 'getSystemInfo',
        request_path: `${API_PREFIX}/system-info`
      });

      const response = await apiService.get(`${API_PREFIX}/system-info`);
      const result = response ? toCamelCase(response) : null;
      
      loggerService.info('Get system info successful', {
        module: 'ContentService',
        function: 'getSystemInfo',
        has_result: !!result,
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Get system info failed', {
        module: 'ContentService',
        function: 'getSystemInfo',
        request_path: `${API_PREFIX}/system-info`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/system-info`,
        error_code: error.code || 'GET_SYSTEM_INFO_FAILED'
      });
      throw error;
    }
  },
  
  /**
   * 更新系统信息（管理员，upsert 模式）
   * @param {Object} data - 系统信息数据
   * @param {string} data.contentHtml - HTML 内容
   * @param {string} data.imageUrl - 图片URL（可选）
   * @returns {Promise<Object>} 更新后的系统信息
   */
  async updateSystemInfo(data) {
    try {
      loggerService.info('Update system info', {
        module: 'ContentService',
        function: 'updateSystemInfo',
        request_path: `${API_PREFIX}/admin/content/system-info`
      });

      const payload = toSnakeCase({
        contentHtml: data.contentHtml,
        imageUrl: data.imageUrl
      });
      
      const response = await apiService.put(`${API_PREFIX}/admin/content/system-info`, payload);
      const result = toCamelCase(response);
      
      loggerService.info('Update system info successful', {
        module: 'ContentService',
        function: 'updateSystemInfo',
        response_status: 200
      });
      
      return result;
    } catch (error) {
      loggerService.error('Update system info failed', {
        module: 'ContentService',
        function: 'updateSystemInfo',
        request_path: `${API_PREFIX}/admin/content/system-info`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'PUT',
        request_path: `${API_PREFIX}/admin/content/system-info`,
        error_code: error.code || 'UPDATE_SYSTEM_INFO_FAILED'
      });
      throw error;
    }
  }
};

export default contentService;

