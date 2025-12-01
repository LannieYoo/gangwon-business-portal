/**
 * Authentication Service
 */

import apiService from './api.service';
import loggerService from './logger.service';
import exceptionService from './exception.service';
import { API_PREFIX, ACCESS_TOKEN_KEY, USER_ROLES } from '@shared/utils/constants';
import { setStorage, getStorage, removeStorage } from '@shared/utils/storage';

class AuthService {
  /**
   * Login
   * 
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.businessNumber - Business number (will be converted to business_number for API)
   * @param {string} credentials.password - Password
   */
  async login(credentials) {
    try {
      loggerService.info('Login attempt', {
        module: 'AuthService',
        function: 'login',
        request_path: `${API_PREFIX}/auth/login`
      });

      // Convert businessNumber (camelCase) to business_number (snake_case) for backend API
      const requestData = {
        business_number: credentials.businessNumber || credentials.business_number,
        password: credentials.password
      };
      
      const response = await apiService.post(`${API_PREFIX}/auth/login`, requestData);
      
      if (response.access_token) {
        setStorage(ACCESS_TOKEN_KEY, response.access_token);
        // Backend doesn't return refresh_token or expires_at yet
        // Store user info with role from response
        const userInfo = {
          ...response.user,
          role: response.user.role || 'member' // Default to member if not provided
        };
        setStorage('user_info', userInfo);
        
        loggerService.info('Login successful', {
          module: 'AuthService',
          function: 'login',
          user_id: userInfo.id,
          response_status: 200
        });
      }
      
      return response;
    } catch (error) {
      loggerService.error('Login failed', {
        module: 'AuthService',
        function: 'login',
        request_path: `${API_PREFIX}/auth/login`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/login`,
        error_code: error.code || 'LOGIN_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Admin Login
   * 
   * @param {Object} credentials - Admin login credentials
   * @param {string} credentials.username - Admin username (business_number)
   * @param {string} credentials.password - Password
   */
  async adminLogin(credentials) {
    try {
      loggerService.info('Admin login attempt', {
        module: 'AuthService',
        function: 'adminLogin',
        request_path: `${API_PREFIX}/auth/admin-login`
      });

      const requestData = {
        username: credentials.username || credentials.email, // Support both username and email
        password: credentials.password
      };
      
      const response = await apiService.post(`${API_PREFIX}/auth/admin-login`, requestData);
      
      if (response.access_token) {
        setStorage(ACCESS_TOKEN_KEY, response.access_token);
        const userInfo = {
          ...response.user,
          role: 'admin' // Ensure role is set to admin
        };
        setStorage('user_info', userInfo);
        
        loggerService.info('Admin login successful', {
          module: 'AuthService',
          function: 'adminLogin',
          user_id: userInfo.id,
          response_status: 200
        });
        
        // Return response with updated user info that includes role
        return {
          ...response,
          user: userInfo
        };
      }
      
      return response;
    } catch (error) {
      loggerService.error('Admin login failed', {
        module: 'AuthService',
        function: 'adminLogin',
        request_path: `${API_PREFIX}/auth/admin-login`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/admin-login`,
        error_code: error.code || 'ADMIN_LOGIN_FAILED'
      });
      throw error;
    }
  }

