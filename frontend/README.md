# 江原创业门户 - Frontend

## 项目简介

江原特别自治道创业企业绩效管理门户的前端应用，使用 React + Vite 构建。

## 技术栈

- **框架**: React 18.3
- **构建工具**: Vite 6.0
- **路由**: React Router 6.28
- **状态管理**: Zustand 5.0
- **数据获取**: TanStack Query (React Query) 5.62
- **HTTP 客户端**: Axios 1.7
- **国际化**: React-i18next 15.1
- **图表**: ECharts 5.5 + echarts-for-react 3.0
- **日期处理**: date-fns 4.1
- **工具库**: clsx 2.1
- **样式**: Tailwind CSS 3.4
- **表单**: React Hook Form 7.54
- **Mock**: MSW 2.6

## 目录结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── shared/         # 共享层
│   │   ├── components/ # 共享组件 (.jsx)
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Textarea.jsx
│   │   │   └── index.js
│   │   ├── hooks/      # 自定义 Hooks (.js)
│   │   │   ├── useAuth.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── usePagination.js
│   │   │   ├── useToggle.js
│   │   │   └── index.js
│   │   ├── services/   # API 服务 (.js)
│   │   │   ├── api.service.js
│   │   │   └── auth.service.js
│   │   ├── stores/     # Zustand 状态管理 (.js)
│   │   │   ├── authStore.js
│   │   │   ├── uiStore.js
│   │   │   └── index.js
│   │   ├── utils/      # 工具函数 (.js)
│   │   │   ├── constants.js
│   │   │   ├── format.js
│   │   │   ├── helpers.js
│   │   │   ├── storage.js
│   │   │   ├── validation.js
│   │   │   └── index.js
│   │   ├── i18n/       # 国际化配置
│   │   │   ├── index.js
│   │   │   └── locales/
│   │   │       ├── ko.json
│   │   │       └── zh.json
│   │   └── styles/     # 全局样式 (.css)
│   │       └── index.css
│   ├── member/         # 企业会员端模块
│   │   ├── layouts/    # 布局组件
│   │   │   ├── MemberLayout.jsx
│   │   │   ├── MemberLayout.css
│   │   │   ├── Header.jsx
│   │   │   ├── Header.css
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Sidebar.css
│   │   │   ├── Footer.jsx
│   │   │   ├── Footer.css
│   │   │   └── index.js
│   │   ├── modules/     # 功能模块
│   │   │   ├── auth/   # 认证模块
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── locales/
│   │   │   │   └── index.js
│   │   │   ├── home/   # 首页模块
│   │   │   ├── projects/ # 项目模块
│   │   │   ├── performance/ # 绩效模块
│   │   │   ├── profile/ # 个人资料模块
│   │   │   ├── support/ # 支持模块
│   │   │   └── about/  # 关于模块
│   │   └── routes.jsx  # 会员端路由
│   ├── admin/          # 管理员端模块
│   │   └── routes.jsx  # 管理员端路由
│   ├── App.jsx         # 根组件
│   ├── main.jsx        # 入口文件
│   └── router.jsx      # 主路由配置
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 文件扩展名规范

- **`.jsx`**: React 组件文件（包含 JSX 语法）
- **`.js`**: 非组件文件（工具函数、服务、配置等）
- **`.css`**: 样式文件

## 路径别名

项目配置了以下路径别名，方便导入：

- `@` → `src/`
- `@shared` → `src/shared/`
- `@member` → `src/member/`
- `@admin` → `src/admin/`
- `@mocks` → `src/mocks/` (预留)

使用示例：
```javascript
import { Button } from '@shared/components';
import { useAuth } from '@shared/hooks';
import Login from '@member/modules/auth/Login';
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 清理缓存

```bash
npm run clean
```

## 环境变量

创建 `.env.local` 文件配置环境变量：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000

# Mock 配置
VITE_USE_MOCK=true

# 功能开关
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
```

## 代码规范

### 组件命名

- 组件文件使用 PascalCase: `Button.jsx`, `UserProfile.jsx`
- 组件导出使用命名导出或默认导出
- 布局组件放在 `layouts/` 目录
- 功能模块放在 `modules/` 目录

### 模块结构

每个功能模块应包含：
```
module-name/
├── ComponentName.jsx    # 主组件
├── index.js            # 导出文件
└── locales/            # 国际化文件
    ├── ko.json
    └── zh.json
```

### 目录组织

- 按功能模块组织代码
- 共享代码放在 `shared/` 目录
- 业务代码按角色分离：`member/` 和 `admin/`
- 每个功能模块包含：
  - 组件文件（`.jsx`）
  - 国际化文件（`locales/` 目录，包含 `ko.json` 和 `zh.json`）
  - 导出文件（`index.js`）

### 样式规范

- 使用 Tailwind CSS 工具类
- 复用样式抽取为组件
- 自定义样式使用独立的 `.css` 文件（如 `MemberLayout.css`）
- Tailwind 配置了自定义颜色主题：
  - `primary`: 蓝色系
  - `secondary`: 绿色系
  - `gray`: 灰色系
- 支持自定义阴影和间距

## API 代理配置

开发环境下，API 请求会自动代理到后端服务器。

### 配置说明

```javascript
// vite.config.js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

### 环境变量

通过 `.env.local` 文件配置 `VITE_API_BASE_URL` 来指定后端服务器地址。

## Mock 数据

使用 MSW (Mock Service Worker) 提供 Mock 数据，便于前端独立开发。

通过 `VITE_USE_MOCK` 环境变量控制是否使用 Mock 数据。

> **注意**: Mock 数据目录 (`src/mocks/`) 目前尚未创建，可根据需要添加。

## 国际化

支持韩语（ko）和中文（zh）双语：

### 使用方式

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <div>{t('key')}</div>;
}
```

### 国际化文件组织

- 全局翻译：`src/shared/i18n/locales/`
- 模块翻译：各模块下的 `locales/` 目录
  - 例如：`src/member/modules/auth/locales/ko.json`

### 语言切换

语言切换功能由 `react-i18next` 自动检测浏览器语言，或通过 `i18next.changeLanguage()` 手动切换。

## 构建优化

Vite 配置了代码分割策略，将依赖包拆分为多个 chunk：

- `vendor-react`: React 相关
- `vendor-query`: React Query 和 Axios
- `vendor-state`: Zustand
- `vendor-i18n`: i18next 相关
- `vendor-charts`: ECharts 相关

这有助于提高加载性能和缓存效率。

## 部署

### 构建

```bash
npm run build
```

生成的文件在 `dist/` 目录。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 浏览器兼容性

支持现代浏览器：

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 功能模块

### 会员端 (Member)

- **认证**: 登录、注册
- **首页**: 仪表板、概览信息
- **项目管理**: 项目列表、详情、申请
- **绩效管理**: 绩效列表、详情、表单
- **个人资料**: 用户信息管理
- **支持**: 帮助和支持
- **关于**: 关于页面

### 管理员端 (Admin)

- 管理员功能（待开发）

## 状态管理

使用 Zustand 进行状态管理：

- `authStore`: 认证状态（用户信息、登录状态）
- `uiStore`: UI 状态（侧边栏、主题等）

## 路由保护

- `ProtectedRoute`: 保护需要认证的路由
- `PublicRoute`: 公共路由（已登录用户自动重定向）
- 基于角色的访问控制（RBAC）

## 许可证

[MIT License](LICENSE)

