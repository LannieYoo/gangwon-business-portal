/**
 * i18n Configuration
 * 
 * Structure:
 * - Shared locales: Global translations (common, errors, etc.)
 * - Module locales: Module-specific translations (auth, dashboard, etc.)
 * 
 * Modules should export their locales and import them here.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Shared locales
import koShared from './locales/ko.json';
import zhShared from './locales/zh.json';

// Module locales
import authKo from '@member/modules/auth/locales/ko.json';
import authZh from '@member/modules/auth/locales/zh.json';

// Deep merge function to combine translations
const deepMerge = (target, source) => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
};

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Merge all translations
const resources = {
  ko: {
    translation: deepMerge(koShared, authKo)
  },
  zh: {
    translation: deepMerge(zhShared, authZh)
  }
};

i18n
  .use(LanguageDetector) // 检测浏览器语言
  .use(initReactI18next) // 绑定 react-i18next
  .init({
    resources,
    fallbackLng: 'ko', // 默认语言
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false // React 已经安全处理
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

