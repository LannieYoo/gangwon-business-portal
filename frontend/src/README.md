# Frontend Source Code

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 构建 | Vite |
| 路由 | React Router v6 |
| 状态管理 | Zustand |
| HTTP | Axios |
| 样式 | Tailwind CSS |
| 国际化 | i18next |
| Mock | MSW (开发环境) |

## 目录结构

```
src/
├── admin/              # 管理员端
│   ├── layouts/        # 布局组件
│   └── modules/        # 功能模块 (dashboard, members, projects, performance, messages, content, reports, audit-logs)
│
├── member/             # 会员端
│   ├── layouts/        # 布局组件
│   └── modules/        # 功能模块 (auth, home, projects, performance, support, about)
│
├── shared/             # 共享资源
│   ├── components/     # 通用组件
│   ├── hooks/          # 自定义 Hooks
│   ├── services/       # API 服务
│   ├── stores/         # Zustand Stores
│   ├── utils/          # 工具函数
│   ├── interceptors/   # AOP 拦截器
│   ├── i18n/           # 国际化
│   ├── config/         # 配置文件
│   └── styles/         # 全局样式
│
├── mocks/              # Mock 数据
├── App.jsx             # 根组件
├── main.jsx            # 入口文件
└── router.jsx          # 路由配置
```

## 规范文档索引

| 目录 | 文档 | 说明 |
|------|------|------|
| `shared/components/` | [COMPONENT_GUIDELINES.md](./shared/components/COMPONENT_GUIDELINES.md) | 组件开发规范 |
| `shared/hooks/` | [HOOKS_GUIDELINES.md](./shared/hooks/HOOKS_GUIDELINES.md) | Hook 开发规范 |
| `shared/services/` | [SERVICES_GUIDELINES.md](./shared/services/SERVICES_GUIDELINES.md) | API 服务规范 |
| `shared/stores/` | [STORES_GUIDELINES.md](./shared/stores/STORES_GUIDELINES.md) | Zustand Store 规范 |
| `shared/utils/` | [UTILS_GUIDELINES.md](./shared/utils/UTILS_GUIDELINES.md) | 工具函数规范 |
| `shared/interceptors/` | [INTERCEPTORS_GUIDELINES.md](./shared/interceptors/INTERCEPTORS_GUIDELINES.md) | 拦截器规范 |
| `shared/i18n/` | [I18N_GUIDELINES.md](./shared/i18n/I18N_GUIDELINES.md) | 国际化规范 |
| `shared/config/` | [CONFIG_GUIDELINES.md](./shared/config/CONFIG_GUIDELINES.md) | 配置文件规范 |
| `shared/styles/` | [STYLES_GUIDELINES.md](./shared/styles/STYLES_GUIDELINES.md) | 样式规范 |
| `mocks/` | [MOCKS_GUIDELINES.md](./mocks/MOCKS_GUIDELINES.md) | Mock 数据规范 |
| `admin/` | [MODULES_GUIDELINES.md](./admin/MODULES_GUIDELINES.md) | 管理员端模块规范 |
| `member/` | [MODULES_GUIDELINES.md](./member/MODULES_GUIDELINES.md) | 会员端模块规范 |

---

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.jsx | `Button.jsx`, `MemberList.jsx` |
| Hook 文件 | camelCase.js | `useAuth.js`, `useDebounce.js` |
| Service 文件 | kebab-case.service.js | `auth.service.js` |
| Store 文件 | camelCase + Store.js | `authStore.js` |
| 工具文件 | camelCase.js | `format.js`, `helpers.js` |
| 拦截器文件 | kebab-case.interceptor.js | `api.interceptor.js` |
| 配置文件 | kebab-case.config.js | `logger.config.js` |
| 常量 | UPPER_SNAKE_CASE | `API_PREFIX`, `USER_ROLES` |
| 翻译键 | camelCase | `common.save`, `auth.loginFailed` |
| 模块目录 | kebab-case | `audit-logs/`, `members/` |
| 布局组件 | PascalCase + Layout | `AdminLayout.jsx` |

## 导入路径别名

```js
// 共享资源
import { Button } from '@shared/components';
import { useAuth } from '@shared/hooks';
import { authService } from '@shared/services';
import { useAuthStore } from '@shared/stores';
import { formatDate } from '@shared/utils';

// 管理员模块
import { MemberList } from '@admin/modules/members';
import AdminLayout from '@admin/layouts';

// 会员模块
import { Home } from '@member/modules/home';
import MemberLayout from '@member/layouts';
```

---

## 核心原则

### 组件命名

组件必须使用具名函数，拦截器依赖函数名记录日志：

