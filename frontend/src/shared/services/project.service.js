/**
 * Project Service
 * 项目管理服务 - 封装项目相关的 API 调用
 */

import apiService from './api.service';
import loggerService from './logger.service';
import exceptionService from './exception.service';
import { API_PREFIX } from '@shared/utils/constants';

class ProjectService {
  /**
   * List projects with pagination and filtering
   * 获取项目列表（分页和筛选）
   * 
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.pageSize=20] - Items per page
   * @param {string} [params.status] - Filter by status (active, inactive, archived)
   * @param {string} [params.search] - Search in title and description
   * @returns {Promise<Object>} Paginated project list
   */
  async listProjects(params = {}) {
    try {
      loggerService.info('List projects', {
        module: 'ProjectService',
        function: 'listProjects',
        request_path: `${API_PREFIX}/projects`
      });

      const queryParams = {
        page: params.page || 1,
        page_size: params.pageSize || params.page_size || 20,
      };
      
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.search) {
        queryParams.search = params.search;
      }
      
      const response = await apiService.get(`${API_PREFIX}/projects`, queryParams);
      
      // Map backend response to frontend format
      if (response && response.items) {
        const result = {
          records: response.items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            targetAudience: item.target_audience,
            startDate: item.start_date,
            endDate: item.end_date,
            imageUrl: item.image_url,
            status: item.status,
            applicationsCount: item.applications_count || 0,
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
        
        loggerService.info('List projects successful', {
          module: 'ProjectService',
          function: 'listProjects',
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
      loggerService.error('List projects failed', {
        module: 'ProjectService',
        function: 'listProjects',
        request_path: `${API_PREFIX}/projects`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/projects`,
        error_code: error.code || 'LIST_PROJECTS_FAILED'
      });
      throw error;
    }
  }

  /**
   * Get project details by ID
   * 获取项目详情
   * 
   * @param {string} projectId - Project ID (UUID)
   * @returns {Promise<Object>} Project details
   */
  async getProject(projectId) {
    try {
      loggerService.info('Get project', {
        module: 'ProjectService',
        function: 'getProject',
        request_path: `${API_PREFIX}/projects/${projectId}`,
        project_id: projectId
      });

      const response = await apiService.get(`${API_PREFIX}/projects/${projectId}`);
      
      // Map backend response to frontend format
      if (response) {
        const mappedResponse = {
          id: response.id,
          title: response.title,
          description: response.description,
          targetAudience: response.target_audience,
          startDate: response.start_date,
          endDate: response.end_date,
          imageUrl: response.image_url,
          status: response.status,
          applicationsCount: response.applications_count || 0,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        };
        
        loggerService.info('Get project successful', {
          module: 'ProjectService',
          function: 'getProject',
          project_id: projectId,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return null;
    } catch (error) {
      loggerService.error('Get project failed', {
        module: 'ProjectService',
        function: 'getProject',
        request_path: `${API_PREFIX}/projects/${projectId}`,
        project_id: projectId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/projects/${projectId}`,
        error_code: error.code || 'GET_PROJECT_FAILED'
      });
      throw error;
    }
  }

  /**
   * Apply to a project
   * 申请项目
   * 
   * @param {string} projectId - Project ID (UUID)
   * @param {Object} data - Application data
   * @param {string} data.applicationReason - Reason for applying (required, min 10 chars)
   * @returns {Promise<Object>} Application response
   */
  async applyToProject(projectId, data) {
    try {
      loggerService.info('Apply to project', {
        module: 'ProjectService',
        function: 'applyToProject',
        request_path: `${API_PREFIX}/projects/${projectId}/apply`,
        project_id: projectId
      });

      const requestData = {
        application_reason: data.applicationReason || data.application_reason,
      };
      
      const response = await apiService.post(
        `${API_PREFIX}/projects/${projectId}/apply`,
        requestData
      );
      
      // Map backend response to frontend format
      if (response) {
        const mappedResponse = {
          id: response.id,
          memberId: response.member_id,
          projectId: response.project_id,
          project: response.project ? {
            id: response.project.id,
            title: response.project.title,
            description: response.project.description,
            status: response.project.status,
          } : null,
          status: response.status,
          applicationReason: response.application_reason,
          submittedAt: response.submitted_at,
          reviewedAt: response.reviewed_at,
        };
        
        loggerService.info('Apply to project successful', {
          module: 'ProjectService',
          function: 'applyToProject',
          project_id: projectId,
          application_id: response.id,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return null;
    } catch (error) {
      loggerService.error('Apply to project failed', {
        module: 'ProjectService',
        function: 'applyToProject',
        request_path: `${API_PREFIX}/projects/${projectId}/apply`,
        project_id: projectId,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/projects/${projectId}/apply`,
        error_code: error.code || 'APPLY_TO_PROJECT_FAILED'
      });
      throw error;
    }
  }

  /**
   * Get my project applications
   * 获取我的项目申请列表
   * 
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.pageSize=20] - Items per page
   * @param {string} [params.status] - Filter by status (submitted, under_review, approved, rejected)
   * @returns {Promise<Object>} Paginated application list
   */
  async getMyApplications(params = {}) {
    try {
      loggerService.info('Get my applications', {
        module: 'ProjectService',
        function: 'getMyApplications',
        request_path: `${API_PREFIX}/my-applications`
      });

      const queryParams = {
        page: params.page || 1,
        page_size: params.pageSize || params.page_size || 20,
      };
      
      if (params.status) {
        queryParams.status = params.status;
      }
      
      const response = await apiService.get(`${API_PREFIX}/my-applications`, queryParams);
      
      // Map backend response to frontend format
      if (response && response.items) {
        const result = {
          records: response.items.map(item => ({
            id: item.id,
            memberId: item.member_id,
            projectId: item.project_id,
            projectTitle: item.project_title,
            status: item.status,
            submittedAt: item.submitted_at,
            reviewedAt: item.reviewed_at,
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
        
        loggerService.info('Get my applications successful', {
          module: 'ProjectService',
          function: 'getMyApplications',
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
      loggerService.error('Get my applications failed', {
        module: 'ProjectService',
        function: 'getMyApplications',
        request_path: `${API_PREFIX}/my-applications`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/my-applications`,
        error_code: error.code || 'GET_MY_APPLICATIONS_FAILED'
      });
      throw error;
    }
  }
}

export default new ProjectService();

