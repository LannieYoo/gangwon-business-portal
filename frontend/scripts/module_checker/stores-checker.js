#!/usr/bin/env node
/**
 * Stores 文件结构检查器
 * 基于 templates/stores-template.json 规则检查
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadTemplate() {
  const templatePath = path.join(__dirname, 'templates/stores-template.json');
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

function checkStoresFile(filePath) {
  const template = loadTemplate();
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');
  
  const results = {
    file: filePath,
    checks: [],
  };

  // 1. 检查必需的导入
  const importViolations = [];
  for (const required of template.required.imports) {
    const importRegex = new RegExp(`from\\s+['"].*${required}.*['"]|import.*${required}`);
    if (!importRegex.test(code)) {
      importViolations.push({
        line: 0,
        message: `缺少必需导入: ${required}`,
      });
    }
  }
  results.checks.push({
    name: '必需导入',
    passed: importViolations.length === 0,
    violations: importViolations,
  });

  // 2. 检查 Store 命名规范
  const namingViolations = [];
  const storeRegex = /export\s+const\s+(\w+)\s*=\s*create/g;
  let match;
  
  while ((match = storeRegex.exec(code)) !== null) {
    const storeName = match[1];
    const line = code.substring(0, match.index).split('\n').length;
    
    if (!storeName.startsWith(template.naming.storePrefix)) {
      namingViolations.push({
        line,
        message: `Store 命名错误: ${storeName}`,
        suggestion: `应以 "${template.naming.storePrefix}" 开头`,
      });
    }
    
    if (!storeName.endsWith(template.naming.storeSuffix)) {
      namingViolations.push({
        line,
        message: `Store 命名错误: ${storeName}`,
        suggestion: `应以 "${template.naming.storeSuffix}" 结尾`,
      });
    }
  }
  results.checks.push({
    name: 'Store 命名',
    passed: namingViolations.length === 0,
    violations: namingViolations,
  });


  // 3. 检查 devtools 使用
  const devtoolsViolations = [];
  if (template.structure.useDevtools) {
    const storeCreateRegex = /export\s+const\s+(\w+)\s*=\s*create\s*\(/g;
    
    while ((match = storeCreateRegex.exec(code)) !== null) {
      const storeName = match[1];
      const line = code.substring(0, match.index).split('\n').length;
      const afterCreate = code.substring(match.index + match[0].length, match.index + match[0].length + 100);
      
      if (!afterCreate.includes('devtools')) {
        devtoolsViolations.push({
          line,
          message: `Store ${storeName} 未使用 devtools`,
          suggestion: '使用 devtools middleware 包装',
        });
      }
    }
  }
  results.checks.push({
    name: 'Devtools 使用',
    passed: devtoolsViolations.length === 0,
    violations: devtoolsViolations,
  });

  // 4. 检查 Store 名称标签
  const storeNameViolations = [];
  if (template.structure.hasStoreName) {
    const devtoolsCallRegex = /devtools\s*\([^)]*\)\s*,\s*\{[^}]*name:\s*['"](\w+)['"]/g;
    const storeNames = [];
    
    const storeDefRegex = /export\s+const\s+(\w+)\s*=\s*create/g;
    while ((match = storeDefRegex.exec(code)) !== null) {
      storeNames.push(match[1]);
    }
    
    for (const storeName of storeNames) {
      const hasNameConfig = code.includes(`name: '`) || code.includes(`name: "`);
      if (!hasNameConfig) {
        storeNameViolations.push({
          line: 0,
          message: `Store ${storeName} 缺少 devtools name 配置`,
          suggestion: '添加 { name: "StoreName" } 配置',
        });
      }
    }
  }
  results.checks.push({
    name: 'Store 名称配置',
    passed: storeNameViolations.length === 0,
    violations: storeNameViolations,
  });

  // 5. 检查 Action 命名规范
  const actionViolations = [];
  const actionRegex = /(\w+):\s*(?:\([^)]*\)\s*=>|function|\(set\)|async)/g;
  const validPrefixes = template.naming.actionPrefixes;
  
  while ((match = actionRegex.exec(code)) !== null) {
    const actionName = match[1];
    const line = code.substring(0, match.index).split('\n').length;
    
    if (['user', 'isAuthenticated', 'isLoading', 'language', 'sidebarCollapsed', 'theme'].includes(actionName)) {
      continue;
    }
    
    const hasValidPrefix = validPrefixes.some(prefix => actionName.startsWith(prefix));
    if (!hasValidPrefix && !actionName.includes('State')) {
      actionViolations.push({
        line,
        message: `Action 命名不规范: ${actionName}`,
        suggestion: `建议前缀: ${validPrefixes.join(', ')}`,
      });
    }
  }
  results.checks.push({
    name: 'Action 命名',
    passed: actionViolations.length === 0,
    violations: actionViolations,
  });


  // 6. 检查 Action devtools 标签
  const actionLabelViolations = [];
  const setCallRegex = /set\s*\([^,]+,\s*false\s*,\s*['"](\w+)['"]\)/g;
  const setCallNoLabelRegex = /set\s*\(\s*\{[^}]+\}\s*\)(?!\s*,\s*false)/g;
  
  let labelMatch;
  while ((labelMatch = setCallNoLabelRegex.exec(code)) !== null) {
    const line = code.substring(0, labelMatch.index).split('\n').length;
    actionLabelViolations.push({
      line,
      message: `set() 调用缺少 devtools 标签`,
      suggestion: '添加 set({...}, false, "actionName")',
    });
  }
  results.checks.push({
    name: 'Action 标签',
    passed: actionLabelViolations.length === 0,
    violations: actionLabelViolations,
  });

  // 7. 检查禁止的模式
  const patternViolations = [];
  for (const pattern of template.forbidden.patterns) {
    if (code.includes(pattern)) {
      patternViolations.push({
        line: findLineNumber(code, pattern),
        message: `禁止的模式: ${pattern}`,
      });
    }
  }
  results.checks.push({
    name: '禁止模式',
    passed: patternViolations.length === 0,
    violations: patternViolations,
  });

  // 8. 检查 Service 导入
  const serviceImportViolations = [];
  if (template.forbidden.serviceImports) {
    const serviceImportRegex = /import\s+.*from\s+['"].*\.service['"]/g;
    
    while ((match = serviceImportRegex.exec(code)) !== null) {
      const line = code.substring(0, match.index).split('\n').length;
      serviceImportViolations.push({
        line,
        message: `Store 不应导入 service: ${match[0]}`,
        suggestion: 'Store 只管理状态，API 调用应在组件或 hooks 中进行',
      });
    }
  }
  results.checks.push({
    name: 'Service 导入',
    passed: serviceImportViolations.length === 0,
    violations: serviceImportViolations,
  });

  // 9. 检查注释规范（单行中文注释）
  const commentViolations = [];
  if (template.codeStyle?.singleLineComment) {
    // 检查文件顶部是否有单行注释
    const firstNonEmptyLine = lines.find(line => line.trim().length > 0);
    if (firstNonEmptyLine && !firstNonEmptyLine.trim().startsWith('//')) {
      commentViolations.push({
        line: 1,
        message: '文件顶部应使用单行注释',
        suggestion: '使用 // 单行中文注释，而非 /** */ 多行注释',
      });
    }
    
    // 检查是否有 JSDoc 多行注释
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    while ((match = jsdocRegex.exec(code)) !== null) {
      const line = code.substring(0, match.index).split('\n').length;
      commentViolations.push({
        line,
        message: '禁止使用 JSDoc 多行注释',
        suggestion: '使用 // 单行中文注释',
      });
    }
  }
  
  // 检查每个 store 前是否有分隔注释
  if (template.codeStyle?.requireSectionComment) {
    const storeDefRegex = /export\s+const\s+(\w+Store)\s*=/g;
    while ((match = storeDefRegex.exec(code)) !== null) {
      const storeName = match[1];
      const line = code.substring(0, match.index).split('\n').length;
      const prevLines = lines.slice(Math.max(0, line - 4), line - 1);
      
      // 检查前几行是否有分隔注释（包含 === 的行）
      const hasSectionComment = prevLines.some(l => l.includes('==='));
      if (!hasSectionComment) {
        commentViolations.push({
          line,
          message: `Store ${storeName} 缺少分隔注释`,
          suggestion: '添加 // ===== storeName ===== 分隔注释',
        });
      }
    }
  }
  
  results.checks.push({
    name: '注释规范',
    passed: commentViolations.length === 0,
    violations: commentViolations,
  });

  return results;
}

