// 自定义 Hooks

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@shared/stores';
import authService from '@shared/services/auth.service';
import uploadService from '@shared/services/upload.service';
import { getStorage, setStorage, removeStorage } from '@shared/utils';
import { DEFAULT_PAGE_SIZE } from '@shared/utils/constants';

// =============================================================================
// useAuth - 认证
// =============================================================================

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setAuthenticated,
    setLoading,
    clearAuth
  } = useAuthStore();
  
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      setAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const adminLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.adminLogin(credentials);
      setUser(response.user);
      setAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      clearAuth();
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };
  
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        setUser(user);
        setAuthenticated(true);
        return user;
      } else {
        clearAuth();
        return null;
      }
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const user = await authService.updateProfile(userData);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const hasRole = (role) => authService.hasRole(role);
  const isAdmin = () => authService.isAdmin();
  const isMember = () => authService.isMember();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    adminLogin,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    hasRole,
    isAdmin,
    isMember
  };
}

// =============================================================================
// useDebounce - 防抖
// =============================================================================

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

// =============================================================================
// useLocalStorage - 本地存储
// =============================================================================

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = getStorage(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      setStorage(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      removeStorage(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue, removeValue];
}

// =============================================================================
// usePagination - 分页
// =============================================================================

export function usePagination(initialPage = 1, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  const goToPage = useCallback((newPage) => setPage(newPage), []);
  const nextPage = useCallback(() => setPage(prev => prev + 1), []);
  const prevPage = useCallback(() => setPage(prev => Math.max(1, prev - 1)), []);
  
  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);
  
  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);
  
  return { page, pageSize, goToPage, nextPage, prevPage, changePageSize, reset };
}

// =============================================================================
// useToggle - 开关
// =============================================================================

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, toggle, setTrue, setFalse];
}

// =============================================================================
// useUpload - 文件上传
// =============================================================================

export function useUpload(options = {}) {
  const { isPublic = true, onSuccess, onError, onProgress } = options;
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleProgress = useCallback((progressEvent) => {
    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setProgress(percent);
    onProgress?.(percent, progressEvent);
  }, [onProgress]);

  const upload = useCallback(async (file) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const result = isPublic
        ? await uploadService.uploadPublic(file, handleProgress)
        : await uploadService.uploadPrivate(file, handleProgress);
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [isPublic, handleProgress, onSuccess, onError]);

  const uploadMultiple = useCallback(async (files) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const result = await uploadService.uploadMultiple(files, handleProgress, isPublic);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [isPublic, handleProgress, onSuccess, onError]);

  const uploadAttachments = useCallback(async (files) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const result = await uploadService.uploadAttachments(files);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [onSuccess, onError]);

  const uploadFile = useCallback(async (formData) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const result = await uploadService.uploadFile(formData, handleProgress);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [handleProgress, onSuccess, onError]);

  return { uploading, progress, error, upload, uploadMultiple, uploadAttachments, uploadFile };
}
