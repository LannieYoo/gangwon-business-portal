/**
 * i18n JSX 规范检查脚本
 *
 * 检查项：
 * 1. 翻译键格式规范 - t() 调用中的键名是否符合命名规范
 * 2. 硬编码文本检测 - JSX 中未国际化的中文/韩文硬编码文本
 * 3. 动态键使用检测 - 可能有问题的动态键拼接
 * 4. 备用值规范 - t('key', 'fallback') 格式检查
 * 5. 命名空间一致性 - 键前缀是否与模块位置匹配
 * 6. 缺失翻译键检查 - 键是否存在于翻译文件
 *
 * 用法：
 *   node scripts/lint-i18n-jsx.js              # 完整检查
 *   node scripts/lint-i18n-jsx.js --summary    # 仅输出摘要
 *   node scripts/lint-i18n-jsx.js --fix-report # 生成详细修复报告
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, relative } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const SRC_DIR = path.join(__dirname, "..", "src");
const REPORT_FILE = path.join(__dirname, "i18n-lint-report.json");

// 正则表达式
const CHINESE_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const KOREAN_REGEX =
  /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\ud7b0-\ud7ff]/;

// T函数调用匹配
const T_FUNCTION_PATTERNS = {
  // t("key") 或 t('key') - 标准调用
  standard: /\bt\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  // t("key", { ... }) - 带插值
  withInterpolation: /\bt\(\s*["'`]([^"'`]+)["'`]\s*,\s*\{/g,
  // t("key", "fallback") - 带备用值
  withFallback: /\bt\(\s*["'`]([^"'`]+)["'`]\s*,\s*["'`]([^"'`]+)["'`]\s*\)/g,
  // t(`template${...}`) - 动态键
  templateLiteral: /\bt\(\s*`([^`]+)`\s*\)/g,
  // t(variable) - 变量键
  variable: /\bt\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/g,
  // t(expr, ...) - 表达式
  expression: /\bt\(\s*([^"'`][^)]*)\s*\)/g,
};

// JSX 文本内容匹配 - 匹配标签之间的文本
const JSX_TEXT_PATTERNS = {
  // >文本内容< 之间的内容
  betweenTags: />([^<>{]+)</g,
  // 字符串属性值 title="文本"
  stringAttr: /(?:title|label|placeholder|alt|aria-label)=["']([^"']+)["']/g,
  // 注释除外
};

// 模块到键前缀的映射
const MODULE_TO_PREFIX_MAP = {
  "admin/layouts": "admin.layouts",
  "admin/modules/auth": "admin.auth",
  "admin/modules/content": "admin.content",
  "admin/modules/dashboard": "admin.dashboard",
  "admin/modules/members": "admin.members",
  "admin/modules/messages": "admin.messages",
  "admin/modules/performance": "admin.performance",
  "admin/modules/projects": "admin.projects",
  "admin/modules/statistics": "admin.statistics",
  "member/layouts": "member.layouts",
  "member/modules/about": "member.about",
  "member/modules/auth": "member.auth",
  "member/modules/home": "member.home",
  "member/modules/performance": "member.performance",
  "member/modules/projects": "member.projects",
  "member/modules/support": "member.support",
  shared: ["common", "enums", "components", "error", "terms", "member"],
};

// 允许的共享键前缀
const SHARED_KEY_PREFIXES = [
  "common",
  "enums",
  "components",
  "error",
  "terms",
  "member",
  "auth",
  "footer",
  "support",
  "notifications",
  "fileAttachments",
  "message",
];

// 问题统计
const issues = {
  // 严重问题
  hardcodedText: [], // 硬编码的中韩文本
  missingKeys: [], // 缺失的翻译键
  invalidKeyFormat: [], // 不规范的键格式

  // 警告
  dynamicKeys: [], // 动态键使用
  fallbackValues: [], // 备用值使用
  namespaceWarnings: [], // 命名空间不匹配

  // 信息
  suggestions: [], // 改进建议
};

// 加载的翻译键
let koKeys = new Set();
let zhKeys = new Set();

/**
 * 获取对象的所有键路径
 */
function getAllKeyPaths(obj, prefix = "") {
  const keys = new Set();
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      getAllKeyPaths(obj[key], fullPath).forEach((k) => keys.add(k));
    } else {
      keys.add(fullPath);
    }
  }
  return keys;
}

