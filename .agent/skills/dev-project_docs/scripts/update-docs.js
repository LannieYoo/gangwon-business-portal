#!/usr/bin/env node

/**
 * 文档更新脚本 (重构版)
 * 遵循单一数据源原则，模块化管理
 */

const fs = require('fs');
const path = require('path');
const DataExtractor = require('./lib/data-extractor');
const MarkdownTemplates = require('./lib/markdown-templates');
const DocHelpers = require('./lib/helpers');

class DocumentUpdater {
  constructor() {
    this.projectRoot = process.cwd();
    this.docsDir = path.join(this.projectRoot, 'docs');
    this.extractor = new DataExtractor(this.projectRoot);
    this.helpers = new DocHelpers(this.projectRoot);
    this.timestamp = new Date().toISOString().split('T')[0];
  }

  async update() {
    console.log('📝 开始更新文档 (模块化运行时)...');
    
    try {
      this.ensureDirectories();
      
      // 1. 提取数据
      const projectData = this.extractor.readProjectConfig();
      const envVars = this.extractor.readEnvExample();
      const frontendPkg = this.extractor.getFrontendDeps();
      
      if (frontendPkg) {
        console.log('🔍 发现前端子项目，正在合并依赖...');
        projectData.dependencies = { ...projectData.dependencies, ...frontendPkg.dependencies };
        projectData.devDependencies = { ...projectData.devDependencies, ...frontendPkg.devDependencies };
      }

      const helpers = {
        ...this.helpers,
        packageManager: this.helpers.detectPackageManager(),
        timestamp: this.timestamp,
        generatePrerequisites: (data) => this.helpers.generatePrerequisites(data),
        generateEnvTable: (vars) => this.helpers.generateEnvTable(vars),
        generateDirectoryStructure: () => this.helpers.generateDirectoryStructure(),
        generateScriptsTable: (scripts) => this.helpers.generateScriptsTable(scripts),
        generateMainDependencies: (deps) => this.helpers.generateMainDependencies(deps),
        generateDevTools: (tools) => this.helpers.generateDevTools(tools),
        getPackageManagerUrl: () => this.helpers.getPackageManagerUrl(),
        getInstallCmd: (pm) => this.helpers.getInstallCmd(pm),
        guessFeatureDesc: (name) => this.helpers.guessFeatureDesc(name),
        guessDescription: (name, type) => this.helpers.guessDescription(name, type),
        generateDetailedEnvGuide: (vars) => this.helpers.generateDetailedEnvGuide(vars)
      };

      // 2. 处理子项目
      const subProjects = ['backend', 'frontend'];
      subProjects.forEach(sub => {
        const subPath = path.join(this.projectRoot, sub);
        if (fs.existsSync(subPath)) {
          const subData = this.extractor.readProjectConfig(subPath);
          if (subData) {
            console.log(`📄 更新 ${sub}/README.md...`);
            const subPm = this.helpers.detectPackageManager(subPath);
            const subHelpers = { ...helpers, packageManager: subPm };
            const subReadme = MarkdownTemplates.renderSubProjectReadme(subData, subHelpers, sub);
            fs.writeFileSync(path.join(subPath, 'README.md'), subReadme);
          }
        }
      });

      // 3. 渲染并写入根项目文件
      this.writeFiles(projectData, envVars, helpers);
      
      console.log('✅ 文档更新完成');
      
    } catch (error) {
      console.error('❌ 文档更新失败:', error.message);
      process.exit(1);
    }
  }

  ensureDirectories() {
    const dirs = ['docs', 'docs/project', 'docs/guides', 'docs/reports'];
    dirs.forEach(d => {
      const p = path.join(this.projectRoot, d);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });
  }

  writeFiles(data, envVars, helpers) {
    // README.md (强制大写)
    const readmeContent = MarkdownTemplates.renderReadme(data, envVars, helpers);
    fs.writeFileSync(path.join(this.projectRoot, 'README.md'), readmeContent);
    
    // 设置指南
    const setupContent = MarkdownTemplates.renderSetupGuide(data, envVars, helpers);
    fs.writeFileSync(path.join(this.docsDir, 'guides/setup.md'), setupContent);
    
    console.log('📄 README.md 已更新');
    console.log('📋 设置指南已更新');
  }
}

if (require.main === module) {
  new DocumentUpdater().update().catch(console.error);
}
