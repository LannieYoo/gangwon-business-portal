/**
 * Profile Service - 会员资料服务
 * 
 * 管理会员个人资料和公司信息
 * 遵循 dev-frontend_patterns skill 规范
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class ProfileService {
  /**
   * 获取当前会员资料
   * @returns {Promise<Object>} 会员资料数据
   */
  async getProfile() {
    return await apiService.get(`${API_PREFIX}/member/profile`);
  }

  /**
   * 更新当前会员资料
   * @param {Object} data - 要更新的资料数据
   * @returns {Promise<Object>} 更新后的资料数据
   */
  async updateProfile(data) {
    return await apiService.put(`${API_PREFIX}/member/profile`, data);
  }

  /**
   * 验证公司信息
   * @param {Object} data - 公司信息数据
   * @param {string} data.businessNumber - 企业注册号
   * @returns {Promise<Object>} 验证结果
   */
  async verifyCompany(data) {
    return await apiService.post(`${API_PREFIX}/members/verify-company`, data);
  }
}

export default createService(ProfileService);
