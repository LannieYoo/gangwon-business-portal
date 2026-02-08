/**
 * API 缓存 Hook
 * 通用的 API 请求缓存管理
 * 
 * 遵循 dev-frontend_patterns skill 规范
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// 内存缓存（快速访问）
const memoryCache = new Map();

// localStorage 缓存 key 前缀
const CACHE_PREFIX = 'api_cache_';
const CACHE_DURATION = 1 * 60 * 1000; // 1分钟缓存

/**
 * 从 localStorage 获取缓存
 */
function getFromStorage(cacheKey) {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
      // 过期，删除
      localStorage.removeItem(CACHE_PREFIX + cacheKey);
    }
  } catch (error) {
    console.warn('[useApiCache] Failed to read from localStorage:', error);
  }
  return null;
}

/**
 * 保存到 localStorage
 */
function saveToStorage(cacheKey, data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('[useApiCache] Failed to save to localStorage:', error);
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  // 清除内存缓存
  memoryCache.clear();
  
  // 清除 localStorage 缓存
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('[useApiCache] Failed to clear localStorage:', error);
  }
}

/**
 * 清除特定 key 的缓存
 */
export function clearCache(cacheKey) {
  // 清除内存缓存
  memoryCache.delete(cacheKey);
  
  // 清除 localStorage 缓存
  try {
    localStorage.removeItem(CACHE_PREFIX + cacheKey);
  } catch (error) {
    console.warn('[useApiCache] Failed to clear cache:', error);
  }
}

/**
 * API 缓存 Hook
 * 
 * @param {Function} fetchFn - 获取数据的异步函数
 * @param {string} cacheKey - 缓存 key
 * @param {Object} options - 配置选项
 * @param {number} options.cacheDuration - 缓存时长（毫秒），默认 1 分钟
 * @param {boolean} options.enabled - 是否启用缓存，默认 true
 * @param {Array} options.deps - 依赖数组，变化时重新请求
 * @returns {Object} { data, loading, error, refresh }
 */
export function useApiCache(fetchFn, cacheKey, options = {}) {
  const {
    cacheDuration = CACHE_DURATION,
    enabled = true,
    deps = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  /**
   * 从缓存获取数据（先内存，后 localStorage）
   */
  const getCachedData = useCallback(() => {
    if (!enabled) return null;

    // 1. 先检查内存缓存（最快）
    const memoryCached = memoryCache.get(cacheKey);
    if (memoryCached && Date.now() - memoryCached.timestamp < cacheDuration) {
      return memoryCached.data;
    }

    // 2. 检查 localStorage 缓存（持久化）
    const storageCached = getFromStorage(cacheKey);
    if (storageCached !== null) {
      // 同步到内存缓存
      memoryCache.set(cacheKey, {
        data: storageCached,
        timestamp: Date.now()
      });
      return storageCached;
    }

    return null;
  }, [cacheKey, cacheDuration, enabled]);

  /**
   * 设置缓存（同时保存到内存和 localStorage）
   */
  const setCachedData = useCallback((newData) => {
    if (!enabled) return;

    // 保存到内存缓存
    memoryCache.set(cacheKey, {
      data: newData,
      timestamp: Date.now()
    });

    // 保存到 localStorage
    saveToStorage(cacheKey, newData);
  }, [cacheKey, enabled]);

  /**
   * 加载数据
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData !== null) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    // 请求数据
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      if (isMountedRef.current) {
        setData(result);
        setCachedData(result);
      }
    } catch (err) {
      console.error(`[useApiCache] Failed to load data for ${cacheKey}:`, err);
      if (isMountedRef.current) {
        setError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, getCachedData, setCachedData, cacheKey]);

  /**
   * 刷新数据（强制重新请求）
   */
  const refresh = useCallback(() => {
    clearCache(cacheKey);
    loadData(true);
  }, [cacheKey, loadData]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, [loadData, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh
  };
}

export default useApiCache;




