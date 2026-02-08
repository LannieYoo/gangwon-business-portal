/**
 * 将 i18n 备用值从中文替换为韩语
 *
 * 功能：
 * 1. 扫描所有 JSX/JS 文件中的 t('key', '备用值') 调用
 * 2. 查找键在 ko.json 中的韩语翻译
 * 3. 用韩语翻译替换备用值
 *
 * 用法：
 *   node scripts/fix-fallback-to-korean.js --dry-run  # 预览修改
 *   node scripts/fix-fallback-to-korean.js            # 实际修改
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, relative } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const SRC_DIR = path.join(__dirname, "..", "src");

// 中文字符检测
const CHINESE_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/;

// 存储所有翻译键
const koTranslations = {};

/**
 * 递归获取对象的所有键值对
 */
function flattenTranslations(obj, prefix = "") {
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenTranslations(obj[key], fullPath);
    } else if (typeof obj[key] === "string") {
      koTranslations[fullPath] = obj[key];
    }
  }
}

/**
 * 加载所有韩语翻译
 */
function loadKoreanTranslations() {
  // 共享层
  const sharedKoDir = path.join(SRC_DIR, "shared", "i18n", "locales", "ko");
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
    if (fs.existsSync(koPath)) {
      const data = JSON.parse(fs.readFileSync(koPath, "utf8"));
      flattenTranslations(data);
    }
  });

  // 模块文件
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
    if (fs.existsSync(koPath)) {
      const data = JSON.parse(fs.readFileSync(koPath, "utf8"));
      flattenTranslations(data);
    }
  });

  console.log(`📚 已加载 ${Object.keys(koTranslations).length} 个韩语翻译键`);
}

/**
 * 处理单个文件
 */
function processFile(filePath, dryRun) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;
  let changeCount = 0;
  const changes = [];

  // 匹配 t("key", "fallback") 或 t('key', 'fallback') 模式
  // 支持多行和带换行的情况
  const patterns = [
    // t("key", "中文")
    /\bt\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g,
    // t("key", "中文", { ... })
    /\bt\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,/g,
  ];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const key = match[1];
      const fallback = match[2];

      // 只处理包含中文的备用值
      if (!CHINESE_REGEX.test(fallback)) {
        continue;
      }

      // 查找韩语翻译
      const koreanValue = koTranslations[key];

      if (koreanValue && koreanValue !== fallback) {
        // 构建替换后的字符串
        const newMatch = fullMatch.replace(fallback, koreanValue);

        changes.push({
          key,
          from: fallback,
          to: koreanValue,
        });

        if (!dryRun) {
          content = content.replace(fullMatch, newMatch);
          modified = true;
        }
        changeCount++;
      }
    }
  }

  if (changeCount > 0) {
    const relativePath = relative(SRC_DIR, filePath);
    console.log(`\n📄 ${relativePath}: ${changeCount} 处替换`);

    changes.slice(0, 5).forEach((c) => {
      console.log(`   ${c.key}:`);
      console.log(
        `     "${c.from.substring(0, 30)}..." → "${c.to.substring(0, 30)}..."`,
      );
    });

    if (changes.length > 5) {
      console.log(`   ... 和 ${changes.length - 5} 处更多`);
    }

    if (!dryRun && modified) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  }

  return changeCount;
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir, dryRun) {
  const extensions = ["jsx", "js", "tsx", "ts"];
  const excludeDirs = [
    "node_modules",
    "dist",
    ".git",
    "scripts",
    "locales",
    "i18n",
    "deprecated",
    "_deprecated",
  ];

  let totalChanges = 0;
  let filesModified = 0;

  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (
          !excludeDirs.includes(entry.name) &&
          !entry.name.includes("deprecated")
        ) {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1);
        if (extensions.includes(ext)) {
          const changes = processFile(fullPath, dryRun);
          if (changes > 0) {
            totalChanges += changes;
            filesModified++;
          }
        }
      }
    }
  }

  walkDir(dir);
  return { totalChanges, filesModified };
}

// 主函数
async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔧 备用值中文→韩语替换脚本");
  console.log("═".repeat(60));

  if (dryRun) {
    console.log("⚠️ 预览模式 - 不会实际修改文件\n");
  }

  // 1. 加载韩语翻译
  loadKoreanTranslations();

  // 2. 扫描并替换
  console.log("\n📂 扫描源文件...");
  const { totalChanges, filesModified } = scanDirectory(SRC_DIR, dryRun);

  // 3. 输出汇总
  console.log("\n" + "═".repeat(60));
  console.log(`✅ 完成: ${filesModified} 个文件, ${totalChanges} 处替换`);

  if (dryRun) {
    console.log("\n💡 提示: 移除 --dry-run 参数以实际应用修改");
  }
}

main().catch((err) => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
