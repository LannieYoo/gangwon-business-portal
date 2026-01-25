#!/usr/bin/env node
/**
 * Utils 文件结构检查器
 * 基于 templates/utils-template.json 规则检查
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadTemplate() {
  const templatePath = path.join(__dirname, 'templates/utils-template.json');
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

function checkUtilsFile(filePath) {
  const template = loadTemplate();
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');
  let match;
  
  const results = {
    file: filePath,
    checks: [],
  };

  // 1. 检查注释规范 (根据模板配置)
  const commentViolations = [];
  
  if (template.codeStyle?.singleLineComment) {
    const exportFuncLineRegex = /^export\s+function\s+(\w+)/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const funcMatch = line.match(exportFuncLineRegex);
      
      if (funcMatch) {
        const funcName = funcMatch[1];
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        
        // 必须是单行注释 // 开头
        if (!prevLine.startsWith('//')) {
          commentViolations.push({
            line: i + 1,
            message: `函数 ${funcName} 缺少单行注释`,
            suggestion: '函数前应有 // 中文注释说明',
          });
        }
        // 检查是否为中文注释
        else if (!/[\u4e00-\u9fa5]/.test(prevLine)) {
          commentViolations.push({
            line: i,
            message: `函数 ${funcName} 注释应为中文`,
            suggestion: '使用中文单行注释',
          });
        }
      }
    }
  }
  
  if (template.codeStyle?.noInternalComments) {
    const funcBodyRegex = /export\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    while ((match = funcBodyRegex.exec(code)) !== null) {
      const funcName = match[1];
      const startIdx = match.index + match[0].length;
      let braceCount = 1;
      let endIdx = startIdx;
      
      while (braceCount > 0 && endIdx < code.length) {
        if (code[endIdx] === '{') braceCount++;
        else if (code[endIdx] === '}') braceCount--;
        endIdx++;
      }
      
      const funcBody = code.substring(startIdx, endIdx - 1);
      const internalComments = funcBody.match(/^\s+\/\/(?!=).*/gm);
      
      if (internalComments && internalComments.length > 0) {
        const line = code.substring(0, match.index).split('\n').length;
        commentViolations.push({
          line,
          message: `函数 ${funcName} 内部有注释`,
          suggestion: '应移除函数内部注释',
        });
      }
    }
  }
  results.checks.push({
    name: '注释规范',
    passed: commentViolations.length === 0,
    violations: commentViolations,
  });

  // 2. 检查缩进风格 (根据模板配置)
  const indentViolations = [];
  const indentSize = template.codeStyle?.indent || 2;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    if (line.trim().startsWith('*')) continue; // 跳过 JSDoc 注释行
    
    const leadingSpaces = line.match(/^( *)/)[1].length;
    if (leadingSpaces > 0 && leadingSpaces % indentSize !== 0) {
      indentViolations.push({
        line: i + 1,
        message: `缩进不规范: ${leadingSpaces} 空格`,
        suggestion: `应使用 ${indentSize} 空格缩进`,
      });
    }
    
    if (line.startsWith('\t')) {
      indentViolations.push({
        line: i + 1,
        message: '使用了 Tab 缩进',
        suggestion: '应使用空格缩进',
      });
    }
  }
  results.checks.push({
    name: '缩进检查',
    passed: indentViolations.length === 0,
    violations: indentViolations,
  });

  // 3. 检查导入规范
  const importViolations = [];
  
  // 3.1 检查禁止的导入
  for (const forbidden of template.forbidden.imports) {
    const regex = new RegExp(`from\\s+['"].*${forbidden}.*['"]`);
    if (regex.test(code)) {
      importViolations.push({
        line: findLineNumber(code, forbidden),
        message: `禁止导入: ${forbidden}`,
      });
    }
  }
  
  // 3.2 检查导入顺序 (第三方库 → 内部模块)
  const importLines = [];
  const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"]/gm;
  while ((match = importRegex.exec(code)) !== null) {
    const line = code.substring(0, match.index).split('\n').length;
    const source = match[1];
    const isRelative = source.startsWith('.') || source.startsWith('@/');
    importLines.push({ line, source, isRelative });
  }
  
  let foundRelative = false;
  for (const imp of importLines) {
    if (imp.isRelative) {
      foundRelative = true;
    } else if (foundRelative) {
      importViolations.push({
        line: imp.line,
        message: `导入顺序错误: ${imp.source}`,
        suggestion: '第三方库应在内部模块之前导入',
      });
    }
  }
  
  // 3.3 检查未使用的导入
  const importedNames = [];
  const namedImportRegex = /import\s+\{([^}]+)\}\s+from/g;
  const defaultImportRegex = /import\s+(\w+)\s+from/g;
  
  while ((match = namedImportRegex.exec(code)) !== null) {
    const names = match[1].split(',').map(n => n.trim().split(' as ').pop().trim());
    const line = code.substring(0, match.index).split('\n').length;
    names.forEach(name => importedNames.push({ name, line }));
  }
  
  while ((match = defaultImportRegex.exec(code)) !== null) {
    if (!match[1].startsWith('{')) {
      const line = code.substring(0, match.index).split('\n').length;
      importedNames.push({ name: match[1], line });
    }
  }
  
  const codeWithoutImports = code.replace(/^import\s+.*$/gm, '');
  for (const { name, line } of importedNames) {
    const usageRegex = new RegExp(`\\b${name}\\b`);
    if (!usageRegex.test(codeWithoutImports)) {
      importViolations.push({
        line,
        message: `未使用的导入: ${name}`,
        suggestion: '移除未使用的导入',
      });
    }
  }
  
  // 3.4 检查相对路径规范 (不允许超过2层 ../)
  for (const imp of importLines) {
    if (imp.isRelative && imp.source.startsWith('.')) {
      const parentCount = (imp.source.match(/\.\.\//g) || []).length;
      if (parentCount > 2) {
        importViolations.push({
          line: imp.line,
          message: `相对路径过深: ${imp.source}`,
          suggestion: '使用别名 @/ 代替深层相对路径',
        });
      }
    }
  }
  
  results.checks.push({
    name: '导入检查',
    passed: importViolations.length === 0,
    violations: importViolations,
  });

  // 4. 检查禁止的模式
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
    name: '模式检查',
    passed: patternViolations.length === 0,
    violations: patternViolations,
  });

  // 5. 检查函数命名
  const namingViolations = [];
  const allPrefixes = template.sections.flatMap((s) => s.prefixes);
  const funcRegex = /export\s+function\s+(\w+)/g;

  while ((match = funcRegex.exec(code)) !== null) {
    const funcName = match[1];
    const hasValidPrefix = allPrefixes.some(
      (prefix) => funcName.startsWith(prefix) || funcName === prefix
    );
    if (!hasValidPrefix) {
      const line = code.substring(0, match.index).split('\n').length;
      namingViolations.push({
        line,
        message: `函数命名不符合规范: ${funcName}`,
        suggestion: `建议前缀: ${allPrefixes.slice(0, 10).join(', ')}...`,
      });
    }
  }
  results.checks.push({
    name: '命名检查',
    passed: namingViolations.length === 0,
    violations: namingViolations,
  });

  // 6. 检查分组注释
  const sectionViolations = [];
  for (const section of template.sections) {
    const nameRegex = new RegExp(`//.*${section.name}`, 'i');
    const aliasRegex = section.alias ? new RegExp(`//.*${section.alias}`) : null;
    const hasSection = nameRegex.test(code) || (aliasRegex && aliasRegex.test(code));
    
    if (!hasSection) {
      const label = section.alias ? `${section.name} (${section.alias})` : section.name;
      sectionViolations.push({
        line: 0,
        message: `缺少分组注释: ${label}`,
      });
    }
  }
  results.checks.push({
    name: '分组检查',
    passed: sectionViolations.length === 0,
    violations: sectionViolations,
  });

  // 6.1 检查函数是否在正确的分组下
  const placementViolations = [];
  const sectionHeaderRegex = /\/\/\s*=+\s*\n\/\/\s*(.+?)\s*\n\/\/\s*=+/g;
  const sectionPositions = [];
  
  while ((match = sectionHeaderRegex.exec(code)) !== null) {
    const sectionTitle = match[1].trim();
    const position = match.index + match[0].length;
    sectionPositions.push({ title: sectionTitle, position });
  }
  
  const funcPosRegex = /export\s+function\s+(\w+)/g;
  while ((match = funcPosRegex.exec(code)) !== null) {
    const funcName = match[1];
    const funcPos = match.index;
    const line = code.substring(0, funcPos).split('\n').length;
    
    let currentSection = null;
    for (const sec of sectionPositions) {
      if (sec.position < funcPos) {
        currentSection = sec.title;
      }
    }
    
    let expectedSection = null;
    let longestMatchLen = 0;
    
    for (const section of template.sections) {
      for (const prefix of section.prefixes) {
        if ((funcName.startsWith(prefix) || funcName === prefix) && prefix.length > longestMatchLen) {
          longestMatchLen = prefix.length;
          expectedSection = section;
        }
      }
    }
    
    if (expectedSection && currentSection) {
      const sectionNameLower = expectedSection.name.toLowerCase();
      const sectionAlias = expectedSection.alias || '';
      const currentLower = currentSection.toLowerCase();
      
      const isCorrectSection = currentLower.includes(sectionNameLower) || 
                               currentLower.includes(sectionAlias);
      
      if (!isCorrectSection) {
        const expectedLabel = expectedSection.alias 
          ? `${expectedSection.name} (${expectedSection.alias})` 
          : expectedSection.name;
        placementViolations.push({
          line,
          message: `函数 ${funcName} 分组错误`,
          suggestion: `应放在 "${expectedLabel}" 分组下，当前在 "${currentSection}"`,
        });
      }
    } else if (expectedSection && !currentSection) {
      placementViolations.push({
        line,
        message: `函数 ${funcName} 未在任何分组下`,
        suggestion: `应放在 "${expectedSection.name}" 分组下`,
      });
    }
  }
  results.checks.push({
    name: '分组位置检查',
    passed: placementViolations.length === 0,
    violations: placementViolations,
  });

  // 7. 检查函数风格 (根据模板配置)
  const styleViolations = [];
  if (template.codeStyle?.functionKeyword) {
    const arrowFuncRegex = /export\s+const\s+(\w+)\s*=\s*(\([^)]*\)|[^=])\s*=>/g;
    while ((match = arrowFuncRegex.exec(code)) !== null) {
      const line = code.substring(0, match.index).split('\n').length;
      styleViolations.push({
        line,
        message: `使用箭头函数: ${match[1]}`,
        suggestion: '应使用 function 关键字',
      });
    }
  }
  results.checks.push({
    name: '函数风格',
    passed: styleViolations.length === 0,
    violations: styleViolations,
  });

  // 8. 检查空值处理 (根据模板配置)
  const nullCheckViolations = [];
  if (template.codeStyle?.nullCheck) {
    const funcWithParamsRegex = /export\s+function\s+(\w+)\s*\(([^)]+)\)\s*\{/g;
    while ((match = funcWithParamsRegex.exec(code)) !== null) {
      const funcName = match[1];
      const params = match[2].trim();
      
      const hasRequiredParams = params.split(',').some(p => {
        const param = p.trim();
        return param && !param.includes('=') && !param.startsWith('...');
      });
      
      if (!hasRequiredParams) continue;
      
      const startIdx = match.index + match[0].length;
      let braceCount = 1;
      let endIdx = startIdx;
      while (braceCount > 0 && endIdx < code.length) {
        if (code[endIdx] === '{') braceCount++;
        else if (code[endIdx] === '}') braceCount--;
        endIdx++;
      }
      
      const funcBody = code.substring(startIdx, endIdx - 1);
      const firstLines = funcBody.split('\n').slice(0, 5).join('\n');
      const hasNullCheck = /(![\w.]+|[\w.]+\s*===?\s*null|[\w.]+\s*===?\s*undefined|[\w.]+\s*==\s*null|\?\.|if\s*\(![\w.]+\)|return\s+[\w.]+\s*\?|try\s*\{)/.test(firstLines);
      
      if (!hasNullCheck && funcBody.trim().length > 0) {
        const line = code.substring(0, match.index).split('\n').length;
        nullCheckViolations.push({
          line,
          message: `函数 ${funcName} 缺少空值检查`,
          suggestion: '函数开头应处理 null/undefined',
        });
      }
    }
  }
  results.checks.push({
    name: '空值检查',
    passed: nullCheckViolations.length === 0,
    violations: nullCheckViolations,
  });

  // 9. 检查必填参数不应有默认值
  const paramDefaultViolations = [];
  const funcParamRegex = /export\s+function\s+(\w+)\s*\(([^)]*)\)/g;
  while ((match = funcParamRegex.exec(code)) !== null) {
    const funcName = match[1];
    const paramsStr = match[2].trim();
    if (!paramsStr) continue;
    
    const params = paramsStr.split(',').map(p => p.trim());
    let foundOptional = false;
    
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      if (param.startsWith('...')) continue;
      
      const hasDefault = param.includes('=');
      
      if (hasDefault) {
        foundOptional = true;
      } else if (foundOptional) {
        const line = code.substring(0, match.index).split('\n').length;
        const paramName = param.split('=')[0].trim();
        paramDefaultViolations.push({
          line,
          message: `函数 ${funcName} 参数顺序错误: ${paramName}`,
          suggestion: '必填参数应在可选参数之前',
        });
        break;
      }
    }
  }
  results.checks.push({
    name: '参数顺序检查',
    passed: paramDefaultViolations.length === 0,
    violations: paramDefaultViolations,
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
    if (file.endsWith('.js') && (file.includes('utils') || file.includes('helpers'))) {
      results.push(checkUtilsFile(path.join(dir, file)));
    }
  }

  return results;
}

function printReport(results) {
  let totalViolations = 0;
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
          totalViolations++;
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
if (process.argv[1].includes('utils-checker')) {
  const dir = process.argv[2] || 'src/shared/utils';
  const violations = checkDirectory(dir);
  process.exit(printReport(violations) ? 0 : 1);
}

export { checkUtilsFile, checkDirectory, printReport };
