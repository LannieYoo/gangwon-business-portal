#!/usr/bin/env node

/**
 * 文档验证脚本
 * 检查文档质量和一致性
 * 确保文档符合标准
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.docsDir = path.join(this.projectRoot, 'docs');
    this.reportsDir = path.join(this.docsDir, 'reports');
    this.errors = [];
    this.warnings = [];
    this.timestamp = new Date().toISOString();
  }

  async validate() {
    console.log('🔍 开始验证文档...');
    
    try {
      // 确保报告目录存在
      this.ensureReportsDir();
      
      // 执行各项检查
      await this.checkRequiredFiles();
      await this.validateMarkdownFormat();
      await this.checkLinks();
      await this.validateCodeExamples();
      await this.checkTimestamps();
      await this.validateFileReferences();
      
      // 生成验证报告
      await this.generateValidationReport();
      
      // 输出结果
      this.printResults();
      
    } catch (error) {
      console.error('❌ 文档验证失败:', error.message);
      process.exit(1);
    }
  }

  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async checkRequiredFiles() {
    console.log('📋 检查必需文件...');
    
    const requiredFiles = [
      'README.md',
      'docs/codemaps/index.md',
      'docs/guides/setup.md'
    ];
    
    const recommendedFiles = [
      'docs/project/contributing.md',
      'docs/project/changelog.md',
      'docs/guides/api.md',
      'docs/guides/deployment.md'
    ];
    
    // 检查必需文件
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.errors.push(`缺少必需文件: ${file}`);
      } else {
        console.log(`✅ ${file}`);
      }
    });
    
    // 检查推荐文件
    recommendedFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.warnings.push(`建议添加文件: ${file}`);
      } else {
        console.log(`✅ ${file}`);
      }
    });
  }

  async validateMarkdownFormat() {
    console.log('📝 验证 Markdown 格式...');
    
    const markdownFiles = this.findMarkdownFiles();
    
    for (const file of markdownFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.validateMarkdownContent(file, content);
      } catch (error) {
        this.errors.push(`无法读取文件 ${file}: ${error.message}`);
      }
    }
  }

  findMarkdownFiles() {
    const files = [];
    const extensions = ['.md'];
    
    // 递归查找 Markdown 文件
    this.walkDirectory('.', extensions, files, ['node_modules', '.git', '.next', 'dist', 'build', 'backups']);
    
    return files;
  }

  walkDirectory(dir, extensions, files, excludeDirs = []) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item) && !item.startsWith('.')) {
          this.walkDirectory(fullPath, extensions, files, excludeDirs);
        }
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  validateMarkdownContent(file, content) {
    const lines = content.split('\n');
    
    // 检查标题层级
    this.checkHeadingHierarchy(file, lines);
    
    // 检查代码块格式
    this.checkCodeBlocks(file, lines);
    
    // 检查链接格式
    this.checkLinkFormat(file, content);
    
    // 检查时间戳
    this.checkDocumentTimestamp(file, content);
  }

  checkHeadingHierarchy(file, lines) {
    let previousLevel = 0;
    let inCodeBlock = false;
    
    lines.forEach((line, index) => {
      // 检查代码块状态
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      
      // 如果在代码块中，跳过检查
      if (inCodeBlock) return;

      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2];
        
        // 检查标题层级跳跃
        if (level > previousLevel + 1) {
          this.warnings.push(`${file}:${index + 1} - 标题层级跳跃: H${previousLevel} -> H${level}`);
        }
        
        // 检查空标题
        if (!title.trim()) {
          this.errors.push(`${file}:${index + 1} - 空标题`);
        }
        
        previousLevel = level;
      }
    });
  }

  checkCodeBlocks(file, lines) {
    let inCodeBlock = false;
    let codeBlockStart = 0;
    
    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockStart = index;
          
          // 检查语言标识
          const language = line.substring(3).trim();
          if (!language && !line.includes('```')) {
            this.warnings.push(`${file}:${index + 1} - 代码块缺少语言标识`);
          }
        } else {
          inCodeBlock = false;
        }
      }
    });
    
    // 检查未闭合的代码块
    if (inCodeBlock) {
      this.errors.push(`${file}:${codeBlockStart + 1} - 代码块未正确闭合`);
    }
  }

  checkLinkFormat(file, content) {
    // 检查 Markdown 链接格式
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      
      // 检查空链接文本
      if (!linkText.trim()) {
        this.warnings.push(`${file} - 空链接文本: ${linkUrl}`);
      }
      
      // 检查空链接地址
      if (!linkUrl.trim()) {
        this.errors.push(`${file} - 空链接地址: ${linkText}`);
      }
    }
  }

  checkDocumentTimestamp(file, content) {
    // 检查是否包含时间戳
    const timestampPatterns = [
      /最后更新[：:]\s*\d{4}-\d{2}-\d{2}/,
      /Last updated[：:]\s*\d{4}-\d{2}-\d{2}/,
      /\*由 \S+\.js 自动生成.*\d{4}-\d{2}-\d{2}/
    ];
    
    const hasTimestamp = timestampPatterns.some(pattern => pattern.test(content));
    
    if (!hasTimestamp && file.includes('docs/')) {
      this.warnings.push(`${file} - 缺少时间戳信息`);
    }
  }

  async checkLinks() {
    console.log('🔗 检查链接有效性...');
    
    const markdownFiles = this.findMarkdownFiles();
    const brokenLinks = [];
    
    for (const file of markdownFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const links = this.extractLinks(content);
        
        for (const link of links) {
          if (this.isInternalLink(link.url)) {
            if (!this.validateInternalLink(file, link.url)) {
              brokenLinks.push({
                file,
                text: link.text,
                url: link.url,
                type: 'internal'
              });
            }
          }
          // 外部链接检查可以在这里添加，但可能较慢
        }
      } catch (error) {
        this.errors.push(`检查链接时出错 ${file}: ${error.message}`);
      }
    }
    
    // 记录损坏的链接
    if (brokenLinks.length > 0) {
      brokenLinks.forEach(link => {
        this.errors.push(`${link.file} - 损坏的${link.type}链接: [${link.text}](${link.url})`);
      });
    }
    
    // 生成链接检查报告
    await this.generateLinkReport(brokenLinks);
  }

  extractLinks(content) {
    const links = [];
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2]
      });
    }
    
    return links;
  }

  isInternalLink(url) {
    return !url.startsWith('http://') && 
           !url.startsWith('https://') && 
           !url.startsWith('mailto:') &&
           !url.startsWith('#');
  }

  validateInternalLink(fromFile, linkUrl) {
    // 处理相对路径
    const fromDir = path.dirname(fromFile);
    const targetPath = path.resolve(fromDir, linkUrl);
    
    // 检查文件是否存在
    return fs.existsSync(targetPath);
  }

  async validateCodeExamples() {
    console.log('💻 验证代码示例...');
    
    const markdownFiles = this.findMarkdownFiles();
    
    for (const file of markdownFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.checkCodeExamples(file, content);
      } catch (error) {
        this.errors.push(`验证代码示例时出错 ${file}: ${error.message}`);
      }
    }
  }

  checkCodeExamples(file, content) {
    const codeBlocks = this.extractCodeBlocks(content);
    
    codeBlocks.forEach((block, index) => {
      // 检查 JavaScript/TypeScript 代码块
      if (['javascript', 'js', 'typescript', 'ts'].includes(block.language)) {
        this.validateJavaScriptCode(file, block, index);
      }
      
      // 检查 JSON 代码块
      if (block.language === 'json') {
        this.validateJsonCode(file, block, index);
      }
      
      // 检查 Shell 命令
      if (['bash', 'sh', 'shell'].includes(block.language)) {
        this.validateShellCommands(file, block, index);
      }
    });
  }

  extractCodeBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');
    let inBlock = false;
    let currentBlock = null;
    
    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inBlock) {
          // 开始代码块
          const language = line.substring(3).trim();
          currentBlock = {
            language: language || 'text',
            code: '',
            startLine: index + 1
          };
          inBlock = true;
        } else {
          // 结束代码块
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          inBlock = false;
          currentBlock = null;
        }
      } else if (inBlock && currentBlock) {
        currentBlock.code += line + '\n';
      }
    });
    
    return blocks;
  }

  validateJavaScriptCode(file, block, index) {
    // 简单的语法检查
    const code = block.code.trim();
    
    // 检查常见语法错误
    if (code.includes('console.log') && !code.includes(';')) {
      this.warnings.push(`${file} - 代码块 ${index + 1}: 建议在 console.log 后添加分号`);
    }
    
    // 检查未闭合的括号
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      this.errors.push(`${file} - 代码块 ${index + 1}: 大括号不匹配`);
    }
    
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      this.errors.push(`${file} - 代码块 ${index + 1}: 圆括号不匹配`);
    }
  }

  validateJsonCode(file, block, index) {
    try {
      JSON.parse(block.code);
    } catch (error) {
      this.errors.push(`${file} - 代码块 ${index + 1}: JSON 格式错误 - ${error.message}`);
    }
  }

  validateShellCommands(file, block, index) {
    const lines = block.code.trim().split('\n');
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // 跳过注释和空行
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }
      
      // 检查危险命令
      const dangerousCommands = ['rm -rf /', 'sudo rm -rf', 'format c:', 'del /s /q'];
      if (dangerousCommands.some(cmd => trimmedLine.includes(cmd))) {
        this.errors.push(`${file} - 代码块 ${index + 1}, 行 ${lineIndex + 1}: 包含危险命令`);
      }
      
      // 检查常见拼写错误
      if (trimmedLine.includes('npm instal ') || trimmedLine.includes('npm isntall')) {
        this.warnings.push(`${file} - 代码块 ${index + 1}, 行 ${lineIndex + 1}: 可能的拼写错误`);
      }
    });
  }

  async checkTimestamps() {
    console.log('⏰ 检查时间戳...');
    
    const markdownFiles = this.findMarkdownFiles();
    const outdatedFiles = [];
    
    for (const file of markdownFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const stat = fs.statSync(file);
        
        // 提取文档中的时间戳
        const docTimestamp = this.extractTimestamp(content);
        if (docTimestamp) {
          const docDate = new Date(docTimestamp);
          const fileDate = new Date(stat.mtime);
          
          // 如果文件修改时间比文档时间戳晚超过1天，标记为过时
          const daysDiff = (fileDate - docDate) / (1000 * 60 * 60 * 24);
          if (daysDiff > 1) {
            outdatedFiles.push({
              file,
              docTimestamp,
              fileModified: stat.mtime.toISOString().split('T')[0],
              daysDiff: Math.round(daysDiff)
            });
          }
        }
      } catch (error) {
        this.warnings.push(`检查时间戳时出错 ${file}: ${error.message}`);
      }
    }
    
    // 记录过时文件
    outdatedFiles.forEach(item => {
      this.warnings.push(`${item.file} - 文档可能过时 (文档时间戳: ${item.docTimestamp}, 文件修改: ${item.fileModified}, 相差 ${item.daysDiff} 天)`);
    });
  }

  extractTimestamp(content) {
    const patterns = [
      /最后更新[：:]\s*(\d{4}-\d{2}-\d{2})/,
      /Last updated[：:]\s*(\d{4}-\d{2}-\d{2})/,
      /\*由 \S+\.js 自动生成.*(\d{4}-\d{2}-\d{2})/
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  async validateFileReferences() {
    console.log('📁 验证文件引用...');
    
    const markdownFiles = this.findMarkdownFiles();
    
    for (const file of markdownFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.checkFileReferences(file, content);
      } catch (error) {
        this.errors.push(`验证文件引用时出错 ${file}: ${error.message}`);
      }
    }
  }

  checkFileReferences(file, content) {
    // 检查代码中提到的文件路径
    const filePathRegex = /`([^`]*\.(js|ts|tsx|jsx|py|go|rs|json|yaml|yml|md))`/g;
    let match;
    
    while ((match = filePathRegex.exec(content)) !== null) {
      const filePath = match[1];
      
      // 跳过明显的示例路径
      if (filePath.includes('example') || filePath.includes('your-') || filePath.includes('<')) {
        continue;
      }
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        this.warnings.push(`${file} - 引用的文件可能不存在: ${filePath}`);
      }
    }
  }

  async generateLinkReport(brokenLinks) {
    const reportPath = path.join(this.reportsDir, 'link-check.txt');
    
    let report = `链接检查报告
================

检查时间: ${this.timestamp}
检查文件数: ${this.findMarkdownFiles().length}
损坏链接数: ${brokenLinks.length}

`;

    if (brokenLinks.length > 0) {
      report += `损坏的链接:
${brokenLinks.map(link => `- ${link.file}: [${link.text}](${link.url})`).join('\n')}

`;
    }

    report += `建议:
- 定期运行链接检查
- 优先使用相对路径
- 避免链接到可能变更的外部资源
`;

    fs.writeFileSync(reportPath, report);
  }

  async generateValidationReport() {
    const reportPath = path.join(this.reportsDir, 'doc-validation.txt');
    
    const report = `文档验证报告
================

验证时间: ${this.timestamp}
验证文件数: ${this.findMarkdownFiles().length}
错误数量: ${this.errors.length}
警告数量: ${this.warnings.length}

${this.errors.length > 0 ? `错误列表:
${this.errors.map(error => `- ${error}`).join('\n')}

` : ''}${this.warnings.length > 0 ? `警告列表:
${this.warnings.map(warning => `- ${warning}`).join('\n')}

` : ''}验证项目:
- [x] 必需文件检查
- [x] Markdown 格式验证
- [x] 链接有效性检查
- [x] 代码示例验证
- [x] 时间戳检查
- [x] 文件引用验证

总体评分: ${this.calculateScore()}/100

建议:
${this.generateRecommendations()}
`;

    fs.writeFileSync(reportPath, report);
    console.log('📊 验证报告已生成');
  }

  calculateScore() {
    const totalIssues = this.errors.length + this.warnings.length * 0.5;
    const maxScore = 100;
    const penalty = Math.min(totalIssues * 5, maxScore);
    return Math.max(0, maxScore - penalty);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.length > 0) {
      recommendations.push('- 优先修复所有错误');
    }
    
    if (this.warnings.length > 5) {
      recommendations.push('- 考虑修复主要警告以提高文档质量');
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      recommendations.push('- 文档质量良好，继续保持');
      recommendations.push('- 定期运行验证以确保持续质量');
    }
    
    recommendations.push('- 建立自动化验证流程');
    recommendations.push('- 收集用户反馈改进文档');
    
    return recommendations.join('\n');
  }

  printResults() {
    console.log('\n📊 验证结果:');
    console.log(`✅ 检查文件: ${this.findMarkdownFiles().length}`);
    console.log(`❌ 错误: ${this.errors.length}`);
    console.log(`⚠️  警告: ${this.warnings.length}`);
    console.log(`📈 评分: ${this.calculateScore()}/100`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0 && this.warnings.length <= 10) {
      console.log('\n⚠️  警告详情:');
      this.warnings.slice(0, 10).forEach(warning => console.log(`  - ${warning}`));
      if (this.warnings.length > 10) {
        console.log(`  ... 还有 ${this.warnings.length - 10} 个警告，详见报告文件`);
      }
    }
    
    console.log(`\n📄 详细报告: ${path.join(this.reportsDir, 'doc-validation.txt')}`);
    
    // 如果有错误，退出码为1
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }
}

// 主执行逻辑
if (require.main === module) {
  const validator = new DocumentValidator();
  validator.validate().catch(error => {
    console.error('验证失败:', error);
    process.exit(1);
  });
}

module.exports = DocumentValidator;
