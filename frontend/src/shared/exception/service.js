/**
 * Frontend Exception Service - 前端异常服务
 * 
 * 协调各模块，提供统一的异常上报接口：
 * - handler: 异常处理和分类
 * - dedup: 异常去重
 * - filter: 异常过滤和清理
 * - transport: 实时上报
 * 
 * Requirements: 12.1, 12.2, 12.3
 */

import { frontendExceptionHandler } from './handler.js';
import { ExceptionDeduplicator } from './dedup.js';
import { ExceptionFilter } from './filter.js';
import { ExceptionTransport } from './transport.js';
import { API_BASE_URL } from '@shared/utils/constants';

/**
 * 默认服务配置
 */
const DEFAULT_CONFIG = {
  // 去重配置
  deduplicationWindow: 10000,
  
  // 过滤配置
  enableFiltering: true,
  maxStackLength: 5000,
  
  // 传输配置
  endpoint: `${API_BASE_URL}/api/v1/exceptions/frontend`,
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000],
  requestTimeout: 5000,
  maxErrorsPerSession: 100,
  
  // 性能配置
  enablePerformanceTracking: true
};

/**
 * 前端异常服务主类
 */
export class FrontendExceptionService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // 初始化各模块
    this.handler = frontendExceptionHandler;
    this.deduplicator = new ExceptionDeduplicator({ 
      windowMs: this.config.deduplicationWindow 
    });
    this.filter = new ExceptionFilter({ 
      enableFiltering: this.config.enableFiltering,
      maxStackLength: this.config.maxStackLength
    });
    this.transport = new ExceptionTransport({
      endpoint: this.config.endpoint,
      maxRetries: this.config.maxRetries,
      retryDelays: this.config.retryDelays,
      requestTimeout: this.config.requestTimeout,
      maxErrorsPerSession: this.config.maxErrorsPerSession
    });
    
    // 性能统计
    this._stats = {
      totalProcessed: 0,
      totalReported: 0,
      totalFiltered: 0,
      totalDuplicated: 0,
      averageProcessingTime: 0
    };
    
    // 集成日志系统
    this._integrateWithLogger();
  }
  
  /**
   * 报告异常
   * @param {Error} error - 异常对象
   * @param {Object} additionalContext - 额外上下文
   * @returns {Promise<Object>} 上报结果
   */
  async reportException(error, additionalContext = {}) {
    const startTime = this.config.enablePerformanceTracking ? performance.now() : 0;
    
    try {
      // 1. 处理异常，获取异常记录
      const exceptionRecord = this.handler.handle(error, additionalContext);
      this._stats.totalProcessed++;
      
      // 2. 检查是否重复
      if (this.deduplicator.isDuplicate(exceptionRecord)) {
        this._stats.totalDuplicated++;
        return { status: 'duplicate', id: exceptionRecord.id };
      }
      
      // 3. 过滤检查
      if (!this.filter.shouldKeep(exceptionRecord)) {
        this._stats.totalFiltered++;
        return { status: 'filtered', id: exceptionRecord.id };
      }
      
      // 4. 清理数据
      const sanitizedRecord = this.filter.sanitize(exceptionRecord);
      
      // 5. 实时上报
      const result = await this.transport.send(sanitizedRecord);
      
      if (result.status === 'sent' || result.status === 'queued_for_retry') {
        this._stats.totalReported++;
      }
      
      // 更新性能统计
      if (this.config.enablePerformanceTracking) {
        this._updateProcessingTime(performance.now() - startTime);
      }
      
      return result;
      
    } catch (serviceError) {
      console.error('[ExceptionService] Failed:', serviceError);
      return { status: 'error', error: serviceError.message };
    }
  }
  
  /**
   * 集成日志系统
   * @private
   */
  _integrateWithLogger() {
    if (typeof window !== 'undefined' && window.logger) {
      const originalReport = this.reportException.bind(this);
      
      this.reportException = async (error, additionalContext = {}) => {
        try {
          window.logger.error('Exception occurred', {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack
            },
            context: additionalContext
          });
        } catch (logError) {
          console.warn('[ExceptionService] Failed to log:', logError);
        }
        
        return originalReport(error, additionalContext);
      };
    }
  }
  
  /**
   * 更新平均处理时间
   * @private
   */
  _updateProcessingTime(newTime) {
    const total = this._stats.totalProcessed;
    const currentAvg = this._stats.averageProcessingTime;
    this._stats.averageProcessingTime = (currentAvg * (total - 1) + newTime) / total;
  }
  
  /**
   * 获取服务统计信息
   */
  getStats() {
    return {
      service: this._stats,
      deduplication: this.deduplicator.getStats(),
      transport: this.transport.getStats()
    };
  }
  
  /**
   * 刷新待处理的异常
   */
  async flush() {
    await this.transport.flush();
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.deduplicationWindow) {
      this.deduplicator.updateConfig({ windowMs: newConfig.deduplicationWindow });
    }
    if (newConfig.enableFiltering !== undefined || newConfig.maxStackLength) {
      this.filter.updateConfig(newConfig);
    }
    if (newConfig.endpoint || newConfig.maxRetries || newConfig.requestTimeout) {
      this.transport.updateConfig(newConfig);
    }
  }
}

// 导出单例实例
export const frontendExceptionService = new FrontendExceptionService();

// 别名导出
export const exceptionService = frontendExceptionService;

export default frontendExceptionService;
