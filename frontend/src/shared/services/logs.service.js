// Logs Service - 日志服务

import apiService from './api.service';
import { API_PREFIX } from '@shared/utils/constants';
import { createService } from '@shared/utils/helpers';

class LogsService {
  // 获取应用日志列表
  async listLogs(params) {
    return await apiService.get(`${API_PREFIX}/v1/logging/logs`, params);
  }

  // 获取系统日志列表
  async listSystemLogs(params) {
    return await apiService.get(`${API_PREFIX}/v1/logging/system`, params);
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
    return await apiService.get(`${API_PREFIX}/v1/logging/errors`, params);
  }

  // 获取性能日志列表
  async listPerformanceLogs(params) {
    return await apiService.get(`${API_PREFIX}/v1/logging/performance`, params);
  }

  // 获取日志统计数据
  async getLogStats() {
    return await apiService.get(`${API_PREFIX}/v1/logging/stats`);
  }

  // 获取最近的错误日志
  async getRecentErrors(params) {
    return await apiService.get(`${API_PREFIX}/v1/logging/errors`, {
      page: 1,
      pageSize: params.limit,
      level: 'ERROR,CRITICAL',
    });
  }

  // 获取慢请求日志
  async getSlowRequests(params) {
    return await apiService.get(`${API_PREFIX}/v1/logging/performance`, {
      page: 1,
      pageSize: params.limit,
    });
  }

  // 获取安全相关日志
  async getSecurityIssues(params) {
    return await apiService.get(`${API_PREFIX}/v1/logging/logs`, {
      page: 1,
      pageSize: params.limit,
      level: 'WARNING',
    });
  }

  // 获取系统健康状态
  async getSystemHealth() {
    return await apiService.get(`${API_PREFIX}/health`);
  }

  // 获取详细的系统健康状态
  async getDetailedHealth() {
    return await apiService.get(`${API_PREFIX}/health/detailed`);
  }

  // 获取数据库指标
  async getDatabaseMetrics() {
    return await apiService.get(`${API_PREFIX}/health/database`);
  }

  // 获取 Render 部署状态
  async getRenderStatus() {
    return await apiService.get(`${API_PREFIX}/health/render`);
  }

  // 获取单条日志详情
  async getLog(logId) {
    return await apiService.get(`${API_PREFIX}/v1/logging/logs/${logId}`);
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
