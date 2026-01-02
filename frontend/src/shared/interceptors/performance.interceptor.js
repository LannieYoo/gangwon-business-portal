/**
 * Performance Interceptor - 性能监控拦截器
 * 
 * 自动监控应用性能指标，实现性能级别的自动日志记录和优化建议。
 * 
 * Features:
 * - 自动监控页面性能指标
 * - 拦截网络请求性能
 * - 监控渲染性能
 * - 内存使用监控
 * - 自动性能报告和优化建议
 * - 避免日志循环的智能排除机制
 * 
 * Requirements: 4.3, 4.4
 */

import { info, debug, warn, LOG_LAYERS, generateRequestId } from '@shared/logger';
import { LOGGING_CONFIG, shouldExcludeFromPerformanceMonitoring } from '@shared/logger/config';

// 拦截器状态
let isInstalled = false;

// 性能监控配置 - 使用统一配置
const performanceConfig = {
  enableNetworkMonitoring: LOGGING_CONFIG.performance.enableNetworkMonitoring,
  enableRenderMonitoring: LOGGING_CONFIG.performance.enableMemoryMonitoring,
  enableMemoryMonitoring: LOGGING_CONFIG.performance.enableMemoryMonitoring,
  enableNavigationMonitoring: true,
  slowRequestThreshold: LOGGING_CONFIG.performance.slowRequestThreshold,
  slowRenderThreshold: 16, // ms (60fps)
  memoryWarningThreshold: LOGGING_CONFIG.performance.memoryWarningThreshold,
  reportInterval: LOGGING_CONFIG.performance.reportInterval
};

// 性能统计信息
const performanceStats = {
  networkRequests: [],
  renderMetrics: [],
  memoryUsage: [],
  navigationMetrics: [],
  slowOperations: [],
  errors: []
};

// 监控定时器
let monitoringInterval = null;
let memoryMonitoringInterval = null;

/**
 * 监控网络请求性能
 */
function monitorNetworkPerformance() {
  if (!performanceConfig.enableNetworkMonitoring) return;
  
  try {
    // 拦截fetch
    const originalFetch = window.fetch;
    window.fetch = async function interceptedFetch(resource, options = {}) {
      const startTime = performance.now();
      const url = typeof resource === 'string' ? resource : resource.url;
      const method = options.method || 'GET';
      const requestId = generateRequestId();
      
      // 使用统一的排除检查函数
      const isLoggingRequest = shouldExcludeFromPerformanceMonitoring(url);
      
      // 不记录请求开始日志，只关注慢查询
      
      try {
        const response = await originalFetch(resource, options);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // 只记录慢查询，忽略日志上传请求
        if (!isLoggingRequest && duration > performanceConfig.slowRequestThreshold) {
          warn(LOG_LAYERS.PERFORMANCE, `Slow network_request: ${method} ${url} (${duration}ms > ${performanceConfig.slowRequestThreshold}ms)`, {
            request_id: requestId,
            metric_name: 'network_request',
            metric_value: duration,
            metric_unit: 'ms',
            method,
            url,
            status: response.status,
            duration_ms: duration,
            threshold_ms: performanceConfig.slowRequestThreshold,
            is_slow: true
          });
          
          performanceStats.slowOperations.push({
            type: 'fetch',
            method,
            url,
            duration
          });
        }
        
        // 保存请求统计（但不包括日志请求）
        if (!isLoggingRequest) {
          performanceStats.networkRequests.push({
            method,
            url,
            status: response.status,
            duration
          });
          
          // 限制统计数据大小
          if (performanceStats.networkRequests.length > 100) {
            performanceStats.networkRequests = performanceStats.networkRequests.slice(-50);
          }
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // 网络错误记录到error日志，不在performance日志
        if (!isLoggingRequest) {
          performanceStats.errors.push({
            type: 'fetch',
            method,
            url,
            error: error.message
          });
        }
        
        throw error;
      }
    };
    
    // 拦截XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      this._startTime = performance.now();
      this._method = method;
      this._url = url;
      this._requestId = generateRequestId();
      
      // 使用统一的排除检查函数
      this._isLoggingRequest = shouldExcludeFromPerformanceMonitoring(url);
      
      // 不记录请求开始日志，只关注慢查询
      
      return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    XMLHttpRequest.prototype.send = function(data) {
      const xhr = this;
      
      const originalOnReadyStateChange = xhr.onreadystatechange;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          const duration = Math.round(performance.now() - xhr._startTime);
          
          // 只记录慢查询
          if (!xhr._isLoggingRequest && duration > performanceConfig.slowRequestThreshold) {
            warn(LOG_LAYERS.PERFORMANCE, `Slow network_request: ${xhr._method} ${xhr._url} (${duration}ms > ${performanceConfig.slowRequestThreshold}ms)`, {
              request_id: xhr._requestId,
              metric_name: 'network_request',
              metric_value: duration,
              metric_unit: 'ms',
              method: xhr._method,
              url: xhr._url,
              status: xhr.status,
              duration_ms: duration,
              threshold_ms: performanceConfig.slowRequestThreshold,
              is_slow: true
            });
            
            performanceStats.slowOperations.push({
              type: 'xhr',
              method: xhr._method,
              url: xhr._url,
              duration
            });
          }
          
          // 保存统计（不包括日志请求）
          if (!xhr._isLoggingRequest) {
            performanceStats.networkRequests.push({
              method: xhr._method,
              url: xhr._url,
              status: xhr.status,
              duration
            });
          }
        }
        
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.call(this);
        }
      };
      
      return originalXHRSend.call(this, data);
    };
    
  } catch (error) {
    console.error('[PerformanceInterceptor] Failed to monitor network performance:', error);
  }
}

