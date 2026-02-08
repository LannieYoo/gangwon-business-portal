/**
 * useEnumTranslation Hook
 * 统一处理枚举值的国际化翻译
 *
 * 这个 hook 可以将数据库中存储的英文枚举值自动转换为当前语言的翻译
 *
 * 使用示例:
 * ```jsx
 * const { translateEnum, translateRegion, translateStartupType, translateFieldValue } = useEnumTranslation();
 *
 * // 通用翻译
 * <span>{translateEnum('industry.startupType', 'student_startup')}</span>
 *
 * // 快捷方法
 * <span>{translateStartupType(member.startupType)}</span>
 * <span>{translateRegion(member.region)}</span>
 *
 * // 字段值翻译（用于表格显示）
 * <span>{translateFieldValue('policyTags', member.policyTags)}</span>
 * ```
 */

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * 枚举翻译配置
 * 定义各类枚举在 i18n 中的路径
 */
const ENUM_PATHS = {
  // 地区
  regions: "enums.regions",
  region: "enums.industry.region", // 与 regions 相同，但在 industry 下

  // 产业分类
  ksicMajor: "enums.industry.ksicMajor",
  ksicSub: "enums.industry.ksicSub",
  gangwonIndustry: "enums.industry.gangwonIndustry",
  futureTech: "enums.industry.futureTech",
  mainIndustryKsic: "enums.industry.mainIndustryKsic",
  mainIndustryKsicCodes: "enums.industry.mainIndustryKsicCodes",
  businessField: "enums.industry.businessField",

  // 创业相关
  startupType: "enums.industry.startupType",
  startupStage: "enums.industry.startupStage",

  // 知识产权
  ipType: "enums.ip.type",
  ipRegistrationType: "enums.ip.registrationType",
  overseasType: "enums.ip.overseasType",

  // 参与项目
  participationPrograms: "enums.participationPrograms",

  // 国家
  country: "enums.country",

  // 江原7大未来产业（用于表格字段翻译）
  gangwonFutureIndustry: "enums.industry.gangwonIndustry",

  // Support 模块状态和分类
  inquiryStatus: "member.support.status",
  inquiryCategory: "member.support.category",
  faqCategory: "member.support.faqCategory",
};

/**
 * 字段翻译路径映射
 * Field Translation Path Mapping
 *
 * 用于表格中快速查找字段对应的翻译路径
 */
const FIELD_TRANSLATION_PATHS = {
  // KSIC 产业分类
  ksicMajor: "enums.industry.ksicMajor",
  ksicSub: "enums.industry.ksicSub",

  // 江原道产业分类
  gangwonIndustry: "enums.industry.mainIndustryKsic", // 江原主导产业
  gangwonFutureIndustry: "enums.industry.gangwonIndustry", // 江原7大未来产业

  // 技术和地区（使用共享 enums）
  futureTech: "enums.industry.futureTech",
  region: "enums.regions",

  // 创业阶段（使用共享 enums，需要特殊处理 key 映射）
  startupStage: "enums.industry.startupStage",

  // 性别
  representativeGender: "admin.statistics.table",
};

/**
 * 政策标签 -> i18n key 映射
 * 数据库可能存储多种格式，需要统一映射到实际翻译 key
 */
