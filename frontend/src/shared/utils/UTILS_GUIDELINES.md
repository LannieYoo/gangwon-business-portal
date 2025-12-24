# Utils 开发规范

本文档定义了 `shared/utils` 目录下工具函数的开发标准和最佳实践。

## 目录结构

```
shared/utils/
├── index.js              # 统一导出入口
├── constants.js          # 常量定义
├── format.js             # 格式化函数
├── validation.js         # 验证函数
├── storage.js            # 存储工具
├── helpers.js            # 通用辅助函数
├── errorHandler.js       # 错误处理
└── UTILS_GUIDELINES.md

shared/logger/            # 日志模块（独立目录）
├── index.js              # 统一导出入口
├── core.js               # 日志核心：级别、格式化
├── transport.js          # 日志传输：实时上报
├── context.js            # 上下文：traceId、requestId
└── dedup.js              # 日志去重
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | camelCase | `format.js`, `helpers.js` |
| 函数名 | camelCase，动词开头 | `formatDate`, `isEmpty` |
| 常量 | UPPER_SNAKE_CASE | `API_PREFIX`, `DEFAULT_PAGE_SIZE` |

## 文件分类

### constants.js - 常量定义

```js
/**
 * Application Constants
 */

// API 配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_PREFIX = '/api/v1';

// 存储键
export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  THEME: 'theme',
  TOKEN: 'access_token'
};

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member'
};

// 分页默认值
export const DEFAULT_PAGE_SIZE = 10;
```

### format.js - 格式化函数

```js
/**
 * Formatting Utilities
 */

/**
 * Format business license number: 0000000000 -> 000-00-00000
 * @param {string} value - Raw business license number
 * @returns {string} Formatted number
 */
export function formatBusinessLicense(value) {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
}

/**
 * Format currency with thousand separators
 * @param {number|string} value - The value to format
 * @param {string} language - Language code ('ko' or 'zh')
 * @returns {string} Formatted currency
 */
export function formatCurrency(value, language = 'ko') {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  const locale = language === 'zh' ? 'zh-CN' : 'ko-KR';
  return num.toLocaleString(locale);
}
```

### validation.js - 验证函数

```js
/**
 * Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate business license number
 * @param {string} value - Business license number
 * @returns {boolean} Is valid
 */
export function isValidBusinessLicense(value) {
  if (!value) return false;
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 10;
}
```

### helpers.js - 通用辅助函数

```js
/**
 * Helper Utilities
 */

import clsx from 'clsx';

/**
 * Combine class names (wrapper for clsx)
 */
export function cn(...inputs) {
  return clsx(...inputs);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if object is empty
 * @param {any} obj - Object to check
 * @returns {boolean} Is empty
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}
```

### storage.js - 存储工具

```js
/**
 * Storage Utilities
 */

/**
 * Get value from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set value to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}
```

## 函数设计原则

### 单一职责

每个函数只做一件事：

```js
// ✅ 正确 - 单一职责
export function formatDate(date) { ... }
export function formatTime(date) { ... }
export function formatDateTime(date) { ... }

// ❌ 错误 - 职责过多
export function formatDateOrTimeOrBoth(date, type) { ... }
```

### 纯函数优先

尽量使用纯函数，避免副作用：

```js
// ✅ 正确 - 纯函数
export function formatCurrency(value) {
  return value.toLocaleString();
}

// ❌ 错误 - 有副作用
let lastValue;
export function formatCurrency(value) {
  lastValue = value;  // 副作用
  return value.toLocaleString();
}
```

### 参数默认值

提供合理的默认值：

```js
// ✅ 正确
export function formatDate(date, format = 'yyyy-MM-dd', language = 'ko') {
  // ...
}

// ❌ 错误 - 无默认值
export function formatDate(date, format, language) {
  // ...
}
```

### 空值处理

始终处理空值情况：

```js
// ✅ 正确
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '';
  // ...
}

// ❌ 错误 - 未处理空值
export function formatCurrency(value) {
  return value.toLocaleString();  // 可能报错
}
```

## JSDoc 注释

所有导出函数必须有 JSDoc 注释：

```js
/**
 * Format date string or Date object
 * 
 * @param {Date|string} date - The date to format
 * @param {string} [formatStr='yyyy-MM-dd'] - Format string
 * @param {string} [language='ko'] - Language code ('ko' or 'zh')
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate(new Date(), 'yyyy-MM-dd')  // '2024-01-15'
 * formatDate('2024-01-15', 'yyyy년 MM월 dd일', 'ko')  // '2024년 01월 15일'
 */
export function formatDate(date, formatStr = 'yyyy-MM-dd', language = 'ko') {
  // ...
}
```

## 导出规范

### 在 index.js 中导出

```js
/**
 * Utility Functions Export
 */

export * from './constants';
export * from './format';
export * from './validation';
export * from './storage';
export * from './helpers';
export { logger, LOG_LAYERS } from '@shared/logger';
```

### 命名导出

工具函数使用命名导出，不使用默认导出：

```js
// ✅ 正确 - 命名导出
export function formatDate() { ... }
export function formatCurrency() { ... }

// ❌ 错误 - 默认导出
export default {
  formatDate,
  formatCurrency
};
```

## 文件注释

每个工具文件顶部添加说明：

```js
/**
 * Formatting Utilities
 * 
 * 提供各种数据格式化函数，包括日期、货币、电话号码等。
 */
```

## Checklist

新建工具函数时确认：

- [ ] 函数名使用 camelCase
- [ ] 常量使用 UPPER_SNAKE_CASE
- [ ] 有完整的 JSDoc 注释
- [ ] 处理了空值情况
- [ ] 提供了合理的默认值
- [ ] 是纯函数（如果可能）
- [ ] 在 `index.js` 中导出
- [ ] 使用命名导出
