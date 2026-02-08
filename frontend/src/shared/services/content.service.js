/**
 * Content Service
 * 内容相关 API 服务 - 横幅、法律内容等
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class ContentService {
  /**
   * 获取横幅列表
   * @param {Object} params - 查询参数
   * @param {string} params.bannerType - 横幅类型
   * @returns {Promise<Object>} 横幅列表
   */
  async getBanners(params) {
    return await apiService.get(`${API_PREFIX}/banners`, params);
  }

  /**
   * 获取法律内容
   * @param {string} type - 内容类型 (terms, privacy, etc.)
   * @returns {Promise<Object>} 法律内容
   */
  async getLegalContent(type) {
    return await apiService.get(`${API_PREFIX}/legal-content/${type}`);
  }

  // ===== 公告管理 (Notices) =====

  /**
   * 获取公告列表 (Admin)
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 公告列表
   */
  async listNotices(params = {}) {
    return await apiService.get(`${API_PREFIX}/admin/content/notices`, params);
  }

  /**
   * 获取单个公告详情
   * @param {string} id - 公告ID
   * @returns {Promise<Object>} 公告详情
   */
  async getNotice(id) {
    return await apiService.get(`${API_PREFIX}/notices/${id}`);
  }

  /**
   * 创建公告 (Admin)
   * @param {Object} data - 公告数据
   * @returns {Promise<Object>} 创建的公告
   */
  async createNotice(data) {
    return await apiService.post(`${API_PREFIX}/admin/content/notices`, data);
  }

  /**
   * 更新公告 (Admin)
   * @param {string} id - 公告ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的公告
   */
  async updateNotice(id, data) {
    return await apiService.put(
      `${API_PREFIX}/admin/content/notices/${id}`,
      data,
    );
  }

  /**
   * 删除公告 (Admin)
   * @param {string} id - 公告ID
   * @returns {Promise<void>}
   */
  async deleteNotice(id) {
    return await apiService.delete(`${API_PREFIX}/admin/content/notices/${id}`);
  }

  // ===== 系统信息 (System Info) =====

  /**
   * 获取系统信息 (Admin)
   * @returns {Promise<Object>} 系统信息
   */
  async getSystemInfo() {
    return await apiService.get(`${API_PREFIX}/admin/content/system-info`);
  }

  /**
   * 更新系统信息 (Admin)
   * @param {Object} data - 系统信息数据
   * @returns {Promise<Object>} 更新后的系统信息
   */
  async updateSystemInfo(data) {
    return await apiService.put(
      `${API_PREFIX}/admin/content/system-info`,
      data,
    );
  }
}

export default createService(ContentService);
