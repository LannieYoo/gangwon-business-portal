/**
 * Router Interceptor - 路由拦截器
 * 
 * 监听路由变化，记录导航日志
 * 
 * Requirements: 3.4
 */

import { info, LOG_LAYERS } from '@shared/logger';

let isInstalled = false;
let unsubscribe = null;
let prevPath = null;

/**
 * 获取认证状态（延迟导入避免循环依赖）
 */
function getAuthState() {
  try {
    // 动态导入 authStore
    const { useAuthStore } = require('@shared/stores');
    const state = useAuthStore.getState();
    return {
      isAuthenticated: state.isAuthenticated,
      userRole: state.user?.role || null,
    };
  } catch {
    return { isAuthenticated: false, userRole: null };
  }
}

/**
 * 记录路由变化
 */
function logRouteChange(location, action) {
  const fromPath = prevPath || '(initial)';
  const toPath = location.pathname;
  
  // 跳过相同路径
  if (fromPath === toPath && fromPath !== '(initial)') {
    return;
  }
  
  const { isAuthenticated, userRole } = getAuthState();
  
  const extraData = {
    action: action || 'PUSH',
    from_path: fromPath,
    to_path: toPath,
    is_authenticated: isAuthenticated,
  };
  
  if (location.search) {
    extraData.search = location.search;
  }
  
  if (userRole) {
    extraData.user_role = userRole;
  }
  
  info(LOG_LAYERS.ROUTER, `Route: ${fromPath} -> ${toPath}`, extraData);
  
  prevPath = toPath;
}

/**
 * 安装路由拦截器
 * @param {Object} router - React Router 的 router 实例
 */
export function installRouterInterceptor(router) {
  if (isInstalled) {
    return false;
  }
  
  if (!router || typeof router.subscribe !== 'function') {
    console.error('[RouterInterceptor] Invalid router instance');
    return false;
  }
  
  // 记录初始路由
  if (router.state?.location) {
    logRouteChange(router.state.location, 'INITIAL');
  }
  
  // 订阅路由变化
  unsubscribe = router.subscribe((state) => {
    if (state.location) {
      logRouteChange(state.location, state.historyAction);
    }
  });
  
  isInstalled = true;
  
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_AOP_DEBUG_LOGS === 'true') {
    console.log('[RouterInterceptor] Installed');
  }
  
  return true;
}

/**
 * 卸载路由拦截器
 */
export function uninstallRouterInterceptor() {
  if (!isInstalled) {
    return false;
  }
  
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  
  prevPath = null;
  isInstalled = false;
  
  return true;
}

export function isRouterInterceptorInstalled() {
  return isInstalled;
}

export default {
  install: installRouterInterceptor,
  uninstall: uninstallRouterInterceptor,
  isInstalled: isRouterInterceptorInstalled,
};
