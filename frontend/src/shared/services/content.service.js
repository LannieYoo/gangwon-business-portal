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
}

export default createService(ContentService);