const POLICY_TAG_I18N_MAP = {
  // 小写下划线格式 (标准格式) - 直接映射到翻译文件中的 key
  startup_university: "enums.participationPrograms.startup_university",
  global_glocal: "enums.participationPrograms.global_glocal",
  rise: "enums.participationPrograms.rise",
  knu_tenant: "enums.participationPrograms.knu_tenant",
  // 大写格式 (旧数据兼容)
  STARTUP_UNIVERSITY: "enums.participationPrograms.startup_university",
  GLOBAL_GLOCAL: "enums.participationPrograms.global_glocal",
  RISE: "enums.participationPrograms.rise",
  KNU_TENANT: "enums.participationPrograms.knu_tenant",
  // 驼峰格式 (旧数据兼容)
  startupCenterUniversity: "enums.participationPrograms.startup_university",
  globalBusiness: "enums.participationPrograms.global_glocal",
  riseBusiness: "enums.participationPrograms.rise",
  knuTenant: "enums.participationPrograms.knu_tenant",
  // 其他变体
  startup_center_university: "enums.participationPrograms.startup_university",
  global_business: "enums.participationPrograms.global_glocal",
  rise_business: "enums.participationPrograms.rise",
  knu_tenant_business: "enums.participationPrograms.knu_tenant",
  // 中文文本（旧数据兼容）
  创业中心大学: "enums.participationPrograms.startup_university",
  全球事业: "enums.participationPrograms.global_glocal",
  "全球·글로컬 사업": "enums.participationPrograms.global_glocal",
  "글로벌 사업": "enums.participationPrograms.global_glocal",
  "글로벌·글로컬 사업": "enums.participationPrograms.global_glocal",
  "RISE 사업단": "enums.participationPrograms.rise",
  "RISE 事业团": "enums.participationPrograms.rise",
  RISE事业: "enums.participationPrograms.rise",
  RISE사업: "enums.participationPrograms.rise",
  // 特殊值
  无: null, // 不显示
  없음: null, // 不显示
  none: null, // 不显示
  None: null, // 不显示
  "": null, // 空字符串不显示
};

/**
 * 创业阶段 -> i18n key 映射
 * 数据库值（英文/韩文）-> 共享 enums 翻译路径
 */
const STARTUP_STAGE_I18N_MAP = {
  // 英文 key -> 共享 enums 路径
  pre_startup: "enums.industry.startupStage.preliminary",
  preliminary: "enums.industry.startupStage.preliminary",
  initial: "enums.industry.startupStage.preliminary",
  growth: "enums.industry.startupStage.growthOver7Years",
  leap: "enums.industry.startupStage.growthOver7Years",
  re_startup: "enums.industry.startupStage.restart",
  restart: "enums.industry.startupStage.restart",
  startup_under_3years: "enums.industry.startupStage.startupUnder3Years",
  growth_over_7years: "enums.industry.startupStage.growthOver7Years",
  startup_3_to_7years: "enums.industry.startupStage.startupUnder3Years",
  startup_over_7years: "enums.industry.startupStage.growthOver7Years",

  // 韩文值 -> 共享 enums 路径
  예비창업: "enums.industry.startupStage.preliminary",
  "3년 이하": "enums.industry.startupStage.startupUnder3Years",
  "창업 3년 이하": "enums.industry.startupStage.startupUnder3Years",
  "3-7년": "enums.industry.startupStage.startupUnder3Years",
  "7년 이상": "enums.industry.startupStage.growthOver7Years",
  성장기: "enums.industry.startupStage.growthOver7Years",
  재창업: "enums.industry.startupStage.restart",

  // 创业类型 -> 共享 enums 路径
  village_enterprise: "enums.industry.startupType.villageEnterprise",
  youth_enterprise: "enums.industry.startupType.youthEnterprise",
  student_startup: "enums.industry.startupType.studentStartup",
  faculty_startup: "enums.industry.startupType.facultyStartup",
  women_enterprise: "enums.industry.startupType.womenEnterprise",
  venture_company: "enums.industry.startupType.ventureCompany",
  social_enterprise: "enums.industry.startupType.socialEnterprise",
};

/**
 * 江原7大未来产业 -> i18n key 映射
 * 支持英文key和韩文值
 */
const GANGWON_FUTURE_INDUSTRY_I18N_MAP = {
  // 英文 key (标准格式)
  semiconductor: "enums.industry.gangwonIndustry.semiconductor",
  bio_health: "enums.industry.gangwonIndustry.bio_health",
  future_energy: "enums.industry.gangwonIndustry.future_energy",
  future_mobility: "enums.industry.gangwonIndustry.future_mobility",
  food_tech: "enums.industry.gangwonIndustry.food_tech",
  advanced_defense: "enums.industry.gangwonIndustry.advanced_defense",
  climate_tech: "enums.industry.gangwonIndustry.climate_tech",
  new_materials: "enums.industry.gangwonIndustry.new_materials",

  // 韩文值 (数据库可能存储的格式)
  반도체: "enums.industry.gangwonIndustry.semiconductor",
  바이오헬스: "enums.industry.gangwonIndustry.bio_health",
  "미래 에너지": "enums.industry.gangwonIndustry.future_energy",
  미래에너지: "enums.industry.gangwonIndustry.future_energy",
  "미래 모빌리티": "enums.industry.gangwonIndustry.future_mobility",
  미래모빌리티: "enums.industry.gangwonIndustry.future_mobility",
  푸드테크: "enums.industry.gangwonIndustry.food_tech",
  첨단국방: "enums.industry.gangwonIndustry.advanced_defense",
  기후테크: "enums.industry.gangwonIndustry.climate_tech",
  신소재: "enums.industry.gangwonIndustry.new_materials",
};

