/**
 * API Offline Queue - API 离线队列管理
 * 
 * 负责管理离线状态下的请求队列，网络恢复后自动重发。
 * 
 * Requirements: 10.4
 */

/**
 * 离线队列管理器
 */
export class ApiOfflineQueue {
  constructor() {
    this.queue = [];
    this.maxQueueSize = 50;
    this.maxRequestAge = 3600000; // 1小时
    this.isOffline = false;
    
    // 监听网络状态
    this._setupNetworkMonitoring();
  }
  
  /**
   * 设置网络状态监听
   * @private
   */
  _setupNetworkMonitoring() {
    if (typeof window !== 'undefined') {
      this.isOffline = !navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOffline = false;
        this.processQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOffline = true;
      });
    }
  }
  
  /**
   * 添加请求到离线队列
   * @param {Object} config - 请求配置
   */
  enqueue(config) {
    // 只队列非 GET 请求
    if (config.method?.toLowerCase() === 'get') {
      return;
    }
    
    const queueItem = {
      config: { ...config },
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
      retryCount: 0
    };
    
    this.queue.push(queueItem);
    
    // 限制队列大小
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }
  }
  
  /**
   * 处理离线队列
   */
  async processQueue() {
    if (this.queue.length === 0 || this.isOffline) {
      return;
    }
    
    const itemsToProcess = [...this.queue];
    this.queue = [];
    
    for (const item of itemsToProcess) {
      try {
        // 检查请求是否过期
        if (Date.now() - item.timestamp > this.maxRequestAge) {
          console.warn(`[ApiOfflineQueue] Skipping expired request: ${item.config.method} ${item.config.url}`);
          continue;
        }
        
        // 重新发送请求
        if (item.config._axios) {
          await item.config._axios(item.config);
        }
        
      } catch (error) {
        console.warn(`[ApiOfflineQueue] Failed to process request: ${item.config.method} ${item.config.url}`, error);
        
        // 如果仍然失败，重新加入队列（最多重试3次）
        if (item.retryCount < 3) {
          item.retryCount++;
          this.queue.push(item);
        }
      }
      
      // 添加延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  /**
   * 获取离线状态
   * @returns {boolean} 是否离线
   */
  getIsOffline() {
    return this.isOffline;
  }
  
  /**
   * 获取队列状态
   * @returns {Object} 队列状态
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isOffline: this.isOffline
    };
  }
  
  /**
   * 清空队列
   */
  clear() {
    this.queue = [];
  }
}

// 全局离线队列实例
export const apiOfflineQueue = new ApiOfflineQueue();

export default apiOfflineQueue;
