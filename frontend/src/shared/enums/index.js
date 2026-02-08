/**
 * 共享枚举定义
 * Shared Enums
 *
 * 数据管理规范:
 * - 此文件只存放枚举 key 值数组
 * - 翻译通过共享层 i18n 获取: enums.*
 * - 使用方式: t(`enums.industry.startupType.${key}`)
 */

// ==================== 创业类型 ====================

/**
 * 创业类型
 * 翻译键: enums.industry.startupType.*
 */
export const STARTUP_TYPES = [
  "student_startup",
  "faculty_startup",
  "women_enterprise",
  "research_institute",
  "venture_company",
  "non_venture",
  "preliminary_social_enterprise",
  "social_enterprise",
  "youth_enterprise",
  "cooperative",
  "village_enterprise",
  "other",
];

/**
 * 创业阶段
 * 翻译键: enums.industry.startupStage.*
 */
export const STARTUP_STAGES = [
  "preliminary",
  "startup_under_3years",
  "growth_over_7years",
  "restart",
];

// ==================== 地区选项 ====================

/**
 * 江原道地区
 * 翻译键: enums.industry.region.*
 */
export const REGIONS = [
  "chuncheon",
  "wonju",
  "gangneung",
  "donghae",
  "taebaek",
  "sokcho",
  "samcheok",
  "hongcheon",
  "hoengseong",
  "yeongwol",
  "pyeongchang",
  "jeongseon",
  "cheorwon",
  "hwacheon",
  "yanggu",
  "inje",
  "goseong",
  "yangyang",
  "other",
];

// ==================== 业务领域 ====================

/**
 * 业务领域 (制造业重点分类)
 * 翻译键: enums.industry.businessField.*
 */
export const BUSINESS_FIELDS = [
  "13",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
];

// ==================== KSIC 标准产业分类 ====================

/**
 * 产业大分类 (A-U)
 * 翻译键: enums.industry.ksicMajor.*
 */
export const KSIC_MAJOR_CATEGORIES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
];

/**
 * 产业中分类 (按大分类分组)
 * 翻译键: enums.industry.ksicSub.*
 */
export const KSIC_SUB_CATEGORIES = {
  A: ["01", "02", "03"],
  B: ["05", "06", "07", "08"],
  C: [
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
  ],
  D: ["35"],
  E: ["36", "37", "38", "39"],
  F: ["41", "42"],
  G: ["45", "46", "47"],
  H: ["49", "50", "51", "52"],
  I: ["55", "56"],
  J: ["58", "59", "60", "61", "62", "63"],
  K: ["64", "65", "66"],
  L: ["68"],
  M: ["70", "71", "72", "73"],
  N: ["74", "75", "76"],
  O: ["84"],
  P: ["85"],
  Q: ["86", "87"],
  R: ["90", "91"],
  S: ["94", "95", "96"],
  T: ["97", "98"],
  U: ["99"],
};

// ==================== 主力产业 KSIC 代码 ====================

/**
 * 主力产业大分类
 * 翻译键: enums.industry.mainIndustryKsic.*
 */
export const MAIN_INDUSTRY_KSIC_MAJORS = [
  "natural_bio",
  "ceramic",
  "digital_health",
];

/**
 * 主力产业细分代码 (按大分类分组)
 * 翻译键: enums.industry.mainIndustryKsicCodes.*
 */
export const MAIN_INDUSTRY_KSIC_CODES = {
  natural_bio: [
    "10501",
    "10795",
    "10797",
    "11209",
    "20422",
    "20423",
    "20499",
    "21101",
    "21102",
    "21210",
    "21220",
  ],
  ceramic: [
    "20129",
    "20412",
    "20499",
    "23129",
    "23222",
    "23311",
    "23312",
    "23993",
    "23999",
    "24113",
    "26299",
    "26429",
    "29174",
    "29271",
  ],
  digital_health: [
    "21300",
    "26299",
    "27111",
    "27112",
    "27192",
    "27199",
    "28519",
    "28909",
    "58221",
    "58222",
  ],
};

// ==================== 江原道产业分类 ====================

/**
 * 江原道 7大未来产业
 * 翻译键: enums.industry.gangwonIndustry.*
 */
export const GANGWON_FUTURE_INDUSTRIES = [
  "semiconductor",
  "bio_health",
  "future_energy",
  "future_mobility",
  "food_tech",
  "advanced_defense",
  "climate_tech",
];

/**
 * 未来有望新技术
 * 翻译键: enums.industry.futureTech.*
 */
export const FUTURE_TECHNOLOGIES = ["it", "bt", "nt", "st", "et", "ct"];

/**
 * 参与项目
 * 翻译键: enums.participationPrograms.*
 */
export const PARTICIPATION_PROGRAMS = [
  "startup_university",
  "global_glocal",
  "rise",
  "knu_tenant",
];

// ==================== 知识产权相关 ====================

/**
 * 知识产权类型
 * 翻译键: enums.ip.type.*
 */