/**
 * 加载所有翻译键
 */
function loadAllTranslations() {
  // 共享层
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
      getAllKeyPaths(data).forEach((k) => koKeys.add(k));
    }
    if (fs.existsSync(zhPath)) {
      const data = JSON.parse(fs.readFileSync(zhPath, "utf8"));
      getAllKeyPaths(data).forEach((k) => zhKeys.add(k));
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
    const zhPath = path.join(SRC_DIR, basePath, "zh.json");
    if (fs.existsSync(koPath)) {
      const data = JSON.parse(fs.readFileSync(koPath, "utf8"));
      getAllKeyPaths(data).forEach((k) => koKeys.add(k));
    }
    if (fs.existsSync(zhPath)) {
      const data = JSON.parse(fs.readFileSync(zhPath, "utf8"));
      getAllKeyPaths(data).forEach((k) => zhKeys.add(k));
    }
  });

  console.log(`📚 已加载翻译键: ko=${koKeys.size}, zh=${zhKeys.size}`);
}

/**
 * 获取文件所属模块
 */
function getModuleFromPath(filePath) {
  const relativePath = relative(SRC_DIR, filePath).replace(/\\/g, "/");

  for (const [modulePath, prefix] of Object.entries(MODULE_TO_PREFIX_MAP)) {
    if (relativePath.startsWith(modulePath)) {
      return { modulePath, expectedPrefix: prefix };
    }
  }

  return { modulePath: "shared", expectedPrefix: SHARED_KEY_PREFIXES };
}

/**
 * 检查键格式是否规范
 */
function isValidKeyFormat(key) {
  // 键应该使用点分隔的小写字母和数字
  // 例如: admin.projects.table.title
  const validPattern = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;
  return validPattern.test(key);
}

/**
 * 检查键是否匹配模块命名空间
 */
function checkNamespaceMatch(key, filePath) {
  const { expectedPrefix } = getModuleFromPath(filePath);

  if (Array.isArray(expectedPrefix)) {
    // 共享层，检查是否使用了允许的前缀
    const keyPrefix = key.split(".")[0];
    return (
      expectedPrefix.includes(keyPrefix) ||
      SHARED_KEY_PREFIXES.includes(keyPrefix)
    );
  }

  // 模块专属键应该以模块前缀开头，或者使用共享键
  const keyPrefix = key.split(".").slice(0, 2).join(".");
  const isModuleKey = key.startsWith(expectedPrefix);
  const isSharedKey = SHARED_KEY_PREFIXES.some((p) => key.startsWith(p + "."));

  return isModuleKey || isSharedKey;
}

/**
 * 检测硬编码文本（排除特定情况）
 */
function detectHardcodedText(content, filePath) {
  const hardcodedMatches = [];
  const lines = content.split("\n");

  lines.forEach((line, lineIndex) => {
    const lineNum = lineIndex + 1;

    // 跳过注释行
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      return;
    }

    // 跳过 import 语句
    if (line.includes("import ") || line.includes("from ")) {
      return;
    }

    // 跳过 console 语句
    if (line.includes("console.")) {
      return;
    }

    // 跳过已经使用 t() 的行 (基本检测)
    if (line.includes("t(") && (line.includes("t('") || line.includes('t("'))) {
      return;
    }

    // 检测 JSX 标签之间的中韩文本
    // 例如: <div>中文文本</div>
    const jsxTextMatch = line.match(/>([^<>{}]+)</g);
    if (jsxTextMatch) {
      jsxTextMatch.forEach((match) => {
        const textContent = match.slice(1, -1).trim();
        if (
          textContent &&
          (CHINESE_REGEX.test(textContent) || KOREAN_REGEX.test(textContent))
        ) {
          // 排除纯数字、空白、变量引用等
          if (
            !/^[\s\d\-\/\.:,]+$/.test(textContent) &&
            !textContent.includes("{")
          ) {
            hardcodedMatches.push({
              line: lineNum,
              text: textContent,
              context: line.trim().substring(0, 100),
              type: "jsx-text",
            });
          }
        }
      });
    }

    // 检测字符串属性中的中韩文本
    // 例如: placeholder="请输入..."
    const attrPatterns = [
      /placeholder=["']([^"']+)["']/g,
      /title=["']([^"']+)["']/g,
      /aria-label=["']([^"']+)["']/g,
      /alt=["']([^"']+)["']/g,
    ];

    attrPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const attrValue = match[1];
        if (CHINESE_REGEX.test(attrValue) || KOREAN_REGEX.test(attrValue)) {
          // 排除已经使用 t() 的情况
          if (!line.includes(`t('`) && !line.includes(`t("`)) {
            hardcodedMatches.push({
              line: lineNum,
              text: attrValue,
              context: line.trim().substring(0, 100),
              type: "attribute",
            });
          }
        }
      }
    });
  });

  return hardcodedMatches;
}

