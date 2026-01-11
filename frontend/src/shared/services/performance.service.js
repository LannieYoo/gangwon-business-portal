// Performance Service - 绩效服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class PerformanceService {
  // 获取绩效记录列表
  async listRecords(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.year !== undefined && params.year !== null && params.year !== "") {
      queryParams.year = parseInt(params.year);
    }
    if (params.quarter !== undefined && params.quarter !== null && params.quarter !== "") {
      queryParams.quarter = parseInt(params.quarter);
    }
    if (params.status) {
      queryParams.status = params.status;
    }
    if (params.type) {
      queryParams.type = params.type;
    }

    const response = await apiService.get(`${API_PREFIX}/performance`, queryParams);

    if (response && response.items) {
      return {
        records: response.items.map((item) => ({
          id: item.id,
          year: item.year,
          quarter: item.quarter,
          type: item.type,
          status: item.status,
          submittedAt: item.submitted_at,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          data_json: item.data_json,
          reviews: item.reviews,
          attachments: item.attachments,
        })),
        pagination: {
          total: response.total,
          page: response.page,
          pageSize: response.page_size,
          totalPages: response.total_pages,
        },
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error("Invalid response format");
  }

  // 获取绩效记录详情
  async getRecord(recordId) {
    const response = await apiService.get(`${API_PREFIX}/performance/${recordId}`);

    if (response) {
      return {
        id: response.id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        reviews: response.reviews,
      };
    }

    return null;
  }


  // 创建绩效记录
  async createRecord(data) {
    const requestData = {
      year: data.year,
      quarter: data.quarter ?? null,
      type: data.type,
      data_json: data.dataJson ?? data.data_json,
    };

    const response = await apiService.post(`${API_PREFIX}/performance`, requestData);

    if (response) {
      return {
        id: response.id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    }

    return null;
  }

  // 更新绩效记录
  async updateRecord(recordId, data) {
    const requestData = {};

    if (data.year !== undefined) {
      requestData.year = data.year;
    }
    if (data.quarter !== undefined) {
      requestData.quarter = data.quarter ?? null;
    }
    if (data.type !== undefined) {
      requestData.type = data.type;
    }
    if (data.dataJson !== undefined || data.data_json !== undefined) {
      requestData.data_json = data.dataJson ?? data.data_json;
    }

    const response = await apiService.put(`${API_PREFIX}/performance/${recordId}`, requestData);

    if (response) {
      return {
        id: response.id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    }

    return null;
  }

  // 删除绩效记录
  async deleteRecord(recordId) {
    await apiService.delete(`${API_PREFIX}/performance/${recordId}`);
  }

  // 提交绩效记录
  async submitRecord(recordId) {
    const response = await apiService.post(`${API_PREFIX}/performance/${recordId}/submit`);

    if (response) {
      return {
        id: response.id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    }

    return null;
  }

  // 转换表单数据为后端格式
  convertFormDataToBackendFormat(formData) {
    let type = "sales";
    if (formData.governmentSupport && formData.governmentSupport.length > 0) {
      type = "support";
    } else if (formData.intellectualProperty && formData.intellectualProperty.length > 0) {
      type = "ip";
    }

    const dataJson = {};

    if (formData.salesEmployment) {
      dataJson.sales_employment = {
        sales: {
          previous_year: formData.salesEmployment.sales?.previousYear ?? null,
          reporting_date: formData.salesEmployment.sales?.reportingDate ?? null,
        },
        export: {
          previous_year: formData.salesEmployment.export?.previousYear ?? null,
          reporting_date: formData.salesEmployment.export?.reportingDate ?? null,
        },
        employment: {
          current_employees: {
            previous_year: formData.salesEmployment.employment?.currentEmployees?.previousYear ?? null,
            reporting_date: formData.salesEmployment.employment?.currentEmployees?.reportingDate ?? null,
          },
          new_employees: {
            previous_year: formData.salesEmployment.employment?.newEmployees?.previousYear ?? null,
            reporting_date: formData.salesEmployment.employment?.newEmployees?.reportingDate ?? null,
          },
          total_employees: {
            previous_year: formData.salesEmployment.employment?.totalEmployees?.previousYear ?? null,
            reporting_date: formData.salesEmployment.employment?.totalEmployees?.reportingDate ?? null,
          },
        },
      };
    }

    if (formData.governmentSupport && formData.governmentSupport.length > 0) {
      dataJson.government_support = formData.governmentSupport.map((item) => ({
        project_name: item.projectName,
        startup_project_name: item.startupProjectName,
        start_date: item.startDate,
        end_date: item.endDate,
        support_amount: item.supportAmount ? parseFloat(item.supportAmount) : null,
        support_organization: item.supportOrganization,
      }));
    }

    if (formData.intellectualProperty && formData.intellectualProperty.length > 0) {
      dataJson.intellectual_property = formData.intellectualProperty.map((item) => ({
        name: item.name,
        number: item.number,
        type: item.type,
        registration_type: item.registrationType,
        country: item.country,
        overseas_type: item.overseasType,
        registration_date: item.registrationDate,
        public_disclosure: item.publicDisclosure,
        proof_document_file_id: item.proofDocumentFileId ?? null,
      }));
    }

    return {
      year: formData.year,
      quarter: formData.quarter ? parseInt(formData.quarter) : null,
      type: type,
      data_json: dataJson,
    };
  }
}

export default createService(PerformanceService);
