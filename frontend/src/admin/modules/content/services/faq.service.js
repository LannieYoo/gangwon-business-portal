/**
 * FAQ Service - Admin Content Module
 * 
 * 管理员端 FAQ 管理服务
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class FAQService {
  // 获取 FAQ 列表
  async listFAQs(params) {
    return await apiService.get(`${API_PREFIX}/faqs`, params);
  }

  // 创建 FAQ (管理员)
  async createFAQ(data) {
    return await apiService.post(`${API_PREFIX}/admin/faqs`, data);
  }

  // 更新 FAQ (管理员)
  async updateFAQ(faqId, data) {
    return await apiService.put(`${API_PREFIX}/admin/faqs/${faqId}`, data);
  }

  // 删除 FAQ (管理员)
  async deleteFAQ(faqId) {
    return await apiService.delete(`${API_PREFIX}/admin/faqs/${faqId}`);
  }
}

export const faqService = createService(FAQService, "FAQ");
export default faqService;