/**
 * 分析 t() 调用
 */
function analyzeTCalls(content, filePath) {
  const results = {
    standardCalls: [],
    dynamicCalls: [],
    fallbackCalls: [],
    invalidKeys: [],
    missingKeys: [],
    namespaceIssues: [],
  };

  // 标准 t() 调用
  let match;
  T_FUNCTION_PATTERNS.standard.lastIndex = 0;
  while ((match = T_FUNCTION_PATTERNS.standard.exec(content)) !== null) {
    const key = match[1];
    const lineNum = content.substring(0, match.index).split("\n").length;

    // 检查键格式
    if (!isValidKeyFormat(key)) {
      // 排除动态键
      if (!key.includes("${") && !key.includes("+")) {
        results.invalidKeys.push({ key, line: lineNum });
      }
    }

    // 检查键是否存在
    if (!koKeys.has(key) && !zhKeys.has(key)) {
      // 排除动态部分的键 (如 status.${value})
      if (!key.includes("${")) {
        results.missingKeys.push({ key, line: lineNum });
      }
    }

    // 检查命名空间一致性
    if (!checkNamespaceMatch(key, filePath)) {
      results.namespaceIssues.push({ key, line: lineNum });
    }

    results.standardCalls.push({ key, line: lineNum });
  }

  // 带备用值的 t() 调用
  T_FUNCTION_PATTERNS.withFallback.lastIndex = 0;
  while ((match = T_FUNCTION_PATTERNS.withFallback.exec(content)) !== null) {
    const key = match[1];
    const fallback = match[2];
    const lineNum = content.substring(0, match.index).split("\n").length;

    results.fallbackCalls.push({ key, fallback, line: lineNum });
  }

  // 动态键检测
  T_FUNCTION_PATTERNS.templateLiteral.lastIndex = 0;
  while ((match = T_FUNCTION_PATTERNS.templateLiteral.exec(content)) !== null) {
    const template = match[1];
    const lineNum = content.substring(0, match.index).split("\n").length;

    if (template.includes("${")) {
      results.dynamicCalls.push({
        template: `\`${template}\``,
        line: lineNum,
        type: "template-literal",
      });
    }
  }

  return results;
}

/**
 * 扫描单个文件
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = relative(SRC_DIR, filePath);

  // 分析 t() 调用
  const tCallResults = analyzeTCalls(content, filePath);

  // 检测硬编码文本
  const hardcodedResults = detectHardcodedText(content, filePath);

  // 记录问题
  if (hardcodedResults.length > 0) {
    issues.hardcodedText.push({
      file: relativePath,
      matches: hardcodedResults,
    });
  }

  if (tCallResults.missingKeys.length > 0) {
    issues.missingKeys.push({
      file: relativePath,
      keys: tCallResults.missingKeys,
    });
  }

  if (tCallResults.invalidKeys.length > 0) {
    issues.invalidKeyFormat.push({
      file: relativePath,
      keys: tCallResults.invalidKeys,
    });
  }

  if (tCallResults.dynamicCalls.length > 0) {
    issues.dynamicKeys.push({
      file: relativePath,
      calls: tCallResults.dynamicCalls,
    });
  }

  if (tCallResults.fallbackCalls.length > 0) {
    issues.fallbackValues.push({
      file: relativePath,
      calls: tCallResults.fallbackCalls,
    });
  }

  if (tCallResults.namespaceIssues.length > 0) {
    issues.namespaceWarnings.push({
      file: relativePath,
      keys: tCallResults.namespaceIssues,
    });
  }

  return {
    hasIssues:
      hardcodedResults.length > 0 ||
      tCallResults.missingKeys.length > 0 ||
      tCallResults.invalidKeys.length > 0,
    tCallCount: tCallResults.standardCalls.length,
  };
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir) {
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

  let totalFiles = 0;
  let totalTCalls = 0;
  let filesWithIssues = 0;

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
          const result = scanFile(fullPath);
          totalFiles++;
          totalTCalls += result.tCallCount;
          if (result.hasIssues) {
            filesWithIssues++;
          }
        }
      }
    }
  }

  walkDir(dir);
  return { totalFiles, totalTCalls, filesWithIssues };
}

/**
 * 打印报告
 */