  /**
   * Register
   * 
   * @param {FormData|Object} userData - Registration data (FormData or plain object)
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    // If userData is FormData, we need to extract and process it
    // Otherwise, assume it's already processed
    let registrationData;
    
    if (userData instanceof FormData) {
      // Extract data from FormData
      const data = {};
      const files = {};
      
      for (const [key, value] of userData.entries()) {
        // Check if value is a File object
        if (value instanceof File) {
          files[key] = value;
        } else if (key.endsWith('[]')) {
          // Handle array fields like cooperationFields[]
          const fieldName = key.replace('[]', '');
          if (!data[fieldName]) {
            data[fieldName] = [];
          }
          data[fieldName].push(value);
        } else {
          data[key] = value;
        }
      }
      
      // Upload files first if they exist
      // Note: Currently, file upload requires authentication, so we skip file uploads during registration
      // Backend needs to support file upload during registration (either by creating
      // a special registration upload endpoint or making the upload endpoint support optional auth)
      // For now, files can be uploaded later after user logs in and updates their profile
      let logoFileId = null;
      let certificateFileId = null;
      
      // Skip file uploads during registration (requires authentication)
      // Users can upload files after registration when they log in
      if (files.logo || files.businessLicenseFile) {
        loggerService.info('File uploads will be skipped during registration. Users can upload files after login.', {
          module: 'AuthService',
          function: 'register'
        });
      }
      
      // Map frontend fields to backend fields
      registrationData = {
        // Step 1: Account information
        business_number: data.businessNumber?.replace(/-/g, '') || data.business_number,
        company_name: data.companyName,
        password: data.password,
        email: data.email,
        
        // Step 2: Company information
        region: data.region || null,
        company_type: data.category || null,
        corporate_number: data.corporationNumber?.replace(/-/g, '') || null,
        address: data.address || null,
        contact_person: data.representativeName || data.contactPersonName || null,
        
        // Step 3: Business information
        industry: data.businessField || null,
        revenue: data.sales ? parseFloat(data.sales.replace(/,/g, '')) : null,
        employee_count: data.employeeCount ? parseInt(data.employeeCount.replace(/,/g, ''), 10) : null,
        founding_date: data.establishedDate || null,
        website: data.websiteUrl || null,
        main_business: data.mainBusiness || null,
        
        // Step 4: File uploads (file IDs from upload endpoint)
        logo_file_id: logoFileId,
        certificate_file_id: certificateFileId,
        
        // Step 5: Terms agreement
        terms_agreed: !!(data.termsOfService && data.privacyPolicy && data.thirdPartySharing)
      };
    } else {
      // Already processed data
      registrationData = userData;
    }
    
    // Send registration request as JSON
    try {
      loggerService.info('Registration attempt', {
        module: 'AuthService',
        function: 'register',
        request_path: `${API_PREFIX}/auth/register`
      });

      const response = await apiService.post(`${API_PREFIX}/auth/register`, registrationData);
      
      loggerService.info('Registration successful', {
        module: 'AuthService',
        function: 'register',
        response_status: 200
      });
      
      return response;
    } catch (error) {
      loggerService.error('Registration failed', {
        module: 'AuthService',
        function: 'register',
        request_path: `${API_PREFIX}/auth/register`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/register`,
        error_code: error.code || 'REGISTRATION_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Logout
   */
  async logout() {
    try {
      loggerService.info('Logout attempt', {
        module: 'AuthService',
        function: 'logout',
        request_path: `${API_PREFIX}/auth/logout`
      });

      await apiService.post(`${API_PREFIX}/auth/logout`);
      
      loggerService.info('Logout successful', {
        module: 'AuthService',
        function: 'logout',
        response_status: 200
      });
    } catch (error) {
      loggerService.error('Logout error', {
        module: 'AuthService',
        function: 'logout',
        request_path: `${API_PREFIX}/auth/logout`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/logout`,
        error_code: error.code || 'LOGOUT_FAILED'
      });
    } finally {
      this.clearAuth();
    }
  }
  
  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      loggerService.info('Token refresh attempt', {
        module: 'AuthService',
        function: 'refreshToken',
        request_path: `${API_PREFIX}/auth/refresh`
      });

      const refreshToken = getStorage('refresh_token');
      if (!refreshToken) {
        const error = new Error('No refresh token available');
        loggerService.warn('Token refresh failed: no refresh token', {
          module: 'AuthService',
          function: 'refreshToken',
          error_message: error.message
        });
        throw error;
      }
      
      const response = await apiService.post(`${API_PREFIX}/auth/refresh`, {
        refresh_token: refreshToken
      });
      
      if (response.access_token) {
        setStorage(ACCESS_TOKEN_KEY, response.access_token);
        setStorage('token_expiry', response.expires_at);
        
        loggerService.info('Token refresh successful', {
          module: 'AuthService',
          function: 'refreshToken',
          response_status: 200
        });
      }
      
      return response;
    } catch (error) {
      loggerService.error('Token refresh failed', {
        module: 'AuthService',
        function: 'refreshToken',
        request_path: `${API_PREFIX}/auth/refresh`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/refresh`,
        error_code: error.code || 'TOKEN_REFRESH_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      loggerService.info('Get current user', {
        module: 'AuthService',
        function: 'getCurrentUser',
        request_path: `${API_PREFIX}/auth/me`
      });

      const response = await apiService.get(`${API_PREFIX}/auth/me`);
      setStorage('user_info', response);
      
      loggerService.info('Get current user successful', {
        module: 'AuthService',
        function: 'getCurrentUser',
        user_id: response.id,
        response_status: 200
      });
      
      return response;
    } catch (error) {
      loggerService.error('Get current user failed', {
        module: 'AuthService',
        function: 'getCurrentUser',
        request_path: `${API_PREFIX}/auth/me`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'GET',
        request_path: `${API_PREFIX}/auth/me`,
        error_code: error.code || 'GET_CURRENT_USER_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Update profile
   */
  async updateProfile(userData) {
    try {
      loggerService.info('Update profile attempt', {
        module: 'AuthService',
        function: 'updateProfile',
        request_path: `${API_PREFIX}/auth/profile`
      });

      const response = await apiService.put(`${API_PREFIX}/auth/profile`, userData);
      setStorage('user_info', response);
      
      loggerService.info('Update profile successful', {
        module: 'AuthService',
        function: 'updateProfile',
        user_id: response.id,
        response_status: 200
      });
      
      return response;
    } catch (error) {
      loggerService.error('Update profile failed', {
        module: 'AuthService',
        function: 'updateProfile',
        request_path: `${API_PREFIX}/auth/profile`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'PUT',
        request_path: `${API_PREFIX}/auth/profile`,
        error_code: error.code || 'UPDATE_PROFILE_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Change password
   */
  async changePassword(passwordData) {
    try {
      loggerService.info('Change password attempt', {
        module: 'AuthService',
        function: 'changePassword',
        request_path: `${API_PREFIX}/auth/change-password`
      });

      const response = await apiService.post(`${API_PREFIX}/auth/change-password`, passwordData);
      
      loggerService.info('Change password successful', {
        module: 'AuthService',
        function: 'changePassword',
        response_status: 200
      });
      
      return response;
    } catch (error) {
      loggerService.error('Change password failed', {
        module: 'AuthService',
        function: 'changePassword',
        request_path: `${API_PREFIX}/auth/change-password`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/change-password`,
        error_code: error.code || 'CHANGE_PASSWORD_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Forgot password (Request password reset)
   * 
   * @param {Object} data - Password reset request data
   * @param {string} data.businessNumber - Business number (will be converted to business_number for API)
   * @param {string} data.email - Email address
   */
  async forgotPassword(data) {
    try {
      loggerService.info('Forgot password request', {
        module: 'AuthService',
        function: 'forgotPassword',
        request_path: `${API_PREFIX}/auth/password-reset-request`
      });

      // Convert businessNumber (camelCase) to business_number (snake_case) for backend API
      const requestData = {
        business_number: data.businessNumber?.replace(/-/g, '') || data.business_number,
        email: data.email
      };
      
      const response = await apiService.post(`${API_PREFIX}/auth/password-reset-request`, requestData);
      
      loggerService.info('Forgot password request successful', {
        module: 'AuthService',
        function: 'forgotPassword',
        response_status: 200
      });
      
      return response;
    } catch (error) {
      loggerService.error('Forgot password request failed', {
        module: 'AuthService',
        function: 'forgotPassword',
        request_path: `${API_PREFIX}/auth/password-reset-request`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/password-reset-request`,
        error_code: error.code || 'FORGOT_PASSWORD_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Reset password (Complete password reset with token)
   * 
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   */
  async resetPassword(token, newPassword) {
    try {
      loggerService.info('Reset password attempt', {
        module: 'AuthService',
        function: 'resetPassword',
        request_path: `${API_PREFIX}/auth/password-reset`
      });

      const response = await apiService.post(`${API_PREFIX}/auth/password-reset`, {
        token,
        new_password: newPassword
      });
      
      loggerService.info('Reset password successful', {
        module: 'AuthService',
        function: 'resetPassword',
        response_status: 200
      });
      
      return response;
    } catch (error) {
      loggerService.error('Reset password failed', {
        module: 'AuthService',
        function: 'resetPassword',
        request_path: `${API_PREFIX}/auth/password-reset`,
        error_message: error.message,
        error_code: error.code
      });
      exceptionService.recordException(error, {
        request_method: 'POST',
        request_path: `${API_PREFIX}/auth/password-reset`,
        error_code: error.code || 'RESET_PASSWORD_FAILED'
      });
      throw error;
    }
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = getStorage(ACCESS_TOKEN_KEY);
    const expiry = getStorage('token_expiry');
    
    if (!token) return false;
    if (!expiry) return true; // If no expiry, assume token is valid
    
    const expiryDate = new Date(expiry);
    return expiryDate > new Date();
  }
  
  /**
   * Get current user from storage
   */
  getCurrentUserFromStorage() {
    return getStorage('user_info');
  }
  
  /**
   * Check if user has role
   */
  hasRole(role) {
    const user = this.getCurrentUserFromStorage();
    return user?.role === role;
  }
  
  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.hasRole(USER_ROLES.ADMIN);
  }
  
  /**
   * Check if user is member
   */
  isMember() {
    return this.hasRole(USER_ROLES.MEMBER);
  }
  
  /**
   * Clear authentication data
   */
  clearAuth() {
    removeStorage(ACCESS_TOKEN_KEY);
    removeStorage('refresh_token');
    removeStorage('user_info');
    removeStorage('token_expiry');
  }
}

export default new AuthService();

