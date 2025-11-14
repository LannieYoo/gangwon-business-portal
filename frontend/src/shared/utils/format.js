/**
 * Formatting Utilities
 */

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Format business license number: 0000000000 -> 000-00-00000
 */
export function formatBusinessLicense(value) {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
}

/**
 * Format corporation number: 0000000000000 -> 000000-0000000
 */
export function formatCorporationNumber(value) {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 6) return cleaned;
  return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 13)}`;
}

/**
 * Format phone number: 00000000000 -> 000-0000-0000
 */
export function formatPhoneNumber(value) {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
}

/**
 * Format currency (KRW) with thousand separators
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('ko-KR');
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('ko-KR');
}

/**
 * Parse formatted number string to number
 */
export function parseFormattedNumber(value) {
  if (!value) return 0;
  return parseFloat(value.replace(/,/g, ''));
}

/**
 * Format date string or Date object
 */
export function formatDate(date, formatStr = 'yyyy-MM-dd') {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ko });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

/**
 * Format datetime string or Date object
 */
export function formatDateTime(date, formatStr = 'yyyy-MM-dd HH:mm:ss') {
  return formatDate(date, formatStr);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return formatDate(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
}

/**
 * Format file size (bytes to human readable)
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return `${num.toFixed(decimals)}%`;
}

/**
 * Mask email (show only first 3 chars and domain)
 */
export function maskEmail(email) {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;
  const maskedUsername = username.length > 3 
    ? `${username.substring(0, 3)}***` 
    : username;
  return `${maskedUsername}@${domain}`;
}

/**
 * Mask phone number (show only last 4 digits)
 */
export function maskPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  return `***-****-${cleaned.slice(-4)}`;
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format year and quarter
 */
export function formatYearQuarter(year, quarter) {
  if (!year || !quarter) return '';
  const quarterMap = {
    'Q1': '1분기',
    'Q2': '2분기',
    'Q3': '3분기',
    'Q4': '4분기'
  };
  return `${year}년 ${quarterMap[quarter] || quarter}`;
}