function printReport(stats, summaryOnly = false) {
  console.log("\n" + "═".repeat(70));
  console.log("                    i18n JSX 规范检查报告");
  console.log("═".repeat(70));

  console.log(`\n📊 扫描统计:`);
  console.log(`   • 扫描文件数: ${stats.totalFiles}`);
  console.log(`   • t() 调用总数: ${stats.totalTCalls}`);
  console.log(`   • 存在问题的文件: ${stats.filesWithIssues}`);

  // === 严重问题 ===
  console.log("\n" + "─".repeat(70));
  console.log(" ❌ 严重问题 (需要修复)");
  console.log("─".repeat(70));

  // 硬编码文本
  const hardcodedCount = issues.hardcodedText.reduce(
    (sum, f) => sum + f.matches.length,
    0,
  );
  if (hardcodedCount > 0) {
    console.log(`\n🔴 硬编码中韩文本: ${hardcodedCount} 处`);
    if (!summaryOnly) {
      issues.hardcodedText.forEach(({ file, matches }) => {
        console.log(`   📄 ${file}:`);
        matches.slice(0, 5).forEach((m) => {
          console.log(
            `      L${m.line} [${m.type}]: "${m.text.substring(0, 40)}..."`,
          );
        });
        if (matches.length > 5) {
          console.log(`      ... 和 ${matches.length - 5} 处更多`);
        }
      });
    }
  } else {
    console.log(`\n✅ 无硬编码中韩文本`);
  }

  // 缺失键
  const missingCount = issues.missingKeys.reduce(
    (sum, f) => sum + f.keys.length,
    0,
  );
  if (missingCount > 0) {
    console.log(`\n🔴 缺失的翻译键: ${missingCount} 个`);
    if (!summaryOnly) {
      issues.missingKeys.forEach(({ file, keys }) => {
        console.log(`   📄 ${file}:`);
        keys.slice(0, 5).forEach((k) => {
          console.log(`      L${k.line}: ${k.key}`);
        });
        if (keys.length > 5) {
          console.log(`      ... 和 ${keys.length - 5} 个更多`);
        }
      });
    }
  } else {
    console.log(`\n✅ 所有翻译键均已定义`);
  }

  // 无效键格式
  const invalidCount = issues.invalidKeyFormat.reduce(
    (sum, f) => sum + f.keys.length,
    0,
  );
  if (invalidCount > 0) {
    console.log(`\n🔴 不规范的键格式: ${invalidCount} 个`);
    if (!summaryOnly) {
      issues.invalidKeyFormat.forEach(({ file, keys }) => {
        console.log(`   📄 ${file}:`);
        keys.slice(0, 5).forEach((k) => {
          console.log(`      L${k.line}: ${k.key}`);
        });
        if (keys.length > 5) {
          console.log(`      ... 和 ${keys.length - 5} 个更多`);
        }
      });
    }
  } else {
    console.log(`\n✅ 所有键格式规范`);
  }

  // === 警告 ===
  console.log("\n" + "─".repeat(70));
  console.log(" ⚠️  警告 (建议检查)");
  console.log("─".repeat(70));

  // 动态键
  const dynamicCount = issues.dynamicKeys.reduce(
    (sum, f) => sum + f.calls.length,
    0,
  );
  if (dynamicCount > 0) {
    console.log(`\n⚠️  动态键使用: ${dynamicCount} 处`);
    if (!summaryOnly) {
      issues.dynamicKeys.forEach(({ file, calls }) => {
        console.log(`   📄 ${file}:`);
        calls.slice(0, 3).forEach((c) => {
          console.log(`      L${c.line}: t(${c.template})`);
        });
        if (calls.length > 3) {
          console.log(`      ... 和 ${calls.length - 3} 处更多`);
        }
      });
    }
    console.log(
      `   💡 提示: 动态键可能导致翻译缺失，建议确保所有可能的键都已定义`,
    );
  } else {
    console.log(`\n✅ 无动态键使用`);
  }

  // 备用值
  const fallbackCount = issues.fallbackValues.reduce(
    (sum, f) => sum + f.calls.length,
    0,
  );
  if (fallbackCount > 0) {
    console.log(`\n⚠️  备用值使用: ${fallbackCount} 处`);
    if (!summaryOnly) {
      const sampleFiles = issues.fallbackValues.slice(0, 3);
      sampleFiles.forEach(({ file, calls }) => {
        console.log(`   📄 ${file}: ${calls.length} 处`);
      });
      if (issues.fallbackValues.length > 3) {
        console.log(`   ... 和 ${issues.fallbackValues.length - 3} 个更多文件`);
      }
    }
    console.log(
      `   💡 提示: 使用备用值 t('key', 'fallback') 可能表示翻译键未定义`,
    );
  } else {
    console.log(`\n✅ 无备用值使用`);
  }

  // 命名空间警告
  const namespaceCount = issues.namespaceWarnings.reduce(
    (sum, f) => sum + f.keys.length,
    0,
  );
  if (namespaceCount > 0) {
    console.log(`\n⚠️  命名空间不匹配: ${namespaceCount} 个`);
    if (!summaryOnly) {
      issues.namespaceWarnings.slice(0, 3).forEach(({ file, keys }) => {
        console.log(`   📄 ${file}:`);
        keys.slice(0, 3).forEach((k) => {
          console.log(`      L${k.line}: ${k.key}`);
        });
      });
    }
    console.log(
      `   💡 提示: 键前缀应与模块位置匹配，如 admin/projects 模块应使用 admin.projects.* 键`,
    );
  } else {
    console.log(`\n✅ 所有键命名空间匹配`);
  }

  // === 最终结果 ===
  console.log("\n" + "═".repeat(70));

  const criticalIssues = hardcodedCount + missingCount + invalidCount;
  const warnings = dynamicCount + fallbackCount + namespaceCount;

  if (criticalIssues > 0) {
    console.log(
      `🔴 检查结果: 失败 - 存在 ${criticalIssues} 个严重问题需要修复`,
    );
    return false;
  } else if (warnings > 0) {
    console.log(`🟡 检查结果: 警告 - 存在 ${warnings} 个警告项建议检查`);
    return true;
  } else {
    console.log(`🟢 检查结果: 通过 - 所有 i18n 使用规范`);
    return true;
  }
}

