/**
 * Error Handler Utility
 * 
 * Utility functions for consistent error handling across the application.
 * Includes exception recording functionality merged from exception.service.js
 */

import axios from 'axios';
import { API_BASE_URL } from '@shared/utils/constants';
import { getStorage } from '@shared/utils/storage';
import loggerService from '@shared/utils/loggerHandler';

const EXCEPTION_API_PREFIX = '/api/v1/exceptions';

// Create a separate axios instance for exception reporting to avoid circular dependency
const exceptionApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to exception API requests
exceptionApiClient.interceptors.request.use((config) => {
  const token = getStorage('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper functions for exception recording
function generateTraceId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentUserId() {
  try {
    const userInfo = getStorage('user_info');
    if (userInfo) {
      const user = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
      return user.id || user.user_id;
    }
  } catch (e) {}
  return null;
}

function getClientInfo() {
  return {
    user_agent: navigator.userAgent,
    url: window.location.href,
    referrer: document.referrer,
    language: navigator.language,
    screen: { width: window.screen.width, height: window.screen.height },
    viewport: { width: window.innerWidth, height: window.innerHeight },
  };
}

function sanitizeData(data) {
  if (!data) return null;
  try {
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'password_hash', 'token', 'access_token', 'refresh_token', 'secret', 'api_key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) sanitized[field] = '***REDACTED***';
    });
    const jsonStr = JSON.stringify(sanitized);
    if (jsonStr.length > 1000) {
      return { ...sanitized, _truncated: true, _original_size: jsonStr.length };
    }
    return sanitized;
  } catch (e) {
    return { _error: 'Failed to sanitize data' };
  }
}

// Exception recording service (merged from exception.service.js)
class ExceptionService {
  constructor() {
    this.traceId = generateTraceId();
  }

  async recordException(exception, context = {}) {
    const exceptionEntry = {
      source: 'frontend',
      exception_type: exception.name || 'Error',
      exception_message: exception.message || (typeof exception === 'object' ? JSON.stringify(exception) : String(exception)),
      error_code: context.error_code,
      status_code: context.status_code,
      trace_id: context.trace_id || this.traceId,
      user_id: getCurrentUserId(),
      ip_address: null,
      user_agent: navigator.userAgent,
      request_method: context.request_method,
      request_path: context.request_path || window.location.pathname,
      request_data: sanitizeData(context.request_data),
      stack_trace: exception.stack || null,
      exception_details: {
        name: exception.name,
        message: exception.message,
        fileName: exception.fileName,
        lineNumber: exception.lineNumber,
        columnNumber: exception.columnNumber,
      },
      context_data: { ...getClientInfo(), ...context.context_data },
    };

    // Log the exception using loggerService
    loggerService.error(`Exception: ${exceptionEntry.exception_type}`, {
      module: 'ErrorHandler',
      function: 'recordException',
      exception_type: exceptionEntry.exception_type,
      exception_message: exceptionEntry.exception_message,
      error_code: exceptionEntry.error_code,
      status_code: exceptionEntry.status_code,
      request_path: exceptionEntry.request_path,
      request_method: exceptionEntry.request_method,
      trace_id: exceptionEntry.trace_id,
      user_id: exceptionEntry.user_id,
    });

    exceptionApiClient.post(`${EXCEPTION_API_PREFIX}/frontend`, exceptionEntry).catch((error) => {
      if (import.meta.env.DEV) {
        console.error('Failed to send exception:', error);
      }
    });

    if (import.meta.env.DEV) {
      console.error('Exception recorded:', exception, context);
    }
  }
}

// Create singleton instance
const exceptionService = new ExceptionService();

// Initialize global error handlers (merged from exception.service.js)
if (typeof window !== 'undefined') {
  // Global error handler - catches uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);
    loggerService.error('Global error caught', {
      module: 'ErrorHandler',
      function: 'globalErrorHandler',
      error_message: error.message,
      error_name: error.name,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      request_path: window.location.pathname,
    });
    
    exceptionService.recordException(error, {
      request_path: window.location.pathname,
      error_code: 'GLOBAL_ERROR',
      context_data: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(typeof event.reason === 'object' 
        ? JSON.stringify(event.reason) 
        : String(event.reason));
    loggerService.error('Unhandled promise rejection', {
      module: 'ErrorHandler',
      function: 'unhandledRejectionHandler',
      error_message: error.message,
      error_name: error.name,
      request_path: window.location.pathname,
    });
    
    exceptionService.recordException(error, {
      request_path: window.location.pathname,
      error_code: 'UNHANDLED_PROMISE_REJECTION',
      context_data: { type: 'unhandled_promise_rejection' },
    });
  });
}

/**
 * Handle and log an error consistently
 * 
 * @param {Error|Object} error - The error to handle
 * @param {Object} context - Additional context information
 * @param {boolean} context.critical - Whether this is a critical error (defaults to true for 5xx)
 * @param {string} context.error_code - Custom error code
 * @param {string} context.request_method - HTTP method
 * @param {string} context.request_path - Request path
 * @param {number} context.status_code - HTTP status code
 * @param {Object} context.context_data - Additional context data
 * @returns {string} Error message
 */
export function handleError(error, context = {}) {
  // Determine if this is a critical error
  const isCritical = error?.response?.status >= 500 || 
                     error?.code === 'NETWORK_ERROR' ||
                     context.critical === true;
  
  // Extract error information
  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      (typeof error === 'object' ? JSON.stringify(error) : String(error)) || 
                      'An unknown error occurred';
  const errorCode = error?.response?.data?.code || 
                   error?.code || 
                   context.error_code || 
                   'UNKNOWN_ERROR';
  const statusCode = error?.response?.status || context.status_code;
  
  // Record as exception for critical errors
  if (isCritical) {
    exceptionService.recordException(
      error instanceof Error ? error : new Error(errorMessage),
      {
        request_method: context.request_method,
        request_path: context.request_path || window.location.pathname,
        error_code: errorCode,
        status_code: statusCode,
        context_data: context.context_data || {},
      }
    );
  } else {
    // Log as warning for non-critical errors
    loggerService.warn(errorMessage, {
      request_method: context.request_method,
      request_path: context.request_path || window.location.pathname,
      error_code: errorCode,
      status_code: statusCode,
      error_message: errorMessage,
      context_data: context.context_data || {},
    });
  }
  
  // Also log to console in development
  if (import.meta.env.DEV) {
    const logMethod = isCritical ? 'error' : 'warn';
    console[logMethod](`[ErrorHandler] ${errorMessage}`, {
      error,
      context,
    });
  }
  
  return errorMessage;
}

/**
 * Wrap an async function with error handling
 * 
 * @param {Function} asyncFn - Async function to wrap
 * @param {Object} context - Context for error logging
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(asyncFn, context = {}) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw after logging
    }
  };
}

// Export exceptionService for backward compatibility
// Components can still use exceptionService.recordException() directly if needed
export { exceptionService };
export default { handleError, withErrorHandling, exceptionService };

