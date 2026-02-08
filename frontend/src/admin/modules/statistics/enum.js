/**
 * 统计报告模块 - 枚举和常量定义
 * Statistics Report Module - Enums and Constants
 *
 * 基于术语表: docs/terminology/statistics_report_terminology.md
 * 命名规范:
 * - 常量: UPPER_SNAKE_CASE
 * - 枚举对象: UPPER_SNAKE_CASE
 * - 枚举值: snake_case（与后端保持一致）
 */

// ==================== API 配置 ====================

/**
 * API 前缀
 */
export const API_PREFIX = "/api";

/**
 * 统计报告 API 端点
 */
export const STATISTICS_API = {
  /** 查询统计数据 - GET */
  REPORT: `${API_PREFIX}/admin/statistics/report`,
  /** 导出 Excel - GET */
  EXPORT: `${API_PREFIX}/admin/statistics/export`,
};

// ==================== 时间维度 ====================

/**
 * 时间维度
 * Time Dimensions
 *
 * @enum {string}
 */
export const TIME_DIMENSION = {
  /** 年度 (연도별) */
  YEAR: "year",
  /** 季度 (분기별) */
  QUARTER: "quarter",
  /** 月份 (월별) */
  MONTH: "month",
};

/**
 * 季度选项 (1-4)
 */
export const QUARTER_OPTIONS = [
  { value: 1, label: "1분기" },
  { value: 2, label: "2분기" },
  { value: 3, label: "3분기" },
  { value: 4, label: "4분기" },
];

/**
 * 月份选项 (1-12)
 */
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}));

// ==================== 创业阶段 ====================

/**
 * 创业阶段
 * Startup Stages
 *
 * @enum {string}
 */
export const STARTUP_STAGE = {
  /** 预备创业 (예비창업) */
  PRE_STARTUP: "pre_startup",
  /** 初创期 (초기) */
  INITIAL: "initial",
  /** 成长期 (성장) */
  GROWTH: "growth",
  /** 跳跃期 (도약) */
  LEAP: "leap",
  /** 再创业 (재창업) */
  RE_STARTUP: "re_startup",
};

/**
 * 创业阶段选项列表（使用共享 enums 翻译）
 */
export const STARTUP_STAGE_OPTIONS = [
  {
    value: STARTUP_STAGE.PRE_STARTUP,
    labelKey: "enums.industry.startupStage.preliminary",
  },
  {
    value: STARTUP_STAGE.INITIAL,
    labelKey: "enums.industry.startupStage.startupUnder3Years",
  },
  {
    value: STARTUP_STAGE.GROWTH,
    labelKey: "enums.industry.startupStage.growthOver7Years",
  },
  {
    value: STARTUP_STAGE.LEAP,
    labelKey: "enums.industry.startupStage.growthOver7Years", // 跃进期也使用成长期翻译
  },
  {
    value: STARTUP_STAGE.RE_STARTUP,
    labelKey: "enums.industry.startupStage.restart",
  },
];

// ==================== 政策关联项目 ====================

/**
 * 政策关联标签 (Policy Tags)
 *
 * @enum {string}
 */
export const POLICY_TAGS = {
  /** 创业中心大学 (창업중심대학) */
  STARTUP_UNIVERSITY: "startup_university",
  /** 全球/成长事业 (글로벌·글로컬 사업) */
  GLOBAL_GLOCAL: "global_glocal",
  /** RISE 事业团 (RISE 사업단) */
  RISE: "rise",
};

/**
 * 江原道重点产业
 * Gangwon Province Key Industries
 */
export const GANGWON_INDUSTRIES = {
  NATURAL_BIO: "natural_bio",
  CERAMIC: "ceramic",
  DIGITAL_HEALTH: "digital_health",
};

/**
 * 江原道重点产业选项
 * 从共享枚举导入: MAIN_INDUSTRY_KSIC_MAJORS
 * 翻译键: enums.industry.mainIndustryKsic.*
 */
