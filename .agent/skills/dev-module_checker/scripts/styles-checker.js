#!/usr/bin/env node
/**
 * Styles 文件结构检查器
 * 基于 templates/styles-template.json 规则检查
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadTemplate() {
  const templatePath = path.join(__dirname, 'templates/styles-template.json');
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

function checkStylesFile(filePath) {
  const template = loadTemplate();
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');
  
  const results = {
    file: filePath,
    checks: [],
  };

  // 1. 检查必需的 Tailwind 导入
  const importViolations = [];
  for (const required of template.required.imports) {
    if (!code.includes(required)) {
      importViolations.push({
        line: 0,
        message: `缺少必需导入: ${required}`,
      });
    }
  }
  results.checks.push({
    name: 'Tailwind 导入',
    passed: importViolations.length === 0,
    violations: importViolations,
  });

  // 2. 检查导入顺序
  const importOrderViolations = [];
  const importOrder = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
  let lastIndex = -1;
  for (const imp of importOrder) {
    const index = code.indexOf(imp);
    if (index !== -1) {
      if (index < lastIndex) {
        importOrderViolations.push({
          line: findLineNumber(code, imp),
          message: `导入顺序错误: ${imp}`,
          suggestion: '顺序应为: base → components → utilities',
        });
      }
      lastIndex = index;
    }
  }
  results.checks.push({
    name: '导入顺序',
    passed: importOrderViolations.length === 0,
    violations: importOrderViolations,
  });


  // 3. 检查必需的 @layer
  const layerViolations = [];
  for (const layer of template.required.layers) {
    const layerRegex = new RegExp(`@layer\\s+${layer}\\s*\\{`);
    if (!layerRegex.test(code)) {
      layerViolations.push({
        line: 0,
        message: `缺少 @layer ${layer}`,
        suggestion: `添加 @layer ${layer} { ... }`,
      });
    }
  }
  results.checks.push({
    name: 'Layer 结构',
    passed: layerViolations.length === 0,
    violations: layerViolations,
  });

  // 4. 检查禁止的模式
  const patternViolations = [];
  for (const pattern of template.forbidden.patterns) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let match;
    const tempCode = code;
    while ((match = regex.exec(tempCode)) !== null) {
      patternViolations.push({
        line: findLineNumber(code, match[0]),
        message: `禁止的模式: ${pattern}`,
        suggestion: '请使用 Tailwind 类或配置替代',
      });
    }
  }
  results.checks.push({
    name: '禁止模式',
    passed: patternViolations.length === 0,
    violations: patternViolations,
  });

  // 5. 检查硬编码颜色
  const colorViolations = [];
  if (template.forbidden.hardcodedColors) {
    const hexColorRegex = /#[0-9a-fA-F]{3,8}\b/g;
    const rgbColorRegex = /rgb\s*\([^)]+\)/gi;
    const rgbaColorRegex = /rgba\s*\([^)]+\)/gi;
    
    const allowedColors = ['#fff', '#ffffff', '#000', '#000000'];
    
    let match;
    while ((match = hexColorRegex.exec(code)) !== null) {
      const color = match[0].toLowerCase();
      if (!allowedColors.includes(color)) {
        colorViolations.push({
          line: findLineNumber(code, match[0]),
          message: `硬编码颜色: ${match[0]}`,
          suggestion: '使用 Tailwind 颜色类或在 tailwind.config.js 中配置',
        });
      }
    }
    
    while ((match = rgbColorRegex.exec(code)) !== null) {
      colorViolations.push({
        line: findLineNumber(code, match[0]),
        message: `硬编码颜色: ${match[0]}`,
        suggestion: '使用 Tailwind 颜色类',
      });
    }
    
    while ((match = rgbaColorRegex.exec(code)) !== null) {
      if (!match[0].includes('var(')) {
        colorViolations.push({
          line: findLineNumber(code, match[0]),
          message: `硬编码颜色: ${match[0]}`,
          suggestion: '使用 Tailwind 颜色类或 CSS 变量',
        });
      }
    }
  }
  results.checks.push({
    name: '颜色规范',
    passed: colorViolations.length === 0,
    violations: colorViolations,
  });


  // 6. 检查硬编码间距
  const spacingViolations = [];
  if (template.forbidden.hardcodedSpacing) {
    const pxRegex = /:\s*\d+px\b/g;
    const allowedPx = ['1px', '2px'];
    
    let match;
    while ((match = pxRegex.exec(code)) !== null) {
      const value = match[0].replace(':', '').trim();
      if (!allowedPx.includes(value)) {
        spacingViolations.push({
          line: findLineNumber(code, match[0]),
          message: `硬编码间距: ${value}`,
          suggestion: '使用 Tailwind spacing scale 或 @apply',
        });
      }
    }
  }
  results.checks.push({
    name: '间距规范',
    passed: spacingViolations.length === 0,
    violations: spacingViolations,
  });

  // 7. 检查类名命名规范
  const namingViolations = [];
  const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/g;
  let match;
  while ((match = classRegex.exec(code)) !== null) {
    const className = match[1];
    
    if (!/^[a-z][a-z0-9-]*$/.test(className)) {
      namingViolations.push({
        line: findLineNumber(code, match[0]),
        message: `类名不符合 kebab-case: .${className}`,
        suggestion: '使用小写字母和连字符',
      });
    }
  }
  results.checks.push({
    name: '命名规范',
    passed: namingViolations.length === 0,
    violations: namingViolations,
  });

  // 8. 检查选择器嵌套深度
  const depthViolations = [];
  const maxDepth = template.codeStyle?.maxSelectorDepth || 3;
  const selectorRegex = /([.#]?[a-zA-Z][a-zA-Z0-9_-]*(?:\s+[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*)\s*\{/g;
  
  while ((match = selectorRegex.exec(code)) !== null) {
    const selector = match[1];
    const depth = selector.split(/\s+/).length;
    if (depth > maxDepth) {
      depthViolations.push({
        line: findLineNumber(code, match[0]),
        message: `选择器嵌套过深: ${selector} (${depth}层)`,
        suggestion: `最大允许 ${maxDepth} 层嵌套`,
      });
    }
  }
  results.checks.push({
    name: '嵌套深度',
    passed: depthViolations.length === 0,
    violations: depthViolations,
  });

  // 9. 检查 @apply 使用
  const applyViolations = [];
  if (template.codeStyle?.preferApply) {
    const rawCssProps = [
      'margin:', 'padding:', 'width:', 'height:', 
      'display:', 'flex:', 'grid:', 'gap:',
      'font-size:', 'font-weight:', 'text-align:',
      'border-radius:', 'background-color:', 'color:'
    ];
    
    for (const prop of rawCssProps) {
      const propRegex = new RegExp(`^\\s*${prop.replace(':', '\\s*:')}`, 'gm');
      let propMatch;
      while ((propMatch = propRegex.exec(code)) !== null) {
        const lineNum = findLineNumber(code, propMatch[0]);
        const lineContent = lines[lineNum - 1] || '';
        
        if (!lineContent.includes('@apply') && !lineContent.includes('--')) {
          applyViolations.push({
            line: lineNum,
            message: `建议使用 @apply: ${prop.replace(':', '')}`,
            suggestion: '使用 @apply 和 Tailwind 类',
          });
        }
      }
    }
  }
  results.checks.push({
    name: '@apply 使用',
    passed: applyViolations.length === 0,
    violations: applyViolations,
  });

  // 10. 检查注释规范
  const commentViolations = [];
  
  // 检查文件顶部注释
  if (template.codeStyle?.requireFileComment) {
    const firstNonEmptyLine = lines.find(line => line.trim().length > 0);
    if (firstNonEmptyLine && !firstNonEmptyLine.trim().startsWith('/*') && !firstNonEmptyLine.trim().startsWith('//')) {
      commentViolations.push({
        line: 1,
        message: '缺少文件顶部注释',
        suggestion: '在文件开头添加注释说明文件用途',
      });
    }
  }
  
  // 检查 @layer 块前的注释
  if (template.codeStyle?.requireSectionComment) {
    const layerRegex = /@layer\s+(\w+)\s*\{/g;
    
    while ((match = layerRegex.exec(code)) !== null) {
      const layerName = match[1];
      const lineNum = code.substring(0, match.index).split('\n').length;
      const prevLine = lines[lineNum - 2] || '';
      
      // 检查上一行是否有注释
      if (!prevLine.trim().startsWith('/*') && !prevLine.trim().startsWith('//') && !prevLine.trim().startsWith('*')) {
        commentViolations.push({
          line: lineNum,
          message: `@layer ${layerName} 缺少注释`,
          suggestion: '在 @layer 块前添加注释说明',
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
    if (file.endsWith('.css')) {
      results.push(checkStylesFile(path.join(dir, file)));
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
if (process.argv[1].includes('styles-checker')) {
  const dir = process.argv[2] || 'src/shared/styles';
  const results = checkDirectory(dir);
  process.exit(printReport(results) ? 0 : 1);
}

export { checkStylesFile, checkDirectory, printReport };