```jsx
// ✅ 正确
export function Button() { ... }
export const Input = forwardRef(function Input(props, ref) { ... });

// ❌ 错误 - 匿名函数无法被拦截器识别
export const Button = (props) => { ... };
```

### 字段映射

前端 camelCase ↔ 后端 snake_case：

```js
// 请求：前端 → 后端
const requestData = { business_number: data.businessNumber };

// 响应：后端 → 前端
const mappedResponse = { businessNumber: response.business_number };
```

### 错误处理

Service 层不捕获错误，让调用方处理。组件只关注业务逻辑，不做日志记录：

```jsx
// ✅ 正确：只关注业务逻辑
const handleSubmit = async () => {
  setSubmitting(true);
  await adminService.createProject(payload);
  setSubmitting(false);
  navigate('/admin/projects');
};

// ❌ 错误：包含日志和错误处理
const handleSubmit = async () => {
  try {
    await adminService.createProject(payload);
  } catch (error) {
    console.error('Failed:', error);
    alert('保存失败');
  }
};
```

### 敏感数据

日志和拦截器必须过滤敏感信息：

```js
const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
```

---

## 组件使用规范

### 消息提示

使用 `Alert` 组件，不要用 `window.alert()`：

```jsx
const [message, setMessage] = useState(null);

// 显示消息
setMessage('保存成功');
setTimeout(() => setMessage(null), 3000);

// JSX
{message && <Alert variant="success">{message}</Alert>}
```

Alert variant: `success` | `error` | `warning` | `info`

### 确认对话框

使用 `Modal` 组件，不要用 `window.confirm()`：

```jsx
const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

<Modal
  isOpen={deleteConfirm.open}
  onClose={() => setDeleteConfirm({ open: false, id: null })}
  title="确定要删除吗？"
  size="sm"
>
  <div className="py-4">
    <p className="text-gray-600">此操作不可撤销</p>
  </div>
  <ModalFooter>
    <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: null })}>取消</Button>
    <Button onClick={confirmDelete}>删除</Button>
  </ModalFooter>
</Modal>
```

### 按钮样式

使用 `variant` 属性，不要用 `type="primary"`：

```jsx
<Button>保存</Button>                              // 默认 primary
<Button variant="outline">取消</Button>            // 轮廓按钮
<Button variant="secondary">导出</Button>          // 次要按钮
```

表格操作使用文本按钮：

```jsx
<button className="text-primary-600 hover:text-primary-900 font-medium text-sm">编辑</button>
<span className="text-gray-300">|</span>
<button className="text-red-600 hover:text-red-900 font-medium text-sm">删除</button>
```

### 分页组件

```jsx
<Pagination
  current={currentPage}
  total={total}
  pageSize={pageSize}
  onChange={setCurrentPage}
  showSizeChanger
  showQuickJumper
/>
```

---

## 页面开发

### 模块结构

```
modules/members/
├── index.js              # 模块导出
├── MemberList.jsx        # 列表页
├── MemberDetail.jsx      # 详情页
├── MemberForm.jsx        # 表单组件
├── components/           # 模块私有组件（可选）
├── hooks/                # 模块私有 hooks（可选）
└── locales/              # 模块翻译 (ko.json, zh.json)
```

### 页面模板

```jsx
/**
 * Member List Page
 * 会员列表页面
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Pagination, Loading } from '@shared/components';
import { memberService } from '@shared/services';

export default function MemberList() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  useEffect(() => { loadData(); }, [page]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getList({ page });
      setData(response.items);
      setTotal(response.total);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <Loading />;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('members.title')}</h1>
      <Table columns={columns} data={data} />
      <Pagination current={page} total={total} pageSize={10} onChange={setPage} />
    </div>
  );
}
```

### 路由配置

```jsx
import { MemberList, MemberDetail } from '@admin/modules/members';

const adminRoutes = [
  {
    path: 'members',
    children: [
      { index: true, element: <MemberList /> },
      { path: ':id', element: <MemberDetail /> }
    ]
  }
];
```

### 开发 Checklist

- [ ] 文件名使用 PascalCase，顶部有注释说明
- [ ] 使用共享组件和服务，不重复造轮子
- [ ] 使用 i18n 翻译，创建 locales 文件
- [ ] 在模块 index.js 导出，router.jsx 配置路由
- [ ] 处理 loading 状态

---

## 注意事项

1. 不要在生产代码中使用 `console.log`
2. 不要使用 `window.confirm()` 或 `window.alert()`
3. 错误处理统一在服务层
4. 组件保持简洁，只关注 UI 和业务逻辑
5. 遵循现有代码风格和目录结构
