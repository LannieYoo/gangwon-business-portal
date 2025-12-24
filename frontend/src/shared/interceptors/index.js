/**
 * Interceptors Module - 拦截器模块入口
 * 
 * 统一导出所有拦截器相关功能。
 * 
 * 注意：Store 层使用 Zustand 中间件模式（storeLogger.js），不使用拦截器。
 */

// API 拦截器
export {
  createRequestInterceptor,
  createResponseInterceptor,
  createErrorInterceptor,
  createApiInterceptors,
  installApiInterceptors
} from './api.interceptor.js';

// API 错误处理
export { ApiErrorClassifier } from './api.error.classifier.js';
export { apiErrorRecovery, ApiErrorRecovery } from './api.error.recovery.js';
export { apiCache, ApiCache } from './api.cache.js';
export { apiOfflineQueue, ApiOfflineQueue } from './api.offline.js';

// 认证拦截器 (原有的认证装饰器)
export {
  createAuthInterceptor,
  applyAuthInterceptor,
  authMethodDecorator,
  AUTH_METHODS
} from './auth.interceptor.js';

// Auth服务拦截器 (新的AOP认证拦截器)
export {
  installAuthInterceptor,
  uninstallAuthInterceptor,
  isAuthInterceptorInstalled,
  interceptAuthService,
  getAuthInterceptorStats,
  resetAuthInterceptorStats
} from './auth.interceptor.js';

// 组件拦截器
export {
  installComponentInterceptor,
  uninstallComponentInterceptor,
  isComponentInterceptorInstalled,
  getComponentInterceptorStats
} from './component.interceptor.js';

// Hook拦截器
export {
  installHookInterceptor,
  uninstallHookInterceptor,
  isHookInterceptorInstalled,
} from './hook.interceptor.js';

// 路由拦截器
export {
  installRouterInterceptor,
  uninstallRouterInterceptor,
  isRouterInterceptorInstalled,
} from './router.interceptor.js';

// 性能拦截器
export {
  installPerformanceInterceptor,
  uninstallPerformanceInterceptor,
  isPerformanceInterceptorInstalled,
  getPerformanceInterceptorStats,
  resetPerformanceInterceptorStats,
  updatePerformanceConfig
} from './performance.interceptor.js';

// 默认导出 API 拦截器
export { default } from './api.interceptor.js';