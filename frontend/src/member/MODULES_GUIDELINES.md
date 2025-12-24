# Member 模块开发规范

## 目录结构

```
member/
├── layouts/                  # 布局组件
│   ├── MemberLayout.jsx      # 主布局（无侧边栏）
│   ├── Header.jsx            # 顶部导航
│   ├── Footer.jsx            # 页脚
│   ├── PageContainer.jsx     # 页面容器
│   ├── locales/              # 布局翻译
│   └── index.js              # 导出
│
└── modules/                  # 功能模块
    ├── auth/                 # 认证（登录、注册）
    ├── home/                 # 首页
    ├── projects/             # 项目申请
    ├── performance/          # 绩效申报
    ├── support/              # 支持中心
    └── about/                # 关于我们
```

## 模块结构

每个模块应包含：

```
modules/projects/
├── index.js              # 模块导出
├── Projects.jsx          # 主页面
├── ProjectList.jsx       # 列表页
├── ProjectDetail.jsx     # 详情页
├── ApplicationModal.jsx  # 申请弹窗
├── components/           # 模块私有组件（可选）
├── hooks/                # 模块私有 hooks（可选）
└── locales/              # 模块翻译
    ├── ko.json
    └── zh.json
```

---

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块目录 | kebab-case | `projects/`, `support/` |
| 页面组件 | PascalCase | `Projects.jsx`, `ProjectDetail.jsx` |
| 模态框 | PascalCase + Modal | `ApplicationModal.jsx` |
| 模块 hooks | use + 模块名 | `useProjectData.js` |

---

## 布局说明

Member 使用简洁布局（无侧边栏）：

```
┌─────────────────────────────────────────┐
│                 Header                   │
├─────────────────────────────────────────┤
│                                         │
│               Content                   │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│                 Footer                   │
└─────────────────────────────────────────┘
```

- Header: 固定顶部，高度 70px（移动端 60px）
- Content: 主内容区，全宽
- Footer: 页脚

---

## 页面模板

### 首页/落地页

```jsx
/**
 * Home Page
 * 会员端首页
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, Loading } from '@shared/components';
import { memberService } from '@shared/services';

export default function Home() {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getNews();
      setNews(response.items);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('member.home.title')}
          </h1>
          <p className="text-lg text-primary-100">
            {t('member.home.subtitle')}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-6">
            {t('member.home.latestNews')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Card key={item.id}>
                <div className="p-4">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{item.date}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

### 列表页

```jsx
/**
 * Project List Page
 * 项目列表
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, Loading, Pagination } from '@shared/components';
import { memberService } from '@shared/services';

export default function ProjectList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getProjects({ page });
      setProjects(response.items);
      setTotal(response.total);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {t('member.projects.title')}
      </h1>

      {/* 项目卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium">{project.name}</h3>
              <p className="text-gray-500 mt-2">{project.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {project.deadline}
                </span>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/member/projects/${project.id}`)}
                >
                  {t('common.viewDetail')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 分页 */}
      {total > 10 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={page}
            total={total}
            pageSize={10}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
```

### 详情页

```jsx
/**
 * Project Detail Page
 * 项目详情
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, Loading, Modal } from '@shared/components';
import { memberService } from '@shared/services';
import ApplicationModal from './ApplicationModal';

export default function ProjectDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getProject(id);
      setProject(response);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!project) return <div>{t('common.noData')}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-gray-700 mb-4"
      >
        ← {t('common.back')}
      </button>

      {/* 项目信息 */}
      <Card>
        <div className="p-6">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-gray-500 mt-4">{project.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">{t('member.projects.deadline')}</span>
              <p className="font-medium">{project.deadline}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">{t('member.projects.status')}</span>
              <p className="font-medium">{project.status}</p>
            </div>
          </div>

          <div className="mt-8">
            <Button onClick={() => setShowApplyModal(true)}>
              {t('member.projects.apply')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 申请弹窗 */}
      <ApplicationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        projectId={id}
      />
    </div>
  );
}
```

---

## 模块导出

```js
/**
 * Projects Module Export
 */

export { default as Projects } from './Projects';
export { default as ProjectList } from './ProjectList';
export { default as ProjectDetail } from './ProjectDetail';
```

---

## 路由配置

在 `router.jsx` 中配置：

```jsx
import { Projects, ProjectList, ProjectDetail } from '@member/modules/projects';

const memberRoutes = {
  path: '/member',
  element: <MemberLayout />,
  children: [
    { path: 'home', element: <Home /> },
    {
      path: 'projects',
      children: [
        { index: true, element: <ProjectList /> },
        { path: ':id', element: <ProjectDetail /> }
      ]
    },
    { path: 'performance', element: <Performance /> },
    { path: 'support', element: <Support /> },
    { path: 'about', element: <About /> }
  ]
};
```

---

## 翻译文件

`locales/ko.json`:

```json
{
  "title": "프로젝트",
  "apply": "신청하기",
  "deadline": "마감일",
  "status": "상태",
  "applicationSuccess": "신청이 완료되었습니다"
}
```

`locales/zh.json`:

```json
{
  "title": "项目",
  "apply": "申请",
  "deadline": "截止日期",
  "status": "状态",
  "applicationSuccess": "申请已提交"
}
```

---

## 与 Admin 的区别

| 特性 | Admin | Member |
|------|-------|--------|
| 布局 | 侧边栏 + 内容区 | 全宽内容区 |
| 导航 | 侧边栏菜单 | 顶部导航 |
| 功能 | 管理、审核、配置 | 查看、申请、提交 |
| 表格 | 大量使用 Table | 更多使用 Card |
| 样式 | 紧凑、功能性 | 宽松、展示性 |

---

## 新增模块

### 步骤

1. 创建模块目录

```bash
# 在 member/modules/ 下创建新模块目录
mkdir -p src/member/modules/new-module/locales
```

2. 创建基础文件

```
new-module/
├── index.js              # 模块导出
├── NewModule.jsx         # 主页面
├── NewModuleDetail.jsx   # 详情页（可选）
└── locales/
    ├── ko.json
    └── zh.json
