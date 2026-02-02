# gangwon-business-portal - Claude Code 项目配置

## 项目概览


- **Frontend**: React 18.3.1 + Vite 6.0.11


- **State Management**: Zustand 5.0.3


- **i18n**: react-i18next 15.1.5


- **Languages**: zh, ko


---

# Base Rules / 基础规则

> 所有 AI 编程助手平台的共享基础规则。
> 适配器会将此文件与其他规则文件合并生成平台配置。

## AI Behavior Guidelines / AI 行为准则

1. **语言**: 使用中文进行解释和说明
2. **技术术语**: 保留英文原文，如 "PCA"、"API"、"React"
3. **响应风格**: 简洁、可操作、结构化
4. **不确定时**: 主动询问而非假设
5. **修改文件**: 显示变更差异（diff）
6. **安全优先**: 不硬编码密钥、不引入 XSS/SQL 注入

## Coding Standards / 代码规范

### 命名规范

- 使用描述性的变量和函数名
- Python: `snake_case`
- JavaScript/TypeScript: `camelCase`
- React 组件: `PascalCase`
- CSS 文件: `kebab-case`

### 注释规范

- 使用双语注释（中文为主，技术术语保留英文）
- 文件顶部添加块注释说明用途
- 复杂逻辑需要注释解释

### 格式规范

- Python: 4 空格缩进
- JavaScript/TypeScript: 2 空格缩进
- 每行最多 120 字符

## Common Commands / 常用命令

```bash
# Git 操作
git pull origin main
git add . && git commit -m "message" && git push

# Node.js
npm install
npm run dev
npm run build

# Python 环境
uv sync
uv run python script.py
```

## Platform Config Mapping / 平台配置映射

| 平台 | 配置入口 | 适配器 |
|------|---------|--------|
| Claude Code | `CLAUDE.md` + `.claude/` | `adapters/claude/` |
| Cursor | `.cursorrules` | `adapters/cursor/` |
| Windsurf | `.windsurfrules` | `adapters/windsurf/` |
| Kiro | `.kiro/steering/` | `adapters/kiro/` |
| OpenAI Codex | `AGENTS.md` | `adapters/codex/` |
| Antigravity | `.agent/` | `adapters/antigravity/` |
| VS Code Copilot | `.github/copilot-instructions.md` | `adapters/copilot/` |


---

# Coding Style / 代码风格

## Immutability / 不可变性 (CRITICAL)

始终创建新对象，绝不直接修改：

```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return { ...user, name }
}

// Zustand Store (CORRECT)
set((state) => ({
  users: state.users.map(u =>
    u.id === id ? { ...u, name } : u
  )
}))

// Zustand Store (WRONG)
set((state) => {
  state.users.push(newUser)
  return state
})
```

## File Organization / 文件组织

遵循基于功能的模块化架构：

```
src/
├── features/           # 按功能组织
│   └── feature-name/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── stores/
│       └── locales/
├── shared/            # 共享资源
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   └── utils/
```

原则：
- 多个小文件 > 少数大文件
- 单文件 200-400 行，最多 800 行
- 高内聚、低耦合
- 按功能/领域组织，而非按类型

## Component Patterns / 组件模式

```javascript
// PREFER: 命名导出 (tree-shaking 友好)
export const UserCard = ({ name, email, role }) => {
  return <div>{name}</div>
}

// AVOID: 默认导出 (重构困难)
export default function UserCard(props) {
  return <div>{props.name}</div>
}
```

## i18n Best Practices / 国际化

```javascript
// ALWAYS: 使用翻译键
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
<h1>{t('common.welcome')}</h1>

// NEVER: 硬编码字符串
<h1>Welcome</h1>
```

## Error Handling / 错误处理

```javascript
try {
  const result = await apiService.fetchData()
  return result
} catch (error) {
  console.error('Failed to fetch data:', error)
  throw new Error(t('errors.fetchFailed'))
}
```

## Code Quality Checklist / 代码质量清单

- [ ] 代码可读且命名良好
- [ ] 函数 < 50 行
- [ ] 文件 < 800 行
- [ ] 嵌套不超过 4 层
- [ ] 正确的错误处理
- [ ] 无 console.log 语句
- [ ] 无硬编码值
- [ ] 使用不可变模式
- [ ] 所有字符串已国际化


---

# Security Guidelines / 安全规范

## Mandatory Security Checks / 必检项

每次提交前必须确认：
- [ ] 无硬编码的密钥（API keys、passwords、tokens）
- [ ] 所有用户输入已验证
- [ ] SQL 注入防护（参数化查询）
- [ ] XSS 防护（HTML 已清理）
- [ ] CSRF 保护已启用
- [ ] 认证/授权已验证
- [ ] API 端点有速率限制
- [ ] 错误消息不泄露敏感数据
- [ ] 敏感数据未输出到 console

## Secret Management / 密钥管理

```javascript
// NEVER: 硬编码密钥
const apiKey = "your-api-key-here"

// ALWAYS: 使用环境变量
// Frontend (Vite)
const apiKey = import.meta.env.VITE_API_KEY
// Backend (Node.js)
const dbPassword = process.env.DB_PASSWORD

if (!apiKey) {
  throw new Error('API key not configured')
}
```

