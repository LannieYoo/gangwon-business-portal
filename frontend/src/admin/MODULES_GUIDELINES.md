# Admin 模块开发规范

## 目录结构

```
admin/
├── layouts/                  # 布局组件
│   ├── AdminLayout.jsx       # 主布局（侧边栏 + 内容区）
│   ├── Header.jsx            # 顶部导航
│   ├── Sidebar.jsx           # 侧边栏导航
│   ├── Footer.jsx            # 页脚
│   ├── locales/              # 布局翻译
│   └── index.js              # 导出
│
└── modules/                  # 功能模块
    ├── auth/                 # 认证（登录）
    ├── dashboard/            # 仪表板
    ├── members/              # 会员管理
    ├── projects/             # 项目管理
    ├── performance/          # 绩效管理
    ├── messages/             # 消息管理
    ├── content/              # 内容管理
    ├── reports/              # 报表
    └── audit-logs/           # 审计日志
```

## 模块结构

每个模块应包含：

```
modules/members/
├── index.js              # 模块导出
├── MemberList.jsx        # 列表页
├── MemberDetail.jsx      # 详情页
├── MemberForm.jsx        # 表单（可选）
├── components/           # 模块私有组件（可选）
│   └── MemberCard.jsx
├── hooks/                # 模块私有 hooks（可选）
│   └── useMemberData.js
└── locales/              # 模块翻译
    ├── ko.json
    └── zh.json
```

---

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块目录 | kebab-case | `audit-logs/`, `members/` |
| 页面组件 | PascalCase | `MemberList.jsx`, `MemberDetail.jsx` |
| 表单组件 | PascalCase + Form | `MemberForm.jsx`, `ProjectForm.jsx` |
| 模态框 | PascalCase + Modal | `CreateModal.jsx`, `EditModal.jsx` |
| 模块 hooks | use + 模块名 | `useMemberData.js` |

---

## 布局说明

Admin 使用带侧边栏的布局：

```
┌─────────────────────────────────────────┐
│                 Header                   │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │         Content              │
│          │                              │
│          │                              │
├──────────┴──────────────────────────────┤
│                 Footer                   │
└─────────────────────────────────────────┘
```

- Header: 固定顶部，高度 64px
- Sidebar: 左侧导航，宽度 256px（收起 64px）
- Content: 主内容区，padding 24px

---

## 页面模板

### 列表页

```jsx
/**
 * Member List Page
 * 会员列表管理
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Pagination, Button, Loading } from '@shared/components';
import { adminService } from '@shared/services';

export default function MemberList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [page, pageSize]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getMembers({ page, page_size: pageSize });
      setData(response.items);
      setTotal(response.total);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'companyName', label: t('admin.members.companyName') },
    { key: 'businessNumber', label: t('admin.members.businessNumber') },
    { key: 'status', label: t('common.status') },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, record) => (
        <button
          onClick={() => navigate(`/admin/members/${record.id}`)}
          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
        >
          {t('common.view')}
        </button>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('admin.members.title')}
        </h1>
      </div>

      {/* 搜索和操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <input
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => navigate('/admin/members/create')}>
          {t('common.add')}
        </Button>
      </div>

      {/* 表格 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={data} />
        
        {total > pageSize && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

### 详情页

```jsx
/**
 * Member Detail Page
 * 会员详情
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, Loading } from '@shared/components';
import { adminService } from '@shared/services';

export default function MemberDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getMember(id);
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!data) return <div>{t('common.noData')}</div>;

  return (
    <div>
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('admin.members.detail')}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </div>

      {/* 详情卡片 */}
      <Card>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('admin.members.companyName')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{data.companyName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('admin.members.businessNumber')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{data.businessNumber}</dd>
            </div>
          </dl>
        </div>
      </Card>
    </div>
  );
}
```

---

## 模块导出

```js
/**
 * Members Module Export
 */

export { default as MemberList } from './MemberList';
export { default as MemberDetail } from './MemberDetail';
export { default as MemberForm } from './MemberForm';
```

---

## 路由配置

在 `router.jsx` 中配置：

```jsx
import { MemberList, MemberDetail } from '@admin/modules/members';

