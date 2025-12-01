/**
 * Performance Service
 * 绩效服务 - 封装绩效相关的 API 调用
 */

import apiService from './api.service';
import loggerService from './logger.service';
import exceptionService from './exception.service';
import { API_PREFIX } from '@shared/utils/constants';

class PerformanceService {
  /**
   * List performance records with pagination and filtering
   * 获取绩效记录列表（分页和筛选）
   * 
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.pageSize=20] - Items per page
   * @param {number} [params.year] - Filter by year
   * @param {number} [params.quarter] - Filter by quarter (1-4)
   * @param {string} [params.status] - Filter by status (draft, submitted, approved, rejected, revision_requested)
   * @param {string} [params.type] - Filter by type (sales, support, ip)
   * @returns {Promise<Object>} Paginated performance list
   */
  async listRecords(params = {}) {
    try {
      loggerService.info('List performance records', {
        module: 'PerformanceService',
        function: 'listRecords',
        request_path: `${API_PREFIX}/performance`
      });

      const queryParams = {
        page: params.page || 1,
        page_size: params.pageSize || params.page_size || 20,
      };
      
      if (params.year !== undefined && params.year !== null && params.year !== '') {
        queryParams.year = parseInt(params.year);
      }
      if (params.quarter !== undefined && params.quarter !== null && params.quarter !== '') {
        queryParams.quarter = parseInt(params.quarter);
      }
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.type) {
        queryParams.type = params.type;
      }
      
      const response = await apiService.get(`${API_PREFIX}/performance`, queryParams);
      
      // Map backend response to frontend format
      if (response && response.items) {
        const result = {
          records: response.items.map(item => ({
            id: item.id,
            year: item.year,
            quarter: item.quarter,
            type: item.type,
            status: item.status,
            submittedAt: item.submitted_at,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
          pagination: {
            total: response.total,
            page: response.page,
            pageSize: response.page_size,
            totalPages: response.total_pages
          },
          total: response.total,
          page: response.page,
          pageSize: response.page_size,
          totalPages: response.total_pages
        };
        
        loggerService.info('List performance records successful', {
          module: 'PerformanceService',
          function: 'listRecords',
          total: response.total,
          response_status: 200
        });
        
        return result;
      }
      
      return {
        records: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0
        },
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      };
    } catch (error) {
      loggerService.error('List performance records failed', {
        module: 'PerformanceService',
        function: 'listRecords',
        request_path: `${API_PREFIX}/performance`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/performance`,
        error_code: error.code || 'LIST_RECORDS_FAILED'
      });
      throw error;
    }
  }

  /**
   * Get performance record details by ID
   * 获取绩效记录详情
   * 
   * @param {string} recordId - Performance record ID (UUID)
   * @returns {Promise<Object>} Performance record details
   */
  async getRecord(recordId) {
    try {
      loggerService.info('Get performance record', {
        module: 'PerformanceService',
        function: 'getRecord',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        record_id: recordId
      });

      const response = await apiService.get(`${API_PREFIX}/performance/${recordId}`);
      
      // Map backend response to frontend format
      if (response) {
        const mappedResponse = {
          id: response.id,
          year: response.year,
          quarter: response.quarter,
          type: response.type,
          status: response.status,
          dataJson: response.data_json,
          submittedAt: response.submitted_at,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
          reviews: response.reviews || []
        };
        
        loggerService.info('Get performance record successful', {
          module: 'PerformanceService',
          function: 'getRecord',
          record_id: recordId,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return response;
    } catch (error) {
      loggerService.error('Get performance record failed', {
        module: 'PerformanceService',
        function: 'getRecord',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        record_id: recordId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        error_code: error.code || 'GET_RECORD_FAILED'
      });
      throw error;
    }
  }

  /**
   * Create a new performance record (draft)
   * 创建新的绩效记录（草稿）
   * 
   * @param {Object} data - Performance data
   * @param {number} data.year - Year
   * @param {number} [data.quarter] - Quarter (1-4), null for annual
   * @param {string} data.type - Type: "sales", "support", or "ip"
   * @param {Object} data.dataJson - Performance data in JSON format
   * @returns {Promise<Object>} Created performance record
   */
  async createRecord(data) {
    try {
      loggerService.info('Create performance record', {
        module: 'PerformanceService',
        function: 'createRecord',
        request_path: `${API_PREFIX}/performance`
      });

      const requestData = {
        year: data.year,
        quarter: data.quarter || null,
        type: data.type,
        data_json: data.dataJson || data.data_json
      };
      
      const response = await apiService.post(`${API_PREFIX}/performance`, requestData);
      
      // Map backend response to frontend format
      if (response) {
        const mappedResponse = {
          id: response.id,
          year: response.year,
          quarter: response.quarter,
          type: response.type,
          status: response.status,
          dataJson: response.data_json,
          submittedAt: response.submitted_at,
          createdAt: response.created_at,
          updatedAt: response.updated_at
        };
        
        loggerService.info('Create performance record successful', {
          module: 'PerformanceService',
          function: 'createRecord',
          record_id: response.id,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return response;
    } catch (error) {
      loggerService.error('Create performance record failed', {
        module: 'PerformanceService',
        function: 'createRecord',
        request_path: `${API_PREFIX}/performance`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/performance`,
        error_code: error.code || 'CREATE_RECORD_FAILED'
      });
      throw error;
    }
  }

  /**
   * Update a performance record (draft or revision_requested only)
   * 更新绩效记录（仅限草稿或需要修改状态）
   * 
   * @param {string} recordId - Performance record ID (UUID)
   * @param {Object} data - Performance data to update
   * @param {number} [data.year] - Year
   * @param {number} [data.quarter] - Quarter (1-4)
   * @param {string} [data.type] - Type: "sales", "support", or "ip"
   * @param {Object} [data.dataJson] - Performance data in JSON format
   * @returns {Promise<Object>} Updated performance record
   */
  async updateRecord(recordId, data) {
    try {
      loggerService.info('Update performance record', {
        module: 'PerformanceService',
        function: 'updateRecord',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        record_id: recordId
      });

      const requestData = {};
      
      if (data.year !== undefined) {
        requestData.year = data.year;
      }
      if (data.quarter !== undefined) {
        requestData.quarter = data.quarter || null;
      }
      if (data.type !== undefined) {
        requestData.type = data.type;
      }
      if (data.dataJson !== undefined || data.data_json !== undefined) {
        requestData.data_json = data.dataJson || data.data_json;
      }
      
      const response = await apiService.put(`${API_PREFIX}/performance/${recordId}`, requestData);
      
      // Map backend response to frontend format
      if (response) {
        const mappedResponse = {
          id: response.id,
          year: response.year,
          quarter: response.quarter,
          type: response.type,
          status: response.status,
          dataJson: response.data_json,
          submittedAt: response.submitted_at,
          createdAt: response.created_at,
          updatedAt: response.updated_at
        };
        
        loggerService.info('Update performance record successful', {
          module: 'PerformanceService',
          function: 'updateRecord',
          record_id: recordId,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return response;
    } catch (error) {
      loggerService.error('Update performance record failed', {
        module: 'PerformanceService',
        function: 'updateRecord',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        record_id: recordId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'PUT',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        error_code: error.code || 'UPDATE_RECORD_FAILED'
      });
      throw error;
    }
  }

  /**
   * Delete a performance record (draft only)
   * 删除绩效记录（仅限草稿状态）
   * 
   * @param {string} recordId - Performance record ID (UUID)
   * @returns {Promise<void>}
   */
  async deleteRecord(recordId) {
    try {
      loggerService.info('Delete performance record', {
        module: 'PerformanceService',
        function: 'deleteRecord',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        record_id: recordId
      });

      await apiService.delete(`${API_PREFIX}/performance/${recordId}`);
      
      loggerService.info('Delete performance record successful', {
        module: 'PerformanceService',
        function: 'deleteRecord',
        record_id: recordId,
        response_status: 200
      });
    } catch (error) {
      loggerService.error('Delete performance record failed', {
        module: 'PerformanceService',
        function: 'deleteRecord',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        record_id: recordId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'DELETE',
        request_path: `${API_PREFIX}/performance/${recordId}`,
        error_code: error.code || 'DELETE_RECORD_FAILED'
      });
      throw error;
    }
  }

  /**
   * Submit a performance record for review
   * 提交绩效记录以供审核
   * 
   * @param {string} recordId - Performance record ID (UUID)
   * @returns {Promise<Object>} Updated performance record
   */
  async submitRecord(recordId) {
    try {
      loggerService.info('Submit performance record', {
        module: 'PerformanceService',
        function: 'submitRecord',
        request_path: `${API_PREFIX}/performance/${recordId}/submit`,
        record_id: recordId
      });

      const response = await apiService.post(`${API_PREFIX}/performance/${recordId}/submit`);
      
      // Map backend response to frontend format
      if (response) {
        const mappedResponse = {
          id: response.id,
          year: response.year,
          quarter: response.quarter,
          type: response.type,
          status: response.status,
          dataJson: response.data_json,
          submittedAt: response.submitted_at,
          createdAt: response.created_at,
          updatedAt: response.updated_at
        };
        
        loggerService.info('Submit performance record successful', {
          module: 'PerformanceService',
          function: 'submitRecord',
          record_id: recordId,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return response;
    } catch (error) {
      loggerService.error('Submit performance record failed', {
        module: 'PerformanceService',
        function: 'submitRecord',
        request_path: `${API_PREFIX}/performance/${recordId}/submit`,
        record_id: recordId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/performance/${recordId}/submit`,
        error_code: error.code || 'SUBMIT_RECORD_FAILED'
      });
      throw error;
    }
  }

  /**
   * Convert frontend form data to backend format
   * 将前端表单数据转换为后端格式
   * 
   * @param {Object} formData - Frontend form data
   * @param {number} formData.year - Year
   * @param {string} formData.quarter - Quarter ("1", "2", "3", "4", or "")
   * @param {Object} formData.salesEmployment - Sales and employment data
   * @param {Array} formData.governmentSupport - Government support records
   * @param {Array} formData.intellectualProperty - Intellectual property records
   * @returns {Object} Backend format data
   */
  convertFormDataToBackendFormat(formData) {
    // Determine type based on which tab has data
    let type = 'sales'; // Default to sales
    if (formData.governmentSupport && formData.governmentSupport.length > 0) {
      type = 'support';
    } else if (formData.intellectualProperty && formData.intellectualProperty.length > 0) {
      type = 'ip';
    }

    const dataJson = {};

    // Sales and employment data
    if (formData.salesEmployment) {
      dataJson.sales_employment = {
        sales: {
          previous_year: formData.salesEmployment.sales?.previousYear || null,
          reporting_date: formData.salesEmployment.sales?.reportingDate || null,
        },
        export: {
          previous_year: formData.salesEmployment.export?.previousYear || null,
          reporting_date: formData.salesEmployment.export?.reportingDate || null,
        },
        employment: {
          current_employees: {
            previous_year: formData.salesEmployment.employment?.currentEmployees?.previousYear || null,
            reporting_date: formData.salesEmployment.employment?.currentEmployees?.reportingDate || null,
          },
          new_employees: {
            previous_year: formData.salesEmployment.employment?.newEmployees?.previousYear || null,
            reporting_date: formData.salesEmployment.employment?.newEmployees?.reportingDate || null,
          },
          total_employees: {
            previous_year: formData.salesEmployment.employment?.totalEmployees?.previousYear || null,
            reporting_date: formData.salesEmployment.employment?.totalEmployees?.reportingDate || null,
          },
        },
      };
    }

    // Government support data
    if (formData.governmentSupport && formData.governmentSupport.length > 0) {
      dataJson.government_support = formData.governmentSupport.map(item => ({
        project_name: item.projectName,
        startup_project_name: item.startupProjectName,
        start_date: item.startDate,
        end_date: item.endDate,
        support_amount: item.supportAmount ? parseFloat(item.supportAmount) : null,
        support_organization: item.supportOrganization,
      }));
    }

    // Intellectual property data
    if (formData.intellectualProperty && formData.intellectualProperty.length > 0) {
      dataJson.intellectual_property = formData.intellectualProperty.map(item => ({
        name: item.name,
        number: item.number,
        type: item.type,
        registration_type: item.registrationType,
        country: item.country,
        overseas_type: item.overseasType,
        registration_date: item.registrationDate,
        public_disclosure: item.publicDisclosure,
        // Note: proofDocument file upload should be handled separately
        proof_document_file_id: item.proofDocumentFileId || null,
      }));
    }

    return {
      year: formData.year,
      quarter: formData.quarter ? parseInt(formData.quarter) : null,
      type: type,
      data_json: dataJson
    };
  }
}

export default new PerformanceService();

