/**
 * i18n 缺失键自动修复脚本
 *
 * 功能：
 * 1. 读取 check-i18n-usage.js 生成的缺失键报告
 * 2. 根据键的前缀自动确定应该放在哪个翻译文件
 * 3. 在对应的翻译文件中添加缺失的键（使用占位符值）
 *
 * 用法：
 *   node scripts/fix-i18n-missing.js
 *   node scripts/fix-i18n-missing.js --dry-run  # 只预览，不实际修改
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const SRC_DIR = path.join(__dirname, "..", "src");
const REPORT_FILE = path.join(__dirname, "i18n-missing-keys.json");

// 键前缀到翻译文件的映射
const KEY_TO_FILE_MAPPING = {
  // Admin 模块
  "admin.layouts": "admin/layouts/locales",
  "admin.auth": "admin/modules/auth/locales",
  "admin.content": "admin/modules/content/locales",
  "admin.dashboard": "admin/modules/dashboard/locales",
  "admin.members": "admin/modules/members/locales",
  "admin.messages": "admin/modules/messages/locales",
  "admin.performance": "admin/modules/performance/locales",
  "admin.projects": "admin/modules/projects/locales",
  "admin.statistics": "admin/modules/statistics/locales",
  "admin.applications": "admin/modules/projects/locales",

  // Member 模块
  "member.layouts": "member/layouts/locales",
  "member.about": "member/modules/about/locales",
  "member.auth": "member/modules/auth/locales",
  "member.home": "member/modules/home/locales",
  "member.performance": "member/modules/performance/locales",
  "member.projects": "member/modules/projects/locales",
  "member.support": "member/modules/support/locales",

  // 共享层 - 按功能分类
  common: "shared/i18n/locales",
  auth: "shared/i18n/locales",
  footer: "shared/i18n/locales",
  enums: "shared/i18n/locales",
  components: "shared/i18n/locales",
  error: "shared/i18n/locales",
  terms: "shared/i18n/locales",
  member: "shared/i18n/locales",
  support: "shared/i18n/locales",
  notifications: "shared/i18n/locales",
  fileAttachments: "shared/i18n/locales",
  message: "shared/i18n/locales",

  // 特殊前缀 - 需要放到对应模块
  performance: "member/modules/performance/locales",
  projects: "member/modules/projects/locales",
  home: "member/modules/home/locales",
  statistics: "admin/modules/statistics/locales",
};

// 共享层键应该放在哪个子文件
const SHARED_KEY_TO_SUBFILE = {
  common: "common",
  auth: "common",
  footer: "common",
  enums: "enums",
  components: "components",
  error: "error",
  terms: "terms",
  member: "member",
  support: "common",
  notifications: "common",
  fileAttachments: "common",
  message: "common",
};

// 存储修改
const changes = {
  ko: new Map(), // filePath -> { keys to add }
  zh: new Map(),
};

/**
 * 确定键应该放在哪个翻译文件
 */
function getTargetFile(key) {
  // 按最长前缀匹配
  const prefixes = Object.keys(KEY_TO_FILE_MAPPING).sort(
    (a, b) => b.length - a.length,
  );

  for (const prefix of prefixes) {
    if (key.startsWith(prefix + ".") || key === prefix) {
      return KEY_TO_FILE_MAPPING[prefix];
    }
  }

  // 默认放到共享层
  return "shared/i18n/locales";
}

/**
 * 获取共享层的子文件名
 */
function getSharedSubfile(key) {
  const firstPart = key.split(".")[0];
  return SHARED_KEY_TO_SUBFILE[firstPart] || "common";
}

/**
 * 设置嵌套对象的值
 */
function setNestedValue(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  if (!(lastPart in current)) {
    current[lastPart] = value;
    return true; // 新增
  }
  return false; // 已存在
}

/**
 * 检查嵌套对象是否有某个键
 */
