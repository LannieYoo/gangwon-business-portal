# 江原企业门户 - Claude Code 项目配置

## 项目概览

江原企业门户是一个前后端分离的企业服务平台，支持韩语和中文双语，为企业提供项目申请、实绩管理、FAQ 和咨询等功能。

## 技术栈

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.11
- **Router**: React Router DOM 7.1.3
- **State Management**: Zustand 5.0.3
- **i18n**: react-i18next 15.1.5
- **HTTP Client**: Axios 1.7.9
- **Styling**: Custom CSS

### Backend
- **Runtime**: Node.js + Express
- **Database**: (根据项目配置添加)

### Testing
- **Unit Testing**: Vitest (待配置)
- **E2E Testing**: Playwright (待配置)

## 项目结构

```
gangwon-business-portal/
├── frontend/
│   ├── src/
│   │   ├── admin/              # 管理员模块
│   │   │   └── modules/
│   │   │       ├── auth/       # 管理员认证
│   │   │       └── members/    # 会员管理
│   │   ├── member/             # 会员模块
│   │   │   ├── layouts/        # 布局组件
│   │   │   └── modules/        # 功能模块
│   │   │       ├── about_deprecated/
│   │   │       ├── auth_deprecated/
│   │   │       ├── home_deprecated/
│   │   │       ├── performance_deprecated/
│   │   │       ├── projects_deprecated/
│   │   │       └── support_deprecated/
│   │   ├── features/           # 新功能模块（推荐）
│   │   ├── shared/             # 共享资源
│   │   │   ├── components/     # 共享组件
│   │   │   ├── hooks/          # 自定义 Hooks
│   │   │   ├── services/       # API 服务
│   │   │   ├── stores/         # Zustand Stores
│   │   │   ├── utils/          # 工具函数
│   │   │   ├── i18n/           # 国际化
│   │   │   │   └── locales/
│   │   │   │       ├── ko.json # 韩语翻译
│   │   │   │       └── zh.json # 中文翻译
│   │   │   └── styles/         # 全局样式
│   │   ├── App.jsx             # 根组件
│   │   └── router.jsx          # 路由配置
│   ├── vite.config.js
│   └── package.json
├── backend/                    # 后端（如有）
├── .claude/                    # Claude Code 配置
│   ├── rules/                  # 代码规则
│   ├── agents/                 # 专门 Agents
│   ├── commands/               # 快捷命令
│   ├── skills/                 # 技能和模式
│   └── hooks.json              # 自动化钩子
├── docs/                       # 项目文档
└── CLAUDE.md                   # 本文件
```

## 开发指南

### 命令

```bash
# 安装依赖
cd frontend && npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 测试（待配置）
npm run test

# E2E 测试（待配置）
npm run test:e2e
```

### 代码规范

#### 1. 文件命名
- 组件文件: `PascalCase.jsx` (例如: `UserCard.jsx`)
- 工具文件: `camelCase.js` (例如: `formatDate.js`)
- 样式文件: `kebab-case.css` (例如: `user-card.css`)

#### 2. 组件模式
- 使用**命名导出**而不是默认导出
- Props 使用**解构**
- 遵循**组合优于继承**原则

```javascript
// ✅ GOOD
export const UserCard = ({ name, email }) => {
  return <div>{name}</div>
}

// ❌ AVOID
export default function UserCard(props) {
  return <div>{props.name}</div>
}
```

#### 3. 状态管理 (Zustand)
- Store 更新必须使用**不可变模式**
- 按功能分割 Store
- 使用 Selector 优化性能

```javascript
// ✅ GOOD: 不可变更新
set((state) => ({
  users: state.users.map(u =>
    u.id === id ? { ...u, name } : u
  )
}))

// ❌ WRONG: 直接修改
set((state) => {
  state.users.push(newUser)
  return state
})
```

#### 4. 国际化 (i18n)
- **所有**用户可见文本必须使用 i18n
- 保持 `ko.json` 和 `zh.json` 键一致
- 使用命名空间组织翻译

```javascript
// ✅ GOOD
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
<h1>{t('common.welcome')}</h1>

// ❌ WRONG
<h1>欢迎</h1>
```

#### 5. 安全规范
- **永不**硬编码 API keys、密码或 tokens
- 使用 `import.meta.env.VITE_*` 环境变量
- 验证所有用户输入
- 防止 XSS 和 SQL 注入

#### 6. 性能优化
- 使用 `React.memo` 优化纯组件
- 使用 `useCallback` 和 `useMemo` 避免不必要的重新渲染
- 懒加载重型组件

#### 7. 测试要求
- 单元测试覆盖率 > 80%
- 关键用户流程必须有 E2E 测试
- 遵循 TDD 原则（测试先行）

### Git 工作流

#### Commit 消息格式
```
<type>: <description>

<optional body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Types:**
- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 重构
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建/工具更改
- `style`: 代码格式化
- `perf`: 性能优化

#### 提交前检查清单
- [ ] 没有 console.log 语句
- [ ] 没有硬编码的密钥
- [ ] 所有测试通过
- [ ] i18n 键已添加（ko.json 和 zh.json）
- [ ] 代码已格式化
- [ ] 没有 TypeScript/ESLint 错误

### Claude Code 使用

#### 可用命令
- `/code-review` - 代码审查
- `/build-fix` - 修复构建错误
- `/e2e` - 生成 E2E 测试

#### 可用 Agents
- `code-reviewer` - 代码质量和安全审查
- `build-error-resolver` - 构建错误解决
- `e2e-runner` - E2E 测试运行器

#### Rules
- `security.md` - 安全规范
- `coding-style.md` - 代码风格
- `git-workflow.md` - Git 工作流
- `testing.md` - 测试要求

## 关键用户流程（必须测试）

### 会员端
1. ✅ 用户注册和登录
2. ✅ 项目列表浏览
3. ✅ 项目申请提交
4. ✅ 实绩报告提交
5. ✅ FAQ 查看和咨询提交
6. ✅ 语言切换（韩语 ↔ 中文）

### 管理端
1. ✅ 管理员登录
2. ✅ 会员管理
3. ✅ 项目审核
4. ✅ 实绩审核

## 环境变量

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=江原企业门户

# Backend (.env)
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gangwon_portal
```

## 常见问题

### 如何添加新功能模块？
1. 在 `frontend/src/features/` 创建功能目录
2. 按模块结构组织：`components/`, `hooks/`, `services/`, `stores/`, `locales/`
3. 在 `router.jsx` 中添加路由
4. 添加 i18n 翻译键到 `ko.json` 和 `zh.json`

### 如何运行 E2E 测试？
```bash
npx playwright test
npx playwright show-report
```

### 如何修复构建错误？
```bash
# 使用 build-fix 命令
/build-fix

# 或手动
npm run build
```

## 联系方式

- 项目管理: [链接]
- 技术文档: `docs/` 目录
- API 文档: `docs/api/` 目录

---

**最后更新**: 2026-01-25
**Claude Code 版本**: 推荐使用最新版本
