/**
 * i18n 键验证脚本
 *
 * 检查项：
 * 1. ko.json 和 zh.json 键完全一致
 * 2. 无混合语言字符 (ko.json 中无中文, zh.json 中无韩文)
 * 3. 无空值或占位符值
 * 4. 插值变量使用 camelCase
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 正则表达式
const CHINESE_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const KOREAN_REGEX =
  /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\ud7b0-\ud7ff]/;
const SNAKE_CASE_INTERPOLATION_REGEX = /\{\{[a-z]+_[a-z_]+\}\}/g;

// 存储所有问题
const issues = {
  keyMismatch: [],
  mixedLanguage: [],
  emptyValues: [],
  snakeCaseInterpolation: [],
};

let totalFilePairs = 0;
let passedFilePairs = 0;

/**
 * 获取对象的所有键路径
 */
function getAllKeyPaths(obj, prefix = "") {
  const keys = [];
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys.push(...getAllKeyPaths(obj[key], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

/**
 * 获取嵌套键的值
 */
function getNestedValue(obj, path) {
  return path.split(".").reduce((curr, key) => curr && curr[key], obj);
}

/**
 * 检查字符串中是否包含中文字符
 */
function hasChinese(str) {
  return typeof str === "string" && CHINESE_REGEX.test(str);
}

/**
 * 检查字符串中是否包含韩文字符
 */
function hasKorean(str) {
  return typeof str === "string" && KOREAN_REGEX.test(str);
}

/**
 * 检查字符串是否为空或占位符
 */
function isEmpty(str) {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return (
    trimmed === "" ||
    trimmed === "TODO" ||
    trimmed === "TBD" ||
    trimmed === "..."
  );
}

/**
 * 检查插值变量是否使用snake_case
 */
function hasSnakeCaseInterpolation(str) {
  if (typeof str !== "string") return false;
  return SNAKE_CASE_INTERPOLATION_REGEX.test(str);
}

/**
 * 验证一对翻译文件
 */
function validateFilePair(koPath, zhPath, moduleName) {
  console.log(`\n📂 验证模块: ${moduleName}`);

  let koData, zhData;

  try {
    koData = JSON.parse(fs.readFileSync(koPath, "utf8"));
  } catch (e) {
    console.error(`  ❌ 无法读取 ko.json: ${e.message}`);
    return false;
  }

  try {
    zhData = JSON.parse(fs.readFileSync(zhPath, "utf8"));
  } catch (e) {
    console.error(`  ❌ 无法读取 zh.json: ${e.message}`);
    return false;
  }

  const koKeys = getAllKeyPaths(koData);
  const zhKeys = getAllKeyPaths(zhData);
  const koKeySet = new Set(koKeys);
  const zhKeySet = new Set(zhKeys);

  let hasIssues = false;

  // 检查键不匹配
  const missingInZh = koKeys.filter((k) => !zhKeySet.has(k));
  const missingInKo = zhKeys.filter((k) => !koKeySet.has(k));

  if (missingInZh.length > 0) {
    hasIssues = true;
    issues.keyMismatch.push({
      module: moduleName,
      type: "zh缺失",
      keys: missingInZh,
    });
    console.log(`  ⚠️ zh.json 缺失 ${missingInZh.length} 个键`);
    missingInZh.slice(0, 3).forEach((k) => console.log(`     - ${k}`));
    if (missingInZh.length > 3)
      console.log(`     ... 和 ${missingInZh.length - 3} 个更多`);
  }

  if (missingInKo.length > 0) {
    hasIssues = true;
    issues.keyMismatch.push({
      module: moduleName,
      type: "ko缺失",
      keys: missingInKo,
    });
    console.log(`  ⚠️ ko.json 缺失 ${missingInKo.length} 个键`);
    missingInKo.slice(0, 3).forEach((k) => console.log(`     - ${k}`));
    if (missingInKo.length > 3)
      console.log(`     ... 和 ${missingInKo.length - 3} 个更多`);
  }

  // 检查混合语言和空值
  koKeys.forEach((key) => {
    const value = getNestedValue(koData, key);

    // 检查 ko.json 中的中文字符
    if (hasChinese(value)) {
      hasIssues = true;
      issues.mixedLanguage.push({
        module: moduleName,
        file: "ko.json",
        key,
        value,
      });
    }

    // 检查空值
    if (isEmpty(value)) {
      issues.emptyValues.push({
        module: moduleName,
        file: "ko.json",
        key,
        value,
      });
    }

    // 检查snake_case插值
    if (hasSnakeCaseInterpolation(value)) {
      issues.snakeCaseInterpolation.push({
        module: moduleName,
        file: "ko.json",
        key,
        value,
      });
    }
  });

  zhKeys.forEach((key) => {
    const value = getNestedValue(zhData, key);

    // 检查 zh.json 中的韩文字符
    if (hasKorean(value)) {
      hasIssues = true;
      issues.mixedLanguage.push({
        module: moduleName,
        file: "zh.json",
        key,
        value,
      });
    }

    // 检查空值
    if (isEmpty(value)) {
      issues.emptyValues.push({
        module: moduleName,
        file: "zh.json",
        key,
        value,
      });
    }

    // 检查snake_case插值
    if (hasSnakeCaseInterpolation(value)) {
      issues.snakeCaseInterpolation.push({
        module: moduleName,
        file: "zh.json",
        key,
        value,
      });
    }
  });

  if (!hasIssues) {
    console.log(`  ✅ 键结构对称`);
  }

  return !hasIssues;
}

/**
 * 扫描所有翻译文件对
 */
function scanAllTranslations() {
  const srcDir = path.join(__dirname, "..", "src");

  // 共享层模块化文件
  const sharedKoDir = path.join(srcDir, "shared", "i18n", "locales", "ko");
  const sharedZhDir = path.join(srcDir, "shared", "i18n", "locales", "zh");

  const sharedModules = [
    "common",
    "enums",
    "components",
    "error",
    "terms",
    "member",
  ];

  console.log("\n=== 共享层翻译文件 ===");
  sharedModules.forEach((mod) => {
    const koPath = path.join(sharedKoDir, `${mod}.json`);
    const zhPath = path.join(sharedZhDir, `${mod}.json`);
    if (fs.existsSync(koPath) && fs.existsSync(zhPath)) {
      totalFilePairs++;
      if (validateFilePair(koPath, zhPath, `shared/${mod}`)) {
        passedFilePairs++;
      }
    }
  });

  // 模块文件对
  const modulePaths = [
    { base: "admin/layouts/locales", name: "admin.layouts" },
    { base: "admin/modules/auth/locales", name: "admin.auth" },
    { base: "admin/modules/content/locales", name: "admin.content" },
    { base: "admin/modules/dashboard/locales", name: "admin.dashboard" },
    { base: "admin/modules/members/locales", name: "admin.members" },
    { base: "admin/modules/messages/locales", name: "admin.messages" },
    { base: "admin/modules/performance/locales", name: "admin.performance" },
    { base: "admin/modules/projects/locales", name: "admin.projects" },
    { base: "admin/modules/statistics/locales", name: "admin.statistics" },
    { base: "member/layouts/locales", name: "member.layouts" },
    { base: "member/modules/about/locales", name: "member.about" },
    { base: "member/modules/auth/locales", name: "member.auth" },
    { base: "member/modules/home/locales", name: "member.home" },
    { base: "member/modules/performance/locales", name: "member.performance" },
    { base: "member/modules/projects/locales", name: "member.projects" },
    { base: "member/modules/support/locales", name: "member.support" },
  ];

  console.log("\n=== 模块翻译文件 ===");
  modulePaths.forEach(({ base, name }) => {
    const koPath = path.join(srcDir, base, "ko.json");
    const zhPath = path.join(srcDir, base, "zh.json");
    if (fs.existsSync(koPath) && fs.existsSync(zhPath)) {
      totalFilePairs++;
      if (validateFilePair(koPath, zhPath, name)) {
        passedFilePairs++;
      }
    }
  });
}

/**
 * 输出汇总报告
 */
function printSummary() {
  console.log("\n\n========================================");
  console.log("           验证汇总报告");
  console.log("========================================");

  console.log(`\n📊 文件对验证: ${passedFilePairs}/${totalFilePairs} 通过`);

  // 混合语言问题
  if (issues.mixedLanguage.length > 0) {
    console.log(`\n❌ 混合语言问题: ${issues.mixedLanguage.length} 处`);
    issues.mixedLanguage.forEach(({ module, file, key, value }) => {
      const displayValue =
        value.length > 50 ? value.substring(0, 50) + "..." : value;
      console.log(`   [${module}] ${file}: ${key} = "${displayValue}"`);
    });
  } else {
    console.log("\n✅ 无混合语言问题");
  }

  // 键不匹配问题
  const totalMismatch = issues.keyMismatch.reduce(
    (sum, i) => sum + i.keys.length,
    0,
  );
  if (totalMismatch > 0) {
    console.log(`\n❌ 键不匹配问题: ${totalMismatch} 个键`);
    issues.keyMismatch.forEach(({ module, type, keys }) => {
      console.log(`   [${module}] ${type}: ${keys.length} 个键`);
    });
  } else {
    console.log("\n✅ 所有键结构对称");
  }

  // Snake case 插值问题
  if (issues.snakeCaseInterpolation.length > 0) {
    console.log(
      `\n⚠️ Snake_case 插值变量: ${issues.snakeCaseInterpolation.length} 处`,
    );
    issues.snakeCaseInterpolation.forEach(({ module, file, key, value }) => {
      const matches = value.match(SNAKE_CASE_INTERPOLATION_REGEX);
      console.log(`   [${module}] ${file}: ${key} - ${matches.join(", ")}`);
    });
  } else {
    console.log("\n✅ 所有插值变量使用 camelCase");
  }

  // 空值问题
  if (issues.emptyValues.length > 0) {
    console.log(`\n⚠️ 空值或占位符: ${issues.emptyValues.length} 处`);
    issues.emptyValues.forEach(({ module, file, key }) => {
      console.log(`   [${module}] ${file}: ${key}`);
    });
  } else {
    console.log("\n✅ 无空值或占位符");
  }

  console.log("\n========================================");

  // 计算总体结果
  const hasCriticalIssues =
    issues.mixedLanguage.length > 0 || totalMismatch > 0;

  if (hasCriticalIssues) {
    console.log("🔴 验证结果: 失败 - 存在需要修复的问题");
    process.exit(1);
  } else if (
    issues.snakeCaseInterpolation.length > 0 ||
    issues.emptyValues.length > 0
  ) {
    console.log("🟡 验证结果: 警告 - 存在建议修复的问题");
    process.exit(0);
  } else {
    console.log("🟢 验证结果: 通过 - 所有检查项通过");
    process.exit(0);
  }
}

// 运行验证
console.log("🔍 i18n 翻译键验证脚本");
console.log("=".repeat(40));

scanAllTranslations();
printSummary();