/**
 * snake_case 转 camelCase 工具函数
 */
const snakeToCamel = (str) => {
  return String(str).replace(/_([a-z0-9])/gi, (_, letter) =>
    letter.toUpperCase(),
  );
};

/**
 * 用于处理数据库中可能存储的不同格式
 * 例如：大写、韩文、snake_case等
 */
const VALUE_NORMALIZERS = {
  futureTech: (value) => String(value).toLowerCase(),
  gender: (value) => String(value).toLowerCase(),
  representativeGender: (value) => String(value).toUpperCase(),
  // 创业类型: snake_case -> camelCase
  startupType: (value) => snakeToCamel(value),
  // 创业阶段: snake_case -> camelCase
  startupStage: (value) => snakeToCamel(value),
};

export function useEnumTranslation() {
  const { t } = useTranslation();

  /**
   * 通用枚举翻译函数
   * @param {string} enumType - 枚举类型，如 'startupType', 'region' 等
   * @param {string|null|undefined} value - 枚举值
   * @param {string} [fallback='-'] - 如果翻译不存在时的默认值
   * @returns {string} - 翻译后的文本
   */
  const translateEnum = useCallback(
    (enumType, value, fallback = "-") => {
      // 空值处理
      if (value === null || value === undefined || value === "") {
        return fallback;
      }

      // 获取枚举路径
      const basePath = ENUM_PATHS[enumType];
      if (!basePath) {
        // 如果没有预定义路径，尝试使用 enums.{enumType} 格式
        const key = `enums.${enumType}.${value}`;
        const translated = t(key);
        return translated !== key
          ? translated
          : fallback === "-"
            ? value
            : fallback;
      }

      // 应用值标准化
      const normalizer = VALUE_NORMALIZERS[enumType];
      const normalizedValue = normalizer ? normalizer(value) : value;

      // 执行翻译
      const key = `${basePath}.${normalizedValue}`;
      const translated = t(key);

      // 如果翻译键不存在（返回了键本身），返回原值或 fallback
      if (translated === key) {
        return fallback === "-" ? value : fallback;
      }

      return translated;
    },
    [t],
  );

  /**
   * 翻译数组中的所有枚举值
   * @param {string} enumType - 枚举类型
   * @param {Array} values - 枚举值数组
   * @param {string} [separator=', '] - 分隔符
   * @returns {string} - 翻译后的文本，用分隔符连接
   */
  const translateEnumArray = useCallback(
    (enumType, values, separator = ", ") => {
      if (!Array.isArray(values) || values.length === 0) {
        return "-";
      }

      return values
        .map((value) => translateEnum(enumType, value))
        .filter(Boolean)
        .join(separator);
    },
    [translateEnum],
  );

  // ==================== 快捷方法 ====================

  /** 翻译地区 */
  const translateRegion = useCallback(
    (value) => {
      // 优先使用 enums.regions 路径
      const key = `enums.regions.${value}`;
      const translated = t(key);
      return translated !== key ? translated : value || "-";
    },
    [t],
  );

  /** 翻译创业类型 */
  const translateStartupType = useCallback(
    (value) => {
      return translateEnum("startupType", value);
    },
    [translateEnum],
  );

  /** 翻译创业阶段 */
  const translateStartupStage = useCallback(
    (value) => {
      return translateEnum("startupStage", value);
    },
    [translateEnum],
  );

  /** 翻译 KSIC 大分类 */
  const translateKsicMajor = useCallback(
    (value) => {
      return translateEnum("ksicMajor", value);
    },
    [translateEnum],
  );

  /** 翻译 KSIC 中分类 */
  const translateKsicSub = useCallback(
    (value) => {
      return translateEnum("ksicSub", value);
    },
    [translateEnum],
  );

  /** 翻译江原道7大未来产业 */
  const translateGangwonIndustry = useCallback(
    (value) => {
      return translateEnum("gangwonIndustry", value);
    },
    [translateEnum],
  );

  /** 翻译未来有望新技术 */
  const translateFutureTech = useCallback(
    (value) => {
      return translateEnum("futureTech", value);
    },
    [translateEnum],
  );

  /** 翻译主力产业 KSIC */
  const translateMainIndustryKsic = useCallback(
    (value) => {
      return translateEnum("mainIndustryKsic", value);
    },
    [translateEnum],
  );

  /** 翻译主力产业 KSIC 代码 (支持 JSON 数组) */
  const translateMainIndustryKsicCodes = useCallback(
    (value) => {
      if (!value) return "-";

      try {
        // 尝试解析 JSON 数组
        const codes = typeof value === "string" ? JSON.parse(value) : value;

        if (Array.isArray(codes) && codes.length > 0) {
          return codes
            .map((code) => translateEnum("mainIndustryKsicCodes", code))
            .join(", ");
        }

        // 如果不是数组，按单值处理
        return translateEnum("mainIndustryKsicCodes", value);
      } catch {
        // JSON 解析失败，按单值处理
        return translateEnum("mainIndustryKsicCodes", value);
      }
    },
    [translateEnum],
  );

  /** 翻译业务领域 */
  const translateBusinessField = useCallback(
    (value) => {
      return translateEnum("businessField", value);
    },
    [translateEnum],
  );

  /** 翻译知识产权类型 */
  const translateIpType = useCallback(
    (value) => {
      return translateEnum("ipType", value);
    },
    [translateEnum],
  );

  /** 翻译知识产权登记类型 */
  const translateIpRegistrationType = useCallback(
    (value) => {
      return translateEnum("ipRegistrationType", value);
    },
    [translateEnum],
  );

  /** 翻译海外申请类型 */
  const translateOverseasType = useCallback(
    (value) => {
      return translateEnum("overseasType", value);
    },
    [translateEnum],
  );

  /** 翻译国家 */
  const translateCountry = useCallback(
    (value) => {
      return translateEnum("country", value);
    },
    [translateEnum],
  );

  /**
   * 翻译产业类型（通用）
   * 尝试多个产业分类进行翻译，因为 industry 字段可能存储来自不同枚举的值
   */
  const translateIndustry = useCallback(
    (value) => {
      if (!value) return "-";

      // 尝试按优先级翻译：mainIndustryKsic -> gangwonIndustry -> futureTech -> ksicSub
      const enumTypes = [
        "mainIndustryKsic",
        "gangwonIndustry",
        "futureTech",
        "ksicSub",
      ];

      for (const enumType of enumTypes) {
        const basePath = ENUM_PATHS[enumType];
        if (!basePath) continue;

        const key = `${basePath}.${value}`;
        const translated = t(key);

        // 如果翻译成功（不等于键本身），返回翻译结果
        if (translated !== key) {
          return translated;
        }
      }

      // 所有尝试都失败，返回原值
      return value;
    },
    [t],
  );

  /** 翻译性别 */
  const translateGender = useCallback(
    (value) => {
      if (!value) return "-";
      const normalizedValue = String(value).toLowerCase();
      if (normalizedValue === "male") {
        return t("common.male", "남성");
      }
      if (normalizedValue === "female") {
        return t("common.female", "여성");
      }
      return value;
    },
    [t],
  );

  /** 翻译参与项目 (支持 JSON 数组) */
  const translateParticipationPrograms = useCallback(
    (value) => {
      if (!value) return "-";

      try {
        // 尝试解析 JSON 数组
        const programs = typeof value === "string" ? JSON.parse(value) : value;

        if (Array.isArray(programs) && programs.length > 0) {
          return programs
            .map((program) => translateEnum("participationPrograms", program))
            .join(", ");
        }

        // 如果不是数组，按单值处理
        return translateEnum("participationPrograms", value);
      } catch {
        // JSON 解析失败，按单值处理
        return translateEnum("participationPrograms", value);
      }
    },
    [translateEnum],
  );

  /** 翻译咨询状态 (Support 模块) */
  const translateInquiryStatus = useCallback(
    (value) => {
      return translateEnum("inquiryStatus", value);
    },
    [translateEnum],
  );

  /** 翻译咨询分类 (Support 模块) */
  const translateInquiryCategory = useCallback(
    (value) => {
      return translateEnum("inquiryCategory", value);
    },
    [translateEnum],
  );

  /** 翻译 FAQ 分类 (Support 模块) */
  const translateFaqCategory = useCallback(
    (value) => {
      return translateEnum("faqCategory", value);
    },
    [translateEnum],
  );

  /**
   * 翻译字段值（用于表格显示）
   * 处理各种特殊字段的翻译逻辑，包括数组、JSON、韩文/英文值等
   *
   * @param {string} fieldKey - 字段键名
   * @param {any} value - 字段值（可以是字符串、数组或 JSON 字符串）
   * @returns {string} 翻译后的文本，如果找不到翻译则返回原值
   */
  const translateFieldValue = useCallback(
    (fieldKey, value) => {
      if (value === null || value === undefined) return "-";
      if (value === "") return "-";

      // === 特殊字段处理 ===

      // 1. policyTags - 政策标签数组
      if (fieldKey === "policyTags") {
        if (!Array.isArray(value) || value.length === 0) return "-";
        const translatedTags = value
          .map((tag) => {
            const i18nKey = POLICY_TAG_I18N_MAP[tag];
            if (i18nKey === null) return null; // 跳过 "无" / "없음" 等
            return i18nKey ? t(i18nKey) : tag;
          })
          .filter(Boolean);
        return translatedTags.length > 0 ? translatedTags.join(", ") : "-";
      }

      // 2. startupStage - 创业阶段
      if (fieldKey === "startupStage") {
        const i18nKey = STARTUP_STAGE_I18N_MAP[value];
        return i18nKey ? t(i18nKey) : value;
      }

      // 2.5. gangwonFutureIndustry - 江原7大未来产业（支持韩文值）
      if (fieldKey === "gangwonFutureIndustry") {
        const i18nKey = GANGWON_FUTURE_INDUSTRY_I18N_MAP[value];
        if (i18nKey) {
          const translated = t(i18nKey);
          return translated !== i18nKey ? translated : value;
        }
        // 如果映射中没有，尝试直接翻译
        const directKey = `enums.industry.gangwonIndustry.${value}`;
        const directTranslated = t(directKey);
        return directTranslated !== directKey ? directTranslated : value;
      }

      // 3. gangwonIndustrySub - 江原主导产业中分类（JSON 数组）
      if (fieldKey === "gangwonIndustrySub") {
        try {
          const codes = typeof value === "string" ? JSON.parse(value) : value;
          if (!Array.isArray(codes) || codes.length === 0) return "-";

          const translatedCodes = codes.map((code) => {
            // 移除前缀字母（如 J62 -> 62）
            const numericCode = code.replace(/^[A-Z]+/, "");

            // 尝试多个翻译路径
            const translationKeys = [
              `enums.industry.mainIndustryKsicCodes.${code}`,
              `enums.industry.mainIndustryKsicCodes.${numericCode}`,
              `enums.industry.ksicSub.${numericCode}`,
              `enums.industry.mainIndustryKsic.${code}`,
              `enums.industry.mainIndustryKsic.${numericCode}`,
            ];

            for (const key of translationKeys) {
              const result = t(key);
              if (result !== key) {
                return result;
              }
            }
            return code; // 如果都没找到，返回原代码
          });

          return translatedCodes.join(", ");
        } catch {
          return String(value);
        }
      }

      // 4. representativeGender - 代表者性别
      if (fieldKey === "representativeGender") {
        const normalizedValue = String(value).toUpperCase();
        if (normalizedValue === "MALE") {
          return t("admin.statistics.table.male");
        }
        if (normalizedValue === "FEMALE") {
          return t("admin.statistics.table.female");
        }
        return value;
      }

      // 5. futureTech - 未来有望新技术（数据库值为大写，翻译键为小写）
      if (fieldKey === "futureTech") {
        const normalizedValue = String(value).toLowerCase();
        const translationKey = `enums.industry.futureTech.${normalizedValue}`;
        const translated = t(translationKey);
        return translated !== translationKey ? translated : value;
      }

      // === 通用字段处理（使用 FIELD_TRANSLATION_PATHS）===
      const basePath = FIELD_TRANSLATION_PATHS[fieldKey];
      if (!basePath) return value;

      const translationKey = `${basePath}.${value}`;
      const translated = t(translationKey);

      // 如果翻译键不存在，t() 会返回键本身
      return translated !== translationKey ? translated : value;
    },
    [t],
  );

  /**
   * 生成枚举选项列表（用于下拉选择框）
   * @param {string} enumType - 枚举类型
   * @param {string[]} keys - 枚举值数组
   * @param {boolean} [addEmpty=true] - 是否添加空选项
   * @param {string} [emptyLabel] - 空选项的标签
   * @returns {Array<{value: string, label: string}>}
   */
  const getEnumOptions = useCallback(
    (enumType, keys, addEmpty = true, emptyLabel = "-") => {
      const options = keys.map((key) => ({
        value: key,
        label: translateEnum(enumType, key),
      }));

      if (addEmpty) {
        return [{ value: "", label: emptyLabel }, ...options];
      }
      return options;
    },
    [translateEnum],
  );

  // ==================== 选项生成快捷方法 ====================

  /** 获取地区选项 */
  const getRegionOptions = useCallback(
    (addEmpty = true, emptyLabel) => {
      const keys = [
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
      return getEnumOptions(
        "regions",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取创业类型选项 */
  const getStartupTypeOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "startupType",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取创业阶段选项 */
  const getStartupStageOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "startupStage",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取KSIC大分类选项 */
  const getKsicMajorOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "ksicMajor",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取KSIC中分类选项 */
  const getKsicSubOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "ksicSub",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取江原道7大未来产业选项 */
  const getGangwonIndustryOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "gangwonIndustry",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取未来有望新技术选项 */
  const getFutureTechOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "futureTech",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取业务领域选项 */
  const getBusinessFieldOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "businessField",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取主力产业KSIC选项 */
  const getMainIndustryKsicOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "mainIndustryKsic",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取主力产业KSIC代码选项 */
  const getMainIndustryKsicCodesOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "mainIndustryKsicCodes",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取知识产权类型选项 */
  const getIpTypeOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "ipType",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取知识产权登记类型选项 */
  const getIpRegistrationTypeOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "ipRegistrationType",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取海外申请类型选项 */
  const getOverseasTypeOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "overseasType",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  /** 获取国家选项 */
  const getCountryOptions = useCallback(
    (keys, addEmpty = true, emptyLabel) => {
      return getEnumOptions(
        "country",
        keys,
        addEmpty,
        emptyLabel || t("common.select", "선택"),
      );
    },
    [getEnumOptions, t],
  );

  return {
    // 通用方法
    translateEnum,
    translateEnumArray,
    getEnumOptions,

    // 地区
    translateRegion,
    getRegionOptions,

    // 产业分类
    translateKsicMajor,
    translateKsicSub,
    translateGangwonIndustry,
    translateFutureTech,
    translateMainIndustryKsic,
    translateMainIndustryKsicCodes,
    translateBusinessField,
    getKsicMajorOptions,
    getKsicSubOptions,
    getGangwonIndustryOptions,
    getFutureTechOptions,
    getMainIndustryKsicOptions,
    getMainIndustryKsicCodesOptions,
    getBusinessFieldOptions,
    translateIndustry,

    // 创业相关
    translateStartupType,
    translateStartupStage,
    getStartupTypeOptions,
    getStartupStageOptions,

    // 知识产权
    translateIpType,
    translateIpRegistrationType,
    translateOverseasType,
    getIpTypeOptions,
    getIpRegistrationTypeOptions,
    getOverseasTypeOptions,

    // 国家和性别
    translateCountry,
    translateGender,
    getCountryOptions,

    // 参与项目
    translateParticipationPrograms,

    // Support 模块
    translateInquiryStatus,
    translateInquiryCategory,
    translateFaqCategory,

    // 字段值翻译（表格显示用）
    translateFieldValue,
  };
}

export default useEnumTranslation;
