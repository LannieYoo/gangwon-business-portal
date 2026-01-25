---
name: dev-frontend_patterns
description: 前端开发模式专家。Use when (1) building React components, (2) implementing state management, (3) styling with Tailwind CSS, (4) handling forms, (5) optimizing performance, (6) accessibility.
---

# 前端开发模式

**技术栈**: React 18, TypeScript, Vite, Zustand, Tailwind CSS, Lucide React

## 前置依赖

> **⚠️ 开始开发前，必须先检查以下 skill：**
>
> 1. **`dev-terminology`** - 确保命名符合项目术语字典
> 2. **`dev-libs_compatibility`** - 添加新依赖时检查兼容性

## 项目结构

```
src/
├── features/           # 功能模块（按领域组织）
│   ├── auth/
│   │   ├── components/  # 展示组件（含 UI 和样式）
│   │   ├── hooks/       # 业务逻辑
│   │   ├── services/    # API 调用
│   │   ├── views/       # 页面视图
│   │   └── types.ts
│   └── research/
├── shared/components/ui/
├── stores/            # Zustand
├── locales/           # i18n
└── app/               # 入口/路由
```

## 目录职责

| 目录          | 职责                      | 可以依赖                             | 禁止                                                  |
| ------------- | ------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `views/`      | 页面总组装 (Orchestrator) | 本模块 components, hooks             | **shared/components**, layouts, CSS, i18n, 函数, 枚举 |
| `components/` | UI 渲染                   | i18n, **shared/components**, layouts | 函数, 枚举, services                                  |
| `hooks/`      | 业务逻辑、函数、枚举      | services, stores                     | UI 代码                                               |
| `services/`   | API 封装                  | types                                | 状态管理                                              |

**核心原则**：

- **View 隔离原则**：View 严禁直接依赖 `shared/components` 或全局 `layouts`。如果 View 需要使用 Banner、Submenu 或 PageContainer，必须使用本模块 `components/` 下的封装组件（如 `ProjectBanner`, `ProjectSubmenu`）。
- 所有函数必须定义在 `hooks/` 中
- 所有业务枚举、配置项、固定值必须统一放到 `enums.ts` 中，严禁使用裸露的 `const` 常量定义业务逻辑
- Components 和 Views 只负责渲染，不定义任何逻辑或数据
- 严禁在 TSX 中使用任何硬编码文本，所有文字内容必须通过 i18n 引用

## Views 规范

**命名**: `*View.tsx`（如 `HomeView.tsx`, `LoginView.tsx`）

**职责**: **页面总编排 (Orchestrator)**。View 是页面的顶层入口，负责组合全局组件（及子菜单）与功能页组件。

```tsx
// ✅ 正确 - 负责编排：组合全局/共享组件 + 调用业务逻辑 + 渲染功能页
export default function NoticeDetailView() {
  const { notice, loading, handleBack } = useNoticeDetail();

  return (
    <div className="flex flex-col w-full">
      {/* 1. 全局/模块共享组件由 View 组装 */}
      <Banner bannerType="SUPPORT" />
      <SupportSubmenu active="notices" />

      {/* 2. 传递业务数据给功能页组件 */}
      <NoticeDetailPage notice={notice} loading={loading} onBack={handleBack} />
    </div>
  );
}

// ❌ 错误 - 包含具体样式定义或复杂的 HTML 标签
export default function NoticeDetailView() {
  return (
    <div className="p-10 border shadow-lg bg-red-50">
      {" "}
      {/* ❌ View 不应处理细节样式 */}
      <h1>Notice title</h1>
    </div>
  );
}
```

## Components 规范

**拆分原则**：

- **严禁使用 Page 级大组件 (`*Page.tsx`)**：禁止创建一个承载整个页面内容的巨大组件。
- **按功能拆分**：必须将页面拆分为多个独立的功能组件（如 `ProjectListHeader`, `ProjectListFilter`, `ProjectList`）。
- **由 View 组装**：View 负责将这些功能组件、全局 Banner、导航菜单等组装在一起。
- 单个组件 **≤ 150 行**。
- 单一职责。

```
components/
├── ProjectList/
│   ├── ProjectListHeader.tsx
│   ├── ProjectListFilter.tsx
│   └── ProjectList.tsx
```

