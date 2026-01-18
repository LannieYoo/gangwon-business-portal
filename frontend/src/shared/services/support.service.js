// Support Service - 支持模块服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class SupportService {
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

  // 提交咨询
  async createInquiry(data) {
    return await apiService.post(`${API_PREFIX}/inquiries`, data);
  }

  // 获取我的咨询列表
  async listMyInquiries(params) {
    return await apiService.get(`${API_PREFIX}/inquiries`, params);
  }

  // 获取咨询详情
  async getInquiry(inquiryId) {
    return await apiService.get(`${API_PREFIX}/inquiries/${inquiryId}`);
  }
}

export default createService(SupportService);