/**
 * 生成详细报告文件
 */
function generateReportFile() {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      hardcodedText: issues.hardcodedText.reduce(
        (sum, f) => sum + f.matches.length,
        0,
      ),
      missingKeys: issues.missingKeys.reduce(
        (sum, f) => sum + f.keys.length,
        0,
      ),
      invalidKeyFormat: issues.invalidKeyFormat.reduce(
        (sum, f) => sum + f.keys.length,
        0,
      ),
      dynamicKeys: issues.dynamicKeys.reduce(
        (sum, f) => sum + f.calls.length,
        0,
      ),
      fallbackValues: issues.fallbackValues.reduce(
        (sum, f) => sum + f.calls.length,
        0,
      ),
      namespaceWarnings: issues.namespaceWarnings.reduce(
        (sum, f) => sum + f.keys.length,
        0,
      ),
    },
    issues,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");
  console.log(`\n📄 详细报告已保存到: scripts/i18n-lint-report.json`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const summaryOnly = args.includes("--summary");
  const generateReport = args.includes("--fix-report");

  console.log("🔍 i18n JSX 规范检查脚本");
  console.log("═".repeat(70));

  // 1. 加载翻译
  loadAllTranslations();

  // 2. 扫描源文件
  console.log(`\n📂 扫描 src 目录...`);
  const stats = scanDirectory(SRC_DIR);

  // 3. 打印报告
  const passed = printReport(stats, summaryOnly);

  // 4. 生成报告文件
  if (generateReport) {
    generateReportFile();
  }

  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error("脚本执行失败:", err);
  process.exit(1);
});
