import axios from 'axios';
import { API_BASE_URL, API_PREFIX, ACCESS_TOKEN_KEY, HTTP_STATUS } from '@shared/utils/constants';
import { getStorage, setStorage, removeStorage } from '@shared/utils/storage';
import loggerService from './logger.service';
import exceptionService from './exception.service';

function sanitizeRequestData(data) {
  if (!data) return null;
  try {
    if (data instanceof FormData) {
      return { _type: 'FormData', _size: 'hidden' };
    }
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        return { _type: 'string', _length: data.length, _preview: data.substring(0, 100) };
      }
    }
    if (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)) {
      const str = String(parsedData);
      if (str.length > 500) {
        return { _type: typeof parsedData, _truncated: true, _preview: str.substring(0, 100) };
      }
      return parsedData;
    }
    const sanitized = { ...parsedData };
    const sensitiveFields = ['password', 'password_hash', 'token', 'access_token', 'refresh_token', 'secret', 'api_key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) sanitized[field] = '***REDACTED***';
    });
    const jsonStr = JSON.stringify(sanitized);
    if (jsonStr.length > 500) {
      return { ...sanitized, _truncated: true, _original_size: jsonStr.length };
    }
    return sanitized;
  } catch (e) {
    return { _error: 'Failed to sanitize data' };
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getStorage(ACCESS_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const language = getStorage('language') || 'ko';
    config.headers['Accept-Language'] = language;
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    config._startTime = Date.now();
    return config;
  },
  (error) => {
    loggerService.error('API Request Error', {
      request_method: error.config?.method,
      request_path: error.config?.url,
      error: error.message,
    });
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    const duration = response.config._startTime ? Date.now() - response.config._startTime : null;
    // Get the full request URL (axios config.url is relative to baseURL)
    const requestUrl = response.config.url || '';
    
    // Skip logging for logging and exception endpoints to avoid recursion
    if (!requestUrl?.includes('/logging/') && !requestUrl?.includes('/exceptions/')) {
      const status = response.status;
      // Log all successful responses (200-299) and server errors (500+)
      // 4xx errors are logged in the error handler below
      if ((status >= 200 && status < 300) || status >= 500) {
        const level = status >= 500 ? 'WARNING' : 'INFO';
        loggerService.log(level, `API: ${response.config.method?.toUpperCase()} ${requestUrl} -> ${status}`, {
          request_method: response.config.method,
          request_path: requestUrl,
          request_data: sanitizeRequestData(response.config.data),
          response_status: status,
          duration_ms: duration,
          force_dedup: true,
        });
      }
    }
    if (response.config.responseType === 'blob') return response;
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const duration = originalRequest?._startTime ? Date.now() - originalRequest._startTime : null;
    
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getStorage('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
            refresh_token: refreshToken
          });
          const { access_token } = response.data;
          setStorage(ACCESS_TOKEN_KEY, access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        removeStorage(ACCESS_TOKEN_KEY);
        removeStorage('refresh_token');
        removeStorage('user_info');
        exceptionService.recordException(refreshError, {
          request_method: 'POST',
          request_path: `${API_PREFIX}/auth/refresh`,
          error_code: 'TOKEN_REFRESH_FAILED',
          status_code: refreshError.response?.status,
        });
        const currentPath = window.location.pathname;
        const isPublicPage = 
          currentPath === '/member' || 
          currentPath === '/member/about' ||
          currentPath === '/login' ||
          currentPath === '/register' ||
          currentPath.startsWith('/login') ||
          currentPath.startsWith('/register');
        if (!isPublicPage) window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Get the full request URL (axios config.url is relative to baseURL)
    const requestUrl = originalRequest?.url || '';
    
    if (!requestUrl?.includes('/logging/') && !requestUrl?.includes('/exceptions/')) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'An error occurred';
      const errorCode = error.response?.data?.code || 'API_ERROR';
      const status = error.response?.status;
      
      // Record 5xx errors and important 4xx errors as exceptions
      // Important 4xx errors: 404 (Not Found), 403 (Forbidden), 401 (Unauthorized - but token refresh is handled separately)
      const shouldRecordAsException = status >= 500 || (status === 404 || status === 403);
      
      if (shouldRecordAsException) {
        exceptionService.recordException(new Error(errorMessage), {
          request_method: originalRequest?.method,
          request_path: requestUrl,
          request_data: sanitizeRequestData(originalRequest?.data),
          error_code: errorCode,
          status_code: status,
          duration_ms: duration,
        });
      }
      
      // Log all errors (4xx and 5xx) as warnings
      // 4xx errors are client errors (like 404), 5xx are server errors
      if (status !== undefined) {
        const logLevel = status >= 500 ? 'ERROR' : 'WARNING';
        loggerService.log(logLevel, `API Error: ${originalRequest?.method?.toUpperCase()} ${requestUrl} -> ${status}`, {
          request_method: originalRequest?.method,
          request_path: requestUrl,
          request_data: sanitizeRequestData(originalRequest?.data),
          response_status: status,
          error_code: errorCode,
          error_message: errorMessage,
          duration_ms: duration,
          force_dedup: true,
        });
      } else {
        // Network errors or other errors without status code - also record as exceptions
        exceptionService.recordException(new Error(errorMessage), {
          request_method: originalRequest?.method,
          request_path: requestUrl,
          request_data: sanitizeRequestData(originalRequest?.data),
          error_code: 'NETWORK_ERROR',
          status_code: null,
          duration_ms: duration,
        });
        loggerService.warn(`API Error: ${originalRequest?.method?.toUpperCase()} ${requestUrl} -> Network Error`, {
          request_method: originalRequest?.method,
          request_path: requestUrl,
          request_data: sanitizeRequestData(originalRequest?.data),
          error_code: errorCode,
          error_message: errorMessage,
          duration_ms: duration,
          force_dedup: true,
        });
      }
    }
    
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: error.response?.data?.code,
      details: error.response?.data?.details
    });
  }
);

class ApiService {
  async get(url, params = {}, config = {}) {
    return apiClient.get(url, { params, ...config });
  }
  
  async post(url, data = {}, config = {}) {
    return apiClient.post(url, data, config);
  }
  
  async put(url, data = {}, config = {}) {
    return apiClient.put(url, data, config);
  }
  
  async patch(url, data = {}, config = {}) {
    return apiClient.patch(url, data, config);
  }
  
  async delete(url, config = {}) {
    return apiClient.delete(url, config);
  }
  
  async upload(url, file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  }
  
  async uploadMultiple(url, files, onUploadProgress) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    return apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  }
  
  async download(url, params = {}, filename = null) {
    const response = await apiClient.get(url, { params, responseType: 'blob' });
    let downloadFilename = filename;
    if (!downloadFilename && response.headers) {
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
    }
    if (!downloadFilename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadFilename = `download-${timestamp}`;
    }
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
    return response;
  }
}

export default new ApiService();
export { apiClient };