function hasNestedKey(obj, keyPath) {
  const parts = keyPath.split(".");
  let current = obj;

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

/**
 * 生成占位符翻译值
 */
function generatePlaceholder(key, lang) {
  // 从键中提取最后一部分作为基础
  const lastPart = key.split(".").pop();

  // 转换 camelCase 为空格分隔的单词，首字母大写
  const words = lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  if (lang === "ko") {
    return `[TODO-KO] ${words}`;
  } else {
    return `[TODO-ZH] ${words}`;
  }
}

/**
 * 处理缺失的键
 */
function processMissingKeys(missingKeys) {
  for (const key of Object.keys(missingKeys)) {
    const targetDir = getTargetFile(key);
    const isShared = targetDir.startsWith("shared/i18n/locales");

    let koPath, zhPath;

    if (isShared) {
      const subfile = getSharedSubfile(key);
      koPath = path.join(SRC_DIR, targetDir, "ko", `${subfile}.json`);
      zhPath = path.join(SRC_DIR, targetDir, "zh", `${subfile}.json`);
    } else {
      koPath = path.join(SRC_DIR, targetDir, "ko.json");
      zhPath = path.join(SRC_DIR, targetDir, "zh.json");
    }

    // 添加到 ko 修改列表
    if (!changes.ko.has(koPath)) {
      changes.ko.set(koPath, []);
    }
    changes.ko.get(koPath).push(key);

    // 添加到 zh 修改列表
    if (!changes.zh.has(zhPath)) {
      changes.zh.set(zhPath, []);
    }
    changes.zh.get(zhPath).push(key);
  }
}

/**
 * 应用修改到翻译文件
 */
function applyChanges(dryRun = false) {
  let totalAdded = 0;
  let totalSkipped = 0;

  const allFiles = new Set([...changes.ko.keys(), ...changes.zh.keys()]);

  for (const filePath of allFiles) {
    const lang =
      filePath.includes("/ko/") ||
      filePath.includes("\\ko\\") ||
      filePath.endsWith("ko.json")
        ? "ko"
        : "zh";
    const keysToAdd =
      lang === "ko" ? changes.ko.get(filePath) : changes.zh.get(filePath);

    if (!keysToAdd || keysToAdd.length === 0) continue;

    // 读取现有文件
    let data = {};
    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (e) {
        console.error(`❌ 无法读取 ${filePath}: ${e.message}`);
        continue;
      }
    } else {
      console.log(`⚠️ 文件不存在，将创建: ${filePath}`);
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!dryRun && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const key of keysToAdd) {
      if (hasNestedKey(data, key)) {
        skippedCount++;
        continue;
      }

      const placeholder = generatePlaceholder(key, lang);
      setNestedValue(data, key, placeholder);
      addedCount++;
    }

    if (addedCount > 0) {
      const relativePath = path.relative(SRC_DIR, filePath);
      console.log(
        `📝 ${relativePath}: +${addedCount} 键${skippedCount > 0 ? `, ${skippedCount} 已存在` : ""}`,
      );

      if (!dryRun) {
        fs.writeFileSync(
          filePath,
          JSON.stringify(data, null, 2) + "\n",
          "utf8",
        );
      }
    }

    totalAdded += addedCount;
    totalSkipped += skippedCount;
  }

  return { totalAdded, totalSkipped };
}

// 主函数
async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔧 i18n 缺失键自动修复脚本");
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("⚠️ 预览模式 - 不会实际修改文件\n");
  }

  // 1. 读取报告
  if (!fs.existsSync(REPORT_FILE)) {
    console.error(
      "❌ 找不到报告文件，请先运行: node scripts/check-i18n-usage.js --report",
    );
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_FILE, "utf8"));
  console.log(
    `📊 缺失键统计: ko=${report.summary.missingInKo}, zh=${report.summary.missingInZh}\n`,
  );

  // 2. 处理缺失的键
  processMissingKeys(report.missingInKo);

  // 3. 应用修改
  console.log(dryRun ? "\n📋 预览修改:" : "\n📝 应用修改:");
  const { totalAdded, totalSkipped } = applyChanges(dryRun);

  // 4. 输出汇总
  console.log("\n" + "=".repeat(60));
  console.log(
    `✅ 完成: 添加 ${totalAdded} 个键, 跳过 ${totalSkipped} 个已存在的键`,
  );

  if (dryRun) {
    // 生成预览报告文件
    const previewFile = path.join(__dirname, "i18n-fix-preview.txt");
    let previewContent = "i18n 缺失键修复预览\n";
    previewContent += "=".repeat(60) + "\n\n";

    for (const [filePath, keys] of changes.ko) {
      const relativePath = path.relative(SRC_DIR, filePath);
      previewContent += `📝 ${relativePath} (+${keys.length} 键)\n`;
      keys.forEach((key) => {
        previewContent += `   + ${key}\n`;
      });
      previewContent += "\n";
    }

    fs.writeFileSync(previewFile, previewContent, "utf8");
    console.log(`\n📄 预览详情已保存到: scripts/i18n-fix-preview.txt`);
    console.log("\n💡 提示: 移除 --dry-run 参数以实际应用修改");
  } else {
    console.log(
      "\n💡 提示: 请手动检查 [TODO-KO] 和 [TODO-ZH] 占位符并填写正确的翻译",
    );
  }
}

main().catch((err) => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
