/**
 * Component Interceptor - React 组件拦截器（API 兼容层）
 *
 * ⚠️ 实际实现在 hook.interceptor.js 中
 *
 * 由于 React 17+ 使用 automatic JSX runtime，无法直接拦截 React.createElement。
 * 组件 mount/unmount 日志通过 Hook 拦截器实现：
 * - mount: 组件第一次调用任何 hook 时记录
 * - unmount: 空依赖 useEffect 的 cleanup 函数执行时记录
 *
 * 此文件保留的原因：
 * 1. API 兼容性 - main.jsx 调用 installComponentInterceptor()
 * 2. 统计功能 - 提供 getComponentInterceptorStats()
 * 3. 手动日志 - 提供 logComponentMount/logComponentUnmount 供特殊场景使用
 *
 * Requirements: 4.3, 4.4
 */

import { debug, LOG_LAYERS } from '@shared/logger';

// 拦截器状态
let isInstalled = false;

/**
 * 手动记录组件 mount
 * 供特殊场景使用（如类组件、无 hook 的函数组件）
 */
export function logComponentMount(componentName) {
  debug(LOG_LAYERS.COMPONENT, `Component: ${componentName} mounted`, {
    component_name: componentName,
    lifecycle: 'mount',
  });
}

/**
 * 手动记录组件 unmount
 * 供特殊场景使用
 */
export function logComponentUnmount(componentName, renderCount = 0, mountDurationMs = 0) {
  debug(LOG_LAYERS.COMPONENT, `Component: ${componentName} unmounted`, {
    component_name: componentName,
    lifecycle: 'unmount',
    render_count: renderCount,
    mount_duration_ms: mountDurationMs,
  });
}

/**
 * 安装组件拦截器
 * 实际拦截逻辑在 hook.interceptor.js 中
 * @returns {boolean} 是否安装成功
 */
export function installComponentInterceptor() {
  if (isInstalled) {
    return false;
  }

  isInstalled = true;

  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_AOP_DEBUG_LOGS === 'true'
  ) {
    console.log('[ComponentInterceptor] Installed (actual impl in hook.interceptor.js)');
  }

  return true;
}

/**
 * 卸载组件拦截器
 * @returns {boolean} 是否卸载成功
 */
export function uninstallComponentInterceptor() {
  if (!isInstalled) {
    return false;
  }

  isInstalled = false;
  return true;
}

/**
 * 检查拦截器是否已安装
 * @returns {boolean} 是否已安装
 */
export function isComponentInterceptorInstalled() {
  return isInstalled;
}

/**
 * 获取拦截器统计信息
 * 注意：实际统计在 hook.interceptor.js 中维护
 * @returns {Object} 统计信息
 */
export function getComponentInterceptorStats() {
  return {
    isInstalled,
    note: 'Actual stats maintained in hook.interceptor.js',
  };
}

export default {
  install: installComponentInterceptor,
  uninstall: uninstallComponentInterceptor,
  isInstalled: isComponentInterceptorInstalled,
  getStats: getComponentInterceptorStats,
  logMount: logComponentMount,
  logUnmount: logComponentUnmount,
};
