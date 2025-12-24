/**
 * Hook Interceptor - React Hook拦截器
 * 
 * 按规范只记录有意义的 Hook 调用：
 * 1. useEffect 执行和清理
 * 2. useState 状态变化
 * 3. 慢 Hook（执行时间 > 10ms）
 * 4. Hook 错误
 * 
 * Requirements: 4.3, 4.4
 */

import React from 'react';
import { debug, warn, LOG_LAYERS } from '@shared/logger';

// 慢 Hook 阈值（毫秒）
const SLOW_HOOK_THRESHOLD = 10;

// 需要过滤的 React 内部组件
const INTERNAL_COMPONENTS = [
  'RouterProvider', 'Router', 'Routes', 'Route', 'DataRoutes',
  'RenderedRoute', 'Outlet', 'Navigate', 'Link', 'NavLink',
  'Provider', 'Consumer', 'Context', 'Suspense', 'Fragment',
  'StrictMode', 'Profiler', 'Unknown', 'Anonymous', 'ForwardRef', 'Memo'
];

// 存储原始的 React Hooks
const originalHooks = {
  useState: React.useState,
  useEffect: React.useEffect,
  useContext: React.useContext,
  useReducer: React.useReducer,
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useRef: React.useRef,
  useLayoutEffect: React.useLayoutEffect,
};

// 拦截器状态
let isInstalled = false;

// 组件 mount 追踪
const mountedComponents = new Map();

/**
 * 从 React Fiber 获取当前组件名称
 */
function getCurrentComponentName() {
  try {
    const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (ReactSharedInternals?.ReactCurrentOwner?.current) {
      const fiber = ReactSharedInternals.ReactCurrentOwner.current;
      const type = fiber.type;
      if (type) {
        if (typeof type === 'function') {
          return type.displayName || type.name || 'Anonymous';
        }
        if (type.$typeof === Symbol.for('react.forward_ref')) {
          return type.render?.displayName || type.render?.name || 'ForwardRef';
        }
        if (type.$typeof === Symbol.for('react.memo')) {
          return type.type?.displayName || type.type?.name || 'Memo';
        }
      }
    }
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}


/**
 * 检查是否应该记录该组件
 */
function shouldLogComponent(componentName) {
  return !INTERNAL_COMPONENTS.some(internal =>
    componentName === internal ||
    componentName.startsWith(internal + '.') ||
    componentName.includes('Provider') ||
    componentName.includes('Consumer')
  );
}

/**
 * 脱敏处理值
 */
function sanitizeValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (value.length > 50) return value.substring(0, 50) + '...';
    return value;
  }
  if (Array.isArray(value)) return `[Array(${value.length})]`;
  if (typeof value === 'object') return '[Object]';
  return String(value);
}

/**
 * 创建 useState 拦截器 - 记录状态变化
 */
function createUseStateInterceptor(originalUseState) {
  const stateIndexMap = new Map();
  
  return function interceptedUseState(initialState) {
    const componentName = getCurrentComponentName();
    const shouldLog = shouldLogComponent(componentName);
    
    const currentIndex = stateIndexMap.get(componentName) || 0;
    stateIndexMap.set(componentName, currentIndex + 1);
    
    const [state, originalSetState] = originalUseState(initialState);
    
    if (!shouldLog) {
      return [state, originalSetState];
    }
    
    const wrappedSetState = (newValue) => {
      const prevValue = state;
      const nextValue = typeof newValue === 'function' ? newValue(prevValue) : newValue;
      
      if (prevValue !== nextValue) {
        debug(LOG_LAYERS.HOOK, `State: ${componentName}.${currentIndex}`, {
          hook_name: 'useState',
          component_name: componentName,
          event: 'state_change',
          state_index: currentIndex,
          prev_value: sanitizeValue(prevValue),
          next_value: sanitizeValue(nextValue),
        });
      }
      
      return originalSetState(newValue);
    };
    
    return [state, wrappedSetState];
  };
}

/**
 * 创建 useEffect 拦截器
 */
