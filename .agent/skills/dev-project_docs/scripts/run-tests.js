#!/usr/bin/env node

/**
 * 测试运行脚本
 * 运行项目测试并检查覆盖率
 * 可集成到 Git pre-push 钩子
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

class TestRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      frontend: { passed: null, coverage: null },
      backend: { passed: null, coverage: null }
    };
    this.minCoverage = 70; // 最低覆盖率要求
  }

  /**
   * 运行测试
   */
  async run() {
    console.log('🧪 开始运行测试...\n');

    // 检测项目类型并运行测试
    await this.runFrontendTests();
    await this.runBackendTests();

    // 输出汇总
    this.printSummary();

    // 返回是否全部通过
    return this.isAllPassed();
  }

  /**
   * 运行前端测试
   */
  async runFrontendTests() {
    const frontendDir = path.join(this.projectRoot, 'frontend');
    
    if (!fs.existsSync(frontendDir)) {
      console.log('ℹ️ 未检测到 frontend 目录，跳过前端测试\n');
      return;
    }

    console.log('📦 运行前端测试...');

    // 检查 package.json 中的测试脚本
    const packageJsonPath = path.join(frontendDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('⚠️ frontend/package.json 不存在\n');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const scripts = packageJson.scripts || {};

      if (scripts.test) {
        console.log('   运行: npm test');
        
        const result = spawnSync('npm', ['test', '--', '--passWithNoTests', '--watchAll=false'], {
          cwd: frontendDir,
          encoding: 'utf-8',
          shell: true,
          timeout: 300000 // 5分钟超时
        });

        if (result.status === 0) {
          this.results.frontend.passed = true;
          console.log('   ✅ 前端测试通过');
        } else {
          this.results.frontend.passed = false;
          console.log('   ❌ 前端测试失败');
          if (result.stderr) {
            console.log('   错误:', result.stderr.substring(0, 500));
          }
        }

        // 检查覆盖率
        await this.checkFrontendCoverage(frontendDir);
      } else {
        console.log('   ⚠️ 未配置测试脚本 (package.json scripts.test)');
        this.results.frontend.passed = null;
      }
    } catch (error) {
      console.log('   ❌ 运行前端测试时出错:', error.message);
      this.results.frontend.passed = false;
    }

    console.log('');
  }

  /**
   * 检查前端覆盖率
   */
  async checkFrontendCoverage(frontendDir) {
    const coveragePath = path.join(frontendDir, 'coverage', 'coverage-summary.json');
    
    if (fs.existsSync(coveragePath)) {
      try {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
        const total = coverage.total;
        const avgCoverage = (
          total.lines.pct + 
          total.statements.pct + 
          total.functions.pct + 
          total.branches.pct
        ) / 4;

        this.results.frontend.coverage = avgCoverage.toFixed(1);
        console.log(`   📊 覆盖率: ${this.results.frontend.coverage}%`);

        if (avgCoverage < this.minCoverage) {
          console.log(`   ⚠️ 覆盖率低于 ${this.minCoverage}%`);
        }
      } catch (error) {
        console.log('   ℹ️ 无法读取覆盖率报告');
      }
    }
  }

  /**
   * 运行后端测试
   */
  async runBackendTests() {
    const backendDir = path.join(this.projectRoot, 'backend');
    
    if (!fs.existsSync(backendDir)) {
      console.log('ℹ️ 未检测到 backend 目录，跳过后端测试\n');
      return;
    }

    console.log('📦 运行后端测试...');

    // 检查 Python 测试
    const pytestExists = fs.existsSync(path.join(backendDir, 'pytest.ini')) ||
                         fs.existsSync(path.join(backendDir, 'pyproject.toml')) ||
                         fs.existsSync(path.join(backendDir, 'tests'));

    if (pytestExists) {
      try {
        console.log('   运行: pytest');
        
        const result = spawnSync('python', ['-m', 'pytest', '-v', '--tb=short'], {
          cwd: backendDir,
          encoding: 'utf-8',
          shell: true,
          timeout: 300000
        });

        if (result.status === 0) {
          this.results.backend.passed = true;
          console.log('   ✅ 后端测试通过');
        } else if (result.status === 5) {
          // pytest 返回 5 表示没有找到测试
          console.log('   ⚠️ 未找到测试文件');
          this.results.backend.passed = null;
        } else {
          this.results.backend.passed = false;
          console.log('   ❌ 后端测试失败');
        }

        // 检查覆盖率
        await this.checkBackendCoverage(backendDir);
      } catch (error) {
        console.log('   ❌ 运行后端测试时出错:', error.message);
        this.results.backend.passed = false;
      }
    } else {
      console.log('   ⚠️ 未检测到 pytest 配置');
      this.results.backend.passed = null;
    }

    console.log('');
  }

  /**
   * 检查后端覆盖率
   */
  async checkBackendCoverage(backendDir) {
    // 尝试运行 pytest --cov
    try {
      const result = spawnSync('python', ['-m', 'pytest', '--cov=app', '--cov-report=term-missing', '-q'], {
        cwd: backendDir,
        encoding: 'utf-8',
        shell: true,
        timeout: 300000
      });

      if (result.stdout) {
        const coverageMatch = result.stdout.match(/TOTAL\s+\d+\s+\d+\s+(\d+)%/);
        if (coverageMatch) {
          this.results.backend.coverage = coverageMatch[1];
          console.log(`   📊 覆盖率: ${this.results.backend.coverage}%`);
        }
      }
    } catch (error) {
      // 忽略覆盖率检查错误
    }
  }

  /**
   * 输出汇总
   */
  printSummary() {
    console.log('📊 测试汇总:');
    console.log('   ┌─────────┬─────────┬──────────┐');
    console.log('   │ 模块    │ 状态    │ 覆盖率   │');
    console.log('   ├─────────┼─────────┼──────────┤');
    
    // 前端
    const feStatus = this.getStatusIcon(this.results.frontend.passed);
    const feCov = this.results.frontend.coverage ? `${this.results.frontend.coverage}%` : 'N/A';
    console.log(`   │ 前端    │ ${feStatus}      │ ${feCov.padEnd(8)} │`);
    
    // 后端
    const beStatus = this.getStatusIcon(this.results.backend.passed);
    const beCov = this.results.backend.coverage ? `${this.results.backend.coverage}%` : 'N/A';
    console.log(`   │ 后端    │ ${beStatus}      │ ${beCov.padEnd(8)} │`);
    
    console.log('   └─────────┴─────────┴──────────┘');
  }

  getStatusIcon(passed) {
    if (passed === true) return '✅';
    if (passed === false) return '❌';
    return '⚠️';
  }

  /**
   * 检查是否全部通过
   */
  isAllPassed() {
    // 如果有任何测试失败，返回 false
    if (this.results.frontend.passed === false || 
        this.results.backend.passed === false) {
      console.log('\n❌ 测试未通过');
      return false;
    }

    // 检查覆盖率
    const feCoverage = parseFloat(this.results.frontend.coverage) || 100;
    const beCoverage = parseFloat(this.results.backend.coverage) || 100;

    if (feCoverage < this.minCoverage || beCoverage < this.minCoverage) {
      console.log(`\n⚠️ 覆盖率未达到 ${this.minCoverage}% 要求`);
      // 覆盖率不足只是警告，不阻止提交
    }

    console.log('\n✅ 测试通过');
    return true;
  }
}

// 主执行逻辑
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().then(passed => {
    process.exit(passed ? 0 : 1);
  }).catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