```

3. 编写 index.js

```js
/**
 * NewModule Module Export
 */

export { default as NewModule } from './NewModule';
export { default as NewModuleDetail } from './NewModuleDetail';
```

4. 添加路由配置（`router.jsx`）

```jsx
import { NewModule, NewModuleDetail } from '@member/modules/new-module';

// 在 memberRoutes.children 中添加
{
  path: 'new-module',
  children: [
    { index: true, element: <NewModule /> },
    { path: ':id', element: <NewModuleDetail /> }
  ]
}
```

5. 添加顶部导航菜单（`layouts/Header.jsx`）

```jsx
// 在 menuItems 数组中添加
{
  path: '/member/new-module',
  label: t('member.nav.newModule')
}
```

6. 添加翻译

```json
// shared/i18n/locales/ko/member.json
{
  "nav": {
    "newModule": "새 모듈"
  },
  "newModule": {
    "title": "새 모듈"
  }
}
```

7. 添加 Mock Handler（如需要）

```js
// mocks/handlers/new-module.js
export const newModuleHandlers = [...];

// mocks/handlers/index.js
import { newModuleHandlers } from './new-module.js';
export const handlers = [...newModuleHandlers];
```

8. 添加 Service 方法（如需要）

```js
// shared/services/member.service.js
async getNewModules(params) {
  return await apiService.get(`${API_PREFIX}/member/new-modules`, { params });
}
```

### Checklist

- [ ] 创建模块目录和基础文件
- [ ] 编写 index.js 导出
- [ ] 配置路由
- [ ] 添加顶部导航菜单
- [ ] 添加翻译（ko.json, zh.json）
- [ ] 添加 Mock Handler
- [ ] 添加 Service 方法

---

## 删除模块

### 步骤

1. 删除模块目录

```bash
rm -rf src/member/modules/old-module
```

2. 移除路由配置（`router.jsx`）

```jsx
// 删除对应的路由配置
```

3. 移除顶部导航菜单（`layouts/Header.jsx`）

```jsx
// 删除 menuItems 中对应的项
```

4. 移除翻译

```json
// 删除 member.json 中对应的翻译键
```

5. 移除 Mock Handler

```js
// 删除 mocks/handlers/old-module.js
// 从 mocks/handlers/index.js 移除导入
```

6. 移除 Service 方法

```js
// 从 shared/services/member.service.js 移除相关方法
```

7. 清理 Mock 数据

```bash
rm -rf src/mocks/data/old-module
```

### Checklist

- [ ] 删除模块目录
- [ ] 移除路由配置
- [ ] 移除顶部导航菜单
- [ ] 移除翻译
- [ ] 移除 Mock Handler
- [ ] 移除 Service 方法
- [ ] 清理 Mock 数据
- [ ] 检查是否有其他模块引用

---

## 修改模块

### 添加新页面

1. 创建页面组件

```jsx
// modules/projects/ApplicationForm.jsx
export default function ApplicationForm() { ... }
```

2. 在 index.js 中导出

```js
export { default as ApplicationForm } from './ApplicationForm';
```

3. 添加路由

```jsx
{ path: ':id/apply', element: <ApplicationForm /> }
```

### 添加子组件

```
modules/projects/
├── components/           # 新增
│   ├── ProjectCard.jsx
│   └── ProjectFilter.jsx
```

子组件不需要在 index.js 中导出，仅在模块内部使用。

### 添加模块私有 Hook

```
modules/projects/
├── hooks/               # 新增
│   └── useProjectData.js
```

```js
// hooks/useProjectData.js
export function useProjectData(id) {
  const [data, setData] = useState(null);
  // ...
  return { data, loading, error };
}
```

### 重命名模块

1. 重命名目录

```bash
mv src/member/modules/old-name src/member/modules/new-name
```

2. 更新所有引用
   - router.jsx 中的路由路径和导入
   - Header.jsx 中的菜单项
   - 翻译文件中的键名
   - Service 方法名
   - Mock Handler 路径

### Checklist

- [ ] 更新 index.js 导出
- [ ] 更新路由配置
- [ ] 更新翻译文件
- [ ] 更新顶部导航菜单（如需要）
- [ ] 更新 Mock Handler（如需要）
- [ ] 更新 Service 方法（如需要）
- [ ] 检查所有引用是否更新

---

## 开发 Checklist

- [ ] 模块目录使用 kebab-case
- [ ] 页面组件使用 PascalCase
- [ ] 文件顶部有注释说明
- [ ] 使用共享组件和服务
- [ ] 使用 i18n 翻译
- [ ] 创建 locales 翻译文件
- [ ] 在 index.js 导出组件
- [ ] 在 router.jsx 配置路由
- [ ] 处理 loading 状态
- [ ] 响应式设计（移动端适配）
- [ ] 页面使用 max-w-7xl 容器
