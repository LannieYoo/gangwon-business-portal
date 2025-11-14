/**
 * Local Storage Utilities with JSON support and error handling
 */

/**
 * Get item from localStorage
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    // Try to parse as JSON, if fails return as string
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Set item to localStorage
 */
export function setStorage(key, value) {
  try {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 */
export function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if item exists in localStorage
 */
export function hasStorage(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Get item from sessionStorage
 */
export function getSessionStorage(key, defaultValue = null) {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) return defaultValue;
    
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error(`Error reading from sessionStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Set item to sessionStorage
 */
export function setSessionStorage(key, value) {
  try {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    console.error(`Error writing to sessionStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove item from sessionStorage
 */
export function removeSessionStorage(key) {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from sessionStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all items from sessionStorage
 */
export function clearSessionStorage() {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
    return false;
  }
}

/**
 * Save draft data with timestamp
 */
export function saveDraft(key, data) {
  const draftData = {
    data,
    timestamp: new Date().toISOString()
  };
  return setStorage(`draft_${key}`, draftData);
}

/**
 * Load draft data
 */
export function loadDraft(key) {
  const draftData = getStorage(`draft_${key}`);
  if (!draftData) return null;
  
  return draftData.data;
}

/**
 * Remove draft data
 */
export function removeDraft(key) {
  return removeStorage(`draft_${key}`);
}

/**
 * Check if draft exists and is recent (within 7 days)
 */
export function hasDraft(key, daysValid = 7) {
  const draftData = getStorage(`draft_${key}`);
  if (!draftData || !draftData.timestamp) return false;
  
  const draftDate = new Date(draftData.timestamp);
  const now = new Date();
  const diffInDays = (now - draftDate) / (1000 * 60 * 60 * 24);
  
  return diffInDays <= daysValid;
}

