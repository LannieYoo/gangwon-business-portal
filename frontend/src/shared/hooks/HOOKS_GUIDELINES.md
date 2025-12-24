# Hooks 开发规范

本文档定义了 `shared/hooks` 目录下自定义 Hook 的开发标准和最佳实践。

## 目录结构

```
shared/hooks/
├── index.js              # 统一导出入口
├── useAuth.js            # 业务 Hook
├── useDebounce.js        # 工具 Hook
├── useComponentLog.js    # 日志 Hook
└── HOOKS_GUIDELINES.md
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | camelCase，use 前缀 | `useAuth.js`, `useDebounce.js` |
| Hook 名 | camelCase，use 前缀 | `useAuth`, `usePagination` |
| 返回值 | 对象或数组 | `{ user, login }` 或 `[value, setValue]` |

## Hook 分类

### 1. 业务 Hook
封装业务逻辑，如认证、数据获取等。

```js
/**
 * Authentication Hook
 */

import { useAuthStore } from '@shared/stores/authStore';
import authService from '@shared/services/auth.service';

export function useAuth() {
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();
  
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };
  
  const logout = async () => {
    await authService.logout();
    clearAuth();
  };
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  };
}
```

### 2. 工具 Hook
通用工具函数，如防抖、本地存储等。

```js
/**
 * Debounce Hook
 */

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

### 3. 日志 Hook
用于 AOP 日志系统，记录组件/Hook 生命周期。

```js
/**
 * Component Log Hook
 * 
 * Requirements: 4.3, 4.4
 */

import { useEffect, useRef, useCallback } from 'react';
import { info, debug, LOG_LAYERS } from '@shared/utils/logger';

export function useComponentLog(componentName, options = {}) {
  const { enableLogging = true } = options;
  const mountTimeRef = useRef(null);
  
  useEffect(() => {
    if (!enableLogging) return;
    
    mountTimeRef.current = performance.now();
    info(LOG_LAYERS.COMPONENT, `Mount: ${componentName}`, {
      component_name: componentName,
      lifecycle_event: 'mount'
    });
    
    return () => {
      const duration = Math.round(performance.now() - mountTimeRef.current);
      info(LOG_LAYERS.COMPONENT, `Unmount: ${componentName}`, {
        component_name: componentName,
        lifecycle_event: 'unmount',
        mount_duration_ms: duration
      });
    };
  }, [componentName, enableLogging]);
  
  const logEvent = useCallback((eventName, data = {}) => {
    if (!enableLogging) return;
    info(LOG_LAYERS.COMPONENT, `${componentName}.${eventName}`, {
      component_name: componentName,
      event_name: eventName,
      event_data: data
    });
  }, [componentName, enableLogging]);
  
  return { logEvent };
}
```

## 返回值设计

### 对象返回（推荐）
适用于返回多个值且需要按名称访问的场景。

```js
// ✅ 推荐 - 清晰的命名
export function useAuth() {
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}

// 使用
const { user, login } = useAuth();
```

### 数组返回
适用于简单的状态 + 更新函数模式（类似 useState）。

```js
// ✅ 适合简单场景
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}

// 使用
const [isOpen, toggleOpen] = useToggle();
```

## 错误处理

### 业务 Hook 错误处理

```js
export function useAuth() {
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      // 向上抛出，让调用方处理
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { login };
}
```

### 日志 Hook 错误处理

```js
// 日志 Hook 内部捕获错误，避免影响业务
const logEvent = useCallback((eventName, data) => {
  try {
    info(LOG_LAYERS.COMPONENT, `${componentName}.${eventName}`, data);
  } catch (error) {
    console.warn('Failed to log event:', error);
  }
}, [componentName]);
```

## 性能优化

### 使用 useCallback 包装函数

```js
// ✅ 正确 - 使用 useCallback
const login = useCallback(async (credentials) => {
  // ...
}, [setUser]);

// ❌ 错误 - 每次渲染创建新函数
const login = async (credentials) => {
  // ...
};
```

### 使用 useRef 存储非响应式数据

```js
// ✅ 正确 - 不触发重渲染
const mountTimeRef = useRef(null);
const renderCountRef = useRef(0);

// ❌ 错误 - 会触发重渲染
const [mountTime, setMountTime] = useState(null);
```

### 依赖数组优化

```js
// ✅ 正确 - 精确的依赖
useEffect(() => {
  logEvent('mount');
}, [logEvent]);

// ❌ 错误 - 缺少依赖或过多依赖
useEffect(() => {
  logEvent('mount');
}, []); // 缺少 logEvent
```

## 敏感数据处理

日志 Hook 必须过滤敏感信息：

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
  
  return sanitized;
}
```

## 导出规范

### 在 index.js 中导出

```js
// 命名导出
export * from './useAuth';
export * from './useDebounce';
export * from './useComponentLog';
```

### Hook 文件导出

```js
// 同时提供命名导出和默认导出
export function useAuth() { ... }
export default useAuth;
```

## 文件注释

每个 Hook 文件顶部添加说明：

```js
/**
 * Authentication Hook
 * 
 * 封装用户认证相关逻辑，包括登录、登出、获取当前用户等。
 * 
 * @returns {Object} 认证状态和方法
 */
```

日志 Hook 需要标注需求编号：

```js
/**
 * Component Log Hook
 * 
 * Requirements: 4.3, 4.4
 */
```

## Checklist

新建 Hook 时确认：

- [ ] 文件名使用 `use` 前缀
- [ ] Hook 函数使用 `use` 前缀
- [ ] 文件顶部有注释说明
- [ ] 函数使用 `useCallback` 包装
- [ ] 非响应式数据使用 `useRef`
- [ ] 依赖数组完整且精确
- [ ] 敏感数据已过滤（日志 Hook）
- [ ] 在 `index.js` 中导出
- [ ] 同时提供命名导出和默认导出
