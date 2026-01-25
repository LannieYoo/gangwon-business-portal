/**
 * i18n Configuration
 *
 * 翻译文件从各 feature 模块的 locales 目录导入并合并。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Shared locales (common translations)
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";

// Feature locales - about
import aboutKo from "../../features/about/locales/ko.json";
import aboutZh from "../../features/about/locales/zh.json";

// Feature locales - auth
import authKo from "../../features/auth/locales/ko.json";
import authZh from "../../features/auth/locales/zh.json";

// Feature locales - home
import homeKo from "../../features/home/locales/ko.json";
import homeZh from "../../features/home/locales/zh.json";

// Feature locales - performance
import performanceKo from "../../features/performance/locales/ko.json";
import performanceZh from "../../features/performance/locales/zh.json";

// Feature locales - projects
import projectsKo from "../../features/projects/locales/ko.json";
import projectsZh from "../../features/projects/locales/zh.json";

// Feature locales - support
import supportKo from "../../features/support/locales/ko.json";
import supportZh from "../../features/support/locales/zh.json";

// Member Layouts locales
import layoutKo from "../../member/layouts/locales/ko.json";
import layoutZh from "../../member/layouts/locales/zh.json";

// Helper to safely merge locales (shallow deep merge for top-level objects)
const safeMerge = (...locales) => {
  const result = {};
  locales.forEach((locale) => {
    Object.keys(locale).forEach((key) => {
      if (
        typeof locale[key] === "object" &&
        locale[key] !== null &&
        !Array.isArray(locale[key])
      ) {
        result[key] = { ...(result[key] || {}), ...locale[key] };
      } else {
        result[key] = locale[key];
      }
    });
  });
  return result;
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