import { MAIN_INDUSTRY_KSIC_MAJORS } from "@/shared/enums";
export const GANGWON_INDUSTRY_OPTIONS = MAIN_INDUSTRY_KSIC_MAJORS;

/**
 * 创业类型选项 (与会员模块同步)
 * 从共享枚举导入: STARTUP_TYPES
 * 翻译键: enums.industry.startupType.*
 */
import { STARTUP_TYPES } from "@/shared/enums";
export const STARTUP_TYPE_OPTIONS = STARTUP_TYPES;

/**
 * 业务领域选项 (Business Field)
 * 从共享枚举导入: BUSINESS_FIELDS
 * 翻译键: enums.industry.businessField.*
 */
import { BUSINESS_FIELDS } from "@/shared/enums";
export const BUSINESS_FIELD_OPTIONS = BUSINESS_FIELDS;

/**
 * 标准产业分类 (KSIC-大分类)
 * 从共享枚举导入: KSIC_MAJOR_CATEGORIES
 * 翻译键: enums.industry.ksicMajor.*
 */
import { KSIC_MAJOR_CATEGORIES } from "@/shared/enums";
export const MAJOR_INDUSTRY_OPTIONS = KSIC_MAJOR_CATEGORIES;

/**
 * 政策关联选项列表
 */
export const POLICY_TAGS_OPTIONS = [
  {
    value: POLICY_TAGS.STARTUP_UNIVERSITY,
    labelKey: "admin.statistics.filters.programs.university", // 匹配韩国语原文：창업중심대학
  },
  {
    value: POLICY_TAGS.GLOBAL_GLOCAL,
    labelKey: "admin.statistics.filters.programs.global", // 匹配韩国语原文：글로벌사업
  },
  {
    value: POLICY_TAGS.RISE,
    labelKey: "admin.statistics.filters.programs.rise", // 匹配韩国语原文：RISE 사업단
  },
];

// ==================== 投资情况 ====================

/**
 * 投资引进与否
 * Investment Status
 *
 * @enum {string}
 */
export const INVESTMENT_STATUS = {
  /** 是 (예) */
  YES: "yes",
  /** 否 (아니오) */
  NO: "no",
  /** 全部 (전체) */
  ALL: "all",
};

/**
 * 投资状态选项列表
 */
export const INVESTMENT_STATUS_OPTIONS = [
  {
    value: INVESTMENT_STATUS.ALL,
    labelKey: "admin.statistics.filters.investment.all",
  },
  {
    value: INVESTMENT_STATUS.YES,
    labelKey: "admin.statistics.filters.investment.yes",
  },
  {
    value: INVESTMENT_STATUS.NO,
    labelKey: "admin.statistics.filters.investment.no",
  },
];

/**
 * 投资引进额预设范围
 * Investment Amount Ranges
 *
 * 单位：万元（韩元万位）
 * null 表示无上限
 */
export const INVESTMENT_RANGES = {
  /** 1000万以上 (1천만원 이상) */
  RANGE_1000: {
    min: 1000,
    max: null,
    labelKey: "admin.statistics.filters.investment.range1000",
  },
  /** 5000万以上 (5천만원 이상) */
  RANGE_5000: {
    min: 5000,
    max: null,
    labelKey: "admin.statistics.filters.investment.range5000",
  },
  /** 1亿以上 (1억원 이상) */
  RANGE_10000: {
    min: 10000,
    max: null,
    labelKey: "admin.statistics.filters.investment.range10000",
  },
};

/**
 * 投资范围选项列表
 */
export const INVESTMENT_RANGES_OPTIONS = [
  { value: "RANGE_1000", ...INVESTMENT_RANGES.RANGE_1000 },
  { value: "RANGE_5000", ...INVESTMENT_RANGES.RANGE_5000 },
  { value: "RANGE_10000", ...INVESTMENT_RANGES.RANGE_10000 },
];

