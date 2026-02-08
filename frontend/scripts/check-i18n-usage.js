/**
 * i18n 使用检查脚本
 *
 * 功能：
 * 1. 扫描所有 React 组件中的 t() / t('key') 调用
 * 2. 提取所有使用的翻译键
 * 3. 检查这些键是否在 ko.json 和 zh.json 中存在
 * 4. 报告缺失的翻译键
 *
 * 用法：
 *   node scripts/check-i18n-usage.js
 *   node scripts/check-i18n-usage.js --fix  # 生成缺失键报告文件
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, relative } from "path";
import { glob } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const SRC_DIR = path.join(__dirname, "..", "src");
const REPORT_FILE = path.join(__dirname, "i18n-missing-keys.json");

// 正则表达式匹配 t() 调用
const T_FUNCTION_PATTERNS = [
  // t("key") 或 t('key')
  /\bt\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  // t("key", { ... })
  /\bt\(\s*["'`]([^"'`]+)["'`]\s*,/g,
  // t(`key`)
  /\bt\(\s*`([^`$]+)`\s*\)/g,
  // labelKey: "key" (用于配置对象)
  /labelKey:\s*["'`]([^"'`]+)["'`]/g,
  // i18nKey: "key"
  /i18nKey:\s*["'`]([^"'`]+)["'`]/g,
];

// 动态键模式（应该跳过）
const DYNAMIC_KEY_PATTERNS = [
  /\$\{/, // 模板字符串插值
  /\+/, // 字符串连接
  /^\s*$/, // 空字符串
];

// 存储结果
const allUsedKeys = new Map(); // key -> [文件位置]
const missingKeys = {
  inKo: new Map(), // 在 ko.json 中缺失
  inZh: new Map(), // 在 zh.json 中缺失
};

/**
 * 递归获取所有翻译文件中的键
 */
function getAllTranslationKeys(obj, prefix = "") {
  const keys = new Set();
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      getAllTranslationKeys(obj[key], fullPath).forEach((k) => keys.add(k));
    } else {
      keys.add(fullPath);
    }
  }
  return keys;
}

/**
 * 加载所有翻译文件并合并键
 */
function loadAllTranslations() {
  const koKeys = new Set();
  const zhKeys = new Set();

  // 共享层翻译
  const sharedKoDir = path.join(SRC_DIR, "shared", "i18n", "locales", "ko");
  const sharedZhDir = path.join(SRC_DIR, "shared", "i18n", "locales", "zh");

  const sharedModules = [
    "common",
    "enums",
    "components",
    "error",
    "terms",
    "member",
  ];
  sharedModules.forEach((mod) => {
    const koPath = path.join(sharedKoDir, `${mod}.json`);
    const zhPath = path.join(sharedZhDir, `${mod}.json`);
    if (fs.existsSync(koPath)) {
      const data = JSON.parse(fs.readFileSync(koPath, "utf8"));
      getAllTranslationKeys(data).forEach((k) => koKeys.add(k));
    }
    if (fs.existsSync(zhPath)) {
      const data = JSON.parse(fs.readFileSync(zhPath, "utf8"));
      getAllTranslationKeys(data).forEach((k) => zhKeys.add(k));
    }
  });

  // 模块翻译
  const modulePaths = [
    "admin/layouts/locales",
    "admin/modules/auth/locales",
    "admin/modules/content/locales",
    "admin/modules/dashboard/locales",
    "admin/modules/members/locales",
    "admin/modules/messages/locales",
    "admin/modules/performance/locales",
    "admin/modules/projects/locales",
    "admin/modules/statistics/locales",
    "member/layouts/locales",
    "member/modules/about/locales",
    "member/modules/auth/locales",
    "member/modules/home/locales",
    "member/modules/performance/locales",
    "member/modules/projects/locales",
    "member/modules/support/locales",
  ];

  modulePaths.forEach((basePath) => {
    const koPath = path.join(SRC_DIR, basePath, "ko.json");
    const zhPath = path.join(SRC_DIR, basePath, "zh.json");
    if (fs.existsSync(koPath)) {
      const data = JSON.parse(fs.readFileSync(koPath, "utf8"));
      getAllTranslationKeys(data).forEach((k) => koKeys.add(k));
    }
    if (fs.existsSync(zhPath)) {
      const data = JSON.parse(fs.readFileSync(zhPath, "utf8"));
      getAllTranslationKeys(data).forEach((k) => zhKeys.add(k));
    }
  });

  console.log(`📚 已加载翻译键: ko=${koKeys.size}, zh=${zhKeys.size}`);
  return { koKeys, zhKeys };
}

/**
 * 检查键是否为动态键（应跳过）
 */
function isDynamicKey(key) {
  return DYNAMIC_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * 从文件内容中提取翻译键
 */
function extractKeysFromContent(content, filePath) {
  const keys = new Set();

  T_FUNCTION_PATTERNS.forEach((pattern) => {
    // 重置正则表达式
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      if (key && !isDynamicKey(key)) {
        keys.add(key);
        // 记录键的使用位置
        if (!allUsedKeys.has(key)) {
          allUsedKeys.set(key, []);
        }
        allUsedKeys.get(key).push(relative(SRC_DIR, filePath));
      }
    }
  });

  return keys;
}

