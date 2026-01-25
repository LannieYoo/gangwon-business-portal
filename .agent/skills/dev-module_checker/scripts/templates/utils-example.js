/**
 * Utils 理想代码示例
 * 纯函数、无副作用、处理边界情况
 */

// ============================================
// Formatters - 格式化
// ============================================

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
}

// 格式化货币
export function formatCurrency(amount, locale = 'ko-KR') {
  if (amount == null || isNaN(amount)) return '';
  return new Intl.NumberFormat(locale).format(amount);
}

// ============================================
// Validators - 验证
// ============================================

// 验证邮箱格式
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 检查是否为空值
export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// ============================================
// Transformers - 转换
// ============================================

// 对象转查询字符串
export function toQueryString(params) {
  if (!params) return '';
  return Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

// 安全解析 JSON
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// ============================================
// Collections - 集合
// ============================================

// 按 key 分组
export function groupBy(arr, key) {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((acc, item) => {
    const k = item[key];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

// 从对象中选取指定 key
export function pick(obj, keys) {
  if (!obj) return {};
  return keys.reduce((acc, k) => {
    if (k in obj) acc[k] = obj[k];
    return acc;
  }, {});
}

// ============================================
// Performance - 性能
// ============================================

// 防抖函数
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 节流函数
export function throttle(fn, limit = 300) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
