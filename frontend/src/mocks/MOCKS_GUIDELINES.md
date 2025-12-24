# Mocks 规范

## 技术栈

- MSW (Mock Service Worker) 2.x
- Vite glob import

## 目录结构

```
mocks/
├── browser.js            # 浏览器端 MSW 配置
├── server.js             # 服务端 MSW 配置（SSR/测试）
├── config.js             # Mock 配置（延迟、错误模拟、数据加载）
├── handlers/             # API 处理器
│   ├── index.js          # 导出所有 handlers
│   ├── auth.js           # 认证 API
│   ├── members.js        # 会员 API
│   ├── projects.js       # 项目 API
│   ├── performance.js    # 绩效 API
│   ├── content.js        # 内容 API
│   ├── dashboard.js      # 仪表板 API
│   ├── support.js        # 支持 API
│   └── upload.js         # 上传 API
├── data/                 # Mock 数据
│   ├── auth/             # 认证数据
│   │   ├── ko.json       # 韩文
│   │   └── zh.json       # 中文
│   ├── members/
│   ├── projects/
│   ├── performance/
│   ├── content/
│   ├── support/
│   └── settings/
└── MOCKS_GUIDELINES.md
```

---

## Handler 编写规范

### 基础模板

```js
/**
 * MSW Handlers for [Module] API
 */

import { http, HttpResponse } from 'msw';
import { API_PREFIX, API_BASE_URL } from '@shared/utils/constants';
import { delay, shouldSimulateError, getErrorStatus, loadMockData } from '../config.js';

const FULL_BASE_URL = `${API_BASE_URL}${API_PREFIX}/[module]`;

// 获取列表
async function getList(req) {
  await delay();
  
  if (shouldSimulateError()) {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  const data = await loadMockData('[module]');
  const url = new URL(req.request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('page_size') || '10');
  
  const start = (page - 1) * pageSize;
  const items = data.items.slice(start, start + pageSize);
  
  return HttpResponse.json({
    items,
    total: data.items.length,
    page,
    page_size: pageSize
  });
}

// 获取详情
async function getById({ params }) {
  await delay();
  
  const data = await loadMockData('[module]');
  const item = data.items.find(i => i.id === parseInt(params.id));
  
  if (!item) {
    return HttpResponse.json(
      { message: 'Not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }
  
  return HttpResponse.json(item);
}

// 创建
async function create(req) {
  await delay();
  
  const body = await req.request.json();
  const newItem = {
    id: Date.now(),
    ...body,
    created_at: new Date().toISOString()
  };
  
  return HttpResponse.json(newItem, { status: 201 });
}

// 更新
async function update(req) {
  await delay();
  
  const { params } = req;
  const body = await req.request.json();
  
  return HttpResponse.json({
    id: parseInt(params.id),
    ...body,
    updated_at: new Date().toISOString()
  });
}

// 删除
async function remove({ params }) {
  await delay();
  return HttpResponse.json({ message: 'Deleted successfully' });
}

export const [module]Handlers = [
  http.get(`${FULL_BASE_URL}`, getList),
  http.get(`${FULL_BASE_URL}/:id`, getById),
  http.post(`${FULL_BASE_URL}`, create),
  http.put(`${FULL_BASE_URL}/:id`, update),
  http.delete(`${FULL_BASE_URL}/:id`, remove)
];
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Handler 文件 | kebab-case.js | `auth.js`, `members.js` |
| Handler 函数 | camelCase | `getList`, `getById`, `create` |
| 导出数组 | camelCase + Handlers | `authHandlers`, `membersHandlers` |

### URL 规范

使用完整 URL（MSW 最佳实践）：

```js
// ✅ 正确：使用完整 URL
const FULL_BASE_URL = `${API_BASE_URL}${API_PREFIX}/members`;
http.get(`${FULL_BASE_URL}/:id`, getById)

// ❌ 错误：使用相对路径
http.get('/api/v1/members/:id', getById)
```

---

## 数据文件规范

### 文件结构

每个模块目录下包含多语言 JSON 文件：

```
data/members/
├── ko.json    # 韩文数据
└── zh.json    # 中文数据
```

### 数据格式

```json
{
  "items": [
    {
      "id": 1,
      "name": "示例",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 字段命名

使用 snake_case（与后端 API 保持一致）：

```json
{
  "id": 1,
  "company_name": "示例公司",
  "business_number": "123-45-67890",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 数据类型规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 日期 | ISO 8601 | `"2024-01-01T00:00:00Z"` |
| 金额 | 整数（韩元） | `1000000` |
| ID | 递增整数 | `1`, `2`, `3` |
| 布尔 | true/false | `true` |
| 空值 | null | `null` |

### 状态枚举

```json
// 通用状态
"status": "active" | "inactive" | "pending" | "approved" | "rejected"

// 审核状态
"review_status": "draft" | "pending" | "approved" | "revision_required" | "rejected"
```

---

## 加载数据

使用 `loadMockData` 函数：

```js
import { loadMockData } from '../config.js';

// 自动根据当前语言加载对应数据
const data = await loadMockData('members');
// 如果当前语言是 ko，加载 data/members/ko.json
// 如果当前语言是 zh，加载 data/members/zh.json
```

---

## 分页处理

```js
async function getList(req) {
  const data = await loadMockData('members');
  const url = new URL(req.request.url);
  
  // 获取分页参数
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('page_size') || '10');
  
  // 获取筛选参数
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  
  // 筛选
  let items = data.items;
  if (status) {
    items = items.filter(i => i.status === status);
  }
  if (search) {
    items = items.filter(i => 
      i.name.includes(search) || i.company_name.includes(search)
    );
  }
  
  // 分页
  const total = items.length;
  const start = (page - 1) * pageSize;
  items = items.slice(start, start + pageSize);
  
  return HttpResponse.json({
    items,
    total,
    page,
    page_size: pageSize
  });
}
```

---

## 错误模拟

### 配置

```js
// config.js
export const ERROR_CONFIG = {
  ENABLE_ERRORS: false,      // 是否启用错误模拟
  ERROR_RATE: 0.1,           // 错误率 (0.0 - 1.0)
  ERROR_ENDPOINTS: [],       // 指定端点模拟错误
  ERROR_STATUSES: [500, 503, 504]
};
```

### 使用

```js
if (shouldSimulateError()) {
  return HttpResponse.json(
    { message: 'Internal server error', code: 'SERVER_ERROR' },
    { status: getErrorStatus() }
  );
}
```

---

## 延迟配置

```js
// config.js
export const MOCK_DELAY = {
  FAST: 50,        // 快速（开发）
  NORMAL: 100,     // 正常
  SLOW: 500,       // 慢
  VERY_SLOW: 2000  // 非常慢
};

// 使用
await delay();                    // 默认 FAST
await delay(MOCK_DELAY.SLOW);     // 慢响应
```

---

## 注册 Handler

在 `handlers/index.js` 中注册：

```js
import { authHandlers } from './auth.js';
import { membersHandlers } from './members.js';
// ...

export const handlers = [
  ...authHandlers,
  ...membersHandlers,
  // ...
];
```

---

## 注意事项

1. Mock 数据格式必须与后端 API 保持一致
2. 韩文和中文数据结构相同，仅内容不同
3. ID 保持唯一性，关联数据引用真实 ID
4. 使用 `delay()` 模拟网络延迟
5. 正确处理分页、筛选、排序参数
6. 返回正确的 HTTP 状态码