/**
 * 扫描所有源文件
 */
async function scanSourceFiles() {
  const extensions = ["jsx", "js", "tsx", "ts"];
  const excludeDirs = [
    "node_modules",
    "dist",
    ".git",
    "scripts",
    "deprecated",
    "_deprecated",
    "performance_deprecated",
  ];

  let totalFiles = 0;
  let totalKeys = 0;

  // 递归遍历目录
  async function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // 跳过排除的目录和包含 deprecated 的目录
        if (
          !excludeDirs.includes(entry.name) &&
          !entry.name.includes("deprecated")
        ) {
          await walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1);
        if (extensions.includes(ext)) {
          const content = fs.readFileSync(fullPath, "utf8");
          const keys = extractKeysFromContent(content, fullPath);
          if (keys.size > 0) {
            totalFiles++;
            totalKeys += keys.size;
          }
        }
      }
    }
  }

  await walkDir(SRC_DIR);
  console.log(
    `📂 已扫描: ${totalFiles} 个文件, 发现 ${allUsedKeys.size} 个唯一翻译键`,
  );
}

/**
 * 检查缺失的翻译键
 */
function checkMissingKeys(koKeys, zhKeys) {
  let missingInKoCount = 0;
  let missingInZhCount = 0;

  for (const [key, locations] of allUsedKeys) {
    if (!koKeys.has(key)) {
      missingKeys.inKo.set(key, locations);
      missingInKoCount++;
    }
    if (!zhKeys.has(key)) {
      missingKeys.inZh.set(key, locations);
      missingInZhCount++;
    }
  }

  return { missingInKoCount, missingInZhCount };
}

/**
 * 打印报告
 */
function printReport(missingInKoCount, missingInZhCount) {
  console.log("\n" + "=".repeat(60));
  console.log("           i18n 使用检查报告");
  console.log("=".repeat(60));

  console.log(`\n📊 统计:`);
  console.log(`   - 使用的翻译键总数: ${allUsedKeys.size}`);
  console.log(`   - ko.json 缺失: ${missingInKoCount}`);
  console.log(`   - zh.json 缺失: ${missingInZhCount}`);

  if (missingInKoCount > 0) {
    console.log(`\n❌ ko.json 缺失的翻译键 (${missingInKoCount} 个):`);
    let count = 0;
    for (const [key, locations] of missingKeys.inKo) {
      if (count++ < 20) {
        console.log(`   - ${key}`);
        locations.slice(0, 2).forEach((loc) => console.log(`     └─ ${loc}`));
        if (locations.length > 2) {
          console.log(`     └─ ... 和 ${locations.length - 2} 个其他位置`);
        }
      }
    }
    if (missingInKoCount > 20) {
      console.log(`   ... 和 ${missingInKoCount - 20} 个更多`);
    }
  }

  if (missingInZhCount > 0) {
    console.log(`\n❌ zh.json 缺失的翻译键 (${missingInZhCount} 个):`);
    let count = 0;
    for (const [key, locations] of missingKeys.inZh) {
      if (count++ < 20) {
        console.log(`   - ${key}`);
        locations.slice(0, 2).forEach((loc) => console.log(`     └─ ${loc}`));
        if (locations.length > 2) {
          console.log(`     └─ ... 和 ${locations.length - 2} 个其他位置`);
        }
      }
    }
    if (missingInZhCount > 20) {
      console.log(`   ... 和 ${missingInZhCount - 20} 个更多`);
    }
  }

  console.log("\n" + "=".repeat(60));

  if (missingInKoCount === 0 && missingInZhCount === 0) {
    console.log("🟢 验证结果: 通过 - 所有翻译键都已定义");
    return true;
  } else {
    console.log("🔴 验证结果: 失败 - 存在缺失的翻译键");
    return false;
  }
}

/**
 * 生成报告文件
 */
function generateReportFile() {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalKeysUsed: allUsedKeys.size,
      missingInKo: missingKeys.inKo.size,
      missingInZh: missingKeys.inZh.size,
    },
    missingInKo: Object.fromEntries(missingKeys.inKo),
    missingInZh: Object.fromEntries(missingKeys.inZh),
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");
  console.log(`\n📄 详细报告已保存到: ${relative(process.cwd(), REPORT_FILE)}`);
}

// 主函数
async function main() {
  console.log("🔍 i18n 使用检查脚本");
  console.log("=".repeat(60));

  // 1. 加载所有翻译
  const { koKeys, zhKeys } = loadAllTranslations();

  // 2. 扫描源文件
  await scanSourceFiles();

  // 3. 检查缺失
  const { missingInKoCount, missingInZhCount } = checkMissingKeys(
    koKeys,
    zhKeys,
  );

  // 4. 打印报告
  const passed = printReport(missingInKoCount, missingInZhCount);

  // 5. 如果有 --fix 参数，生成报告文件
  if (process.argv.includes("--fix") || process.argv.includes("--report")) {
    generateReportFile();
  }

  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
