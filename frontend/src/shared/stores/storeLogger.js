/**
 * Zustand Store Logger Middleware
 * 自动记录所有 store 状态变更
 */

import { info, LOG_LAYERS } from '@shared/logger';

/**
 * 创建日志中间件
 * @param {string} storeName - Store 名称
 */
export const storeLogger = (storeName) => (config) => (set, get, api) => {
  const loggedSet = (partial, replace, actionName) => {
    const prevState = get();
    
    // 调用原始 set
    set(partial, replace, actionName);
    
    const nextState = get();
    
    // 获取变更的字段
    const changes = typeof partial === 'function' 
      ? Object.keys(nextState).filter(key => prevState[key] !== nextState[key])
      : Object.keys(partial);
    
    // 记录日志
    const actualActionName = actionName || 'setState';
    info(LOG_LAYERS.STORE, `Store: ${storeName}.${actualActionName}`, {
      store_name: storeName,
      action_name: actualActionName,
      changed_fields: changes
    });
  };
  
  return config(loggedSet, get, api);
};

export default storeLogger;