// ==================== 专利持有数量 ====================

/**
 * 专利持有数量预设范围
 * Patent Count Ranges
 *
 * null 表示无上限
 */
export const PATENT_RANGES = {
  /** 1个以上 (1개 이상) */
  RANGE_1: {
    min: 1,
    max: null,
    labelKey: "admin.statistics.filters.patent.range1",
  },
  /** 3个以上 (3개 이상) */
  RANGE_3: {
    min: 3,
    max: null,
    labelKey: "admin.statistics.filters.patent.range3",
  },
  /** 5个以上 (5개 이상) */
  RANGE_5: {
    min: 5,
    max: null,
    labelKey: "admin.statistics.filters.patent.range5",
  },
  /** 10个以上 (10개 이상) */
  RANGE_10: {
    min: 10,
    max: null,
    labelKey: "admin.statistics.filters.patent.range10",
  },
};

/**
 * 专利范围选项列表
 */
export const PATENT_RANGES_OPTIONS = [
  { value: "RANGE_1", ...PATENT_RANGES.RANGE_1 },
  { value: "RANGE_3", ...PATENT_RANGES.RANGE_3 },
  { value: "RANGE_5", ...PATENT_RANGES.RANGE_5 },
  { value: "RANGE_10", ...PATENT_RANGES.RANGE_10 },
];

// ==================== 性别 ====================

/**
 * 性别
 * Gender
 *
 * @enum {string}
 */
export const GENDER = {
  /** 男 (남성) */
  MALE: "male",
  /** 女 (여성) */
  FEMALE: "female",
};

/**
 * 性别选项列表
 */
export const GENDER_OPTIONS = [
  {
    value: GENDER.MALE,
    labelKey: "admin.statistics.filters.representative.male",
  },
  {
    value: GENDER.FEMALE,
    labelKey: "admin.statistics.filters.representative.female",
  },
];

// ==================== 年营收区间 ====================

/**
 * 年营收区间选项
 * Annual Revenue Range Options
 *
 * 单位：韩元 (₩)
 */
export const REVENUE_RANGE_OPTIONS = [
  {
    value: "under_100m",
    labelKey: "admin.statistics.filters.quantitive.revenueRange.under100m",
    min: null,
    max: 100000000,
  },
  {
    value: "100m_500m",
    labelKey: "admin.statistics.filters.quantitive.revenueRange.100m500m",
    min: 100000000,
    max: 500000000,
  },
  {
    value: "500m_1b",
    labelKey: "admin.statistics.filters.quantitive.revenueRange.500m1b",
    min: 500000000,
    max: 1000000000,
  },
  {
    value: "1b_5b",
    labelKey: "admin.statistics.filters.quantitive.revenueRange.1b5b",
    min: 1000000000,
    max: 5000000000,
  },
  {
    value: "5b_10b",
    labelKey: "admin.statistics.filters.quantitive.revenueRange.5b10b",
    min: 5000000000,
    max: 10000000000,
  },
  {
    value: "over_10b",
    labelKey: "admin.statistics.filters.quantitive.revenueRange.over10b",
    min: 10000000000,
    max: null,
  },
];

// ==================== 员工人数区间 ====================

/**
 * 员工人数区间选项
 * Employee Count Range Options
 */
export const EMPLOYEE_RANGE_OPTIONS = [
  {
    value: "under_5",
    labelKey: "admin.statistics.filters.quantitive.employeeRange.under5",
    min: null,
    max: 5,
  },
  {
    value: "5_10",
    labelKey: "admin.statistics.filters.quantitive.employeeRange.5to10",
    min: 5,
    max: 10,
  },
  {
    value: "10_30",
    labelKey: "admin.statistics.filters.quantitive.employeeRange.10to30",
    min: 10,
    max: 30,
  },
  {
    value: "30_50",
    labelKey: "admin.statistics.filters.quantitive.employeeRange.30to50",
    min: 30,
    max: 50,
  },
  {
    value: "50_100",
    labelKey: "admin.statistics.filters.quantitive.employeeRange.50to100",
    min: 50,
    max: 100,
  },
  {
    value: "100_300",
    labelKey: "admin.statistics.filters.quantitive.employeeRange.100to300",
    min: 100,
    max: 300,
  },
  {
    value: "over_300",
    labelKey: "admin.statistics.filters.quantitive.employeeRange.over300",
    min: 300,
    max: null,
  },
];

