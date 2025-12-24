# Interceptors 开发规范

本文档定义了 `shared/interceptors` 目录下拦截器的开发标准和最佳实践。

## 目录结构

```
shared/interceptors/
├── index.js                  # 统一导出入口
├── api.interceptor.js        # API 请求/响应拦截器
├── api.error.classifier.js   # API 错误分类器
├── api.error.recovery.js     # API 错误恢复
├── auth.interceptor.js       # 认证拦截器
├── component.interceptor.js  # 组件拦截器
├── hook.interceptor.js       # Hook 拦截器
├── performance.interceptor.js # 性能拦截器
└── INTERCEPTORS_GUIDELINES.md
```

> **注意**：Store 层使用 Zustand 中间件模式（`storeLogger.js`），不使用拦截器。详见 [STORES_GUIDELINES.md](../stores/STORES_GUIDELINES.md)。

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | kebab-case，.interceptor 后缀 | `api.interceptor.js` |
| 安装函数 | install 前缀 | `installApiInterceptors` |
| 卸载函数 | uninstall 前缀 | `uninstallComponentInterceptor` |
| 状态检查 | is...Installed | `isComponentInterceptorInstalled` |
| 统计函数 | get...Stats | `getComponentInterceptorStats` |

## 拦截器分类

### 1. API 拦截器

拦截 HTTP 请求和响应，记录日志和处理错误：

```js
/**
 * API Interceptor - API 请求/响应拦截器
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import { info, warn, error, LOG_LAYERS } from '@shared/utils/logger';

/**
 * 创建请求拦截器
 */
export function createRequestInterceptor(options = {}) {
  return (config) => {
    // 添加追踪 ID
    config.headers['X-Trace-Id'] = getTraceId();
    config.headers['X-Request-Id'] = generateRequestId();
    
    // 记录开始时间
    config._startTime = performance.now();
    
    // 记录请求日志
    debug(LOG_LAYERS.SERVICE, `API Request: ${config.method} ${config.url}`, {
      request_method: config.method?.toUpperCase(),
      request_path: config.url
    });
    
    return config;
  };
}

/**
 * 创建响应拦截器
 */
export function createResponseInterceptor(options = {}) {
  const { slowApiThreshold = 2000 } = options;
  
  return (response) => {
    const duration = Math.round(performance.now() - response.config._startTime);
    
    // 记录成功响应
    info(LOG_LAYERS.SERVICE, `API Success: ${response.config.url}`, {
      response_status: response.status,
      duration_ms: duration
    });
    
    // 慢 API 告警
    if (duration > slowApiThreshold) {
      warn(LOG_LAYERS.SERVICE, `Slow API: ${response.config.url}`, {
        duration_ms: duration,
        threshold_ms: slowApiThreshold
      });
    }
    
    return response;
  };
}

/**
 * 创建错误拦截器
 */
export function createErrorInterceptor(options = {}) {
  return (err) => {
    error(LOG_LAYERS.SERVICE, `API Failed: ${err.config?.url}`, {
      response_status: err.response?.status,
      error_message: err.message
    });
    
    return Promise.reject(err);
  };
}
```

### 2. 组件拦截器

拦截 React 组件渲染，记录生命周期日志：

```js
/**
 * Component Interceptor - React 组件拦截器
 * 
 * Requirements: 4.3, 4.4
 */

import React from 'react';
import { useComponentLog } from '@shared/hooks/useComponentLog';

const originalCreateElement = React.createElement;
const componentCache = new WeakMap();
let isInstalled = false;

/**
 * 获取组件名称
 */
function getComponentName(type) {
  if (typeof type === 'string') return type;
  if (typeof type === 'function') {
    return type.displayName || type.name || 'Anonymous';
  }
  return 'Unknown';
}

/**
 * 判断是否需要拦截
 */
function shouldInterceptComponent(type, componentName) {
  // 跳过 HTML 元素
  if (typeof type === 'string') return false;
  // 跳过匿名组件
  if (componentName === 'Anonymous') return false;
  // 跳过 React 内置组件
  if (componentName.includes('Fragment')) return false;
  return true;
}

/**
 * 安装组件拦截器
 */
export function installComponentInterceptor() {
  if (isInstalled) return false;
  
  React.createElement = function(type, props, ...children) {
    const componentName = getComponentName(type);
    
    if (!shouldInterceptComponent(type, componentName)) {
      return originalCreateElement(type, props, ...children);
    }
    
    // 创建带日志的包装组件
    let LoggedComponent = componentCache.get(type);
    if (!LoggedComponent) {
      LoggedComponent = createLoggedComponent(type, componentName);
      componentCache.set(type, LoggedComponent);
    }
    
    return originalCreateElement(LoggedComponent, props, ...children);
  };
  
  isInstalled = true;
  return true;
}

/**
 * 卸载组件拦截器
 */
export function uninstallComponentInterceptor() {
  if (!isInstalled) return false;
  React.createElement = originalCreateElement;
  isInstalled = false;
  return true;
}

export function isComponentInterceptorInstalled() {
  return isInstalled;
}
```

### 3. 认证拦截器

为服务方法添加认证日志：

