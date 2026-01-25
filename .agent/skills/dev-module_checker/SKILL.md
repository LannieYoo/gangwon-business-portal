---
name: dev-module_checker
description: 自动化模块架构检查器。用于验证前端代码（Services, Hooks, i18n, Stores等）是否符合项目特定的架构规范和最佳实践。
---

# 模块架构检查器 (Module Checker)

该 Skill 封装了 `frontend/scripts/module_checker` 下的一系列静态检查脚本，用于自动化验证代码架构的合规性。这些脚本比通用的 ESLint 规则更严格，专注于项目特定的设计模式和目录结构规范。

## 使用场景

当需要执行以下任务时使用此 Skill：

1.  **架构合规性验证**：检查代码是否遵循项目定义的分层架构（如 Service 层的类结构、禁止直接使用 axios 等）。
2.  **i18n 一致性检查**：验证多语言文件（zh/ko）的 key 是否一致、是否有遗漏或空值。
3.  **模式强制**：强制执行特定的编码模式（如 Hooks 命名、Export 规范、禁止的反模式）。
4.  **重构后检查**：在进行大规模重构后，快速验证是否引入了架构违规。

## 检查器列表

脚本位于 `frontend/scripts/module_checker/` 目录下，可使用 `node` 直接运行。

### 1. Service 检查器 (`services-checker.js`)

验证 `src/shared/services` 及各模块下的服务层代码。

- **检查项**：
  - 文件命名（`*.service.js`）
  - 必须使用 Class 结构封装
  - 禁止直接导入 `axios`（需使用 `apiService`）
  - 必须处理参数校验（`params` 检查）
  - 禁止参数/响应使用默认值（强制显式处理空值）
  - 禁止多重 Fallback 写法

**运行命令**：

```bash
node .agent/skills/dev-module_checker/scripts/services-checker.js [目录路径]
# 默认检查 src/shared/services
```

### 2. i18n 检查器 (`i18n-checker.js`)

验证多语言资源文件的一致性。

- **检查项**：
  - 多语言文件是否齐全（ko.json, zh.json 等）
  - Key 的一致性（zh 是否包含了 ko 的所有 key）
  - 空值检查（不允许有空的翻译值）
  - Key 命名规范（camelCase 检查）

**运行命令**：

```bash
node .agent/skills/dev-module_checker/scripts/i18n-checker.js [i18n目录]
# 默认检查 src/shared/i18n
# 也可检查模块特定的 locales: node .agent/skills/dev-module_checker/scripts/i18n-checker.js frontend/src/member/layouts
```

### 3. Hooks 检查器 (`hooks-checker.js`)

验证 React Hooks 的编写规范。

- **检查项**：
  - 文件命名和导出规范（Named Export）
  - 必须导入 React
  - 禁止直接 DOM 操作（强制使用 `useRef`）
  - 代码风格（单行注释、useCallback 使用等）

**运行命令**：

```bash
node .agent/skills/dev-module_checker/scripts/hooks-checker.js [目录路径]
```

### 4. 其他检查器

- **Stores 检查器 (`stores-checker.js`)**：验证 Zustand store 定义、持久化配置等。
- **Styles 检查器 (`styles-checker.js`)**：验证 Tailwind 使用规范、禁止内联样式等。
- **Utils 检查器 (`utils-checker.js`)**：验证工具函数的纯函数特性、JSDoc 注释等。

## 最佳实践

1.  **提交前运行**：在提交代码前，运行相关模块的检查器以确保合规。
2.  **修复指引**：脚本输出会包含 `[FAIL]` 和具体的错误行号及修复建议（Suggestion），请根据提示修改代码。
3.  **增量检查**：可以只针对修改过的目录运行检查器，节省时间。

## 示例

**检查 member layouts 的 i18n 文件：**

```bash
node .agent/skills/dev-module_checker/scripts/i18n-checker.js frontend/src/member/layouts
```

**检查 shared services：**

```bash
node .agent/skills/dev-module_checker/scripts/services-checker.js frontend/src/shared/services
```