function createUseEffectInterceptor(originalUseEffect, hookName = 'useEffect') {
  return function interceptedUseEffect(effect, deps) {
    const componentName = getCurrentComponentName();
    const shouldLog = shouldLogComponent(componentName);
    const isMountEffect = Array.isArray(deps) && deps.length === 0;
    
    const wrappedEffect = function() {
      const startTime = performance.now();
      
      try {
        const result = effect();
        const executionTime = Math.round(performance.now() - startTime);
        const hasCleanup = typeof result === 'function';
        
        if (shouldLog) {
          if (isMountEffect && !mountedComponents.has(componentName)) {
            mountedComponents.set(componentName, { mountTime: Date.now(), renderCount: 1 });
            debug(LOG_LAYERS.COMPONENT, `Component: ${componentName} mounted`, {
              component_name: componentName,
              lifecycle: 'mount',
            });
          }
          
          debug(LOG_LAYERS.HOOK, `Effect: ${componentName}`, {
            hook_name: hookName,
            component_name: componentName,
            event: 'effect',
            has_cleanup: hasCleanup,
            deps_changed: true,
          }, { duration_ms: executionTime });
          
          if (executionTime > SLOW_HOOK_THRESHOLD) {
            warn(LOG_LAYERS.HOOK, `Slow Hook: ${hookName} in ${componentName}`, {
              hook_name: hookName,
              component_name: componentName,
              event: 'slow',
            }, { duration_ms: executionTime });
          }
        }
        
        if (hasCleanup) {
          return function wrappedCleanup() {
            const cleanupStart = performance.now();
            try {
              const cleanupResult = result();
              const cleanupTime = Math.round(performance.now() - cleanupStart);
              
              if (shouldLog) {
                debug(LOG_LAYERS.HOOK, `Effect Cleanup: ${componentName}`, {
                  hook_name: hookName,
                  component_name: componentName,
                  event: 'cleanup',
                }, { duration_ms: cleanupTime });
                
                if (isMountEffect && mountedComponents.has(componentName)) {
                  const info = mountedComponents.get(componentName);
                  mountedComponents.delete(componentName);
                  debug(LOG_LAYERS.COMPONENT, `Component: ${componentName} unmounted`, {
                    component_name: componentName,
                    lifecycle: 'unmount',
                    render_count: info.renderCount,
                    mount_duration_ms: Date.now() - info.mountTime,
                  });
                }
              }
              return cleanupResult;
            } catch (error) {
              warn(LOG_LAYERS.HOOK, `Hook Error: ${hookName} in ${componentName}`, {
                hook_name: hookName, component_name: componentName, event: 'error', error_message: error.message,
              });
              throw error;
            }
          };
        }
        return result;
      } catch (error) {
        if (shouldLog) {
          warn(LOG_LAYERS.HOOK, `Hook Error: ${hookName} in ${componentName}`, {
            hook_name: hookName, component_name: componentName, event: 'error', error_message: error.message,
          });
        }
        throw error;
      }
    };
    
    return originalUseEffect(wrappedEffect, deps);
  };
}


/**
 * 创建通用 Hook 拦截器 - 只记录慢 Hook 和错误
 */
function createGenericHookInterceptor(hookName, originalHook) {
  return function interceptedHook(...args) {
    const startTime = performance.now();
    const componentName = getCurrentComponentName();
    const shouldLog = shouldLogComponent(componentName);
    
    try {
      const result = originalHook.apply(this, args);
      const executionTime = Math.round(performance.now() - startTime);
      
      if (shouldLog && executionTime > SLOW_HOOK_THRESHOLD) {
        warn(LOG_LAYERS.HOOK, `Slow Hook: ${hookName} in ${componentName}`, {
          hook_name: hookName,
          component_name: componentName,
          event: 'slow',
        }, { duration_ms: executionTime });
      }
      
      return result;
    } catch (error) {
      if (shouldLog) {
        warn(LOG_LAYERS.HOOK, `Hook Error: ${hookName} in ${componentName}`, {
          hook_name: hookName,
          component_name: componentName,
          event: 'error',
          error_message: error.message,
        });
      }
      throw error;
    }
  };
}

/**
 * 安装 Hook 拦截器
 */
export function installHookInterceptor() {
  if (isInstalled) return false;
  
  try {
    React.useState = createUseStateInterceptor(originalHooks.useState);
    React.useEffect = createUseEffectInterceptor(originalHooks.useEffect, 'useEffect');
    React.useLayoutEffect = createUseEffectInterceptor(originalHooks.useLayoutEffect, 'useLayoutEffect');
    React.useContext = createGenericHookInterceptor('useContext', originalHooks.useContext);
    React.useReducer = createGenericHookInterceptor('useReducer', originalHooks.useReducer);
    React.useCallback = createGenericHookInterceptor('useCallback', originalHooks.useCallback);
    React.useMemo = createGenericHookInterceptor('useMemo', originalHooks.useMemo);
    React.useRef = createGenericHookInterceptor('useRef', originalHooks.useRef);
    
    isInstalled = true;
    
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_AOP_DEBUG_LOGS === 'true') {
      console.log('[HookInterceptor] Installed');
    }
    return true;
  } catch (error) {
    console.error('[HookInterceptor] Failed:', error);
    return false;
  }
}

/**
 * 卸载 Hook 拦截器
 */
export function uninstallHookInterceptor() {
  if (!isInstalled) return false;
  
  Object.keys(originalHooks).forEach(hookName => {
    React[hookName] = originalHooks[hookName];
  });
  
  isInstalled = false;
  return true;
}

export function isHookInterceptorInstalled() {
  return isInstalled;
}

export default {
  install: installHookInterceptor,
  uninstall: uninstallHookInterceptor,
  isInstalled: isHookInterceptorInstalled,
};
