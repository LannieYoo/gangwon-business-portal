// Hooks 理想代码示例

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// useExample - 示例 Hook
// =============================================================================

export function useExample(initialValue = null) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  const update = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  return { value, loading, error, reset, update };
}

// =============================================================================
// useToggle - 开关状态
// =============================================================================

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
}

// =============================================================================
// useDebounce - 防抖值
// =============================================================================

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// useAsync - 异步操作
// =============================================================================

export function useAsync(asyncFn, immediate = false) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) execute();
  }, [immediate, execute]);

  return { loading, error, data, execute };
}
