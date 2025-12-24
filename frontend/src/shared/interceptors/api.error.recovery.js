/**
 * API Error Recovery - API 错误恢复服务
 * 
 * 负责协调错误恢复策略，包括重试、缓存回退和离线处理。
 * 
 * Requirements: 10.2, 10.3, 10.4
 */

import { ApiErrorClassifier } from './api.error.classifier.js';
import { apiCache } from './api.cache.js';
import { apiOfflineQueue } from './api.offline.js';
import { authRecoveryService } from '@shared/services/auth.recovery.js';

/**
 * API 错误恢复服务
 */
export class ApiErrorRecovery {
  constructor(config = {}) {
    this.retryAttempts = new Map();
    this.maxRetries = config.maxRetries || 3;
    this.retryDelays = config.retryDelays || [1000, 2000, 4000];
    
    this.cache = apiCache;
    this.offlineQueue = apiOfflineQueue;
  }
  
  /**
   * 尝试恢复错误
   * @param {Error} error - 错误对象
   * @param {Object} config - 请求配置
   * @returns {Promise} 恢复结果
   */
  async attemptRecovery(error, config) {
    const classification = ApiErrorClassifier.classify(error);
    
    // 离线模式处理
    if (this.offlineQueue.getIsOffline() || classification.type === 'NETWORK_ERROR') {
      return this._handleOfflineError(error, config);
    }
    
    if (!classification.recoverable) {
      return null;
    }
    
    // 认证错误恢复
    if (classification.type === 'AUTHENTICATION_ERROR') {
      return this._handleAuthError(error, config);
    }
    
    // 可重试错误恢复
    if (classification.retryable) {
      return this._handleRetryableError(error, config);
    }
    
    return null;
  }
  
  /**
   * 处理离线错误
   * @private
   */
  async _handleOfflineError(error, config) {
    // 对于 GET 请求，尝试从缓存获取数据
    if (config.method?.toLowerCase() === 'get') {
      const cachedResponse = this.cache.get(config);
      if (cachedResponse) {
        return Promise.resolve(cachedResponse);
      }
    }
    
    // 对于非 GET 请求，添加到离线队列
    this.offlineQueue.enqueue(config);
    
    // 返回离线错误
    const offlineError = new Error('Application is offline. Request has been queued for when connection is restored.');
    offlineError.isOfflineError = true;
    offlineError.originalError = error;
    
    return Promise.reject(offlineError);
  }
  
  /**
   * 处理认证错误
   * @private
   */
  async _handleAuthError(error, config) {
    try {
      const result = await authRecoveryService.handleAuthError(error, config);
      // 如果返回 undefined 或 null，表示认证失败但已处理（如显示登录模态框）
      if (result === undefined || result === null) {
        return null;
      }
      return result;
    } catch (recoveryError) {
      // 如果是401错误且是/api/auth/me请求，不抛出异常
      if (error?.response?.status === 401 && config?.url?.includes('/api/auth/me')) {
        console.log('[ApiErrorRecovery] Auth validation failed, clearing auth state');
        return null;
      }
      throw recoveryError;
    }
  }
  
  /**
   * 处理可重试错误
   * @private
   */
  async _handleRetryableError(error, config) {
    const requestKey = `${config.method}_${config.url}`;
    const attempts = this.retryAttempts.get(requestKey) || 0;
    
    if (attempts >= this.maxRetries) {
      this.retryAttempts.delete(requestKey);
      
      // 最后尝试从缓存获取数据（如果是 GET 请求）
      if (config.method?.toLowerCase() === 'get') {
        const cachedResponse = this.cache.get(config);
        if (cachedResponse) {
          cachedResponse.isStale = true;
          return Promise.resolve(cachedResponse);
        }
      }
      
      return null;
    }
    
    // 增加重试次数
    this.retryAttempts.set(requestKey, attempts + 1);
    
    // 等待重试延迟
    const delay = this.retryDelays[attempts] || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // 添加重试标记
    config._retryAttempt = attempts + 1;
    
    return config;
  }
  
  /**
   * 清除重试记录
   * @param {Object} config - 请求配置
   */
  clearRetryAttempts(config) {
    const requestKey = `${config.method}_${config.url}`;
    this.retryAttempts.delete(requestKey);
  }
  
  /**
   * 缓存响应
   * @param {Object} config - 请求配置
   * @param {Object} response - 响应对象
   */
  cacheResponse(config, response) {
    this.cache.set(config, response);
  }
  
  /**
   * 获取离线状态
   * @returns {boolean} 是否离线
   */
  isOffline() {
    return this.offlineQueue.getIsOffline();
  }
  
  /**
   * 获取状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      ...this.offlineQueue.getStatus(),
      cacheSize: this.cache.size
    };
  }
}

// 全局错误恢复实例
export const apiErrorRecovery = new ApiErrorRecovery();

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 300000); // 每5分钟清理一次
}

export default apiErrorRecovery;
