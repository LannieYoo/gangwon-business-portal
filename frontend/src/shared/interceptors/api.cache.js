/**
 * API Cache - API 响应缓存管理
 * 
 * 负责缓存 API 响应，支持离线访问和缓存回退。
 * 
 * Requirements: 10.4
 */

/**
 * API 缓存管理器
 */
export class ApiCache {
  constructor(config = {}) {
    this.cacheStorage = new Map();
    this.defaultTimeout = config.cacheTimeout || 300000; // 默认5分钟
    
    // 初始化时从 localStorage 恢复缓存
    this._restoreFromStorage();
  }
  
  /**
   * 从 localStorage 恢复缓存
   * @private
   */
  _restoreFromStorage() {
    try {
      const cachedData = localStorage.getItem('api_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        Object.entries(parsed).forEach(([key, value]) => {
          // 检查缓存是否过期
          if (value.expiry && Date.now() < value.expiry) {
            this.cacheStorage.set(key, value);
          }
        });
      }
    } catch (error) {
      console.warn('[ApiCache] Failed to restore cache from storage:', error);
    }
  }
  
  /**
   * 持久化缓存到 localStorage
   * @private
   */
  _persistToStorage() {
    try {
      const cacheData = {};
      this.cacheStorage.forEach((value, key) => {
        cacheData[key] = value;
      });
      localStorage.setItem('api_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[ApiCache] Failed to persist cache:', error);
    }
  }
  
  /**
   * 生成缓存键
   * @param {Object} config - 请求配置
   * @returns {string} 缓存键
   */
  getCacheKey(config) {
    const url = config.url || '';
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${config.method}_${url}_${params}`;
  }
  
  /**
   * 保存响应到缓存
   * @param {Object} config - 请求配置
   * @param {Object} response - 响应对象
   */
  set(config, response) {
    try {
      // 只缓存 GET 请求
      if (config.method?.toLowerCase() !== 'get') {
        return;
      }
      
      // 只缓存成功响应
      if (response.status < 200 || response.status >= 300) {
        return;
      }
      
      const cacheKey = this.getCacheKey(config);
      const cacheData = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        timestamp: Date.now(),
        expiry: Date.now() + (config.cacheTimeout || this.defaultTimeout)
      };
      
      this.cacheStorage.set(cacheKey, cacheData);
      this._persistToStorage();
      
    } catch (error) {
      console.warn('[ApiCache] Failed to cache response:', error);
    }
  }
  
  /**
   * 从缓存获取响应
   * @param {Object} config - 请求配置
   * @returns {Object|null} 缓存的响应或 null
   */
  get(config) {
    try {
      const cacheKey = this.getCacheKey(config);
      const cached = this.cacheStorage.get(cacheKey);
      
      if (!cached) {
        return null;
      }
      
      // 检查是否过期
      if (cached.expiry && Date.now() > cached.expiry) {
        this.cacheStorage.delete(cacheKey);
        return null;
      }
      
      return {
        data: cached.data,
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
        config: config,
        fromCache: true
      };
      
    } catch (error) {
      console.warn('[ApiCache] Failed to get cached response:', error);
      return null;
    }
  }
  
  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    this.cacheStorage.forEach((value, key) => {
      if (value.expiry && now > value.expiry) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.cacheStorage.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      this._persistToStorage();
    }
  }
  
  /**
   * 清空所有缓存
   */
  clear() {
    this.cacheStorage.clear();
    try {
      localStorage.removeItem('api_cache');
    } catch (error) {
      console.warn('[ApiCache] Failed to clear cache from storage:', error);
    }
  }
  
  /**
   * 获取缓存大小
   * @returns {number} 缓存条目数
   */
  get size() {
    return this.cacheStorage.size;
  }
}

// 全局缓存实例
export const apiCache = new ApiCache();

export default apiCache;
