#!/usr/bin/env node

/**
 * 文档批量更新脚本
 * 按顺序执行所有文档自动化任务
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class DocumentationRunner {
  constructor() {
    this.scriptsDir = __dirname;
    this.projectRoot = process.cwd();
    this.results = [];
  }

  /**
   * 执行所有文档自动化任务
   */
  async runAll() {
    console.log('🚀 开始执行文档自动化任务...\n');
    console.log('=' .repeat(50));

    const scripts = [
      { name: 'generate-codemaps.js', description: '生成代码地图' },
      { name: 'update-docs.js', description: '更新项目文档' },
      { name: 'validate-docs.js', description: '验证文档质量' },
      { name: 'validate-prd.js', description: '验证 PRD 实现' },
    ];

    for (const script of scripts) {
      await this.runScript(script);
    }

    this.printSummary();
  }

  /**
   * 执行单个脚本
   */
  async runScript({ name, description }) {
    const scriptPath = path.join(this.scriptsDir, name);

    if (!fs.existsSync(scriptPath)) {
      console.log(`⚠️ 跳过 ${name}: 文件不存在\n`);
      this.results.push({ name, status: 'skipped', error: '文件不存在' });
      return;
    }

    console.log(`\n📦 ${description} (${name})`);
    console.log('-'.repeat(50));

    const startTime = Date.now();

    try {
      execSync(`node "${scriptPath}"`, {
        cwd: this.projectRoot,
        stdio: 'inherit',
        encoding: 'utf-8',
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.results.push({ name, status: 'success', duration });
      console.log(`✅ 完成 (${duration}s)\n`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.results.push({ name, status: 'failed', duration, error: error.message });
      console.log(`❌ 失败 (${duration}s)\n`);
    }
  }

  /**
   * 打印执行汇总
   */
  printSummary() {
    console.log('=' .repeat(50));
    console.log('\n📊 执行汇总:\n');

    const success = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    console.log('| 脚本 | 状态 | 耗时 |');
    console.log('|------|------|------|');

    for (const result of this.results) {
      const statusEmoji = result.status === 'success' ? '✅' :
                          result.status === 'failed' ? '❌' : '⚠️';
      const duration = result.duration ? `${result.duration}s` : '-';
      console.log(`| ${result.name} | ${statusEmoji} ${result.status} | ${duration} |`);
    }

    console.log(`\n总计: ${success} 成功, ${failed} 失败, ${skipped} 跳过`);

    if (failed > 0) {
      console.log('\n⚠️ 部分任务执行失败，请检查上方日志');
      process.exitCode = 1;
    } else {
      console.log('\n🎉 所有文档自动化任务执行完成!');
    }
  }
}

// 主执行逻辑
if (require.main === module) {
  const runner = new DocumentationRunner();
  runner.runAll().catch(error => {
    console.error('执行失败:', error);
    process.exit(1);
  });
}

module.exports = DocumentationRunner;
