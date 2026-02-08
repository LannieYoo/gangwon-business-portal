/**
 * Performance Module Enums
 *
 * 成果管理模块枚举定义
 * 从共享枚举导入，翻译通过 useEnumTranslation hook 获取
 * 翻译键: enums.ip.*, enums.country.*, enums.industry.*
 */

// 知识产权相关
export {
  IP_TYPES,
  IP_REGISTRATION_TYPES,
  OVERSEAS_APPLICATION_TYPES,
  COUNTRIES,
} from "@/shared/enums";

// 产业分类相关
export {
  // 创业类型
  STARTUP_TYPES as STARTUP_TYPE_KEYS,
  STARTUP_STAGES as STARTUP_STAGE_KEYS,
  // KSIC 分类
  KSIC_MAJOR_CATEGORIES as KSIC_MAJOR_CATEGORY_KEYS,
  getSubCategoriesByMajor as getSubCategoryKeysByMajor,
  // 业务领域
  BUSINESS_FIELDS as BUSINESS_FIELD_KEYS,
  // 主力产业
  MAIN_INDUSTRY_KSIC_MAJORS as MAIN_INDUSTRY_KSIC_MAJOR_KEYS,
  getMainIndustryCodesByMajor as getMainIndustryKsicCodesByMajor,
  // 江原道产业
  GANGWON_FUTURE_INDUSTRIES,
  FUTURE_TECHNOLOGIES,
} from "@/shared/enums";
