/**
 * About 模块 API 服务
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";

/**
 * 关于/系统信息相关 API 服务
 */
export const aboutService = {
  /**
   * 获取系统信息
   */
  async getSystemInfo() {
    return await apiService.get(`${API_PREFIX}/system-info`);
  },
};

export default aboutService;
