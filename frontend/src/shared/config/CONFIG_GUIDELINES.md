# Config 配置规范

本文档定义了 `shared/config` 目录下配置文件的开发标准和最佳实践。

## 目录结构

```
shared/config/
├── logger.config.js      # 日志配置
├── logging.config.js     # 日志系统详细配置
└── CONFIG_GUIDELINES.md
```

## 配置文件命名

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 配置文件 | kebab-case + .config.js | `logger.config.js` |
| 配置对象 | UPPER_SNAKE_CASE | `LOGGER_CONFIG` |
| 获取函数 | get + 配置名 | `getLoggerConfig()` |

## 配置文件模板

### 基础配置

```js
/**
 * Logger Configuration
 * 
 * 前端日志配置，根据环境自动调整日志级别和输出
 */

/**
 * 日志配置
 */
export const LOGGER_CONFIG = {
  // 开发环境配置
  development: {
    consoleMinLevel: 'WARNING',
    transportMinLevel: 'DEBUG',
    enableDeduplication: true,
    batchSize: 10,
    batchInterval: 5000
  },
  
  // 生产环境配置
  production: {
    consoleMinLevel: 'ERROR',
    transportMinLevel: 'INFO',
    enableDeduplication: true,
    batchSize: 20,
    batchInterval: 10000
  }
};

/**
 * 获取当前环境的配置
 */
export function getLoggerConfig() {
  const env = import.meta.env.MODE || 'development';
  return LOGGER_CONFIG[env] || LOGGER_CONFIG.development;
}
```

### 带层级的配置

```js
/**
 * Logging Configuration
 */

import { getLoggerConfig } from './logger.config.js';

const isDevelopment = import.meta.env.DEV;
const loggerConfig = getLoggerConfig();

export const LOGGING_CONFIG = {
  // 日志级别
  levels: {
    minConsoleLevel: loggerConfig.consoleMinLevel,
    minTransportLevel: loggerConfig.transportMinLevel
  },
  
  // 传输配置
  transport: {
    batchSize: isDevelopment ? 15 : 25,
    batchInterval: isDevelopment ? 8000 : 15000,
    maxRetries: 2,
    requestTimeout: 8000
  },
  
  // 性能监控
  performance: {
    enableNetworkMonitoring: true,
    slowRequestThreshold: 1500,
    excludePatterns: ['/api/v1/logging/', '/logs']
  },
  
  // 敏感信息过滤
  sensitiveFiltering: {
    enabled: true,
    fields: ['password', 'token', 'secret', 'key']
  }
};

export default LOGGING_CONFIG;
```

## 环境变量

### 使用 Vite 环境变量

```js
// 环境检测
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const mode = import.meta.env.MODE;

// 自定义环境变量（需要 VITE_ 前缀）
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true';
```

### .env 文件

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_ENABLE_DEBUG=true
VITE_ENABLE_VERBOSE_LOGGING=false
```

## 配置设计原则

### 环境区分

为不同环境提供不同配置：

```js
export const CONFIG = {
  development: {
    // 开发环境：更详细的日志，更短的间隔
    logLevel: 'DEBUG',
    batchInterval: 5000
  },
  production: {
    // 生产环境：精简日志，更长的间隔
    logLevel: 'INFO',
    batchInterval: 15000
  }
};
```

### 默认值

始终提供合理的默认值：

```js
export function getConfig() {
  const env = import.meta.env.MODE || 'development';
  return CONFIG[env] || CONFIG.development;  // 回退到开发配置
}
```

### 类型安全

使用 JSDoc 注释配置结构：

```js
/**
 * @typedef {Object} LoggerConfig
 * @property {string} consoleMinLevel - 控制台最低日志级别
 * @property {string} transportMinLevel - 上报最低日志级别
 * @property {boolean} enableDeduplication - 是否启用去重
 * @property {number} batchSize - 批量大小
 * @property {number} batchInterval - 批量间隔（毫秒）
 */

/**
 * 获取日志配置
 * @returns {LoggerConfig}
 */
export function getLoggerConfig() {
  // ...
}
```

## 辅助函数

### 配置检查函数

```js
/**
 * 检查是否应该排除 URL
 */
export function shouldExcludeUrl(url) {
  if (!url) return false;
  return CONFIG.excludePatterns.some(pattern => url.includes(pattern));
}

/**
 * 检查日志级别
 */
export function shouldLog(level, minLevel) {
  const levels = { DEBUG: 10, INFO: 20, WARNING: 30, ERROR: 40 };
  return levels[level] >= levels[minLevel];
}
```

## 导出规范

```js
// 导出配置对象
export const LOGGER_CONFIG = { ... };

// 导出获取函数
export function getLoggerConfig() { ... }

// 导出辅助函数
export function shouldLog() { ... }

// 默认导出（可选）
export default LOGGER_CONFIG;
```

## 文件注释

```js
/**
 * Logger Configuration
 * 
 * 前端日志配置，根据环境自动调整日志级别和输出。
 * 统一管理所有层级（Component/Hook/Store/Auth/API）的日志级别。
 */
```

## Checklist

新建配置文件时确认：

- [ ] 文件名使用 `.config.js` 后缀
- [ ] 配置对象使用 UPPER_SNAKE_CASE
- [ ] 区分 development 和 production 环境
- [ ] 提供 get 函数获取当前环境配置
- [ ] 有合理的默认值和回退
- [ ] 使用 JSDoc 注释配置结构
- [ ] 敏感配置使用环境变量