## Frontend Security

```javascript
// NEVER: 直接注入 HTML
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ALWAYS: 清理用户输入
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />

// NEVER: 使用 eval
eval(userCode)
new Function(userCode)()
```

## API Security

```javascript
// ALWAYS: 验证请求数据
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100)
})

const validated = schema.parse(requestBody)
```

## Security Response Protocol

发现安全问题时：
1. 立即停止当前工作
2. 修复 CRITICAL 级别问题
3. 轮换已暴露的密钥
4. 审查代码库中的类似问题


---

# Git Workflow / Git 工作流

## Commit Message Format / 提交消息格式

遵循 Conventional Commits：

```
<type>: <description>

<optional body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types:
- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 代码重构
- `docs`: 文档变更
- `test`: 测试变更
- `chore`: 构建/工具变更
- `perf`: 性能优化
- `ci`: CI/CD 变更
- `style`: 代码格式化

## Branch Naming / 分支命名

```
feature/feature-name
fix/bug-description
refactor/component-name
```

## Pull Request Workflow

创建 PR 时：
1. 分析完整的 commit 历史（不只是最新 commit）
2. 使用 `git diff main...HEAD` 查看所有变更
3. 撰写全面的 PR 摘要
4. 包含测试计划清单
5. 新分支用 `-u` 标志推送

PR 模板:
```markdown
## Summary
[简要描述变更内容]

## Changes
- [变更点 1]
- [变更点 2]

## Test Plan
- [ ] 单元测试通过
- [ ] E2E 测试通过
- [ ] 手动测试关键流程
- [ ] i18n 翻译完整
```

## Pre-commit Checklist / 提交前检查

- [ ] 无 console.log 语句
- [ ] 无硬编码密钥
- [ ] 所有测试通过
- [ ] i18n 键已添加
- [ ] 代码已格式化
- [ ] 无 lint 错误


---

# Testing Requirements / 测试要求

## Coverage Target: 80%+

测试类型（全部需要）：
1. **Unit Tests** — 单个函数、工具、组件
2. **Integration Tests** — API 端点、数据库操作
3. **E2E Tests** — 关键用户流程

## Test-Driven Development (TDD)

新功能必须遵循 TDD 流程：
1. 先写测试 (RED)
2. 运行测试 — 应该失败
3. 写最小实现 (GREEN)
4. 运行测试 — 应该通过
5. 重构 (IMPROVE)
6. 验证覆盖率 (80%+)

## Frontend Testing (Vitest)

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('renders user information correctly', () => {
    const user = { name: 'John', email: 'john@example.com' }
    render(<UserCard user={user} />)
    expect(screen.getByText('John')).toBeInTheDocument()
  })
})
```

## Store Testing (Zustand)

```javascript
import { renderHook, act } from '@testing-library/react'
import { useUserStore } from './userStore'

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ users: [] })
  })

  it('adds user correctly', () => {
    const { result } = renderHook(() => useUserStore())
    act(() => {
      result.current.addUser({ id: 1, name: 'John' })
    })
    expect(result.current.users).toHaveLength(1)
  })
})
```

## E2E Testing (Playwright)

```javascript
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## Test File Organization

```
src/features/
└── feature-name/
    ├── components/
    │   ├── Component.jsx
    │   └── Component.test.jsx
    ├── hooks/
    │   ├── useHook.js
    │   └── useHook.test.js
    └── services/
        ├── service.js
        └── service.test.js
```


---

## 江原企业门户 - 项目特定规则

### i18n 要求
- **所有**用户可见文本必须使用 i18n
- 保持 `ko.json` 和 `zh.json` 键一致
- 使用命名空间组织翻译

```javascript
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
<h1>{t('common.welcome')}</h1>
```

### 组件规范
- 使用**命名导出**，禁止默认导出
- Props 使用**解构**
- Zustand Store 必须使用**不可变更新模式**

### 项目结构
```
frontend/src/
├── admin/              # 管理员模块
├── member/             # 会员模块
├── features/           # 新功能模块（推荐）
├── shared/             # 共享资源
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── utils/
│   └── i18n/locales/   # ko.json + zh.json
```

### 环境变量
```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=江原企业门户
```


---

## 可用 Skills


- `dev-code_reviewer`

- `dev-code_standards`

- `dev-code_style`

- `dev-communication_standards`

- `dev-data_download`

- `dev-documentation_standards`

- `dev-pptx_to_pdf`

- `dev-product_manager`

- `dev-quality_standards`

- `dev-resource_discovery`

- `dev-security_standards`

- `dev-senior_architect`

- `dev-senior_backend`

- `dev-senior_data_engineer`

- `dev-senior_devops`

- `dev-senior_frontend`

- `dev-senior_fullstack`

- `dev-senior_qa`

- `dev-senior_security`

- `dev-tdd_guide`

- `dev-tech_stack_evaluator`

- `dev-ux_designer`

- `dev-web_scraping`


---

**由 ai-dev-config 自动生成，请勿手动编辑。**
**运行 `ai-dev-config generate` 重新生成。**