```js
/**
 * Auth Interceptor - 认证服务拦截器
 * 
 * Requirements: 3.5
 */

import { info, warn, LOG_LAYERS } from '@shared/utils/logger';

const AUTH_METHODS = ['login', 'logout', 'register', 'refreshToken'];

/**
 * 应用认证拦截器
 */
export function applyAuthInterceptor(service, options = {}) {
  const { enableLogging = true } = options;
  
  return new Proxy(service, {
    get(target, prop) {
      const original = target[prop];
      
      if (typeof original !== 'function') return original;
      if (!AUTH_METHODS.includes(prop)) return original.bind(target);
      
      return async function(...args) {
        const startTime = performance.now();
        
        try {
          const result = await original.apply(target, args);
          const duration = Math.round(performance.now() - startTime);
          
          if (enableLogging) {
            info(LOG_LAYERS.AUTH, `Auth ${prop} success`, {
              method: prop,
              duration_ms: duration
            });
          }
          
          return result;
        } catch (error) {
          if (enableLogging) {
            warn(LOG_LAYERS.AUTH, `Auth ${prop} failed`, {
              method: prop,
              error_message: error.message
            });
          }
          throw error;
        }
      };
    }
  });
}
```

## 拦截器模板

### 标准拦截器结构

```js
/**
 * [Name] Interceptor - [Description]
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * Requirements: X.X, X.X
 */

import { info, debug, warn, LOG_LAYERS } from '@shared/utils/logger';

// 拦截器状态
let isInstalled = false;
let stats = { intercepted: 0, errors: 0 };

/**
 * 安装拦截器
 * @returns {boolean} 是否安装成功
 */
export function installXxxInterceptor() {
  if (isInstalled) {
    console.warn('[XxxInterceptor] Already installed');
    return false;
  }
  
  try {
    // 安装逻辑
    isInstalled = true;
    
    if (import.meta.env.DEV) {
      console.log('[XxxInterceptor] Installed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('[XxxInterceptor] Failed to install:', error);
    return false;
  }
}

/**
 * 卸载拦截器
 * @returns {boolean} 是否卸载成功
 */
export function uninstallXxxInterceptor() {
  if (!isInstalled) {
    console.warn('[XxxInterceptor] Not installed');
    return false;
  }
  
  try {
    // 卸载逻辑
    isInstalled = false;
    
    if (import.meta.env.DEV) {
      console.log('[XxxInterceptor] Uninstalled successfully');
    }
    
    return true;
  } catch (error) {
    console.error('[XxxInterceptor] Failed to uninstall:', error);
    return false;
  }
}

/**
 * 检查拦截器是否已安装
 * @returns {boolean} 是否已安装
 */
export function isXxxInterceptorInstalled() {
  return isInstalled;
}

/**
 * 获取拦截器统计信息
 * @returns {Object} 统计信息
 */
export function getXxxInterceptorStats() {
  return { ...stats, isInstalled };
}

/**
 * 重置统计信息
 */
export function resetXxxInterceptorStats() {
  stats = { intercepted: 0, errors: 0 };
}

export default {
  install: installXxxInterceptor,
  uninstall: uninstallXxxInterceptor,
  isInstalled: isXxxInterceptorInstalled,
  getStats: getXxxInterceptorStats,
  resetStats: resetXxxInterceptorStats
};
```

## 日志层级

使用 `LOG_LAYERS` 常量标识日志来源：

```js
import { LOG_LAYERS } from '@shared/utils/logger';

// 可用的日志层级
LOG_LAYERS.SERVICE    // API 服务层
LOG_LAYERS.AUTH       // 认证层
LOG_LAYERS.COMPONENT  // 组件层
LOG_LAYERS.HOOK       // Hook 层
LOG_LAYERS.STORE      // Store 层（使用 storeLogger 中间件）
LOG_LAYERS.PERFORMANCE // 性能层
```

> **注意**：Store 层不使用拦截器，而是使用 Zustand 中间件 `storeLogger.js`。

## 敏感数据过滤

拦截器必须过滤敏感信息：

```js
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[FILTERED]';
    }
  });
  
  // 限制数据大小
  const jsonStr = JSON.stringify(sanitized);
  if (jsonStr.length > 500) {
    return { _truncated: true, _size: jsonStr.length };
  }
  
  return sanitized;
}
```

## 性能考虑

### 避免无限循环

跳过日志相关的请求：

```js
export function createRequestInterceptor(options = {}) {
  return (config) => {
    // 跳过日志请求本身
    if (config.url?.includes('/logging/') || config.url?.includes('/logs')) {
      return config;
    }
    // ...
  };
}
```

### 使用缓存

避免重复创建包装对象：

```js
const componentCache = new WeakMap();

function getLoggedComponent(type) {
  let cached = componentCache.get(type);
  if (!cached) {
    cached = createLoggedComponent(type);
    componentCache.set(type, cached);
  }
  return cached;
}
```

## 导出规范

### 在 index.js 中导出

```js
// API 拦截器
export {
  createRequestInterceptor,
  createResponseInterceptor,
  createErrorInterceptor,
  createApiInterceptors,
  installApiInterceptors
} from './api.interceptor.js';

// 组件拦截器
export {
  installComponentInterceptor,
  uninstallComponentInterceptor,
  isComponentInterceptorInstalled,
  getComponentInterceptorStats
} from './component.interceptor.js';
```

## 文件注释

每个拦截器文件顶部添加说明：

```js
/**
 * Component Interceptor - React 组件拦截器
 * 
 * 自动为所有 React 组件添加 AOP 日志功能。
 * 
 * Features:
 * - 自动拦截 React.createElement 调用
 * - 为组件添加生命周期日志
 * - 支持组件渲染性能监控
 * 
 * Requirements: 4.3, 4.4
 */
```

## Checklist

新建拦截器时确认：

- [ ] 文件名使用 `.interceptor.js` 后缀
- [ ] 文件顶部有完整注释（Features、Requirements）
- [ ] 提供 install/uninstall 函数
- [ ] 提供 isInstalled 检查函数
- [ ] 提供 getStats 统计函数
- [ ] 使用 LOG_LAYERS 标识日志来源
- [ ] 过滤敏感数据
- [ ] 避免无限循环
- [ ] 使用缓存优化性能
- [ ] 在 `index.js` 中导出
