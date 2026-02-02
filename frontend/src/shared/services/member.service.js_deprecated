// Member Service - 会员服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

// 安全解析 JSON 字符串
function safeJsonParse(value, defaultValue = null) {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

class MemberService {
  // 获取当前会员资料
  async getProfile() {
    return await apiService.get(`${API_PREFIX}/member/profile`);
  }

  // 验证公司信息
  async verifyCompany(data) {
    return await apiService.post(`${API_PREFIX}/members/verify-company`, data);
  }

  // 更新当前会员资料
  async updateProfile(data) {
    return await apiService.put(`${API_PREFIX}/member/profile`, data);
  }
}

export default createService(MemberService);
