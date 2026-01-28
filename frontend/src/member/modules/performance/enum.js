/**
 * Industry Classification Enums
 *
 * 韩国标准产业分类 (KSIC) 第10次修订版相关枚举。
 * 
 * ⚠️ 重要: 此文件已废弃，请从统一数据源导入
 * 统一数据源: frontend/src/shared/data/industryClassification.js
 * 
 * 迁移指南:
 * - 旧: import { STARTUP_TYPE_KEYS } from './enum'
 * - 新: import { STARTUP_TYPE_KEYS } from '@/shared/data/industryClassification'
 */

// 从统一数据源重新导出，保持向后兼容
export {
  STARTUP_TYPE_KEYS,
  STARTUP_STAGE_KEYS,
  BUSINESS_FIELD_KEYS,
  KSIC_MAJOR_CATEGORY_KEYS,
  KSIC_SUB_CATEGORY_KEYS,
  MAIN_INDUSTRY_KSIC_MAJOR_KEYS,
  MAIN_INDUSTRY_KSIC_CODES,
  getSubCategoryKeysByMajor,
  getMainIndustryKsicCodesByMajor,
  translateOptions
} from '@/shared/data/industryClassification';

/**
 * 知识产权类型枚举
 */
export const IP_TYPE_KEYS = {
  PATENT: 'patent',
  UTILITY_MODEL: 'utilityModel',
  DESIGN: 'design',
  TRADEMARK: 'trademark',
  COPYRIGHT: 'copyright'
};

/**
 * 知识产权注册状态枚举
 */
export const IP_REGISTRATION_TYPE_KEYS = {
  APPLICATION: 'application',
  REGISTRATION: 'registration',
  PUBLICATION: 'publication'
};

/**
 * 国家代码枚举
 */
export const COUNTRY_KEYS = {
  KOREA: 'korea',
  USA: 'usa',
  CHINA: 'china',
  JAPAN: 'japan',
  EU: 'eu',
  OTHER: 'other'
};

/**
 * 海外申请类型枚举
 */
export const OVERSEAS_APPLICATION_TYPE_KEYS = {
  PCT: 'pct',
  PARIS: 'paris',
  DIRECT: 'direct',
  NONE: 'none'
};