// ==================== 年龄段区间 ====================

/**
 * 年龄段区间选项
 * Age Range Options
 */
export const AGE_RANGE_OPTIONS = [
  {
    value: "under_20",
    labelKey: "admin.statistics.filters.representative.ageRange.under20",
    min: null,
    max: 20,
  },
  {
    value: "20_29",
    labelKey: "admin.statistics.filters.representative.ageRange.20to29",
    min: 20,
    max: 29,
  },
  {
    value: "30_39",
    labelKey: "admin.statistics.filters.representative.ageRange.30to39",
    min: 30,
    max: 39,
  },
  {
    value: "40_49",
    labelKey: "admin.statistics.filters.representative.ageRange.40to49",
    min: 40,
    max: 49,
  },
  {
    value: "50_59",
    labelKey: "admin.statistics.filters.representative.ageRange.50to59",
    min: 50,
    max: 59,
  },
  {
    value: "over_60",
    labelKey: "admin.statistics.filters.representative.ageRange.over60",
    min: 60,
    max: null,
  },
];

// ==================== 工龄范围 ====================

/**
 * 企业工龄范围
 * Work Years Ranges
 *
 * null 表示无上限
 */
export const WORK_YEARS = {
  /** 3年以下 (3년 이하) */
  UNDER_3: {
    min: 0,
    max: 3,
    labelKey: "admin.statistics.filters.workYears.under3",
  },
  /** 3-7年 (3-7년) */
  RANGE_3_7: {
    min: 3,
    max: 7,
    labelKey: "admin.statistics.filters.workYears.range37",
  },
  /** 7年以上 (7년 이상) */
  OVER_7: {
    min: 7,
    max: null,
    labelKey: "admin.statistics.filters.workYears.over7",
  },
};

/**
 * 江原道地区选项
 * Gangwon Province Regions (7 cities + 11 counties)
 * 使用 enums.regions 翻译键以保持一致性
 */
export const LOCATION_OPTIONS = [
  // 市 (Cities)
  { value: "chuncheon", labelKey: "enums.regions.chuncheon" },
  { value: "wonju", labelKey: "enums.regions.wonju" },
  { value: "gangneung", labelKey: "enums.regions.gangneung" },
  { value: "donghae", labelKey: "enums.regions.donghae" },
  { value: "taebaek", labelKey: "enums.regions.taebaek" },
  { value: "sokcho", labelKey: "enums.regions.sokcho" },
  { value: "samcheok", labelKey: "enums.regions.samcheok" },
  // 郡 (Counties)
  { value: "hongcheon", labelKey: "enums.regions.hongcheon" },
  { value: "hoengseong", labelKey: "enums.regions.hoengseong" },
  { value: "yeongwol", labelKey: "enums.regions.yeongwol" },
  { value: "pyeongchang", labelKey: "enums.regions.pyeongchang" },
  { value: "jeongseon", labelKey: "enums.regions.jeongseon" },
  { value: "cheorwon", labelKey: "enums.regions.cheorwon" },
  { value: "hwacheon", labelKey: "enums.regions.hwacheon" },
  { value: "yanggu", labelKey: "enums.regions.yanggu" },
  { value: "inje", labelKey: "enums.regions.inje" },
  { value: "goseong", labelKey: "enums.regions.goseong" },
  { value: "yangyang", labelKey: "enums.regions.yangyang" },
];