const adminRoutes = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
    { path: 'dashboard', element: <Dashboard /> },
    {
      path: 'members',
      children: [
        { index: true, element: <MemberList /> },
        { path: ':id', element: <MemberDetail /> },
        { path: 'create', element: <MemberForm /> }
      ]
    }
  ]
};
```

---

## 翻译文件

`locales/ko.json`:

```json
{
  "title": "회원 관리",
  "detail": "회원 상세",
  "companyName": "회사명",
  "businessNumber": "사업자등록번호",
  "status": {
    "approved": "승인",
    "pending": "대기",
    "rejected": "거절"
  }
}
```

`locales/zh.json`:

```json
{
  "title": "会员管理",
  "detail": "会员详情",
  "companyName": "公司名称",
  "businessNumber": "营业执照号",
  "status": {
    "approved": "已批准",
    "pending": "待审批",
    "rejected": "已拒绝"
  }
}
```

---

## 新增模块

### 步骤

1. 创建模块目录

```bash
# 在 admin/modules/ 下创建新模块目录
mkdir -p src/admin/modules/new-module/locales
```

2. 创建基础文件

```
new-module/
├── index.js           # 模块导出
├── NewModuleList.jsx  # 列表页
├── NewModuleDetail.jsx # 详情页（可选）
└── locales/
    ├── ko.json
    └── zh.json
```

3. 编写 index.js

```js
/**
 * NewModule Module Export
 */

export { default as NewModuleList } from './NewModuleList';
export { default as NewModuleDetail } from './NewModuleDetail';
```

4. 添加路由配置（`router.jsx`）

```jsx
import { NewModuleList, NewModuleDetail } from '@admin/modules/new-module';

// 在 adminRoutes.children 中添加
{
  path: 'new-module',
  children: [
    { index: true, element: <NewModuleList /> },
    { path: ':id', element: <NewModuleDetail /> }
  ]
}
```

5. 添加侧边栏菜单（`layouts/Sidebar.jsx`）

```jsx
// 在 menuItems 数组中添加
{
  path: '/admin/new-module',
  label: t('admin.sidebar.newModule'),
  icon: <IconComponent />
}
```

6. 添加翻译

```json
// shared/i18n/locales/ko/admin.json
{
  "sidebar": {
    "newModule": "새 모듈"
  },
  "newModule": {
    "title": "새 모듈 관리"
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
// shared/services/admin.service.js
async getNewModules(params) {
  return await apiService.get(`${API_PREFIX}/admin/new-modules`, { params });
}
```

### Checklist

- [ ] 创建模块目录和基础文件
- [ ] 编写 index.js 导出
- [ ] 配置路由
- [ ] 添加侧边栏菜单
- [ ] 添加翻译（ko.json, zh.json）
- [ ] 添加 Mock Handler
- [ ] 添加 Service 方法

---

## 删除模块

### 步骤

1. 删除模块目录

```bash
rm -rf src/admin/modules/old-module
```

2. 移除路由配置（`router.jsx`）

```jsx
// 删除对应的路由配置
// {
//   path: 'old-module',
//   children: [...]
// }
```

3. 移除侧边栏菜单（`layouts/Sidebar.jsx`）

```jsx
// 删除 menuItems 中对应的项
```

4. 移除翻译

```json
// 删除 admin.json 中对应的翻译键
```

5. 移除 Mock Handler

```js
// 删除 mocks/handlers/old-module.js
// 从 mocks/handlers/index.js 移除导入
```

6. 移除 Service 方法

```js
// 从 shared/services/admin.service.js 移除相关方法
```

7. 清理 Mock 数据

```bash
rm -rf src/mocks/data/old-module
```

### Checklist

- [ ] 删除模块目录
- [ ] 移除路由配置
- [ ] 移除侧边栏菜单
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
// modules/members/MemberForm.jsx
export default function MemberForm() { ... }
```

2. 在 index.js 中导出

```js
export { default as MemberForm } from './MemberForm';
```

3. 添加路由

```jsx
{ path: 'create', element: <MemberForm /> }
{ path: ':id/edit', element: <MemberForm /> }
```

### 添加子组件

```
modules/members/
├── components/           # 新增
│   ├── MemberCard.jsx
│   └── MemberFilter.jsx
```

子组件不需要在 index.js 中导出，仅在模块内部使用。

### 添加模块私有 Hook

```
modules/members/
├── hooks/               # 新增
│   └── useMemberData.js
```

```js
// hooks/useMemberData.js
export function useMemberData(id) {
  const [data, setData] = useState(null);
  // ...
  return { data, loading, error };
}
```

### 重命名模块

1. 重命名目录

```bash
mv src/admin/modules/old-name src/admin/modules/new-name
```

2. 更新所有引用
   - router.jsx 中的路由路径和导入
   - Sidebar.jsx 中的菜单项
   - 翻译文件中的键名
   - Service 方法名
   - Mock Handler 路径

### Checklist

- [ ] 更新 index.js 导出
- [ ] 更新路由配置
- [ ] 更新翻译文件
- [ ] 更新侧边栏菜单（如需要）
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
- [ ] 列表页支持分页和搜索