/**
 * 监控页面导航性能
 */
function monitorNavigationPerformance() {
  if (!performanceConfig.enableNavigationMonitoring) return;
  
  try {
    // 监控页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const metrics = {
            dns_lookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
            tcp_connect: Math.round(navigation.connectEnd - navigation.connectStart),
            request_response: Math.round(navigation.responseEnd - navigation.requestStart),
            dom_parse: Math.round(navigation.domContentLoadedEventEnd - navigation.responseEnd),
            resource_load: Math.round(navigation.loadEventEnd - navigation.domContentLoadedEventEnd),
            total_load_time: Math.round(navigation.loadEventEnd - navigation.navigationStart),
            timestamp: new Date().toISOString()
          };
          
          info(LOG_LAYERS.PERFORMANCE, 'Page Navigation Performance', {
            navigation_type: navigation.type,
            ...metrics
          });
          
          performanceStats.navigationMetrics.push(metrics);
        }
      }, 0);
    });
    
    // 监控页面可见性变化
    document.addEventListener('visibilitychange', () => {
      debug(LOG_LAYERS.PERFORMANCE, `Page Visibility Changed: ${document.visibilityState}`, {
        visibility_state: document.visibilityState,
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('[PerformanceInterceptor] Failed to monitor navigation performance:', error);
  }
}

/**
 * 监控内存使用
 */
function monitorMemoryUsage() {
  if (!performanceConfig.enableMemoryMonitoring || !performance.memory) return;
  
  try {
    const memory = performance.memory;
    const memoryUsage = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage_percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
      timestamp: new Date().toISOString()
    };
    
    const isHighMemory = memory.usedJSHeapSize > performanceConfig.memoryWarningThreshold;
    
    // 按照日志规范格式发送性能日志
    const logFn = isHighMemory ? warn : info;
    const message = isHighMemory 
      ? `Slow memory_usage: App (${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB > ${Math.round(performanceConfig.memoryWarningThreshold / 1024 / 1024)}MB)`
      : `Perf: memory_usage = ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`;
    
    logFn(LOG_LAYERS.PERFORMANCE, message, {
      metric_name: 'memory_usage',
      metric_value: memory.usedJSHeapSize,
      metric_unit: 'bytes',
      threshold_ms: performanceConfig.memoryWarningThreshold,
      is_slow: isHighMemory,
      ...memoryUsage
    });
    
    performanceStats.memoryUsage.push(memoryUsage);
    
    // 限制统计数据大小
    if (performanceStats.memoryUsage.length > 100) {
      performanceStats.memoryUsage = performanceStats.memoryUsage.slice(-50);
    }
    
  } catch (error) {
    console.error('[PerformanceInterceptor] Failed to monitor memory usage:', error);
  }
}

/**
 * 生成性能报告
 * 注意：定期报告已禁用，只记录慢查询
 */
function generatePerformanceReport() {
  // 禁用定期报告，只关注慢查询
  // 慢查询已在网络监控中实时记录
}

/**
 * 安装性能拦截器
 * @param {Object} config - 配置选项
 * @returns {boolean} 是否安装成功
 */
export function installPerformanceInterceptor(config = {}) {
  if (isInstalled) {
    console.warn('[PerformanceInterceptor] Already installed');
    return false;
  }
  
  try {
    // 更新配置
    Object.assign(performanceConfig, config);
    
    // 安装网络监控（慢查询检测）
    monitorNetworkPerformance();
    
    // 开发环境启用完整监控
    if (import.meta.env.DEV) {
      monitorNavigationPerformance();
      memoryMonitoringInterval = setInterval(monitorMemoryUsage, 30000); // 30秒检查一次内存
    }
    
    isInstalled = true;
    
    // 只在开发环境且启用调试日志时显示安装成功信息
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_AOP_DEBUG_LOGS === 'true') {
      console.log('[PerformanceInterceptor] Installed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('[PerformanceInterceptor] Failed to install:', error);
    return false;
  }
}

/**
 * 卸载性能拦截器
 * @returns {boolean} 是否卸载成功
 */
export function uninstallPerformanceInterceptor() {
  if (!isInstalled) {
    console.warn('[PerformanceInterceptor] Not installed');
    return false;
  }
  
  try {
    // 清除定时器
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
    
    if (memoryMonitoringInterval) {
      clearInterval(memoryMonitoringInterval);
      memoryMonitoringInterval = null;
    }
    
    isInstalled = false;
    
    return true;
  } catch (error) {
    console.error('[PerformanceInterceptor] Failed to uninstall:', error);
    return false;
  }
}

/**
 * 检查拦截器是否已安装
 * @returns {boolean} 是否已安装
 */
export function isPerformanceInterceptorInstalled() {
  return isInstalled;
}

/**
 * 获取性能统计信息
 * @returns {Object} 统计信息
 */
export function getPerformanceInterceptorStats() {
  return {
    isInstalled,
    config: { ...performanceConfig },
    networkRequests: performanceStats.networkRequests.length,
    memorySnapshots: performanceStats.memoryUsage.length,
    slowOperations: performanceStats.slowOperations.length,
    errors: performanceStats.errors.length,
    recentNetworkRequests: performanceStats.networkRequests.slice(-5),
    recentMemoryUsage: performanceStats.memoryUsage.slice(-5),
    recentSlowOperations: performanceStats.slowOperations.slice(-5)
  };
}

/**
 * 重置性能统计信息
 */
export function resetPerformanceInterceptorStats() {
  performanceStats.networkRequests = [];
  performanceStats.renderMetrics = [];
  performanceStats.memoryUsage = [];
  performanceStats.navigationMetrics = [];
  performanceStats.slowOperations = [];
  performanceStats.errors = [];
}

/**
 * 更新配置
 * @param {Object} newConfig - 新配置
 */
export function updatePerformanceConfig(newConfig) {
  Object.assign(performanceConfig, newConfig);
}

// 默认导出
export default {
  install: installPerformanceInterceptor,
  uninstall: uninstallPerformanceInterceptor,
  isInstalled: isPerformanceInterceptorInstalled,
  getStats: getPerformanceInterceptorStats,
  resetStats: resetPerformanceInterceptorStats,
  updateConfig: updatePerformanceConfig
};