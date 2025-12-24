/**
 * Logger Transport Module - 日志传输模块
 * 
 * 负责将日志实时上报到后端：
 * - 实时传输（每条日志立即发送）
 * - 失败重试（减少重试次数）
 * - 敏感信息过滤
 * - 智能队列管理（仅用于失败重试）
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

import { LOGGING_CONFIG } from './config';

/**
 * 过滤敏感信息
 * @param {Object} data - 要过滤的数据
 * @returns {Object} 过滤后的数据
 */
function filterSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // 使用配置中的敏感字段列表
  const sensitiveFields = LOGGING_CONFIG.sensitiveFiltering.fields;
  
  const filtered = Array.isArray(data) ? [] : {};
  
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    
    // 检查是否是敏感字段
    if (sensitiveFields.some(sensitive => keyLower.includes(sensitive))) {
      filtered[key] = '[FILTERED]';
    } else if (value && typeof value === 'object') {
      // 递归过滤嵌套对象
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }
  
  return filtered;
}

/**
 * 传输管理器类 - 实时传输模式
 */
export class LogTransport {
  constructor(config = {}) {
    // 使用统一配置，允许覆盖
    const defaultConfig = LOGGING_CONFIG.transport;
    
    this.config = {
      endpoint: config.endpoint || '/api/v1/logging/frontend/logs',
      maxRetries: config.maxRetries || defaultConfig.maxRetries,
      retryDelays: config.retryDelays || defaultConfig.retryDelays,
      enableSensitiveFiltering: config.enableSensitiveFiltering !== false,
      maxQueueSize: config.maxQueueSize || defaultConfig.maxQueueSize,
      requestTimeout: config.requestTimeout || defaultConfig.requestTimeout,
      ...config
    };
    
    // 重试队列（仅用于失败重试）
    this._retryQueue = [];
    
    // 统计信息
    this._stats = {
      totalEnqueued: 0,
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
      logsSent: 0,
      droppedLogs: 0
    };
  }
  
  /**
   * 入队日志条目 - 实时发送
   * @param {Object} logEntry - 日志条目
   */
  enqueue(logEntry) {
    // 过滤敏感信息
    const filteredEntry = this.config.enableSensitiveFiltering 
      ? filterSensitiveData(logEntry) 
      : logEntry;
    
    this._stats.totalEnqueued++;
    
    // 实时发送日志
    this._sendLog(filteredEntry);
  }
  
  /**
   * 发送单条日志
   * @private
   * @param {Object} logEntry - 日志条目
   */
  async _sendLog(logEntry) {
    try {
      await this._sendBatch([logEntry]);
      this._stats.totalSent++;
      this._stats.logsSent++;
      
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[LogTransport] Sent log: ${logEntry.layer || 'unknown'} - ${logEntry.message || ''}`);
      }
    } catch (error) {
      console.warn('[LogTransport] Failed to send log:', error);
      
      // 添加到重试队列
      this._retryQueue.push({
        batch: [logEntry],
        retryCount: 0,
        lastError: error
      });
      
      // 处理重试
      this._processRetries();
    }
  }
  
  /**
   * 发送批次到后端
   * @private
   * @param {Array} batch - 日志批次
   * @returns {Promise} 发送结果
   */
  async _sendBatch(batch) {
    // 前端字段已与后端一致，无需映射
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logs: batch,
        timestamp: new Date().toISOString(),
        batch_size: batch.length
      }),
      // 添加超时控制，避免长时间等待
      signal: AbortSignal.timeout(this.config.requestTimeout)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * 处理重试
   * @private
   */
  async _processRetries() {
    const retryItems = [...this._retryQueue];
    this._retryQueue = [];
    
    for (const item of retryItems) {
      if (item.retryCount >= this.config.maxRetries) {
        // 超过最大重试次数，放弃
        this._stats.totalFailed += item.batch.length;
        console.error('[LogTransport] Max retries exceeded, dropping batch:', item.lastError);
        continue;
      }
      
      // 计算延迟时间
      const delay = this.config.retryDelays[item.retryCount] || this.config.retryDelays[this.config.retryDelays.length - 1];
      
      // 延迟后重试
      setTimeout(async () => {
        try {
          await this._sendBatch(item.batch);
          this._stats.totalSent += item.batch.length;
          this._stats.totalRetries++;
          this._stats.batchesSent++;
          
          if (process.env.NODE_ENV === 'development') {
            console.debug(`[LogTransport] Retry ${item.retryCount + 1} succeeded for batch of ${item.batch.length} logs`);
          }
        } catch (error) {
          console.warn(`[LogTransport] Retry ${item.retryCount + 1} failed:`, error);
          
          // 增加重试次数并重新入队
          item.retryCount++;
          item.lastError = error;
          this._retryQueue.push(item);
          
          // 如果还有重试机会，继续处理
          if (item.retryCount < this.config.maxRetries) {
            this._processRetries();
          }
        }
      }, delay);
    }
  }
  
  /**
   * 立即刷新所有待发送的日志（实时模式下主要处理重试队列）
   * @returns {Promise} 刷新结果
   */
  async flush() {
    // 等待所有重试完成
    while (this._retryQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  /**
   * 关闭传输器
   * @returns {Promise} 关闭结果
   */
  async close() {
    // 刷新剩余日志
    await this.flush();
  }
  
  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this._stats,
      retryQueueSize: this._retryQueue.length,
      config: { ...this.config }
    };
  }
  
  /**
   * 清空队列
   */
  clear() {
    this._retryQueue = [];
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this._stats = {
      totalEnqueued: 0,
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
      batchesSent: 0,
      droppedLogs: 0
    };
  }
}

// 创建全局传输管理器实例
export const logTransport = new LogTransport();

// 导出便捷函数
export const enqueue = (logEntry) => logTransport.enqueue(logEntry);
export const flush = () => logTransport.flush();

export default logTransport;
