/**
 * Performance Service - 绩效管理服务 (管理员端)
 * 
 * 管理员端绩效审核功能
 * 遵循 dev-frontend_patterns skill 规范
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class PerformanceService {
  /**
   * 获取绩效记录列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 绩效记录列表
   */
  async listPerformanceRecords(params) {
    return await apiService.get(`${API_PREFIX}/admin/performance`, params);
  }

  /**
   * 获取绩效记录详情
   * @param {string} recordId - 记录ID
   * @returns {Promise<Object>} 绩效记录详情
   */
  async getPerformanceRecord(recordId) {
    return await apiService.get(`${API_PREFIX}/admin/performance/${recordId}`);
  }

  /**
   * 批准绩效记录
   * @param {string} recordId - 记录ID
   * @param {string} comments - 审批意见
   * @returns {Promise<Object>} 操作结果
   */
  async approvePerformance(recordId, comments = null) {
    return await apiService.post(`${API_PREFIX}/admin/performance/${recordId}/approve`, { comments });
  }

  /**
   * 要求修改绩效记录
   * @param {string} recordId - 记录ID
   * @param {string} comments - 修改要求
   * @returns {Promise<Object>} 操作结果
   */
  async requestPerformanceRevision(recordId, comments) {
    return await apiService.post(`${API_PREFIX}/admin/performance/${recordId}/request-fix`, { comments });
  }

  /**
   * 驳回绩效记录
   * @param {string} recordId - 记录ID
   * @param {string} comments - 驳回原因
   * @returns {Promise<Object>} 操作结果
   */
  async rejectPerformance(recordId, comments) {
    return await apiService.post(`${API_PREFIX}/admin/performance/${recordId}/reject`, { comments: comments ?? null });
  }

  /**
   * 取消审核，重置为已提交状态
   * @param {string} recordId - 记录ID
   * @returns {Promise<Object>} 操作结果
   */
  async cancelReviewPerformance(recordId) {
    return await apiService.post(`${API_PREFIX}/admin/performance/${recordId}/cancel-review`, {});
  }

  /**
   * 导出绩效数据
   * @param {Object} params - 导出参数
   * @returns {Promise<Blob>} 导出文件
   */
  async exportPerformance(params) {
    return await apiService.download(`${API_PREFIX}/admin/performance/export`, params);
  }
}

export default createService(PerformanceService);