**View 的职责**: **页面总组装 (Orchestrator)**。View 是页面的顶层入口，负责：

1. 调用业务逻辑 (Hooks)。
2. 组合全局组件 (Banner, Submenu)。
3. 组合页面内的功能组件。
4. 传递状态和回调。

```tsx
// ✅ 正确 - View 负责组装功能组件
export default function ProjectListView() {
  const { projects, filters, handleApply } = useProjectList();

  return (
    <div className="flex flex-col w-full">
      <Banner type="PROJECTS" />
      <Submenu active="list" />

      <PageContainer>
        <ProjectListHeader title={t("projects.title")} />
        <ProjectListFilter {...filters} />
        <ProjectList projects={projects} onApply={handleApply} />
      </PageContainer>
    </div>
  );
}
```

**View 与 Page 的配合示例**：

```tsx
// ChatPage.tsx (负责内容的骨架)
export function ChatPage({ sidebar, messages, input }) {
  return (
    <PageContainer>
      {" "}
      {/* 使用标准的容器组件 */}
      <div className="flex gap-6">
        <ChatSidebar {...sidebar} />
        <main className="flex-1">
          <MessageList messages={messages} />
          <ChatInput {...input} />
        </main>
      </div>
    </PageContainer>
  );
}
```

## 样式规范（Tailwind CSS）

**响应式断点**: `sm:640px` `md:768px` `lg:1024px` `xl:1280px`

```tsx
<div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-6">
```

**条件类名**: 使用 `clsx`

```tsx
import { clsx } from 'clsx'
<button className={clsx('px-4 py-2', isActive && 'bg-primary-500')}>
```

## 视觉风格规范 (Classic Professional Style)

遵循“回归经典、底层现代”的原则：

1.  **Header 规范**：使用纯白背景 (`bg-white`) + 细边框 (`border-b border-slate-200`)。仅在首页 Hero 区域允许透明切换。
2.  **Logo 规范**：使用正式的蓝色 Building 样式图标。
3.  **Footer 规范**：使用温和的深灰色（如 `bg-slate-900` 或 `bg-gray-800`），避免过于突兀的深黑色。
4.  **去渐变化**：减少不必要的色彩渐变，优先使用纯色块和细边框来界定区域，保持专业办公感。

## 图标规范

**禁止 Emoji！** 使用 Lucide React：

```tsx
import { Search, Send, User } from "lucide-react";
<Search className="w-5 h-5" />;
```

## 注释规范

所有文件（`.ts`, `.tsx`, `.pcss` 等）开头必须包含文件描述和所属 Skill 的声明。

使用中文 JSDoc 格式：

```tsx
/**
 * 登录页面组件
 *
 * 描述该文件的核心功能和职责。
 * 遵循 dev-frontend_patterns skill 规范。
 */
```

如果是测试文件：

```tsx
/**
 * 文档组件单元测试
 *
 * 遵循 dev-tdd_workflow skill 规范。
 */
```

## 国际化 (i18n)

- 所有 UI 文本通过 i18n 管理
- 使用 `react-i18next`
- 翻译文件: `locales/en/*.json`
- **Fallback 文本必须使用中文**

```tsx
const { t } = useTranslation('home')
<h1>{t('hero.title', '首页标题')}</h1>
```

## 状态管理 (Zustand)

```tsx
export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user, isAuthenticated: true }),
    }),
    { name: "auth-storage" },
  ),
);
```

## 验证清单

- [ ] Views 只组合 components + 调用 hooks
- [ ] 所有 TSX 文本已全部国际化（i18n），无硬编码文本
- [ ] 所有业务配置已提取至 `enums.ts` 或专门的枚举文件，无裸露的 `const` 业务常量
- [ ] 使用 Lucide 图标，无 Emoji
- [ ] 中文 JSDoc 注释
- [ ] 响应式设计

---

## 自动化工具

为了确保代码质量和注释规范，提供了以下辅助脚本：

### 1. 头部注释更新脚本

自动为 `frontend/src` 下的所有 `.ts` 和 `.tsx` 文件添加或更新符合规范的 Skill 声明注释。

**使用方法**:

```bash
python .skills/dev-frontend_patterns/scripts/update_headers.py
```

---

**详细示例**: 见 `references/` 目录