export const IP_TYPES = [
  "patent",
  "utilityModel",
  "design",
  "trademark",
  "copyright",
];

/**
 * 知识产权注册状态
 * 翻译键: enums.ip.registrationType.*
 */
export const IP_REGISTRATION_TYPES = [
  "application",
  "registration",
  "publication",
];

/**
 * 海外申请类型
 * 翻译键: enums.ip.overseasType.*
 */
export const OVERSEAS_APPLICATION_TYPES = ["pct", "paris", "direct", "none"];

/**
 * 国家代码
 * 翻译键: enums.country.*
 */
export const COUNTRIES = ["korea", "usa", "china", "japan", "eu", "other"];

// ==================== 工具函数 ====================

/**
 * 根据大分类获取中分类
 * @param {string} majorCategory - 大分类代码 (A-U)
 * @returns {string[]} 中分类代码数组
 */
export function getSubCategoriesByMajor(majorCategory) {
  return KSIC_SUB_CATEGORIES[majorCategory] || [];
}

/**
 * 根据主力产业大分类获取细分代码
 * @param {string} majorCategory - 主力产业大分类
 * @returns {string[]} 细分代码数组
 */
export function getMainIndustryCodesByMajor(majorCategory) {
  return MAIN_INDUSTRY_KSIC_CODES[majorCategory] || [];
}

/**
 * 生成带翻译的选项数组
 * @param {string[]} keys - 枚举值数组
 * @param {string|Object} translationPrefixOrLabels - 翻译键前缀（如 'enums.industry.ksicMajor'）或预定义的翻译映射对象
 * @param {Function} t - i18n 翻译函数
 * @returns {Array<{value: string, label: string}>}
 * @example
 * // 使用动态前缀（不推荐）
 * getTranslatedOptions(['pending', 'approved'], 'common.status', t);
 * // 使用静态映射（推荐）
 * getTranslatedOptions(['pending', 'approved'], { pending: t('common.status.pending'), approved: t('common.status.approved') }, t);
 */
export function getTranslatedOptions(keys, translationPrefixOrLabels, t) {
  if (typeof translationPrefixOrLabels === "object") {
    // 使用预定义的翻译映射（推荐）
    return keys.map((key) => ({
      value: key,
      label: translationPrefixOrLabels[key] || key,
    }));
  }
  // 兼容旧的动态前缀方式
  return keys.map((key) => ({
    value: key,
    label: t(`${translationPrefixOrLabels}.${key}`, key),
  }));
}

/**
 * 根据 value 获取翻译后的标签
 * @param {string} value - 枚举值
 * @param {string|Object} translationPrefixOrLabels - 翻译键前缀或预定义的翻译映射对象
 * @param {Function} t - i18n 翻译函数
 * @returns {string}
 * @example
 * // 使用动态前缀（不推荐）
 * getTranslatedLabel('pending', 'common.status', t);
 * // 使用静态映射（推荐）
 * getTranslatedLabel('pending', { pending: t('common.status.pending'), approved: t('common.status.approved') }, t);
 */
export function getTranslatedLabel(value, translationPrefixOrLabels, t) {
  if (typeof translationPrefixOrLabels === "object") {
    // 使用预定义的翻译映射（推荐）
    return translationPrefixOrLabels[value] || value;
  }
  // 兼容旧的动态前缀方式
  return t(`${translationPrefixOrLabels}.${value}`, value);
}

// ==================== 归一化工具函数 ====================

/**
 * 韩语创业类型到英文代码的映射
 * 用于将数据库中存储的韩语值归一化为代码
 */
const STARTUP_TYPE_KO_TO_CODE = {
  "학생 창업": "student_startup",
  학생창업: "student_startup",
  "교원 창업": "faculty_startup",
  교원창업: "faculty_startup",
  "여성 기업": "women_enterprise",
  여성기업: "women_enterprise",
  "연구소 기업": "research_institute",
  연구소기업: "research_institute",
  "벤처 기업": "venture_company",
  벤처기업: "venture_company",
  "비벤처 기업": "non_venture",
  비벤처기업: "non_venture",
  "예비 사회적기업": "preliminary_social_enterprise",
  예비사회적기업: "preliminary_social_enterprise",
  사회적기업: "social_enterprise",
  "청년 기업": "youth_enterprise",
  청년기업: "youth_enterprise",
  협동조합: "cooperative",
  마을기업: "village_enterprise",
  기타: "other",
};

/**
 * 归一化创业类型值
 * 将韩语值转换为英文代码，以便正确翻译
 * @param {string} value - 原始创业类型值（可能是英文代码或韩语）
 * @returns {string} 归一化后的英文代码
 */
export function normalizeStartupType(value) {
  if (!value) return value;
  // 如果已经是英文代码，直接返回
  if (STARTUP_TYPES.includes(value)) {
    return value;
  }
  // 尝试从韩语映射
  return STARTUP_TYPE_KO_TO_CODE[value] || value;
}
