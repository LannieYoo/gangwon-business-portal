#!/usr/bin/env node
// i18n 文件结构检查器

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadTemplate() {
  const templatePath = path.join(__dirname, 'templates/i18n-template.json');
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

// 递归获取所有 key 路径
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// 获取所有 section（顶层 key）
function getSections(obj) {
  return Object.keys(obj);
}

// 检查空值
function findEmptyValues(obj, prefix = '') {
  const empty = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      empty.push(...findEmptyValues(value, fullKey));
    } else if (value === '' || value === null || value === undefined) {
      empty.push(fullKey);
    }
  }
  return empty;
}

function checkI18nFiles(dir) {
  const template = loadTemplate();
  const localesDir = path.join(dir, 'locales');
  
  const results = {
    file: dir,
    checks: [],
  };

  // 加载所有语言文件
  const localeFiles = {};
  for (const locale of template.locales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    if (fs.existsSync(filePath)) {
      localeFiles[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  }

  // 1. 检查语言文件是否存在
  const fileViolations = [];
  for (const locale of template.locales) {
    if (!localeFiles[locale]) {
      fileViolations.push({
        line: 0,
        message: `缺少语言文件: ${locale}.json`,
      });
    }
  }
  results.checks.push({
    name: '语言文件',
    passed: fileViolations.length === 0,
    violations: fileViolations,
  });

  if (Object.keys(localeFiles).length < 2) {
    return results;
  }

  // 2. 检查 key 一致性
  const keyViolations = [];
  const defaultLocale = template.defaultLocale;
  const defaultKeys = new Set(getAllKeys(localeFiles[defaultLocale] || {}));
  
  for (const [locale, data] of Object.entries(localeFiles)) {
    if (locale === defaultLocale) continue;
    
    const localeKeys = new Set(getAllKeys(data));
    
    // 检查缺失的 key
    for (const key of defaultKeys) {
      if (!localeKeys.has(key)) {
        keyViolations.push({
          line: 0,
          message: `${locale}.json 缺少 key: ${key}`,
          suggestion: `从 ${defaultLocale}.json 复制并翻译`,
        });
      }
    }
    
    // 检查多余的 key
    for (const key of localeKeys) {
      if (!defaultKeys.has(key)) {
        keyViolations.push({
          line: 0,
          message: `${locale}.json 多余 key: ${key}`,
          suggestion: `在 ${defaultLocale}.json 中不存在`,
        });
      }
    }
  }
  results.checks.push({
    name: 'Key 一致性',
    passed: keyViolations.length === 0,
    violations: keyViolations,
  });

  // 3. 检查空值
  const emptyViolations = [];
  if (template.forbidden?.emptyValues) {
    for (const [locale, data] of Object.entries(localeFiles)) {
      const emptyKeys = findEmptyValues(data);
      for (const key of emptyKeys) {
        emptyViolations.push({
          line: 0,
          message: `${locale}.json 空值: ${key}`,
          suggestion: '添加翻译内容',
        });
      }
    }
  }
  results.checks.push({
    name: '空值检查',
    passed: emptyViolations.length === 0,
    violations: emptyViolations,
  });

  // 4. 检查必需的 section
  const sectionViolations = [];
  const requiredSections = template.required?.sections || [];
  for (const [locale, data] of Object.entries(localeFiles)) {
    const sections = getSections(data);
    for (const required of requiredSections) {
      if (!sections.includes(required)) {
        sectionViolations.push({
          line: 0,
          message: `${locale}.json 缺少 section: ${required}`,
        });
      }
    }
  }
  results.checks.push({
    name: '必需 Section',
    passed: sectionViolations.length === 0,
    violations: sectionViolations,
  });

  // 5. 检查 key 命名规范
  const namingViolations = [];
  const keyStyle = template.naming?.keyStyle || 'camelCase';
  
  // 允许的特殊 key 模式（外部数据格式）
  const allowedPatterns = [
    /^[A-Z]$/,            // 单个大写字母（产业分类代码 A-U）
    /^[A-Z]\d+$/,         // 大写字母+数字（Q1-Q4 季度）
    /^\d+$/,              // 纯数字（产业子分类代码）
    /^[a-z]+_[a-z0-9_]+$/ // snake_case（外部数据 key）
  ];
  
  for (const [locale, data] of Object.entries(localeFiles)) {
    const allKeys = getAllKeys(data);
    for (const fullKey of allKeys) {
      const parts = fullKey.split('.');
      const lastKey = parts[parts.length - 1];
      
      // 检查是否匹配允许的特殊模式
      const isAllowed = allowedPatterns.some(pattern => pattern.test(lastKey));
      if (isAllowed) continue;
      
      // 检查 camelCase
      if (keyStyle === 'camelCase' && !/^[a-z][a-zA-Z0-9]*$/.test(lastKey)) {
        namingViolations.push({
          line: 0,
          message: `${locale}.json key 命名不规范: ${fullKey}`,
          suggestion: '使用 camelCase 命名',
        });
      }
    }
  }
  results.checks.push({
    name: 'Key 命名',
    passed: namingViolations.length === 0,
    violations: namingViolations,
  });

  return results;
}

function printReport(results) {
  console.log(`\n检查目录: ${results.file}`);
  console.log('='.repeat(60));

  for (const check of results.checks) {
    if (check.passed) {
      console.log(`[PASS] ${check.name}`);
    } else {
      console.log(`[FAIL] ${check.name}`);
      // 限制显示数量
      const maxShow = 10;
      const violations = check.violations.slice(0, maxShow);
      for (const v of violations) {
        console.log(`  ${v.message}`);
        if (v.suggestion) {
          console.log(`    → ${v.suggestion}`);
        }
      }
      if (check.violations.length > maxShow) {
        console.log(`  ... 还有 ${check.violations.length - maxShow} 个问题`);
      }
      console.log('\n' + '='.repeat(60));
      console.log(`[STOP] 检查失败，请先修复上述问题！`);
      return false;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('[PASS] 所有检查通过');
  return true;
}

// CLI
if (process.argv[1].includes('i18n-checker')) {
  const dir = process.argv[2] || 'src/shared/i18n';
  const results = checkI18nFiles(dir);
  process.exit(printReport(results) ? 0 : 1);
}

export { checkI18nFiles, printReport };
