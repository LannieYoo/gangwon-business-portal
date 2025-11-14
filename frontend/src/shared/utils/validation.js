/**
 * Validation Utilities
 */

import { PATTERNS } from './constants';

/**
 * Validate business license number
 */
export function validateBusinessLicense(value) {
  if (!value) return false;
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 10 && PATTERNS.BUSINESS_LICENSE.test(value);
}

/**
 * Validate corporation number
 */
export function validateCorporationNumber(value) {
  if (!value) return false;
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 13 && PATTERNS.CORPORATION_NUMBER.test(value);
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(value) {
  if (!value) return false;
  return PATTERNS.PHONE.test(value);
}

/**
 * Validate email
 */
export function validateEmail(value) {
  if (!value) return false;
  return PATTERNS.EMAIL.test(value);
}

/**
 * Validate URL
 */
export function validateURL(value) {
  if (!value) return false;
  return PATTERNS.URL.test(value);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 */
export function validatePassword(value) {
  if (!value) return { valid: false, errors: ['비밀번호를 입력해주세요'] };
  
  const errors = [];
  
  if (value.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다');
  }
  
  if (!/[A-Z]/.test(value)) {
    errors.push('대문자를 최소 1개 포함해야 합니다');
  }
  
  if (!/[a-z]/.test(value)) {
    errors.push('소문자를 최소 1개 포함해야 합니다');
  }
  
  if (!/[0-9]/.test(value)) {
    errors.push('숫자를 최소 1개 포함해야 합니다');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    errors.push('특수문자를 최소 1개 포함해야 합니다');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return { valid: false, error: '비밀번호 확인을 입력해주세요' };
  if (password !== confirmation) {
    return { valid: false, error: '비밀번호가 일치하지 않습니다' };
  }
  return { valid: true, error: null };
}

/**
 * Validate file type
 */
export function validateFileType(file, allowedTypes) {
  if (!file) return { valid: false, error: '파일을 선택해주세요' };
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `허용되지 않는 파일 형식입니다. (${allowedTypes.join(', ')})` 
    };
  }
  return { valid: true, error: null };
}

/**
 * Validate file size
 */
export function validateFileSize(file, maxSize) {
  if (!file) return { valid: false, error: '파일을 선택해주세요' };
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    return { 
      valid: false, 
      error: `파일 크기가 ${maxSizeMB}MB를 초과합니다` 
    };
  }
  return { valid: true, error: null };
}

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = '필수 항목') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName}을(를) 입력해주세요` };
  }
  return { valid: true, error: null };
}

/**
 * Validate min length
 */
export function validateMinLength(value, minLength, fieldName = '입력값') {
  if (!value) return { valid: false, error: `${fieldName}을(를) 입력해주세요` };
  if (value.length < minLength) {
    return { 
      valid: false, 
      error: `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다` 
    };
  }
  return { valid: true, error: null };
}

/**
 * Validate max length
 */
export function validateMaxLength(value, maxLength, fieldName = '입력값') {
  if (!value) return { valid: true, error: null };
  if (value.length > maxLength) {
    return { 
      valid: false, 
      error: `${fieldName}은(는) 최대 ${maxLength}자까지 입력 가능합니다` 
    };
  }
  return { valid: true, error: null };
}

/**
 * Validate number range
 */
export function validateNumberRange(value, min, max, fieldName = '숫자') {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, error: `유효한 ${fieldName}을(를) 입력해주세요` };
  }
  
  if (num < min || num > max) {
    return { 
      valid: false, 
      error: `${fieldName}은(는) ${min}에서 ${max} 사이의 값이어야 합니다` 
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { valid: false, error: '시작일과 종료일을 입력해주세요' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { valid: false, error: '종료일은 시작일 이후여야 합니다' };
  }
  
  return { valid: true, error: null };
}

/**
 * SQL Injection protection - sanitize input
 */
export function sanitizeInput(value) {
  if (!value) return value;
  
  // Remove or escape potentially dangerous characters
  return value
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/;/g, '')    // Remove semicolons
    .replace(/--/g, '')   // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .trim();
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(value) {
  if (!value) return false;
  return /^\d+$/.test(value);
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(value) {
  if (!value) return false;
  return /^[a-zA-Z0-9]+$/.test(value);
}

