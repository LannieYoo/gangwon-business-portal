#!/usr/bin/env node
// Hooks 文件结构检查器

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadTemplate() {
  const templatePath = path.join(__dirname, 'templates/hooks-template.json');
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

function checkHooksFile(filePath) {
  const template = loadTemplate();
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');
  
  const results = {
    file: filePath,
    checks: [],
  };

  // 1. 检查 React 导入
  const importViolations = [];
  const reactImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]react['"]/;
  const reactMatch = reactImportRegex.exec(code);
  
  if (!reactMatch) {
    importViolations.push({
      line: 0,
      message: '缺少 React hooks 导入',
    });
  }
  results.checks.push({
    name: 'React 导入',
    passed: importViolations.length === 0,
    violations: importViolations,
  });

  // 2. 检查 Hook 命名规范
  const namingViolations = [];
  const hookRegex = /export\s+function\s+(\w+)\s*\(/g;
  let match;
  
  while ((match = hookRegex.exec(code)) !== null) {
    const hookName = match[1];
    const line = code.substring(0, match.index).split('\n').length;
    
    if (!hookName.startsWith(template.naming.hookPrefix)) {
      namingViolations.push({
        line,
        message: `Hook 命名错误: ${hookName}`,
        suggestion: `应以 "${template.naming.hookPrefix}" 开头`,
      });
    }
  }
  results.checks.push({
    name: 'Hook 命名',
    passed: namingViolations.length === 0,
    violations: namingViolations,
  });

  // 3. 检查禁止的模式
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

  // 4. 检查直接 DOM 操作
  const domViolations = [];
  if (template.forbidden.directDomAccess) {
    const domPatterns = ['document.getElementById', 'document.querySelector', 'document.getElementsBy'];
    for (const pattern of domPatterns) {
      if (code.includes(pattern)) {
        domViolations.push({
          line: findLineNumber(code, pattern),
          message: `禁止直接 DOM 操作: ${pattern}`,
          suggestion: '使用 useRef 代替',
        });
      }
    }
  }
  results.checks.push({
    name: 'DOM 操作',
    passed: domViolations.length === 0,
    violations: domViolations,
  });

  // 5. 检查注释规范（单行中文注释）
  const commentViolations = [];
  
  if (template.codeStyle?.singleLineComment) {
    // 检查文件顶部是否有单行注释
    const firstNonEmptyLine = lines.find(line => line.trim().length > 0);
    if (firstNonEmptyLine && !firstNonEmptyLine.trim().startsWith('//')) {
      commentViolations.push({
        line: 1,
        message: '文件顶部应使用单行注释',
        suggestion: '使用 // 单行中文注释',
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
  
  // 检查每个 hook 前是否有分隔注释
  if (template.codeStyle?.requireSectionComment) {
    const hookDefRegex = /export\s+function\s+(use\w+)\s*\(/g;
    while ((match = hookDefRegex.exec(code)) !== null) {
      const hookName = match[1];
      const line = code.substring(0, match.index).split('\n').length;
      const prevLines = lines.slice(Math.max(0, line - 4), line - 1);
      
      // 检查前几行是否有分隔注释（包含 === 的行）
      const hasSectionComment = prevLines.some(l => l.includes('==='));
      if (!hasSectionComment) {
        commentViolations.push({
          line,
          message: `Hook ${hookName} 缺少分隔注释`,
          suggestion: '添加 // ===== hookName ===== 分隔注释',
        });
      }
    }
  }
  
  results.checks.push({
    name: '注释规范',
    passed: commentViolations.length === 0,
    violations: commentViolations,
  });

  // 6. 检查 function 关键字
  const functionViolations = [];
  if (template.codeStyle?.functionKeyword) {
    const arrowHookRegex = /export\s+const\s+(use\w+)\s*=\s*\(/g;
    while ((match = arrowHookRegex.exec(code)) !== null) {
      const hookName = match[1];
      const line = code.substring(0, match.index).split('\n').length;
      functionViolations.push({
        line,
        message: `Hook ${hookName} 应使用 function 关键字`,
        suggestion: '使用 export function useXxx() 而非箭头函数',
      });
    }
  }
  results.checks.push({
    name: 'function 关键字',
    passed: functionViolations.length === 0,
    violations: functionViolations,
  });

  // 7. 检查 useCallback 使用
  const callbackViolations = [];
  if (template.codeStyle?.useCallback) {
    // 跳过 useAuth 这种返回 async 函数的 hook（它们的依赖是 store actions）
    // 只检查简单的同步回调函数
    const simpleCallbackRegex = /const\s+(\w+)\s*=\s*\(\)\s*=>\s*set\w+\(/g;
    while ((match = simpleCallbackRegex.exec(code)) !== null) {
      const funcName = match[1];
      const line = code.substring(0, match.index).split('\n').length;
      const lineContent = lines[line - 1] || '';
      
      if (!lineContent.includes('useCallback')) {
        callbackViolations.push({
          line,
          message: `简单回调 ${funcName} 应使用 useCallback`,
          suggestion: `const ${funcName} = useCallback(() => {...}, [])`,
        });
      }
    }
  }
  results.checks.push({
    name: 'useCallback 使用',
    passed: callbackViolations.length === 0,
    violations: callbackViolations,
  });

  // 8. 检查导出规范
  const exportViolations = [];
  const defaultExportRegex = /export\s+default/;
  if (defaultExportRegex.test(code)) {
    exportViolations.push({
      line: findLineNumber(code, 'export default'),
      message: '不应使用 default export',
      suggestion: '使用 named export: export function useXxx',
    });
  }
  results.checks.push({
    name: '导出规范',
    passed: exportViolations.length === 0,
    violations: exportViolations,
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
    if (file.endsWith('.js') && (file.includes('hook') || file.includes('use') || dir.includes('hooks'))) {
      results.push(checkHooksFile(path.join(dir, file)));
    }
  }

  return results;
}

function printReport(results) {
  for (const result of results) {
    console.log(`\n检查文件: ${result.file}`);
    console.log('='.repeat(60));

    for (const check of result.checks) {
      if (check.passed) {
        console.log(`[PASS] ${check.name}`);
      } else {
        console.log(`[FAIL] ${check.name}`);
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
if (process.argv[1].includes('hooks-checker')) {
  const dir = process.argv[2] || 'src/shared/hooks';
  const results = checkDirectory(dir);
  process.exit(printReport(results) ? 0 : 1);
}

export { checkHooksFile, checkDirectory, printReport };
