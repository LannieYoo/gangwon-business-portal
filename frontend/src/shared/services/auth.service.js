/**
 * Authentication Service
 */

import apiService from './api.service';
import { API_PREFIX, ACCESS_TOKEN_KEY, USER_ROLES } from '@shared/utils/constants';
import { setStorage, getStorage, removeStorage } from '@shared/utils/storage';

class AuthService {
  /**
   * Login
   */
  async login(credentials) {
    const response = await apiService.post(`${API_PREFIX}/auth/login`, credentials);
    
    if (response.access_token) {
      setStorage(ACCESS_TOKEN_KEY, response.access_token);
      setStorage('refresh_token', response.refresh_token);
      setStorage('user_info', response.user);
      setStorage('token_expiry', response.expires_at);
    }
    
    return response;
  }
  
  /**
   * Register
   */
  async register(userData) {
    const response = await apiService.post(`${API_PREFIX}/auth/register`, userData);
    return response;
  }
  
  /**
   * Logout
   */
  async logout() {
    try {
      await apiService.post(`${API_PREFIX}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }
  
  /**
   * Refresh token
   */
  async refreshToken() {
    const refreshToken = getStorage('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiService.post(`${API_PREFIX}/auth/refresh`, {
      refresh_token: refreshToken
    });
    
    if (response.access_token) {
      setStorage(ACCESS_TOKEN_KEY, response.access_token);
      setStorage('token_expiry', response.expires_at);
    }
    
    return response;
  }
  
  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await apiService.get(`${API_PREFIX}/auth/me`);
    setStorage('user_info', response);
    return response;
  }
  
  /**
   * Update profile
   */
  async updateProfile(userData) {
    const response = await apiService.put(`${API_PREFIX}/auth/profile`, userData);
    setStorage('user_info', response);
    return response;
  }
  
  /**
   * Change password
   */
  async changePassword(passwordData) {
    return await apiService.post(`${API_PREFIX}/auth/change-password`, passwordData);
  }
  
  /**
   * Forgot password
   */
  async forgotPassword(email) {
    return await apiService.post(`${API_PREFIX}/auth/forgot-password`, { email });
  }
  
  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    return await apiService.post(`${API_PREFIX}/auth/reset-password`, {
      token,
      new_password: newPassword
    });
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