/**
 * 江原道7大未来产业选项
 * Gangwon 7 Future Industries
 * 从共享枚举导入: GANGWON_FUTURE_INDUSTRIES
 * 翻译键: enums.industry.gangwonIndustry.*
 */
import { GANGWON_FUTURE_INDUSTRIES, FUTURE_TECHNOLOGIES } from "@/shared/enums";
export const GANGWON_FUTURE_INDUSTRY_OPTIONS = GANGWON_FUTURE_INDUSTRIES;

/**
 * 未来有望新技术选项
 * Future Promising Technologies
 * 从共享枚举导入: FUTURE_TECHNOLOGIES
 * 翻译键: enums.industry.futureTech.*
 */
export const FUTURE_TECHNOLOGY_OPTIONS = FUTURE_TECHNOLOGIES;

/**
 * 工龄范围选项列表
 */
export const WORK_YEARS_OPTIONS = [
  { value: "UNDER_3", ...WORK_YEARS.UNDER_3 },
  { value: "RANGE_3_7", ...WORK_YEARS.RANGE_3_7 },
  { value: "OVER_7", ...WORK_YEARS.OVER_7 },
];

// ==================== 排序字段 ====================

/**
 * 排序字段
 * Sort Fields
 *
 * @enum {string}
 */
export const SORT_FIELD = {
  /** 企业名称 */
  ENTERPRISE_NAME: "enterprise_name",
  /** 投资金额 */
  TOTAL_INVESTMENT: "total_investment",
  /** 专利数量 */
  PATENT_COUNT: "patent_count",
  /** 营收 */
  ANNUAL_REVENUE: "annual_revenue",
};

/**
 * 排序方向
 * Sort Order
 *
 * @enum {string}
 */
export const SORT_ORDER = {
  /** 升序 */
  ASC: "asc",
  /** 降序 */
  DESC: "desc",
};

/**
 * 排序选项列表
 */
export const SORT_FIELD_OPTIONS = [
  {
    value: SORT_FIELD.ENTERPRISE_NAME,
    labelKey: "admin.statistics.sort.companyName",
  },
  {
    value: SORT_FIELD.TOTAL_INVESTMENT,
    labelKey: "admin.statistics.sort.investment",
  },
  {
    value: SORT_FIELD.PATENT_COUNT,
    labelKey: "admin.statistics.sort.patentCount",
  },
  {
    value: SORT_FIELD.ANNUAL_REVENUE,
    labelKey: "admin.statistics.sort.revenue",
  },
];

// ==================== 分页配置 ====================

/**
 * 分页默认配置
 */
export const PAGINATION_CONFIG = {
  /** 默认页码 */
  DEFAULT_PAGE: 1,
  /** 默认每页数量 */
  DEFAULT_LIMIT: 20,
  /** 最大每页数量 */
  MAX_LIMIT: 100,
  /** 每页数量选项 */
  LIMIT_OPTIONS: [10, 20, 50, 100],
};

// ==================== 表格列字段 ====================

/**
 * 表格列字段映射
 * 顺序与筛选器保持一致
 */
export const TABLE_COLUMNS = {
  // 时间维度
  YEAR: "year",
  QUARTER: "quarter",
  MONTH: "month",

  // 基本信息
  BUSINESS_REG_NO: "businessRegNo",
  ENTERPRISE_NAME: "enterpriseName",

  // 快速筛选组
  POLICY_TAGS: "policyTags",

  // 企业特征组
  KSIC_MAJOR: "ksicMajor",
  KSIC_SUB: "ksicSub",
  GANGWON_INDUSTRY: "gangwonIndustry",
  GANGWON_INDUSTRY_SUB: "gangwonIndustrySub",
  GANGWON_FUTURE_INDUSTRY: "gangwonFutureIndustry",
  FUTURE_TECH: "futureTech",
  WORK_YEARS: "workYears",
  STARTUP_STAGE: "startupStage",
  REGION: "region",

  // 经营指标组
  TOTAL_INVESTMENT: "totalInvestment",
  ANNUAL_REVENUE: "annualRevenue",
  EXPORT_AMOUNT: "exportAmount",
  EMPLOYEE_COUNT: "employeeCount",
  PATENT_COUNT: "patentCount",

  // 代表者信息组
  REPRESENTATIVE_GENDER: "representativeGender",
  REPRESENTATIVE_AGE: "representativeAge",
};

