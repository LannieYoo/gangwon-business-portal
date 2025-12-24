/**
 * Exception Deduplication Module - 异常去重模块
 * 
 * 在时间窗口内对相同异常进行去重，避免重复上报
 * 
 * Requirements: 12.3
 */

/**
 * 默认去重配置
 */
const DEFAULT_DEDUP_CONFIG = {
  windowMs: 10000  // 去重时间窗口（毫秒）
};

/**
 * 异常去重器类
 */
export class ExceptionDeduplicator {
  constructor(config = {}) {
    this.config = { ...DEFAULT_DEDUP_CONFIG, ...config };
    this._recentExceptions = new Map();
    
    // 定期清理过期记录
    this._cleanupInterval = setInterval(
      () => this._cleanup(), 
      this.config.windowMs
    );
  }
  
  /**
   * 检查异常是否重复
   * @param {Object} exceptionRecord - 异常记录
   * @returns {boolean} 是否重复
   */
  isDuplicate(exceptionRecord) {
    const key = this._generateKey(exceptionRecord);
    const now = Date.now();
    
    if (this._recentExceptions.has(key)) {
      const lastSeen = this._recentExceptions.get(key);
      if (now - lastSeen < this.config.windowMs) {
        // 更新最后见到的时间
        this._recentExceptions.set(key, now);
        return true;
      }
    }
    
    // 记录新异常
    this._recentExceptions.set(key, now);
    return false;
  }
  
  /**
   * 生成异常唯一键
   * @private
   */
  _generateKey(exceptionRecord) {
    const { error, context } = exceptionRecord;
    
    const keyParts = [
      error?.name || 'Unknown',
      error?.message || 'Unknown',
      context?.url || 'Unknown'
    ];
    
    // 使用堆栈的前几行增加唯一性
    if (error?.stack) {
      const stackLines = error.stack.split('\n').slice(0, 3);
      keyParts.push(stackLines.join('|'));
    }
    
    return keyParts.join('::');
  }
  
  /**
   * 清理过期记录
   * @private
   */
  _cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, timestamp] of this._recentExceptions.entries()) {
      if (now - timestamp > this.config.windowMs) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this._recentExceptions.delete(key));
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalTracked: this._recentExceptions.size,
      windowMs: this.config.windowMs
    };
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * 销毁去重器
   */
  destroy() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
    this._recentExceptions.clear();
  }
}

// 导出单例
export const exceptionDeduplicator = new ExceptionDeduplicator();

export default exceptionDeduplicator;
