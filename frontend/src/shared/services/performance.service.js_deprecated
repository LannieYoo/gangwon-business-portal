// Performance Service - 绩效服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class PerformanceService {
  // 获取绩效记录列表
  async listRecords(params) {
    return await apiService.get(`${API_PREFIX}/performance`, params);
  }

  // 获取绩效记录详情
  async getRecord(recordId) {
    return await apiService.get(`${API_PREFIX}/performance/${recordId}`);
  }

  // 创建绩效记录
  async createRecord(data) {
    return await apiService.post(`${API_PREFIX}/performance`, data);
  }

  // 更新绩效记录
  async updateRecord(recordId, data) {
    return await apiService.put(`${API_PREFIX}/performance/${recordId}`, data);
  }

  // 删除绩效记录
  async deleteRecord(recordId) {
    return await apiService.delete(`${API_PREFIX}/performance/${recordId}`);
  }

  // 提交绩效记录
  async submitRecord(recordId) {
    return await apiService.post(`${API_PREFIX}/performance/${recordId}/submit`);
  }

  // 转换表单数据为后端格式
  convertFormDataToBackendFormat(formData) {
    let type = "sales";
    
    if (formData.governmentSupport?.length > 0) {
      type = "support";
    }
    
    if (formData.intellectualProperty?.length > 0) {
      type = "ip";
    }

    const hskCode = formData.salesEmployment?.export?.hskCode?.trim();
    const exportCountry1 = formData.salesEmployment?.export?.exportCountry1?.trim();
    const exportCountry2 = formData.salesEmployment?.export?.exportCountry2?.trim();

    return {
      year: formData.year,
      quarter: formData.quarter ? parseInt(formData.quarter) : null,
      type,
      dataJson: {
        salesEmployment: formData.salesEmployment,
        governmentSupport: formData.governmentSupport,
        intellectualProperty: formData.intellectualProperty,
        notes: formData.notes,
      },
      hskCode: hskCode || null,
      exportCountry1: exportCountry1 || null,
      exportCountry2: exportCountry2 || null,
    };
  }
}

export default createService(PerformanceService);