/**
 * 表格列配置
 * 顺序与筛选器保持一致
 */
export const TABLE_COLUMN_CONFIGS = [
  // 时间维度
  {
    key: TABLE_COLUMNS.YEAR,
    labelKey: "admin.statistics.table.year",
    width: 80,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.QUARTER,
    labelKey: "admin.statistics.table.quarter",
    width: 80,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.MONTH,
    labelKey: "admin.statistics.table.month",
    width: 70,
    align: "center",
  },

  // 基本信息
  {
    key: TABLE_COLUMNS.BUSINESS_REG_NO,
    labelKey: "admin.statistics.table.businessRegNo",
    width: 130,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.ENTERPRISE_NAME,
    labelKey: "admin.statistics.table.enterpriseName",
    width: 180,
    align: "center",
  },

  // 快速筛选组
  {
    key: TABLE_COLUMNS.POLICY_TAGS,
    labelKey: "admin.statistics.table.programs",
    width: 140,
    align: "center",
  },

  // 企业特征组
  {
    key: TABLE_COLUMNS.KSIC_MAJOR,
    labelKey: "admin.statistics.table.ksicMajor",
    width: 150,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.KSIC_SUB,
    labelKey: "admin.statistics.table.ksicSub",
    width: 150,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.GANGWON_INDUSTRY,
    labelKey: "admin.statistics.table.gangwonIndustry",
    width: 150,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.GANGWON_INDUSTRY_SUB,
    labelKey: "admin.statistics.table.gangwonIndustrySub",
    width: 150,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.GANGWON_FUTURE_INDUSTRY,
    labelKey: "admin.statistics.table.gangwonFutureIndustry",
    width: 150,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.FUTURE_TECH,
    labelKey: "admin.statistics.table.futureTech",
    width: 150,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.WORK_YEARS,
    labelKey: "admin.statistics.table.workYears",
    width: 90,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.STARTUP_STAGE,
    labelKey: "admin.statistics.table.startupStage",
    width: 100,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.REGION,
    labelKey: "admin.statistics.table.region",
    width: 120,
    align: "center",
  },

  // 经营指标组
  {
    key: TABLE_COLUMNS.TOTAL_INVESTMENT,
    labelKey: "admin.statistics.table.investmentAmount",
    width: 110,
    align: "right",
  },
  {
    key: TABLE_COLUMNS.ANNUAL_REVENUE,
    labelKey: "admin.statistics.table.revenue",
    width: 110,
    align: "right",
  },
  {
    key: TABLE_COLUMNS.EXPORT_AMOUNT,
    labelKey: "admin.statistics.table.exportAmount",
    width: 110,
    align: "right",
  },
  {
    key: TABLE_COLUMNS.EMPLOYEE_COUNT,
    labelKey: "admin.statistics.table.employeeCount",
    width: 80,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.PATENT_COUNT,
    labelKey: "admin.statistics.table.patentCount",
    width: 70,
    align: "center",
  },

  // 代表者信息组
  {
    key: TABLE_COLUMNS.REPRESENTATIVE_GENDER,
    labelKey: "admin.statistics.table.representativeGender",
    width: 80,
    align: "center",
  },
  {
    key: TABLE_COLUMNS.REPRESENTATIVE_AGE,
    labelKey: "admin.statistics.table.representativeAge",
    width: 80,
    align: "center",
  },
];

// ==================== 导出配置 ====================

/**
 * Excel 导出配置
 */
