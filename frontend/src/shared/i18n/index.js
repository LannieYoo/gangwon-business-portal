/**
 * i18n Configuration
 *
 * 翻译文件从各 feature 模块的 locales 目录导入并合并。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Shared locales (common translations) - now split into modular files
import ko from "./locales/ko";
import zh from "./locales/zh";

// Feature locales - about
import aboutKo from "../../member/modules/about/locales/ko.json";
import aboutZh from "../../member/modules/about/locales/zh.json";

// Feature locales - auth
import authKo from "../../member/modules/auth/locales/ko.json";
import authZh from "../../member/modules/auth/locales/zh.json";

// Feature locales - home
import homeKo from "../../member/modules/home/locales/ko.json";
import homeZh from "../../member/modules/home/locales/zh.json";

// Feature locales - performance
import performanceKo from "../../member/modules/performance/locales/ko.json";
import performanceZh from "../../member/modules/performance/locales/zh.json";

// Feature locales - projects
import projectsKo from "../../member/modules/projects/locales/ko.json";
import projectsZh from "../../member/modules/projects/locales/zh.json";

// Feature locales - support
import supportKo from "../../member/modules/support/locales/ko.json";
import supportZh from "../../member/modules/support/locales/zh.json";

// Member Layouts locales
import layoutKo from "../../member/layouts/locales/ko.json";
import layoutZh from "../../member/layouts/locales/zh.json";

// Admin locales
import adminLayoutKo from "../../admin/layouts/locales/ko.json";
import adminLayoutZh from "../../admin/layouts/locales/zh.json";
import adminAuthKo from "../../admin/modules/auth/locales/ko.json";
import adminAuthZh from "../../admin/modules/auth/locales/zh.json";
import adminContentKo from "../../admin/modules/content/locales/ko.json";
import adminContentZh from "../../admin/modules/content/locales/zh.json";
import adminDashboardKo from "../../admin/modules/dashboard/locales/ko.json";
import adminDashboardZh from "../../admin/modules/dashboard/locales/zh.json";
import adminMembersKo from "../../admin/modules/members/locales/ko.json";
import adminMembersZh from "../../admin/modules/members/locales/zh.json";
import adminMessagesKo from "../../admin/modules/messages/locales/ko.json";
import adminMessagesZh from "../../admin/modules/messages/locales/zh.json";
import adminPerformanceKo from "../../admin/modules/performance/locales/ko.json";
import adminPerformanceZh from "../../admin/modules/performance/locales/zh.json";
import adminProjectsKo from "../../admin/modules/projects/locales/ko.json";
import adminProjectsZh from "../../admin/modules/projects/locales/zh.json";
import adminStatisticsKo from "../../admin/modules/statistics/locales/ko.json";
import adminStatisticsZh from "../../admin/modules/statistics/locales/zh.json";

// Helper to deeply merge locales recursively
const deepMerge = (target, source) => {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      // 递归深度合并对象
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      // 直接覆盖原始值、数组或其他类型
      result[key] = sourceValue;
    }
  });

  return result;
};

// Helper to safely merge locales (deep merge for all nested objects)
const safeMerge = (...locales) => {
  return locales.reduce((result, locale) => {
    if (!locale) return result;
    return deepMerge(result, locale);
  }, {});
};

const resources = {
  ko: {
    translation: safeMerge(
      ko,
      aboutKo,
      authKo,
      homeKo,
      performanceKo,
      projectsKo,
      supportKo,
      layoutKo,
      adminLayoutKo,
      adminAuthKo,
      adminContentKo,
      adminDashboardKo,
      adminMembersKo,
      adminMessagesKo,
      adminPerformanceKo,
      adminProjectsKo,
      adminStatisticsKo,
    ),
  },
  zh: {
    translation: safeMerge(
      zh,
      aboutZh,
      authZh,
      homeZh,
      performanceZh,
      projectsZh,
      supportZh,
      layoutZh,
      adminLayoutZh,
      adminAuthZh,
      adminContentZh,
      adminDashboardZh,
      adminMembersZh,
      adminMessagesZh,
      adminPerformanceZh,
      adminProjectsZh,
      adminStatisticsZh,
    ),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko",
    fallbackLng: "ko",
    supportedLngs: ["ko", "zh"],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
      excludeCacheFor: ["cimode"],
    },
  });

export default i18n;
