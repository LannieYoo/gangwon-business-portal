/**
 * Logger Configuration
 * 
 * 前端日志系统统一配置
 */

// 环境检测
const isDevelopment = import.meta.env.DEV;

/**
 * 日志级别值
 */
export const LOG_LEVEL_VALUES = {
  DEBUG: 10,
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  CRITICAL: 50
};

/**
 * 环境配置
 */
export const LOGGER_CONFIG = {
  development: {
    consoleMinLevel: 'WARNING',
    transportMinLevel: 'DEBUG',
    layerLogLevels: {
      component: 'DEBUG',
      hook: 'DEBUG',
      store: 'DEBUG',
      auth: 'DEBUG',
      api: 'DEBUG',
    },
    enableDeduplication: true,
    deduplicationWindow: 5000,
    enableBatching: true,
    batchSize: 10,
    batchInterval: 5000,
  },
  production: {
    consoleMinLevel: 'ERROR',
    transportMinLevel: 'INFO',
    layerLogLevels: {
      component: 'INFO',
      hook: 'INFO',
      store: 'INFO',
      auth: 'INFO',
      api: 'INFO',
    },
    enableDeduplication: true,
    deduplicationWindow: 10000,
    enableBatching: true,
    batchSize: 20,
    batchInterval: 10000,
  }
};

/**
 * 获取当前环境的日志配置
 */
export function getLoggerConfig() {
  const env = import.meta.env.MODE || 'development';
  return LOGGER_CONFIG[env] || LOGGER_CONFIG.development;
}

/**
 * 获取指定层级的日志级别
 */
export function getLayerLogLevel(layer) {
  const config = getLoggerConfig();
  return config.layerLogLevels?.[layer] || 'INFO';
}

/**
 * 检查日志级别是否应该输出
 */
export function shouldLog(logLevel, minLevel) {
  return LOG_LEVEL_VALUES[logLevel] >= LOG_LEVEL_VALUES[minLevel];
}

// 获取当前配置
const loggerConfig = getLoggerConfig();

/**
 * 日志系统配置
 */
export const LOGGING_CONFIG = {
  levels: {
    minConsoleLevel: loggerConfig.consoleMinLevel,
    minTransportLevel: loggerConfig.transportMinLevel
  },
  
  transport: {
    maxRetries: 2,
    retryDelays: [3000, 8000],
    maxQueueSize: isDevelopment ? 50 : 100,
    requestTimeout: 8000,
  },
  
  performance: {
    enableNetworkMonitoring: true,
    enableMemoryMonitoring: true,
    slowRequestThreshold: 1500,
    memoryWarningThreshold: 100 * 1024 * 1024,
    reportInterval: isDevelopment ? 60000 : 300000,
    excludePatterns: [
      '/api/v1/logging/',
      '/logging/',
      '/logs',
      'logging/frontend/logs'
    ]
  },
  
  deduplication: {
    enabled: true,
    windowSize: isDevelopment ? 30000 : 60000,
    maxDuplicates: 3
  },
  
  sensitiveFiltering: {
    enabled: true,
    fields: [
      'password', 'token', 'secret', 'key', 'auth',
      'credential', 'private', 'confidential', 'authorization',
      'access_token', 'refresh_token', 'api_key', 'session_id'
    ]
  },
  
  development: {
    enableDebugLogs: isDevelopment,
    enableVerboseLogging: isDevelopment && import.meta.env.VITE_ENABLE_VERBOSE_LOGGING === 'true',
    enableAOPDebugLogs: isDevelopment && import.meta.env.VITE_ENABLE_AOP_DEBUG_LOGS === 'true'
  }
};

/**
 * 性能监控排除检查
 */
export function shouldExcludeFromPerformanceMonitoring(url) {
  if (!url) return false;
  return LOGGING_CONFIG.performance.excludePatterns.some(pattern => url.includes(pattern));
}

/**
 * 日志级别检查
 */
export function shouldLogToConsole(level) {
  const minLevel = LOG_LEVEL_VALUES[LOGGING_CONFIG.levels.minConsoleLevel] || 30;
  return (LOG_LEVEL_VALUES[level] || 0) >= minLevel;
}

export function shouldLogToTransport(level) {
  const minLevel = LOG_LEVEL_VALUES[LOGGING_CONFIG.levels.minTransportLevel] || 20;
  return (LOG_LEVEL_VALUES[level] || 0) >= minLevel;
}

export default LOGGING_CONFIG;