export const EXPORT_CONFIG = {
  /** 文件名前缀 */
  FILE_PREFIX: "statistics_report",
  /** 文件扩展名 */
  FILE_EXT: ".xlsx",
  /** 工作表名称 */
  SHEET_NAME: "Statistics Report",
};

// ==================== 默认查询参数 ====================

/**
 * 后端支持的查询参数 (与 backend/src/modules/statistics/schemas.py StatisticsQuery 对齐)
 *
 * 重要：此对象的字段必须与后端 StatisticsQuery 完全一致
 * 前端 camelCase -> 后端 snake_case 由 api.service.js 自动转换
 */
export const DEFAULT_QUERY_PARAMS = {
  // 时间维度
  year: null,
  quarter: null,
  month: null,

  // 产业筛选 - 标准产业分类
  majorIndustryCodes: [], // -> major_industry_codes
  subIndustryCodes: [], // -> sub_industry_codes

  // 产业筛选 - 江原道主导产业
  gangwonIndustryCodes: [], // -> gangwon_industry_codes
  gangwonIndustrySubCodes: [], // -> gangwon_industry_sub_codes

  // 产业筛选 - 江原道7大未来产业
  gangwonFutureIndustries: [], // -> gangwon_future_industries

  // 产业筛选 - 未来有望新技术
  futureTechnologies: [], // -> future_technologies

  // 企业分类
  startupTypes: [], // -> startup_types
  businessFields: [], // -> business_fields
  cooperationFields: [], // -> cooperation_fields

  // 政策关联
  policyTags: [], // -> policy_tags

  // 投资筛选
  hasInvestment: null, // -> has_investment
  minInvestment: null, // -> min_investment
  maxInvestment: null, // -> max_investment

  // 专利筛选
  minPatents: null, // -> min_patents
  maxPatents: null, // -> max_patents

  // 代表者特征
  gender: null, // -> gender (male/female)
  minAge: null, // -> min_age
  maxAge: null, // -> max_age

  // 关键词搜索
  searchQuery: null, // -> search_query (null 而非空字符串)

  // 创业阶段
  startupStages: [], // -> startup_stages

  // 企业工龄
  minWorkYears: null, // -> min_work_years
  maxWorkYears: null, // -> max_work_years

  // 经营成果 (后端支持)
  minRevenue: null, // -> min_revenue
  maxRevenue: null, // -> max_revenue
  minEmployees: null, // -> min_employees
  maxEmployees: null, // -> max_employees

  // 所在地 (后端支持)
  region: null, // -> region

  // 排序
  sortBy: SORT_FIELD.ENTERPRISE_NAME, // -> sort_by
  sortOrder: SORT_ORDER.ASC, // -> sort_order

  // 分页
  page: PAGINATION_CONFIG.DEFAULT_PAGE, // -> page
  pageSize: PAGINATION_CONFIG.DEFAULT_LIMIT, // -> page_size
};

/**
 * UI 扩展字段 (仅前端筛选器使用，不发送到后端)
 *
 * 这些字段作为 UI 便利功能，帮助用户快速选择预设范围
 */
export const UI_EXTENDED_PARAMS = {
  // 量化指标范围选择器 (UI 便利功能，实际使用 min/max 参数)
  revenueRange: "all", // 年营收区间选择
  employeeRange: "all", // 员工人数区间选择

  // 年龄段区间选择器 (UI 便利功能，实际使用 min/max 参数)
  ageRange: "all",
};

