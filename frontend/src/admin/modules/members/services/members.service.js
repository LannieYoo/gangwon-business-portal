/**
 * Members Service - 会员管理服务
 * 
 * 管理员端会员管理功能
 * 遵循 dev-frontend_patterns skill 规范
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class MembersService {
  /**
   * 获取会员列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 会员列表数据
   */
  async listMembers(params) {
    return await apiService.get(`${API_PREFIX}/admin/members`, params);
  }

  /**
   * 获取会员详情
   * @param {string} memberId - 会员ID
   * @returns {Promise<Object>} 会员详情数据
   */
  async getMemberDetail(memberId) {
    return await apiService.get(`${API_PREFIX}/admin/members/${memberId}`);
  }

  /**
   * 批准会员注册
   * @param {string} memberId - 会员ID
   * @returns {Promise<Object>} 操作结果
   */
  async approveMember(memberId) {
    return await apiService.put(`${API_PREFIX}/admin/members/${memberId}/approve`);
  }

  /**
   * 拒绝会员注册
   * @param {string} memberId - 会员ID
   * @param {string} reason - 拒绝原因
   * @returns {Promise<Object>} 操作结果
   */
  async rejectMember(memberId, reason) {
    const queryParams = reason ? { reason } : {};
    return await apiService.put(`${API_PREFIX}/admin/members/${memberId}/reject`, {}, { params: queryParams });
  }

  /**
   * 重置会员审批状态为待审核
   * @param {string} memberId - 会员ID
   * @returns {Promise<Object>} 操作结果
   */
  async resetMemberToPending(memberId) {
    return await apiService.put(`${API_PREFIX}/admin/members/${memberId}/reset-pending`);
  }

  /**
   * 查询 Nice D&B 企业信息
   * @param {string} businessNumber - 企业注册号
   * @returns {Promise<Object>} 企业信息
   */
  async searchNiceDnb(businessNumber) {
    const cleanBusinessNumber = businessNumber.replace(/-/g, "");
    return await apiService.get(`${API_PREFIX}/admin/members/nice-dnb`, { businessNumber: cleanBusinessNumber });
  }

  /**
   * 导出会员数据
   * @param {Object} params - 导出参数
   * @returns {Promise<Blob>} 导出文件
   */
  async exportMembers(params) {
    return await apiService.download(`${API_PREFIX}/admin/members/export`, params);
  }
}

export default createService(MembersService);
