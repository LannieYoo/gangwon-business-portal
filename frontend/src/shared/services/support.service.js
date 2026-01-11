// Support Service - 支持模块服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { toCamelCase, toSnakeCase, createService } from "@shared/utils/helpers";

class SupportService {
  // 获取 FAQ 列表
  async listFAQs(params) {
    const queryParams = new URLSearchParams();
    if (params?.category) {
      queryParams.append("category", params.category);
    }

    const url = `${API_PREFIX}/faqs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await apiService.get(url);

    const items = response.items ?? response.records ?? response.faqs;
    return items.map(toCamelCase);
  }

  // 创建 FAQ (管理员)
  async createFAQ(data) {
    const requestData = toSnakeCase(data);
    const response = await apiService.post(`${API_PREFIX}/admin/faqs`, requestData);
    return toCamelCase(response);
  }

  // 更新 FAQ (管理员)
  async updateFAQ(faqId, data) {
    const requestData = toSnakeCase(data);
    const response = await apiService.put(`${API_PREFIX}/admin/faqs/${faqId}`, requestData);
    return toCamelCase(response);
  }

  // 删除 FAQ (管理员)
  async deleteFAQ(faqId) {
    await apiService.delete(`${API_PREFIX}/admin/faqs/${faqId}`);
  }

  // 提交咨询
  async createInquiry(data) {
    const requestData = {
      category: data.category,
      subject: data.subject,
      content: data.content,
    };

    if (data.attachments && data.attachments.length > 0) {
      requestData.attachments = data.attachments.slice(0, 3).map(att => ({
        file_id: att.file_id ?? att.id,
        file_url: att.file_url ?? att.url,
        original_name: att.original_name ?? att.name,
        file_size: att.file_size ?? att.size,
      }));
    }

    const response = await apiService.post(`${API_PREFIX}/inquiries`, requestData);
    const result = toCamelCase(response);

    if (result.status) {
      result.status = this.mapStatus(result.status);
    }
    return result;
  }


  // 获取我的咨询列表
  async listMyInquiries(params) {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.pageSize) {
      queryParams.append("page_size", params.pageSize.toString());
    }

    const url = `${API_PREFIX}/inquiries${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await apiService.get(url);
    const result = toCamelCase(response);

    if (result.items) {
      result.items = result.items.map((item) => ({
        ...item,
        status: this.mapStatus(item.status),
      }));
    }

    return result;
  }

  // 获取咨询详情
  async getInquiry(inquiryId) {
    const response = await apiService.get(`${API_PREFIX}/inquiries/${inquiryId}`);
    const result = toCamelCase(response);

    if (result.status) {
      result.status = this.mapStatus(result.status);
    }

    if (result.adminReply) {
      result.answer = result.adminReply;
    }

    if (result.repliedAt) {
      result.answeredAt = result.repliedAt;
    }

    return result;
  }

  // 状态映射
  mapStatus(status) {
    const statusMap = {
      pending: "pending",
      replied: "answered",
      closed: "closed",
    };
    return statusMap[status] ?? status;
  }
}

export default createService(SupportService);
