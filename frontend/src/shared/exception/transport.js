/**
 * Exception Transport Module - 异常传输模块
 * 
 * 负责将异常实时上报到后端：
 * - 实时传输（每条异常立即发送）
 * - 失败重试（指数退避）
 * - 重试队列管理
 * 
 * Requirements: 12.1, 12.2
 */

/**
 * 默认传输配置
 */
const DEFAULT_TRANSPORT_CONFIG = {
  endpoint: '/api/v1/exceptions/frontend',
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000],
  requestTimeout: 5000,
  maxErrorsPerSession: 100
};

/**
 * 异常传输器类 - 实时传输模式
 */
export class ExceptionTransport {
  constructor(config = {}) {
    this.config = { ...DEFAULT_TRANSPORT_CONFIG, ...config };
    
    // 重试队列（仅用于失败重试）
    this._retryQueue = [];
    
    // 会话异常计数
    this._sessionErrorCount = 0;
    
    // 统计信息
    this._stats = {
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
      totalDropped: 0
    };
  }
  
  /**
   * 发送异常记录
   * @param {Object} exceptionRecord - 异常记录
   * @returns {Promise<Object>} 发送结果
   */
  async send(exceptionRecord) {
    // 检查会话限制
    if (this._sessionErrorCount >= this.config.maxErrorsPerSession) {
      this._stats.totalDropped++;
      return { status: 'dropped', reason: 'session_limit_exceeded' };
    }
    
    this._sessionErrorCount++;
    
    try {
      await this._sendRequest(exceptionRecord);
      this._stats.totalSent++;
      return { status: 'sent', id: exceptionRecord.id };
    } catch (error) {
      console.warn('[ExceptionTransport] Failed to send exception:', error);
      
      // 添加到重试队列
      this._retryQueue.push({
        record: exceptionRecord,
        retryCount: 0,
        lastError: error
      });
      
      // 处理重试
      this._processRetries();
      
      return { status: 'queued_for_retry', id: exceptionRecord.id };
    }
  }
  
  /**
   * 发送请求到后端
   * @private
   */
  async _sendRequest(exceptionRecord) {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        exception: exceptionRecord,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }),
      signal: AbortSignal.timeout(this.config.requestTimeout)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * 处理重试队列
   * @private
   */
  async _processRetries() {
    const retryItems = [...this._retryQueue];
    this._retryQueue = [];
    
    for (const item of retryItems) {
      if (item.retryCount >= this.config.maxRetries) {
        this._stats.totalFailed++;
        console.error('[ExceptionTransport] Max retries exceeded:', item.lastError);
        continue;
      }
      
      const delay = this.config.retryDelays[item.retryCount] || 
                    this.config.retryDelays[this.config.retryDelays.length - 1];
      
      setTimeout(async () => {
        try {
          await this._sendRequest(item.record);
          this._stats.totalSent++;
          this._stats.totalRetries++;
        } catch (error) {
          item.retryCount++;
          item.lastError = error;
          this._retryQueue.push(item);
          
          if (item.retryCount < this.config.maxRetries) {
            this._processRetries();
          }
        }
      }, delay);
    }
  }
  
  /**
   * 刷新重试队列
   */
  async flush() {
    while (this._retryQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this._stats,
      retryQueueSize: this._retryQueue.length,
      sessionErrorCount: this._sessionErrorCount
    };
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * 重置会话计数
   */
  resetSessionCount() {
    this._sessionErrorCount = 0;
  }
}

// 导出单例
export const exceptionTransport = new ExceptionTransport();

export default exceptionTransport;
