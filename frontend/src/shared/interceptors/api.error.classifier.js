/**
 * API Error Classifier - API 错误分类器
 * 
 * 负责将 API 错误分类为不同类型，便于后续处理和恢复。
 * 
 * Requirements: 10.2
 */

/**
 * API 错误分类器
 */
export class ApiErrorClassifier {
  /**
   * 分类 API 错误
   * @param {Error} error - Axios 错误对象
   * @returns {Object} 分类结果
   */
  static classify(error) {
    const response = error.response;
    const request = error.request;
    
    // 网络错误
    if (!response && request) {
      return {
        type: 'NETWORK_ERROR',
        category: 'NETWORK',
        recoverable: true,
        retryable: true,
        severity: 'HIGH'
      };
    }
    
    // HTTP 状态码错误
    if (response) {
      const status = response.status;
      
      if (status >= 500) {
        return {
          type: 'SERVER_ERROR',
          category: 'SERVER',
          recoverable: true,
          retryable: true,
          severity: 'HIGH'
        };
      }
      
      if (status === 429) {
        return {
          type: 'RATE_LIMIT_ERROR',
          category: 'CLIENT',
          recoverable: true,
          retryable: true,
          severity: 'MEDIUM'
        };
      }
      
      if (status === 401) {
        return {
          type: 'AUTHENTICATION_ERROR',
          category: 'AUTH',
          recoverable: true,
          retryable: false,
          severity: 'HIGH'
        };
      }
      
      if (status === 403) {
        return {
          type: 'AUTHORIZATION_ERROR',
          category: 'AUTH',
          recoverable: false,
          retryable: false,
          severity: 'HIGH'
        };
      }
      
      if (status >= 400 && status < 500) {
        return {
          type: 'CLIENT_ERROR',
          category: 'CLIENT',
          recoverable: false,
          retryable: false,
          severity: 'MEDIUM'
        };
      }
    }
    
    // 超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        type: 'TIMEOUT_ERROR',
        category: 'NETWORK',
        recoverable: true,
        retryable: true,
        severity: 'MEDIUM'
      };
    }
    
    // CORS 错误
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      return {
        type: 'CORS_ERROR',
        category: 'NETWORK',
        recoverable: false,
        retryable: false,
        severity: 'HIGH'
      };
    }
    
    // 默认未知错误
    return {
      type: 'UNKNOWN_ERROR',
      category: 'UNKNOWN',
      recoverable: false,
      retryable: false,
      severity: 'MEDIUM'
    };
  }
}

export default ApiErrorClassifier;
