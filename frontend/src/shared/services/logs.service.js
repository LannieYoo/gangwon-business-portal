// Logs Service - 日志服务

import apiService from './api.service';
import { API_PREFIX } from '@shared/utils/constants';
import { toCamelCase, createService } from '@shared/utils/helpers';

class LogsService {
  // 获取应用日志列表
  async listLogs(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.source) queryParams.source = params.source;
    if (params.level) queryParams.level = params.level;
    if (params.layer) queryParams.layer = params.layer;
    if (params.traceId) queryParams.trace_id = params.traceId;
    if (params.userId) queryParams.user_id = params.userId;
    if (params.startDate) queryParams.start_date = new Date(params.startDate).toISOString();
    if (params.endDate) queryParams.end_date = new Date(params.endDate).toISOString();

    const response = await apiService.get(`${API_PREFIX}/v1/logging/logs`, queryParams);

    if (response && response.items) {
      return {
        items: response.items.map(toCamelCase),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error('Invalid response format');
  }

  // 获取系统日志列表
  async listSystemLogs(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.level) queryParams.level = params.level;
    if (params.traceId) queryParams.trace_id = params.traceId;

    const response = await apiService.get(`${API_PREFIX}/v1/logging/system`, queryParams);

    if (response && response.items) {
      return {
        items: response.items.map(toCamelCase),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error('Invalid response format');
  }

  // 删除单条系统日志
  async deleteSystemLog(logId) {
    return await apiService.delete(`${API_PREFIX}/v1/logging/system/${logId}`);
  }

  // 删除匹配指定消息的系统日志
  async deleteSystemLogsByMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    return await apiService.delete(`${API_PREFIX}/v1/logging/system/by-message?message=${encodedMessage}`);
  }

  // 获取异常日志列表
  async listErrorLogs(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.level) queryParams.level = params.level;
    if (params.traceId) queryParams.trace_id = params.traceId;
    if (params.userId) queryParams.user_id = params.userId;

    const response = await apiService.get(`${API_PREFIX}/v1/logging/errors`, queryParams);

    if (response && response.items) {
      return {
        items: response.items.map(toCamelCase),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error('Invalid response format');
  }


  // 获取性能日志列表
  async listPerformanceLogs(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.source) queryParams.source = params.source;
    if (params.traceId) queryParams.trace_id = params.traceId;
    if (params.userId) queryParams.user_id = params.userId;

    const response = await apiService.get(`${API_PREFIX}/v1/logging/performance`, queryParams);

    if (response && response.items) {
      return {
        items: response.items.map(toCamelCase),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error('Invalid response format');
  }

  // 获取日志统计数据
  async getLogStats() {
    const response = await apiService.get(`${API_PREFIX}/v1/logging/stats`);
    return {
      todayErrors: response.today_errors,
      errorChange: response.error_change,
      slowRequests: response.slow_requests,
      securityAlerts: response.security_alerts,
      todayRequests: response.today_requests,
      avgResponseTime: response.avg_response_time,
      apiHealth: response.api_health,
      dbHealth: response.db_health,
      cacheHealth: response.cache_health,
      storageHealth: response.storage_health,
    };
  }

  // 获取最近的错误日志
  async getRecentErrors(params) {
    const queryParams = {
      page: 1,
      page_size: params.limit,
      level: 'ERROR,CRITICAL',
    };

    const response = await apiService.get(`${API_PREFIX}/v1/logging/errors`, queryParams);

    if (response && response.items) {
      return {
        items: response.items.map(toCamelCase),
        total: response.total,
      };
    }

    throw new Error('Invalid response format');
  }

  // 获取慢请求日志
  async getSlowRequests(params) {
    const queryParams = {
      page: 1,
      page_size: params.limit,
    };

    const response = await apiService.get(`${API_PREFIX}/v1/logging/performance`, queryParams);

    if (response && response.items) {
      const slowItems = response.items.filter(item =>
        (item.duration_ms && item.duration_ms > 500) ||
        (item.message && item.message.toLowerCase().includes('slow'))
      );

      return {
        items: slowItems.map(toCamelCase),
        total: slowItems.length,
      };
    }

    throw new Error('Invalid response format');
  }

  // 获取安全相关日志
  async getSecurityIssues(params) {
    const queryParams = {
      page: 1,
      page_size: params.limit,
      level: 'WARNING',
    };

    const response = await apiService.get(`${API_PREFIX}/v1/logging/logs`, queryParams);

    if (response && response.items) {
      const securityItems = response.items.filter(item => {
        const message = item.message?.toLowerCase();
        const layer = item.layer?.toLowerCase();
        return layer === 'auth' ||
          message?.includes('unauthorized') ||
          message?.includes('forbidden') ||
          message?.includes('invalid token') ||
          message?.includes('login failed');
      });

      return {
        items: securityItems.map(toCamelCase),
        total: securityItems.length,
      };
    }

    throw new Error('Invalid response format');
  }


  // 获取系统健康状态
  async getSystemHealth() {
    const response = await apiService.get(`${API_PREFIX}/health`);
    return {
      status: response.status,
      timestamp: response.timestamp,
      version: response.version,
      services: {
        api: response.services?.api,
        database: response.services?.database,
        cache: response.services?.cache,
        storage: response.services?.storage,
      },
    };
  }

  // 获取详细的系统健康状态
  async getDetailedHealth() {
    const response = await apiService.get(`${API_PREFIX}/health/detailed`);
    return {
      status: response.status,
      timestamp: response.timestamp,
      version: response.version,
      services: response.services,
      databaseMetrics: response.database_metrics ? {
        status: response.database_metrics.status,
        responseTimeMs: response.database_metrics.responseTimeMs,
        sizeMB: response.database_metrics.sizeMB,
        connections: response.database_metrics.connections,
        tableCount: response.database_metrics.tableCount,
      } : null,
    };
  }

  // 获取数据库指标
  async getDatabaseMetrics() {
    const response = await apiService.get(`${API_PREFIX}/health/database`);
    return {
      status: response.status,
      responseTimeMs: response.responseTimeMs,
      sizeBytes: response.sizeBytes,
      sizeMB: response.sizeMB,
      connections: response.connections,
      tableCount: response.tableCount,
      timestamp: response.timestamp,
    };
  }

  // 获取 Render 部署状态
  async getRenderStatus() {
    const response = await apiService.get(`${API_PREFIX}/health/render`);
    return {
      backend: response.backend,
      frontend: response.frontend,
    };
  }

  // 获取单条日志详情
  async getLog(logId) {
    const response = await apiService.get(`${API_PREFIX}/v1/logging/logs/${logId}`);
    return toCamelCase(response);
  }

  // 删除单条日志
  async deleteLog(logId) {
    return await apiService.delete(`${API_PREFIX}/v1/logging/logs/${logId}`);
  }

  // 删除匹配指定消息的日志
  async deleteLogsByMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    return await apiService.delete(`${API_PREFIX}/v1/logging/logs/by-message?message=${encodedMessage}`);
  }

  // 删除单条性能日志
  async deletePerformanceLog(logId) {
    return await apiService.delete(`${API_PREFIX}/v1/logging/performance/${logId}`);
  }

  // 删除匹配指定消息的性能日志
  async deletePerformanceLogsByMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    return await apiService.delete(`${API_PREFIX}/v1/logging/performance/by-message?message=${encodedMessage}`);
  }

  // 删除单条异常日志
  async deleteErrorLog(logId) {
    return await apiService.delete(`${API_PREFIX}/v1/logging/errors/${logId}`);
  }

  // 删除匹配指定消息的异常日志
  async deleteErrorLogsByMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    return await apiService.delete(`${API_PREFIX}/v1/logging/errors/by-message?message=${encodedMessage}`);
  }

  // 清理所有日志
  async deleteAllLogs() {
    return await apiService.delete(`${API_PREFIX}/v1/logging/all`);
  }
}

export default createService(LogsService);
