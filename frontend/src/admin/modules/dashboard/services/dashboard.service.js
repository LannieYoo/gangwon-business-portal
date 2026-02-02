/**
 * Dashboard Service - 仪表盘服务
 * 
 * 管理员端仪表盘数据导出功能
 * 遵循 dev-frontend_patterns skill 规范
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class DashboardService {
  /**
   * 导出仪表盘数据
   * @param {Object} params - 导出参数
   * @param {number} params.year - 年份
   * @param {number} params.quarter - 季度
   * @param {string} params.format - 格式 (excel/csv)
   * @returns {Promise<Blob>} 导出文件
   */
  async exportDashboard(params) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `dashboard_${params.year}_${params.quarter}_${timestamp}.${params.format === "excel" ? "xlsx" : "csv"}`;
    return await apiService.download(`${API_PREFIX}/admin/dashboard/export`, params, filename);
  }
}

export default createService(DashboardService);
