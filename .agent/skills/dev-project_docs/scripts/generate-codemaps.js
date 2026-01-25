#!/usr/bin/env node

/**
 * 代码地图生成脚本
 * 自动分析项目结构并生成架构文档
 * 遵循项目最佳实践
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodemapGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.outputDir = path.join(this.projectRoot, 'docs', 'codemaps');
    this.reportsDir = path.join(this.projectRoot, 'docs', 'reports');
    this.timestamp = new Date().toISOString().split('T')[0];
  }

  async generate() {
    console.log('🗺️ 开始生成代码地图...');
    
    try {
      // 确保输出目录存在
      this.ensureDirectories();
      
      // 分析项目结构
      const structure = await this.analyzeProjectStructure();
      
      // 生成各个领域的代码地图
      await this.generateFrontendMap(structure);
      await this.generateBackendMap(structure);
      await this.generateDatabaseMap(structure);
      await this.generateIntegrationsMap(structure);
      await this.generateIndexMap(structure);
      
      // 生成变更报告
      await this.generateChangeReport(structure);
      
      console.log('✅ 代码地图生成完成');
      console.log(`📁 输出目录: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ 代码地图生成失败:', error.message);
      process.exit(1);
    }
  }

  ensureDirectories() {
    [this.outputDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async analyzeProjectStructure() {
    console.log('🔍 分析项目结构...');
    
    const packageJson = this.readPackageJson();
    const srcFiles = this.findSourceFiles();
    const dependencies = this.analyzeDependencies(srcFiles);
    const framework = this.detectFramework(packageJson, srcFiles);
    
    return {
      name: packageJson.name || 'Unknown Project',
      version: packageJson.version || '0.0.0',
      description: packageJson.description || '',
      scripts: packageJson.scripts || {},
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      framework,
      srcFiles,
      dependencies,
      entryPoints: this.findEntryPoints(srcFiles, framework)
    };
  }

  readPackageJson() {
    try {
      return JSON.parse(fs.readFileSync('package.json', 'utf8'));
    } catch {
      return {};
    }
  }

  findSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs'];
    const srcDirs = ['src', 'app', 'pages', 'components', 'lib', 'utils', 'backend', 'frontend'];
    const files = [];

    srcDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.walkDirectory(dir, extensions, files);
      }
    });

    return files;
  }

  walkDirectory(dir, extensions, files) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.walkDirectory(fullPath, extensions, files);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push({
          path: fullPath,
          name: item,
          dir: dir,
          extension: path.extname(item),
          size: stat.size,
          modified: stat.mtime
        });
      }
    });
  }

  analyzeDependencies(files) {
    const dependencies = new Map();
    
    files.forEach(file => {
      if (['.ts', '.tsx', '.js', '.jsx'].includes(file.extension)) {
        try {
          const content = fs.readFileSync(file.path, 'utf8');
          const imports = this.extractImports(content);
          dependencies.set(file.path, imports);
        } catch (error) {
          console.warn(`⚠️ 无法读取文件: ${file.path}`);
        }
      }
    });
    
    return dependencies;
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  detectFramework(packageJson, srcFiles) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.next) return 'Next.js';
    if (deps.react) return 'React';
    if (deps.vue) return 'Vue.js';
    if (deps.fastapi) return 'FastAPI';
    if (deps.express) return 'Express.js';
    if (srcFiles.some(f => f.name === 'main.py')) return 'Python';
    if (srcFiles.some(f => f.name === 'main.go')) return 'Go';
    
    return 'Unknown';
  }

  findEntryPoints(srcFiles, framework) {
    const entryPoints = [];
    
    // 根据框架查找入口点
    switch (framework) {
      case 'Next.js':
        entryPoints.push(...srcFiles.filter(f => 
          f.path.includes('app/layout') || 
          f.path.includes('pages/_app') ||
          f.path.includes('app/page')
        ));
        break;
      case 'React':
        entryPoints.push(...srcFiles.filter(f => 
          f.name === 'index.tsx' || 
          f.name === 'App.tsx' ||
          f.name === 'main.tsx'
        ));
        break;
      case 'FastAPI':
        entryPoints.push(...srcFiles.filter(f => 
          f.name === 'main.py' || 
          f.name === 'app.py'
        ));
        break;
      default:
        entryPoints.push(...srcFiles.filter(f => 
          f.name.includes('main') || 
          f.name.includes('index') ||
          f.name.includes('app')
        ));
    }
    
    return entryPoints;
  }

  async generateFrontendMap(structure) {
    const frontendFiles = structure.srcFiles.filter(f => 
      f.dir.includes('frontend') || 
      f.dir.includes('src') || 
      f.dir.includes('components') ||
      ['.tsx', '.jsx'].includes(f.extension)
    );

    const template = `# 前端架构

**最后更新:** ${this.timestamp}
**框架:** ${structure.framework}
**入口点:** ${structure.entryPoints.map(ep => ep.path).join(', ') || '未检测到'}

## 项目结构

\`\`\`
${this.generateStructureTree(frontendFiles)}
\`\`\`

## 关键组件

${this.generateComponentTable(frontendFiles)}

## 数据流

${this.generateDataFlow(structure, 'frontend')}

## 外部依赖

${this.generateDependencyList(structure, 'frontend')}

## 相关领域

- [后端架构](backend.md) - API 和服务层
- [数据库结构](database.md) - 数据模型
- [外部集成](integrations.md) - 第三方服务

---
*由 generate-codemaps.js 自动生成 - ${new Date().toISOString()}*
`;

    fs.writeFileSync(path.join(this.outputDir, 'frontend.md'), template);
    console.log('📝 前端代码地图已生成');
  }

  async generateBackendMap(structure) {
    const backendFiles = structure.srcFiles.filter(f => 
      f.dir.includes('backend') || 
      f.dir.includes('api') || 
      f.dir.includes('server') ||
      f.extension === '.py'
    );

    const template = `# 后端架构

**最后更新:** ${this.timestamp}
**框架:** ${structure.framework}
**入口点:** ${structure.entryPoints.filter(ep => backendFiles.some(bf => bf.path === ep.path)).map(ep => ep.path).join(', ') || '未检测到'}

## 项目结构

\`\`\`
${this.generateStructureTree(backendFiles)}
\`\`\`

## API 路由

${this.generateApiRoutes(backendFiles)}

## 数据流

${this.generateDataFlow(structure, 'backend')}

## 外部依赖

${this.generateDependencyList(structure, 'backend')}

## 相关领域

- [前端架构](frontend.md) - 用户界面
- [数据库结构](database.md) - 数据持久化
- [外部集成](integrations.md) - 第三方 API

---
*由 generate-codemaps.js 自动生成 - ${new Date().toISOString()}*
`;

    fs.writeFileSync(path.join(this.outputDir, 'backend.md'), template);
    console.log('📝 后端代码地图已生成');
  }

  async generateDatabaseMap(structure) {
    const dbFiles = structure.srcFiles.filter(f => 
      f.path.includes('schema') || 
      f.path.includes('model') || 
      f.path.includes('migration') ||
      f.name.includes('db') ||
      f.name.includes('database')
    );

    const template = `# 数据库结构

**最后更新:** ${this.timestamp}
**数据库类型:** ${this.detectDatabaseType(structure)}

## 数据模型

${this.generateDataModels(dbFiles)}

## 关系图

\`\`\`
${this.generateERDiagram(dbFiles)}
\`\`\`

## 索引和约束

${this.generateIndexes(dbFiles)}

## 相关领域

- [后端架构](backend.md) - 数据访问层
- [外部集成](integrations.md) - 数据同步

---
*由 generate-codemaps.js 自动生成 - ${new Date().toISOString()}*
`;

    fs.writeFileSync(path.join(this.outputDir, 'database.md'), template);
    console.log('📝 数据库代码地图已生成');
  }

  async generateIntegrationsMap(structure) {
    const integrationDeps = this.findIntegrationDependencies(structure);

    const template = `# 外部集成

**最后更新:** ${this.timestamp}

## 第三方服务

${this.generateIntegrationTable(integrationDeps)}

## 认证和授权

${this.generateAuthSection(structure)}

## API 集成

${this.generateApiIntegrations(structure)}

## 相关领域

- [前端架构](frontend.md) - 客户端集成
- [后端架构](backend.md) - 服务端集成

---
*由 generate-codemaps.js 自动生成 - ${new Date().toISOString()}*
`;

    fs.writeFileSync(path.join(this.outputDir, 'integrations.md'), template);
    console.log('📝 集成代码地图已生成');
  }

  async generateIndexMap(structure) {
    const template = `# 架构总览

**最后更新:** ${this.timestamp}
**项目:** ${structure.name}
**版本:** ${structure.version}
**框架:** ${structure.framework}

## 项目描述

${structure.description || '暂无描述'}

## 整体架构

\`\`\`
用户界面 (Frontend)
    ↓
API 网关 (Backend)
    ↓
数据库 (Database)
    ↓
外部服务 (Integrations)
\`\`\`

## 核心模块

| 模块 | 描述 | 文档链接 |
|------|------|----------|
| 前端 | 用户界面和交互 | [frontend.md](frontend.md) |
| 后端 | API 和业务逻辑 | [backend.md](backend.md) |
| 数据库 | 数据存储和管理 | [database.md](database.md) |
| 集成 | 第三方服务集成 | [integrations.md](integrations.md) |

## 技术栈

### 前端
${this.generateTechStack(structure, 'frontend')}

### 后端
${this.generateTechStack(structure, 'backend')}

### 数据库
${this.generateTechStack(structure, 'database')}

## 开发工具

### 可用脚本
${this.generateScriptsTable(structure.scripts)}

### 开发依赖
${this.generateDevDependencies(structure.devDependencies)}

## 项目统计

- **总文件数:** ${structure.srcFiles.length}
- **代码行数:** ${this.calculateLinesOfCode(structure.srcFiles)}
- **最后修改:** ${this.getLastModified(structure.srcFiles)}

---
*由 generate-codemaps.js 自动生成 - ${new Date().toISOString()}*
`;

    fs.writeFileSync(path.join(this.outputDir, 'index.md'), template);
    console.log('📝 总览代码地图已生成');
  }

  generateStructureTree(files) {
    const tree = {};
    
    files.forEach(file => {
      const parts = file.path.split(path.sep);
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? null : {};
        }
        if (current[part] !== null) {
          current = current[part];
        }
      });
    });
    
    return this.renderTree(tree, 0);
  }

  renderTree(obj, depth) {
    let result = '';
    const indent = '  '.repeat(depth);
    
    Object.keys(obj).sort().forEach(key => {
      if (obj[key] === null) {
        result += `${indent}${key}\n`;
      } else {
        result += `${indent}${key}/\n`;
        result += this.renderTree(obj[key], depth + 1);
      }
    });
    
    return result;
  }

  generateComponentTable(files) {
    const components = files.filter(f => 
      f.name.includes('Component') || 
      f.dir.includes('components') ||
      /^[A-Z]/.test(f.name)
    ).slice(0, 10);

    if (components.length === 0) {
      return '暂无检测到组件';
    }

    let table = '| 组件 | 路径 | 大小 |\n|------|------|------|\n';
    components.forEach(comp => {
      table += `| ${comp.name} | ${comp.path} | ${(comp.size / 1024).toFixed(1)}KB |\n`;
    });
    
    return table;
  }

  generateDataFlow(structure, domain) {
    switch (domain) {
      case 'frontend':
        return '用户交互 → 组件状态 → API 调用 → 数据更新 → UI 重渲染';
      case 'backend':
        return 'HTTP 请求 → 路由处理 → 业务逻辑 → 数据库操作 → 响应返回';
      default:
        return '数据流待分析';
    }
  }

  generateDependencyList(structure, domain) {
    const deps = structure.dependencies;
    const relevantDeps = Object.entries(deps).filter(([name]) => {
      if (domain === 'frontend') {
        return ['react', 'vue', 'next', 'typescript', 'tailwind'].some(keyword => 
          name.toLowerCase().includes(keyword)
        );
      } else if (domain === 'backend') {
        return ['express', 'fastapi', 'django', 'flask', 'node'].some(keyword => 
          name.toLowerCase().includes(keyword)
        );
      }
      return true;
    }).slice(0, 10);

    if (relevantDeps.length === 0) {
      return '暂无相关依赖';
    }

    let list = '';
    relevantDeps.forEach(([name, version]) => {
      list += `- **${name}** ${version}\n`;
    });
    
    return list;
  }

  generateApiRoutes(files) {
    const apiFiles = files.filter(f => 
      f.path.includes('api') || 
      f.path.includes('route') ||
      f.name.includes('router')
    );

    if (apiFiles.length === 0) {
      return '暂无检测到 API 路由';
    }

    let table = '| 文件 | 路径 | 用途 |\n|------|------|------|\n';
    apiFiles.forEach(file => {
      const purpose = this.guessFilePurpose(file.name);
      table += `| ${file.name} | ${file.path} | ${purpose} |\n`;
    });
    
    return table;
  }

  guessFilePurpose(filename) {
    if (filename.includes('auth')) return '认证相关';
    if (filename.includes('user')) return '用户管理';
    if (filename.includes('api')) return 'API 接口';
    if (filename.includes('route')) return '路由定义';
    return '待分析';
  }

  detectDatabaseType(structure) {
    const deps = structure.dependencies;
    if (deps.postgresql || deps.pg) return 'PostgreSQL';
    if (deps.mysql || deps.mysql2) return 'MySQL';
    if (deps.sqlite || deps.sqlite3) return 'SQLite';
    if (deps.mongodb || deps.mongoose) return 'MongoDB';
    return '未检测到';
  }

  generateDataModels(files) {
    if (files.length === 0) {
      return '暂无检测到数据模型';
    }

    let models = '| 模型文件 | 路径 |\n|----------|------|\n';
    files.forEach(file => {
      models += `| ${file.name} | ${file.path} |\n`;
    });
    
    return models;
  }

  generateERDiagram(files) {
    return '数据库关系图待生成\n(需要分析具体的模型定义)';
  }

  generateIndexes(files) {
    return '索引和约束信息待分析';
  }

  findIntegrationDependencies(structure) {
    const integrationKeywords = [
      'auth', 'oauth', 'jwt', 'passport',
      'stripe', 'paypal', 'payment',
      'aws', 'azure', 'gcp', 'cloud',
      'redis', 'elasticsearch', 'kafka',
      'sendgrid', 'mailgun', 'email',
      'twilio', 'sms', 'notification'
    ];

    return Object.entries(structure.dependencies).filter(([name]) =>
      integrationKeywords.some(keyword => name.toLowerCase().includes(keyword))
    );
  }

  generateIntegrationTable(integrations) {
    if (integrations.length === 0) {
      return '暂无检测到第三方集成';
    }

    let table = '| 服务 | 版本 | 用途 |\n|------|------|------|\n';
    integrations.forEach(([name, version]) => {
      const purpose = this.guessIntegrationPurpose(name);
      table += `| ${name} | ${version} | ${purpose} |\n`;
    });
    
    return table;
  }

  guessIntegrationPurpose(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('auth') || lowerName.includes('jwt')) return '认证授权';
    if (lowerName.includes('payment') || lowerName.includes('stripe')) return '支付处理';
    if (lowerName.includes('mail') || lowerName.includes('email')) return '邮件服务';
    if (lowerName.includes('cloud') || lowerName.includes('aws')) return '云服务';
    if (lowerName.includes('redis') || lowerName.includes('cache')) return '缓存服务';
    return '待分析';
  }

  generateAuthSection(structure) {
    const authDeps = Object.keys(structure.dependencies).filter(name =>
      ['auth', 'jwt', 'passport', 'oauth'].some(keyword => 
        name.toLowerCase().includes(keyword)
      )
    );

    if (authDeps.length === 0) {
      return '暂无检测到认证相关依赖';
    }

    return `检测到认证相关依赖: ${authDeps.join(', ')}`;
  }

  generateApiIntegrations(structure) {
    return '外部 API 集成待分析';
  }

  generateTechStack(structure, domain) {
    const deps = structure.dependencies;
    const relevantDeps = Object.keys(deps).filter(name => {
      const lowerName = name.toLowerCase();
      if (domain === 'frontend') {
        return ['react', 'vue', 'next', 'typescript', 'tailwind', 'css'].some(keyword => 
          lowerName.includes(keyword)
        );
      } else if (domain === 'backend') {
        return ['express', 'fastapi', 'django', 'flask', 'node', 'python'].some(keyword => 
          lowerName.includes(keyword)
        );
      } else if (domain === 'database') {
        return ['postgres', 'mysql', 'mongo', 'redis', 'sqlite'].some(keyword => 
          lowerName.includes(keyword)
        );
      }
      return false;
    });

    return relevantDeps.length > 0 ? relevantDeps.join(', ') : '待分析';
  }

  generateScriptsTable(scripts) {
    if (!scripts || Object.keys(scripts).length === 0) {
      return '暂无可用脚本';
    }

    let table = '| 脚本 | 命令 |\n|------|------|\n';
    Object.entries(scripts).forEach(([name, command]) => {
      table += `| \`${name}\` | \`${command}\` |\n`;
    });
    
    return table;
  }

  generateDevDependencies(devDeps) {
    if (!devDeps || Object.keys(devDeps).length === 0) {
      return '暂无开发依赖';
    }

    const importantDevDeps = Object.entries(devDeps).slice(0, 10);
    let list = '';
    importantDevDeps.forEach(([name, version]) => {
      list += `- ${name} ${version}\n`;
    });
    
    return list;
  }

  calculateLinesOfCode(files) {
    // 简化实现，实际可以读取文件内容计算
    return files.length * 50; // 估算
  }

  getLastModified(files) {
    if (files.length === 0) return '未知';
    
    const latest = files.reduce((latest, file) => 
      file.modified > latest.modified ? file : latest
    );
    
    return latest.modified.toISOString().split('T')[0];
  }

  async generateChangeReport(structure) {
    const reportPath = path.join(this.reportsDir, 'codemap-diff.txt');
    
    const report = `代码地图生成报告
===================

生成时间: ${new Date().toISOString()}
项目名称: ${structure.name}
项目版本: ${structure.version}

统计信息:
- 总文件数: ${structure.srcFiles.length}
- 前端文件: ${structure.srcFiles.filter(f => ['.tsx', '.jsx'].includes(f.extension)).length}
- 后端文件: ${structure.srcFiles.filter(f => f.extension === '.py').length}
- 配置文件: ${structure.srcFiles.filter(f => f.name.includes('config')).length}

生成的文档:
- docs/codemaps/index.md
- docs/codemaps/frontend.md
- docs/codemaps/backend.md
- docs/codemaps/database.md
- docs/codemaps/integrations.md

建议:
- 定期更新代码地图以保持同步
- 添加更多的代码注释以改善文档质量
- 考虑添加架构决策记录 (ADR)
`;

    fs.writeFileSync(reportPath, report);
    console.log('📊 变更报告已生成');
  }
}

// 主执行逻辑
if (require.main === module) {
  const generator = new CodemapGenerator();
  generator.generate().catch(error => {
    console.error('生成失败:', error);
    process.exit(1);
  });
}

module.exports = CodemapGenerator;
