#!/usr/bin/env node

/**
 * 代码质量检查脚本
 * 检查代码规范、复杂度、潜在问题
 * 可集成到 Git pre-commit 钩子
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeQualityChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesChecked: 0,
      issuesFound: 0,
      passed: true
    };
  }

  /**
   * 执行代码质量检查
   */
  async check() {
    console.log('🔍 开始代码质量检查...\n');

    // 1. 检查文件大小
    await this.checkFileSizes();

    // 2. 检查函数复杂度
    await this.checkFunctionComplexity();

    // 3. 检查硬编码值
    await this.checkHardcodedValues();

    // 4. 检查 console.log / print 语句
    await this.checkDebugStatements();

    // 5. 检查未使用的导入（简单检查）
    await this.checkUnusedImports();

    // 6. 运行 ESLint（如果存在）
    await this.runLinter();

    // 输出结果
    this.printResults();

    return this.stats.passed;
  }

  /**
   * 检查文件大小
   */
  async checkFileSizes() {
    console.log('📏 检查文件大小...');
    
    const maxLines = 800;
    const files = this.findSourceFiles();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;
        this.stats.filesChecked++;

        if (lines > maxLines) {
          this.errors.push(`${file}: 文件过大 (${lines} 行，建议 < ${maxLines} 行)`);
        } else if (lines > maxLines * 0.8) {
          this.warnings.push(`${file}: 文件较大 (${lines} 行，接近上限)`);
        }
      } catch (error) {
        // 忽略读取错误
      }
    }
  }

  /**
   * 检查函数复杂度（简化版）
   */
  async checkFunctionComplexity() {
    console.log('🧩 检查函数复杂度...');
    
    const maxFunctionLines = 50;
    const files = this.findSourceFiles();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        let inFunction = false;
        let functionStart = 0;
        let braceCount = 0;
        let functionName = '';

        lines.forEach((line, index) => {
          // 简单检测函数开始
          const funcMatch = line.match(/(?:function|async function|const|let)\s+(\w+)\s*[=:]\s*(?:async\s*)?\(?/);
          if (funcMatch || line.includes('=>')) {
            if (!inFunction) {
              inFunction = true;
              functionStart = index;
              functionName = funcMatch ? funcMatch[1] : 'anonymous';
              braceCount = 0;
            }
          }

          // 计算大括号
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;

          // 函数结束
          if (inFunction && braceCount === 0 && line.includes('}')) {
            const functionLines = index - functionStart + 1;
            if (functionLines > maxFunctionLines) {
              this.warnings.push(`${file}:${functionStart + 1} - 函数 "${functionName}" 过长 (${functionLines} 行)`);
            }
            inFunction = false;
          }
        });
      } catch (error) {
        // 忽略
      }
    }
  }

  /**
   * 检查硬编码值
   */
  async checkHardcodedValues() {
    console.log('🔐 检查硬编码值...');
    
    const patterns = [
      { regex: /['"]sk-[a-zA-Z0-9]{32,}['"]/, message: 'OpenAI API Key' },
      { regex: /['"][a-zA-Z0-9]{32}['"](?=.*(?:key|token|secret))/i, message: '可能的 API Key' },
      { regex: /password\s*[:=]\s*['"][^'"]+['"](?!.*example)/i, message: '硬编码密码' },
      { regex: /mongodb\+srv:\/\/[^'"]+['"]/, message: 'MongoDB 连接字符串' },
      { regex: /postgres:\/\/[^'"]+['"]/, message: 'PostgreSQL 连接字符串' },
    ];

    const files = this.findSourceFiles();

    for (const file of files) {
      // 跳过测试文件和示例文件
      if (file.includes('test') || file.includes('example') || file.includes('.env')) {
        continue;
      }

      try {
        const content = fs.readFileSync(file, 'utf-8');
        
        for (const pattern of patterns) {
          if (pattern.regex.test(content)) {
            this.errors.push(`${file}: 发现 ${pattern.message}`);
          }
        }
      } catch (error) {
        // 忽略
      }
    }
  }

  /**
   * 检查调试语句
   */
  async checkDebugStatements() {
    console.log('🐛 检查调试语句...');
    
    const patterns = [
      { regex: /console\.log\s*\(/, language: 'js', message: 'console.log' },
      { regex: /console\.debug\s*\(/, language: 'js', message: 'console.debug' },
      { regex: /print\s*\(/, language: 'py', message: 'print()' },
      { regex: /debugger;/, language: 'js', message: 'debugger' },
    ];

    const files = this.findSourceFiles();

    for (const file of files) {
      // 跳过测试文件
      if (file.includes('test') || file.includes('spec')) {
        continue;
      }

      try {
        const content = fs.readFileSync(file, 'utf-8');
        const ext = path.extname(file);
        
        for (const pattern of patterns) {
          // 匹配语言
          if ((pattern.language === 'js' && ['.js', '.jsx', '.ts', '.tsx'].includes(ext)) ||
              (pattern.language === 'py' && ext === '.py')) {
            const matches = content.match(new RegExp(pattern.regex, 'g'));
            if (matches) {
              this.warnings.push(`${file}: 发现 ${matches.length} 个 ${pattern.message} 语句`);
            }
          }
        }
      } catch (error) {
        // 忽略
      }
    }
  }

  /**
   * 检查未使用的导入（简化版）
   */
  async checkUnusedImports() {
    console.log('📦 检查导入语句...');
    
    const jsFiles = this.findSourceFiles().filter(f => 
      ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(f))
    );

    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        
        // 提取导入
        const importRegex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const imports = match[1] || match[2];
          if (imports) {
            const names = imports.split(',').map(s => s.trim().split(' as ')[0]);
            for (const name of names) {
              // 简单检查：导入名称在文件其他地方是否出现
              const restContent = content.replace(match[0], '');
              const usageRegex = new RegExp(`\\b${name}\\b`);
              if (!usageRegex.test(restContent)) {
                this.warnings.push(`${file}: 可能未使用的导入 "${name}"`);
              }
            }
          }
        }
      } catch (error) {
        // 忽略
      }
    }
  }

  /**
   * 运行 ESLint
   */
  async runLinter() {
    console.log('🔧 运行代码检查工具...');
    
    // 检查 ESLint 是否存在
    const eslintConfig = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js']
      .find(f => fs.existsSync(path.join(this.projectRoot, f)));

    if (eslintConfig) {
      try {
        execSync('npx eslint src/ --max-warnings 0', { 
          cwd: this.projectRoot,
          stdio: 'pipe'
        });
        console.log('✅ ESLint 检查通过');
      } catch (error) {
        this.warnings.push('ESLint 发现问题，请运行 `npx eslint src/` 查看详情');
      }
    } else {
      console.log('ℹ️ 未检测到 ESLint 配置');
    }
  }

  /**
   * 查找源代码文件
   */
  findSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py'];
    const excludeDirs = ['node_modules', '__pycache__', '.git', 'dist', 'build', '.venv', 'venv', 'backups'];

    this.walkDirectory('.', extensions, files, excludeDirs);
    return files;
  }

  walkDirectory(dir, extensions, files, excludeDirs) {
    if (!fs.existsSync(dir)) return;

    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          if (!excludeDirs.includes(item.name) && !item.name.startsWith('.')) {
            this.walkDirectory(fullPath, extensions, files, excludeDirs);
          }
        } else if (item.isFile()) {
          const ext = path.extname(item.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // 忽略权限错误
    }
  }

  /**
   * 输出结果
   */
  printResults() {
    console.log('\n📊 检查结果:');
    console.log(`   📁 检查文件: ${this.stats.filesChecked}`);
    console.log(`   ❌ 错误: ${this.errors.length}`);
    console.log(`   ⚠️  警告: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      this.errors.forEach(e => console.log(`   - ${e}`));
      this.stats.passed = false;
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告详情:');
      this.warnings.slice(0, 10).forEach(w => console.log(`   - ${w}`));
      if (this.warnings.length > 10) {
        console.log(`   ... 还有 ${this.warnings.length - 10} 个警告`);
      }
    }

    if (this.stats.passed) {
      console.log('\n✅ 代码质量检查通过');
    } else {
      console.log('\n❌ 代码质量检查失败，请修复错误后再提交');
    }
  }
}

// 主执行逻辑
if (require.main === module) {
  const checker = new CodeQualityChecker();
  checker.check().then(passed => {
    process.exit(passed ? 0 : 1);
  }).catch(error => {
    console.error('检查失败:', error);
    process.exit(1);
  });
}

module.exports = CodeQualityChecker;
