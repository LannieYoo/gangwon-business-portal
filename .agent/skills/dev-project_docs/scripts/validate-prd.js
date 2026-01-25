#!/usr/bin/env node

/**
 * PRD 验证脚本
 * 检查需求文档中的功能是否已在代码中实现
 */

const fs = require('fs');
const path = require('path');

class PrdValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.prdPath = path.join(this.projectRoot, 'docs', 'requirements', 'master_prd.md');
    this.reportsDir = path.join(this.projectRoot, 'docs', 'reports');
    this.results = [];
  }

  /**
   * 执行 PRD 验证
   */
  async validate() {
    console.log('🔍 开始验证 PRD 实现状态...\n');

    const prdFiles = this.findPrdFiles();
    if (prdFiles.length === 0) {
      console.log('⚠️ 未找到 PRD 文件');
      return;
    }

    for (const file of prdFiles) {
      console.log(`� 正在解析: ${path.relative(this.projectRoot, file)}`);
      const requirements = this.parsePrdFile(file);
      
      for (const req of requirements) {
        let status = 'missing';
        
        if (req.type === 'checkbox') {
          status = req.checked ? 'implemented' : 'planned';
        } else {
          status = await this.validateByLogic(req);
        }
        
        this.results.push({ 
          requirement: req.text, 
          status, 
          source: path.basename(file) 
        });
      }
    }

    console.log(`📋 找到 ${this.results.length} 个需求项\n`);

    // 3. 生成报告
    this.generateReport();
    this.printResults();
  }

  findPrdFiles() {
    const dir = path.join(this.projectRoot, 'docs', 'requirements');
    if (!fs.existsSync(dir)) return [];
    
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(dir, f));
  }

  /**
   * 解析 PRD 文档
   */
  parsePrdFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const requirements = [];

    // 匹配带复选框的需求项 - [ ] 或 - [x]
    const checkboxRegex = /- \[([xX ])\] (.+)/g;
    let match;
    while ((match = checkboxRegex.exec(content)) !== null) {
      requirements.push({
        text: match[2].trim(),
        type: 'checkbox',
        checked: match[1].toLowerCase() === 'x'
      });
    }

    // 如果该文件没有任何复选框，则尝试匹配普通列表项
    if (requirements.length === 0) {
      const listRegex = /^-\s+(.+)$/gm;
      while ((match = listRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text.length > 10 && !text.startsWith('[') && !text.startsWith('http')) {
          requirements.push({
            text: text,
            type: 'list'
          });
        }
      }
    }

    return requirements;
  }

  /**
   * 验证通过逻辑搜索
   */
  async validateByLogic(req) {
    // 只有列表项才尝试逻辑搜索
    const keywords = req.text
      .split(/[\s,()，（）]+/)
      .filter(w => w.length >= 2 && !/^(基于|实现|提供|支持|构建|项目|数据|由于|旨在)$/.test(w))
      .slice(0, 3); // 最多取前三个关键词

    if (keywords.length === 0) return 'unknown';

    // 必须匹配到至少两个关键词，或者只有一个长关键词
    const searchString = keywords.join('|');
    const minMatches = keywords.length >= 2 ? 2 : 1;

    // 此处简化处理：如果关键词在代码中出现，且包含特定的实现标记，或者关键词足够独特
    const found = this.searchStrict(keywords);
    return found ? 'implemented' : 'missing';
  }

  searchStrict(keywords) {
    // 这种简单的全量搜索仍然容易误报，但在没有更好手段前，我们提高匹配门槛
    // 实际项目中应建议在代码中使用 @requirement US-101 这种标记
    return false; // 默认返回 missing，除非手动勾选，强制要求手动管理状态以保证准确性
  }

  /**
   * 在目录中搜索关键词
   */
  searchInDirectory(dir, extensions, keyword) {
    if (!fs.existsSync(dir)) {
      return false;
    }

    const files = this.walkDirectory(dir, extensions);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8').toLowerCase();
        if (content.includes(keyword)) {
          return true;
        }
      } catch (error) {
        // 忽略读取错误
      }
    }

    return false;
  }

  /**
   * 递归遍历目录
   */
  walkDirectory(dir, extensions, files = []) {
    const excludeDirs = ['node_modules', '__pycache__', '.git', 'dist', 'build', '.venv', 'venv'];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            this.walkDirectory(fullPath, extensions, files);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // 忽略目录访问错误
    }

    return files;
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    // 确保报告目录存在
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    const implemented = this.results.filter(r => r.status === 'implemented').length;
    const planned = this.results.filter(r => r.status === 'planned').length;
    const missing = this.results.filter(r => r.status === 'missing').length;
    const unknown = this.results.filter(r => r.status === 'unknown').length;
    const total = this.results.length;
    const coverage = total > 0 ? ((implemented / total) * 100).toFixed(1) : 0;

    let report = `# PRD 实现状态报告\n\n`;
    report += `**生成时间:** ${new Date().toISOString().split('T')[0]}\n\n`;
    
    report += `## 概览\n\n`;
    report += `| 指标 | 数值 |\n|------|------|\n`;
    report += `| 总需求数 | ${total} |\n`;
    report += `| 已实现 | ${implemented} |\n`;
    report += `| 已规划 (未实现) | ${planned} |\n`;
    report += `| 缺失 (未规划) | ${missing} |\n`;
    report += `| 覆盖率 | ${coverage}% |\n\n`;

    // 按源文件分组显示
    const sources = [...new Set(this.results.map(r => r.source))];
    
    for (const source of sources) {
      report += `### 📄 ${source}\n\n`;
      report += `| 需求 | 状态 |\n|------|------|\n`;
      
      const fileResults = this.results.filter(r => r.source === source);
      for (const r of fileResults) {
        const text = r.requirement.substring(0, 80) + (r.requirement.length > 80 ? '...' : '');
        report += `| ${text} | ${this.getStatusEmoji(r.status)} ${r.status} |\n`;
      }
      report += `\n`;
    }

    report += `## 说明\n\n`;
    report += `- ✅ **implemented**: 需求已标记为完成 (\`[x]\`)\n`;
    report += `- ⏳ **planned**: 需求已列入计划 (\`[ ]\`) 但尚未完成\n`;
    report += `- ❌ **missing**: 需求在 PRD 中作为列表项存在，但既未标记也未检测到实现\n\n`;
    report += `---\n\n*此报告由 validate-prd.js 自动生成*\n`;

    const reportPath = path.join(this.reportsDir, 'prd-validation.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`📄 报告已保存至: ${path.relative(this.projectRoot, reportPath)}\n`);
  }

  /**
   * 获取状态表情
   */
  getStatusEmoji(status) {
    switch (status) {
      case 'implemented': return '✅';
      case 'planned': return '⏳';
      case 'missing': return '❌';
      default: return '❓';
    }
  }

  /**
   * 打印结果到控制台
   */
  printResults() {
    const implemented = this.results.filter(r => r.status === 'implemented').length;
    const planned = this.results.filter(r => r.status === 'planned').length;
    const total = this.results.length;
    
    console.log('📊 验证结果汇总:');
    console.log(`   ✅ 已实现: ${implemented}`);
    console.log(`   ⏳ 已规划: ${planned}`);
    console.log(`   📈 总进度: ${total > 0 ? ((implemented / total) * 100).toFixed(1) : 0}%`);
    console.log('\n✅ PRD 验证完成');
  }
}

// 主执行逻辑
if (require.main === module) {
  const validator = new PrdValidator();
  validator.validate().catch(error => {
    console.error('验证失败:', error);
    process.exit(1);
  });
}

module.exports = PrdValidator;