function findLineNumber(code, pattern) {
  const index = code.indexOf(pattern);
  if (index === -1) return 0;
  return code.substring(0, index).split('\n').length;
}

function checkDirectory(dir) {
  const results = [];
  const files = fs.readdirSync(dir, { recursive: true });

  for (const file of files) {
    if (file.endsWith('.js') && (file.includes('store') || dir.includes('stores'))) {
      results.push(checkStoresFile(path.join(dir, file)));
    }
  }

  return results;
}

function printReport(results) {
  let allPassed = true;

  for (const result of results) {
    console.log(`\n检查文件: ${result.file}`);
    console.log('='.repeat(60));

    for (const check of result.checks) {
      if (check.passed) {
        console.log(`[PASS] ${check.name}`);
      } else {
        console.log(`[FAIL] ${check.name}`);
        allPassed = false;
        for (const v of check.violations) {
          const location = v.line > 0 ? `:${v.line}` : '';
          console.log(`  ${result.file}${location}`);
          console.log(`    ${v.message}`);
          if (v.suggestion) {
            console.log(`    → ${v.suggestion}`);
          }
        }
        console.log('\n' + '='.repeat(60));
        console.log(`[STOP] 检查失败，请先修复上述问题！`);
        return false;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('[PASS] 所有检查通过');
  return true;
}

// CLI
if (process.argv[1].includes('stores-checker')) {
  const dir = process.argv[2] || 'src/shared/stores';
  const results = checkDirectory(dir);
  process.exit(printReport(results) ? 0 : 1);
}

export { checkStoresFile, checkDirectory, printReport };