// ==================== 翻译辅助函数 (已迁移) ====================
//
// 以下功能已迁移到 @/shared/hooks/useEnumTranslation.js
// 请使用 useEnumTranslation hook 中的 translateFieldValue 方法
//
// 迁移的内容:
// - POLICY_TAG_I18N_MAP -> hook 内部常量
// - STARTUP_STAGE_I18N_MAP -> hook 内部常量
// - GANGWON_FUTURE_INDUSTRY_I18N_MAP -> hook 内部常量
// - FIELD_TRANSLATION_PATHS -> hook 内部常量
// - getFieldTranslation() -> translateFieldValue() 方法
//
// 使用示例:
// ```jsx
// import { useEnumTranslation } from "@/shared/hooks/useEnumTranslation";
//
// function MyComponent() {
//   const { translateFieldValue } = useEnumTranslation();
//   return <span>{translateFieldValue('policyTags', data.policyTags)}</span>;
// }
// ```

/**
 * 完整的 UI 筛选参数 (后端参数 + UI 扩展参数)
 * 用于初始化 FilterPanel 状态
 */
export const FULL_FILTER_PARAMS = {
  ...DEFAULT_QUERY_PARAMS,
  ...UI_EXTENDED_PARAMS,
};

// ==================== 验证规则 ====================

/**
 * 验证规则
 */
export const VALIDATION_RULES = {
  /** 投资金额最小值 */
  INVESTMENT_MIN: 0,
  /** 投资金额最大值 */
  INVESTMENT_MAX: 999999999,
  /** 专利数量最小值 */
  PATENT_MIN: 0,
  /** 专利数量最大值 */
  PATENT_MAX: 9999,
  /** 年份最小值 */
  YEAR_MIN: 2000,
  /** 年份最大值 */
  YEAR_MAX: new Date().getFullYear() + 10,
};

// ==================== 工具函数 ====================

/**
 * 获取枚举值对应的 i18n 键
 * @param {Object} enumObj - 枚举对象
 * @param {string} value - 枚举值
 * @returns {string|null} i18n 键
 */
export const getEnumLabelKey = (enumObj, value) => {
  const option = Object.values(enumObj).find((opt) => opt.value === value);
  return option?.labelKey || null;
};

/**
 * 验证投资金额范围
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean}
 */
export const validateInvestmentRange = (min, max) => {
  if (min !== null && min < VALIDATION_RULES.INVESTMENT_MIN) return false;
  if (max !== null && max > VALIDATION_RULES.INVESTMENT_MAX) return false;
  if (min !== null && max !== null && min > max) return false;
  return true;
};

/**
 * 验证专利数量范围
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean}
 */
export const validatePatentRange = (min, max) => {
  if (min !== null && min < VALIDATION_RULES.PATENT_MIN) return false;
  if (max !== null && max > VALIDATION_RULES.PATENT_MAX) return false;
  if (min !== null && max !== null && min > max) return false;
  return true;
};

/**
 * UI 扩展参数的 key 列表 (不发送到后端)
 * 这些是 UI 便利功能，用于快速选择预设范围
 */
const UI_EXTENDED_KEYS = new Set([
  "revenueRange", // UI 选择器，实际使用 minRevenue/maxRevenue
  "employeeRange", // UI 选择器，实际使用 minEmployees/maxEmployees
  "ageRange", // UI 选择器，实际使用 minAge/maxAge
]);

/**
 * 构建查询参数（移除空值和 UI-only 参数）
 *
 * 重要：此函数会过滤掉 UI_EXTENDED_KEYS 中的字段，这些字段仅用于前端显示
 * 后端 StatisticsQuery 不支持这些参数，发送会导致 400 ValidationError
 *
 * @param {Object} params - 原始参数 (可能包含 UI 扩展参数)
 * @returns {Object} 清理后的参数 (仅包含后端支持的字段)
 */
export const buildQueryParams = (params) => {
  const cleanParams = {};

  Object.entries(params).forEach(([key, value]) => {
    // 跳过 UI-only 参数
    if (UI_EXTENDED_KEYS.has(key)) {
      return;
    }

    // 跳过 null、undefined、空字符串、空数组
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }

    // 直接保留原始 key，api.service.js 会自动转换 camelCase -> snake_case
    cleanParams[key] = value;
  });

  return cleanParams;
};
