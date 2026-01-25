---
name: project-standards
description: 核心项目规范。包含代码风格、Git工作流和质量标准。在开始任何编码任务前必须阅读。
---

# Project Governance Standards

本项目遵循严格的工程规范。Antigravity Agent 在执行任务时必须严格遵守以下标准。

## 1. 核心文档 (Source of Truth)

以下文档位于 `.kiro/steering/` 目录，是本项目的最高准则：

- **代码规范**: `{.kiro/steering/code-standard.md}`
  - _关键点_: 纯服务层、不可变性、函数<50行、服务层无数据转换。
- **Git 工作流**: `{.kiro/steering/git-workflow.md}`
  - _关键点_: Conventional Commits、原子提交、分支命名规范。
- **代码质量**: `{.kiro/steering/code-quality.md}`
  - _关键点_: 避免嵌套层级过深、错误处理、变量命名。

## 2. 必读指令 (Mandatory Instructions)

### 在编写代码前

1. **读取规范**: 必须使用 `view_file` 读取上述相关标准文件。
2. **检查风格**: 确认当前修改符合 `code-standard.md` 中的 "Implementation Checklist"。

### 在提交代码前 (Git)

1. **格式化**: 确保提交信息遵循 `git-workflow.md` 中的 `<type>: <description>` 格式。
2. **自检**: 再次确认没有包含 `console.log` 或硬编码的 Secrets。

## 3. 常见误区 (Anti-Patterns)

- ❌ **直接修改对象**: 违反 Immutability 原则 (见 `code-quality.md`).
- ❌ **服务层转换数据**: 违反 Service Layer Responsibilities (见 `code-standard.md`).
- ❌ **大杂烩提交**: 违反 Atomic Commits (见 `git-workflow.md`).
