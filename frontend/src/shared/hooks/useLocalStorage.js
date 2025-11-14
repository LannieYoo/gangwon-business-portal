/**
 * Local Storage Hook
 */

import { useState, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from '@shared/utils/storage';

export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = getStorage(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function like useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      setStorage(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  // Remove value from localStorage
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

