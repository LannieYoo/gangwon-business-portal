/**
 * useUpload Hook
 * 统一的文件上传 Hook，封装上传逻辑和 loading 状态
 */

import { useState, useCallback } from 'react';
import uploadService from '@shared/services/upload.service';

/**
 * @param {Object} options
 * @param {boolean} options.isPublic - 是否公开上传 (默认 true)
 * @param {Function} options.onSuccess - 上传成功回调
 * @param {Function} options.onError - 上传失败回调
 * @param {Function} options.onProgress - 上传进度回调
 * @returns {Object} { uploading, progress, upload, uploadMultiple, uploadAttachments, error }
 */
export default function useUpload(options = {}) {
  const { isPublic = true, onSuccess, onError, onProgress } = options;
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // 进度回调处理
  const handleProgress = useCallback((progressEvent) => {
    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setProgress(percent);
    onProgress?.(percent, progressEvent);
  }, [onProgress]);

  // 单文件上传
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

  // 多文件上传
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

  // 上传附件（返回格式化的附件列表）
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

  // 使用 FormData 上传
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

  return {
    uploading,
    progress,
    error,
    upload,
    uploadMultiple,
    uploadAttachments,
    uploadFile,
  };
}
