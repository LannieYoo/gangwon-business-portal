/**
 * Member Service
 * 会员服务 - 封装会员相关的 API 调用
 */

import apiService from './api.service';
import loggerService from './logger.service';
import exceptionService from './exception.service';
import { API_PREFIX } from '@shared/utils/constants';

class MemberService {
  /**
   * Get current member's profile
   * 获取当前会员资料
   * 
   * @returns {Promise<Object>} Member profile data
   */
  async getProfile() {
    try {
      loggerService.info('Get member profile', {
        module: 'MemberService',
        function: 'getProfile',
        request_path: `${API_PREFIX}/member/profile`
      });

      const response = await apiService.get(`${API_PREFIX}/member/profile`);
      
      // Map backend fields to frontend fields
      if (response) {
        const mappedResponse = {
          id: response.id,
          businessNumber: response.business_number,
          companyName: response.company_name,
          email: response.email,
          status: response.status,
          approvalStatus: response.approval_status,
          industry: response.industry,
          sales: response.revenue ? parseFloat(response.revenue) : null,
          revenue: response.revenue ? parseFloat(response.revenue) : null,
          employeeCount: response.employee_count,
          establishedDate: response.founding_date,
          foundingDate: response.founding_date,
          region: response.region,
          address: response.address,
          website: response.website,
          websiteUrl: response.website,
          logo: response.logo_url,
          logoUrl: response.logo_url,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
          // Additional fields for compatibility
          corporationNumber: null, // Not in backend response yet
          representativeName: null, // Not in backend response yet
          phone: null, // Not in backend response yet
          category: null, // Not in backend response yet
          description: null, // Not in backend response yet
          businessField: null, // Not in backend response yet
          mainBusiness: null, // Not in backend response yet
          cooperationFields: [] // Not in backend response yet
        };
        
        loggerService.info('Get member profile successful', {
          module: 'MemberService',
          function: 'getProfile',
          member_id: response.id,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return response;
    } catch (error) {
      loggerService.error('Get member profile failed', {
        module: 'MemberService',
        function: 'getProfile',
        request_path: `${API_PREFIX}/member/profile`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/member/profile`,
        error_code: error.code || 'GET_PROFILE_FAILED'
      });
      throw error;
    }
  }

  /**
   * Verify company information
   * 验证公司信息
   * 
   * @param {Object} data - Company verification data
   * @param {string} data.businessNumber - Business registration number
   * @param {string} [data.companyName] - Company name (optional)
   * @returns {Promise<Object>} Verification result
   */
  async verifyCompany(data) {
    try {
      loggerService.info('Verify company', {
        module: 'MemberService',
        function: 'verifyCompany',
        request_path: `${API_PREFIX}/members/verify-company`
      });

      const requestData = {
        business_number: data.businessNumber?.replace(/-/g, '') || data.business_number,
        company_name: data.companyName || null
      };
      
      const response = await apiService.post(`${API_PREFIX}/members/verify-company`, requestData);
      
      loggerService.info('Verify company successful', {
        module: 'MemberService',
        function: 'verifyCompany',
        response_status: 200
      });
      
      return response;
    } catch (error) {
      loggerService.error('Verify company failed', {
        module: 'MemberService',
        function: 'verifyCompany',
        request_path: `${API_PREFIX}/members/verify-company`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/members/verify-company`,
        error_code: error.code || 'VERIFY_COMPANY_FAILED'
      });
      throw error;
    }
  }

  /**
   * Update current member's profile
   * 更新当前会员资料
   * 
   * @param {Object} data - Profile data to update
   * @param {string} [data.companyName] - Company name
   * @param {string} [data.email] - Email
   * @param {string} [data.industry] - Industry
   * @param {number} [data.revenue] - Annual revenue
   * @param {number} [data.employeeCount] - Employee count
   * @param {string} [data.foundingDate] - Founding date (YYYY-MM-DD)
   * @param {string} [data.region] - Region
   * @param {string} [data.address] - Address
   * @param {string} [data.website] - Website URL
   * @returns {Promise<Object>} Updated member profile
   */
  async updateProfile(data) {
    try {
      loggerService.info('Update member profile', {
        module: 'MemberService',
        function: 'updateProfile',
        request_path: `${API_PREFIX}/member/profile`
      });

      // Map frontend fields to backend fields
      const requestData = {};
      
      if (data.companyName !== undefined) {
        requestData.company_name = data.companyName;
      }
      if (data.email !== undefined) {
        requestData.email = data.email;
      }
      if (data.industry !== undefined) {
        requestData.industry = data.industry;
      }
      if (data.revenue !== undefined || data.sales !== undefined) {
        requestData.revenue = data.revenue || data.sales;
      }
      if (data.employeeCount !== undefined) {
        requestData.employee_count = data.employeeCount;
      }
      if (data.foundingDate !== undefined || data.establishedDate !== undefined) {
        requestData.founding_date = data.foundingDate || data.establishedDate;
      }
      if (data.region !== undefined) {
        requestData.region = data.region;
      }
      if (data.address !== undefined) {
        requestData.address = data.address;
      }
      if (data.website !== undefined || data.websiteUrl !== undefined) {
        requestData.website = data.website || data.websiteUrl;
      }
      
      const response = await apiService.put(`${API_PREFIX}/member/profile`, requestData);
      
      // Map backend response to frontend format
      if (response) {
        const mappedResponse = {
          id: response.id,
          businessNumber: response.business_number,
          companyName: response.company_name,
          email: response.email,
          status: response.status,
          approvalStatus: response.approval_status,
          industry: response.industry,
          sales: response.revenue ? parseFloat(response.revenue) : null,
          revenue: response.revenue ? parseFloat(response.revenue) : null,
          employeeCount: response.employee_count,
          establishedDate: response.founding_date,
          foundingDate: response.founding_date,
          region: response.region,
          address: response.address,
          website: response.website,
          websiteUrl: response.website,
          logo: response.logo_url,
          logoUrl: response.logo_url,
          createdAt: response.created_at,
          updatedAt: response.updated_at
        };
        
        loggerService.info('Update member profile successful', {
          module: 'MemberService',
          function: 'updateProfile',
          member_id: response.id,
          response_status: 200
        });
        
        return mappedResponse;
      }
      
      return response;
    } catch (error) {
      loggerService.error('Update member profile failed', {
        module: 'MemberService',
        function: 'updateProfile',
        request_path: `${API_PREFIX}/member/profile`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'PUT',
        request_path: `${API_PREFIX}/member/profile`,
        error_code: error.code || 'UPDATE_PROFILE_FAILED'
      });
      throw error;
    }
  }
}

export default new MemberService();

