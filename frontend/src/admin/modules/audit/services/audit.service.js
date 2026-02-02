/**
 * Audit Service - 审计日志服务
 * 
 * 管理员端审计日志管理功能
 * 遵循 dev-frontend_patterns skill 规范
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class AuditService {
  /**
   * 获取审计日志列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 审计日志列表
   */
  async listAuditLogs(params) {
    return await apiService.get(`${API_PREFIX}/admin/audit-logs`, params);
  }

  /**
   * 获取审计日志详情
   * @param {string} logId - 日志ID
   * @returns {Promise<Object>} 审计日志详情
   */
  async getAuditLog(logId) {
    return await apiService.get(`${API_PREFIX}/admin/audit-logs/${logId}`);
  }

  /**
   * 删除单条审计日志
   * @param {string} logId - 日志ID
   * @returns {Promise<Object>} 操作结果
   */
  async deleteAuditLog(logId) {
    return await apiService.delete(`${API_PREFIX}/admin/audit-logs/${logId}`);
  }

  /**
   * 删除指定操作类型的审计日志
   * @param {string} action - 操作类型
   * @returns {Promise<Object>} 操作结果
   */
  async deleteAuditLogsByAction(action) {
    const encodedAction = encodeURIComponent(action);
    return await apiService.delete(`${API_PREFIX}/admin/audit-logs/by-action?action=${encodedAction}`);
  }
}

export default createService(AuditService);
