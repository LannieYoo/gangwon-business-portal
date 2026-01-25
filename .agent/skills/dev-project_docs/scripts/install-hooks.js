#!/usr/bin/env node

/**
 * Git Hooks 安装脚本
 * 将质量检查脚本安装为 Git 钩子
 * 
 * 用法:
 *   node install-hooks.js          # 安装所有钩子
 *   node install-hooks.js --remove # 移除所有钩子
 */

const fs = require('fs');
const path = require('path');

class HooksInstaller {
  constructor() {
    this.projectRoot = process.cwd();
    this.gitDir = path.join(this.projectRoot, '.git');
    this.hooksDir = path.join(this.gitDir, 'hooks');
    this.scriptsDir = path.join(this.projectRoot, '.agent', 'skills', 'dev-project_docs', 'scripts');
  }

  /**
   * 安装钩子
   */
  install() {
    console.log('📦 安装 Git 钩子...\n');

    if (!fs.existsSync(this.gitDir)) {
      console.log('❌ 未检测到 .git 目录，请确保在 Git 仓库根目录运行');
      return false;
    }

    // 确保 hooks 目录存在
    if (!fs.existsSync(this.hooksDir)) {
      fs.mkdirSync(this.hooksDir, { recursive: true });
    }

    // 安装 pre-commit 钩子
    this.installPreCommit();

    // 安装 pre-push 钩子
    this.installPrePush();

    console.log('\n✅ Git 钩子安装完成！');
    console.log('   - pre-commit: 代码质量检查 + 文档验证');
    console.log('   - pre-push: 运行测试');
    
    return true;
  }

  /**
   * 安装 pre-commit 钩子
   */
  installPreCommit() {
    const hookPath = path.join(this.hooksDir, 'pre-commit');
    
    const hookContent = `#!/bin/sh
# Pre-commit hook - 代码质量检查
# 由 install-hooks.js 自动生成

echo "🔍 运行 pre-commit 检查..."
echo ""

# 1. 代码质量检查
echo "📋 代码质量检查..."
node "${this.scriptsDir}/check-quality.js"
QUALITY_EXIT=$?

if [ $QUALITY_EXIT -ne 0 ]; then
  echo ""
  echo "❌ 代码质量检查失败，提交已取消"
  echo "   请修复上述问题后重新提交"
  exit 1
fi

# 2. 文档验证（仅警告，不阻止提交）
echo ""
echo "📄 文档验证..."
node "${this.scriptsDir}/validate-docs.js" 2>/dev/null || true

echo ""
echo "✅ pre-commit 检查通过"
exit 0
`;

    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
    console.log('✅ pre-commit 钩子已安装');
  }

  /**
   * 安装 pre-push 钩子
   */
  installPrePush() {
    const hookPath = path.join(this.hooksDir, 'pre-push');
    
    const hookContent = `#!/bin/sh
# Pre-push hook - 运行测试
# 由 install-hooks.js 自动生成

echo "🧪 运行 pre-push 检查..."
echo ""

# 运行测试
node "${this.scriptsDir}/run-tests.js"
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo ""
  echo "❌ 测试失败，推送已取消"
  echo "   请修复测试后重新推送"
  exit 1
fi

echo ""
echo "✅ pre-push 检查通过"
exit 0
`;

    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
    console.log('✅ pre-push 钩子已安装');
  }

  /**
   * 移除钩子
   */
  remove() {
    console.log('🗑️ 移除 Git 钩子...\n');

    const hooks = ['pre-commit', 'pre-push'];
    
    for (const hook of hooks) {
      const hookPath = path.join(this.hooksDir, hook);
      if (fs.existsSync(hookPath)) {
        // 检查是否是我们安装的钩子
        const content = fs.readFileSync(hookPath, 'utf-8');
        if (content.includes('install-hooks.js')) {
          fs.unlinkSync(hookPath);
          console.log(`✅ 已移除 ${hook}`);
        } else {
          console.log(`⚠️ ${hook} 不是由此脚本安装，已跳过`);
        }
      }
    }

    console.log('\n✅ Git 钩子移除完成');
    return true;
  }

  /**
   * 显示状态
   */
  status() {
    console.log('📊 Git 钩子状态:\n');

    const hooks = ['pre-commit', 'pre-push', 'commit-msg', 'post-merge'];
    
    for (const hook of hooks) {
      const hookPath = path.join(this.hooksDir, hook);
      if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf-8');
        const isOurs = content.includes('install-hooks.js');
        console.log(`   ${hook}: ✅ 已安装 ${isOurs ? '(由此脚本)' : '(外部)'}`);
      } else {
        console.log(`   ${hook}: ❌ 未安装`);
      }
    }
  }
}

// 主执行逻辑
if (require.main === module) {
  const installer = new HooksInstaller();
  const args = process.argv.slice(2);

  if (args.includes('--remove') || args.includes('-r')) {
    installer.remove();
  } else if (args.includes('--status') || args.includes('-s')) {
    installer.status();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Git Hooks 安装脚本

用法:
  node install-hooks.js           # 安装钩子
  node install-hooks.js --remove  # 移除钩子
  node install-hooks.js --status  # 查看状态
  node install-hooks.js --help    # 显示帮助

安装的钩子:
  pre-commit  - 代码质量检查 + 文档验证
  pre-push    - 运行测试
    `);
  } else {
    installer.install();
  }
}

module.exports = HooksInstaller;
