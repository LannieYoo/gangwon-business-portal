# 文档自动化脚本

本文档提供文档自动化生成和维护的脚本示例。

## 代码地图生成

```javascript
// scripts/generate-codemaps.js
const fs = require("fs");
const path = require("path");

/**
 * 生成项目代码地图
 */
async function generateCodemaps() {
  console.log("🗺️ 生成代码地图...");

  // 1. 分析项目结构
  const structure = analyzeProjectStructure();

  // 2. 生成各个领域的代码地图
  await generateFrontendMap(structure);
  await generateBackendMap(structure);
  await generateIndexMap(structure);

  console.log("✅ 代码地图生成完成");
}

function analyzeProjectStructure() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    scripts: packageJson.scripts,
    dependencies: packageJson.dependencies,
  };
}

async function generateFrontendMap(structure) {
  const template = `# 前端架构

**最后更新:** ${new Date().toISOString().split("T")[0]}

## 项目结构

\`\`\`
src/
├── app/           # Next.js App Router
├── components/    # React 组件
├── hooks/         # 自定义 Hooks
├── lib/           # 工具库
└── types/         # TypeScript 类型
\`\`\`

## 技术栈

- Framework: ${structure.dependencies?.next ? "Next.js" : "React"}
- State: ${structure.dependencies?.zustand ? "Zustand" : "Context"}
`;

  fs.writeFileSync("docs/codemaps/frontend.md", template);
}

if (require.main === module) {
  generateCodemaps().catch(console.error);
}

module.exports = { generateCodemaps };
```

## 文档更新脚本

```javascript
// scripts/update-docs.js
const fs = require("fs");

/**
 * 从源代码更新文档
 */
async function updateDocs() {
  console.log("📝 更新文档...");

  // 1. 更新 README.md
  await updateReadme();

  // 2. 更新环境变量文档
  await updateEnvDocs();

  console.log("✅ 文档更新完成");
}

async function updateReadme() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  const readmeTemplate = `# ${packageJson.name}

${packageJson.description || "项目描述"}

## 快速开始

### 安装依赖
\`\`\`bash
${detectPackageManager()} install
\`\`\`

### 运行开发服务器
\`\`\`bash
${detectPackageManager()} run dev
\`\`\`

## 脚本命令

${generateScriptsTable(packageJson.scripts)}

---

*此文档自动生成*
`;

  fs.writeFileSync("README.md", readmeTemplate);
}

function detectPackageManager() {
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("bun.lockb")) return "bun";
  return "npm";
}

function generateScriptsTable(scripts) {
  if (!scripts) return "无可用脚本";

  const rows = Object.entries(scripts)
    .map(([name, command]) => `| \`${name}\` | ${command} |`)
    .join("\n");

  return `| 脚本 | 命令 |\n|------|------|\n${rows}`;
}

if (require.main === module) {
  updateDocs().catch(console.error);
}

module.exports = { updateDocs };
```

## 文档验证脚本

````python
# scripts/validate_docs.py
import subprocess
import re
from pathlib import Path

def extract_code_blocks(md_file):
    """提取 Markdown 文件中的代码块"""
    content = Path(md_file).read_text(encoding='utf-8')
    code_blocks = re.findall(r'```python\n(.*?)\n```', content, re.DOTALL)
    return code_blocks

def test_code_block(code):
    """测试代码块是否可执行"""
    try:
        # 仅进行语法检查
        compile(code, '<string>', 'exec')
        return True
    except SyntaxError as e:
        print(f"语法错误: {e}")
        return False

def validate_docs():
    """验证所有文档中的代码示例"""
    errors = []

    for md_file in Path('docs').glob('**/*.md'):
        code_blocks = extract_code_blocks(md_file)
        for i, code in enumerate(code_blocks):
            if not test_code_block(code):
                errors.append(f"{md_file}: 代码块 {i+1} 语法错误")

    if errors:
        print("发现以下问题:")
        for error in errors:
            print(f"  - {error}")
        return False

    print("✅ 所有文档验证通过")
    return True

if __name__ == "__main__":
    validate_docs()
````

## GitHub Actions 集成

```yaml
# .github/workflows/docs.yml
name: 文档生成和验证

on:
  push:
    branches: [main]
    paths: ["docs/**", "src/**/*.py", "src/**/*.ts"]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          pip install mkdocs mkdocs-material

      - name: Generate API docs
        run: python scripts/generate_api_docs.py

      - name: Build docs
        run: mkdocs build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
```

## MkDocs 配置

```yaml
# mkdocs.yml
site_name: 项目文档
site_description: 项目的完整文档
site_url: https://docs.example.com

theme:
  name: material
  language: zh
  palette:
    - scheme: default
      primary: blue
      accent: blue
  features:
    - navigation.tabs
    - navigation.sections
    - search.highlight

nav:
  - 首页: index.md
  - 快速开始: guides/getting-started.md
  - API 文档: api/
  - 架构设计: architecture/
  - 开发指南: development/

plugins:
  - search

markdown_extensions:
  - pymdownx.highlight
  - pymdownx.superfences
  - admonition
  - codehilite
```

---

## 代码质量检查

```bash
# 运行代码质量检查
node .agent/skills/dev-project_docs/scripts/check-quality.js
```

**检查项目**:

- 文件大小（建议 < 800 行）
- 函数复杂度（建议 < 50 行）
- 硬编码值（API keys、密码等）
- 调试语句（console.log、print）
- 未使用的导入
- ESLint（如果配置）

---

## 测试运行

```bash
# 运行前端和后端测试
node .agent/skills/dev-project_docs/scripts/run-tests.js
```

**功能**:

- 自动检测前端/后端目录
- 运行 npm test (前端) / pytest (后端)
- 检查覆盖率（要求 ≥ 70%）
- 汇总测试结果

---

## Git Hooks 安装

```bash
# 安装 Git 钩子
node .agent/skills/dev-project_docs/scripts/install-hooks.js

# 移除 Git 钩子
node .agent/skills/dev-project_docs/scripts/install-hooks.js --remove

# 查看状态
node .agent/skills/dev-project_docs/scripts/install-hooks.js --status
```

**安装的钩子**:

- `pre-commit`: 代码质量检查 + 文档验证
- `pre-push`: 运行测试
