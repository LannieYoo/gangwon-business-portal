# Services 开发规范

本文档定义了 `shared/services` 目录下 API 服务的开发标准和最佳实践。

## 目录结构

```
shared/services/
├── index.js              # 统一导出入口
├── api.service.js        # 基础 HTTP 客户端
├── auth.service.js       # 认证服务
├── member.service.js     # 会员服务
└── SERVICES_GUIDELINES.md
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | kebab-case，.service 后缀 | `auth.service.js`, `member.service.js` |
| 类名 | PascalCase，Service 后缀 | `AuthService`, `MemberService` |
| 方法名 | camelCase，动词开头 | `getProfile`, `updateProfile`, `login` |

## 服务模板

### 基础服务类

```js
/**
 * Member Service
 * 会员服务 - 封装会员相关的 API 调用
 */

import apiService from './api.service';
import { API_PREFIX } from '@shared/utils/constants';

class MemberService {
  /**
   * Get current member's profile
   * 
   * @returns {Promise<Object>} Member profile data
   */
  async getProfile() {
    const response = await apiService.get(`${API_PREFIX}/member/profile`);
    return this._mapResponse(response);
  }
  
  /**
   * Update profile
   * 
   * @param {Object} data - Profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(data) {
    const requestData = this._mapRequest(data);
    const response = await apiService.put(`${API_PREFIX}/member/profile`, requestData);
    return this._mapResponse(response);
  }
  
  // 私有方法：请求数据映射
  _mapRequest(data) {
    return {
      company_name: data.companyName,
      email: data.email
    };
  }
  
  // 私有方法：响应数据映射
  _mapResponse(response) {
    if (!response) return response;
    return {
      id: response.id,
      companyName: response.company_name,
      email: response.email
    };
  }
}

export default new MemberService();
```

### 带拦截器的服务

```js
/**
 * Authentication Service
 */

import apiService from './api.service';
import { API_PREFIX } from '@shared/utils/constants';
import { applyAuthInterceptor } from '@shared/interceptors/auth.interceptor';

class AuthService {
  async login(credentials) {
    const requestData = {
      business_number: credentials.businessNumber,
      password: credentials.password
    };
    return await apiService.post(`${API_PREFIX}/auth/login`, requestData);
  }
}

// 创建实例并应用拦截器
const authService = new AuthService();
const interceptedAuthService = applyAuthInterceptor(authService, {
  enableLogging: true
});

export default interceptedAuthService;
```

## 字段映射规范

### 请求映射（前端 → 后端）

前端使用 camelCase，后端使用 snake_case：

```js
// 前端字段 → 后端字段
const requestData = {
  business_number: data.businessNumber,
  company_name: data.companyName,
  employee_count: data.employeeCount,
  founding_date: data.foundingDate
};
```

### 响应映射（后端 → 前端）

```js
// 后端字段 → 前端字段
const mappedResponse = {
  id: response.id,
  businessNumber: response.business_number,
  companyName: response.company_name,
  employeeCount: response.employee_count,
  foundingDate: response.founding_date
};
```

## 方法命名约定

| 操作 | 前缀 | 示例 |
|------|------|------|
| 获取单个 | `get` | `getProfile()`, `getUser(id)` |
| 获取列表 | `get` + 复数 / `list` | `getMembers()`, `listProjects()` |
| 创建 | `create` | `createProject()` |
| 更新 | `update` | `updateProfile()` |
| 删除 | `delete` | `deleteProject(id)` |
| 验证 | `check` / `verify` | `checkEmail()`, `verifyCompany()` |
| 认证 | 动词 | `login()`, `logout()`, `register()` |

## 错误处理

### 服务层不捕获错误

让错误向上传播，由调用方（Hook 或组件）处理：

```js
// ✅ 正确 - 让错误传播
async getProfile() {
  const response = await apiService.get(`${API_PREFIX}/member/profile`);
  return this._mapResponse(response);
}

// ❌ 错误 - 服务层捕获错误
async getProfile() {
  try {
    const response = await apiService.get(`${API_PREFIX}/member/profile`);
    return this._mapResponse(response);
  } catch (error) {
    console.error(error); // 不要在这里处理
    return null;
  }
}
```

### 特殊情况：需要清理的操作

```js
async logout() {
  try {
    await apiService.post(`${API_PREFIX}/auth/logout`);
  } catch (error) {
    // 即使 API 失败也要清理本地状态
  } finally {
    this.clearAuth();
  }
}
```

## API 路径规范

使用常量定义 API 前缀：

```js
import { API_PREFIX } from '@shared/utils/constants';

// ✅ 正确
await apiService.get(`${API_PREFIX}/member/profile`);

// ❌ 错误 - 硬编码路径
await apiService.get('/api/v1/member/profile');
```

## 私有方法

使用下划线前缀标识私有方法：

```js
class MemberService {
  // 公开方法
  async getProfile() { ... }
  
  // 私有方法
  _mapRequest(data) { ... }
  _mapResponse(response) { ... }
  _validateData(data) { ... }
}
```

## 导出规范

### 在 index.js 中导出

```js
export { default as authService } from './auth.service';
export { default as memberService } from './member.service';
export { default as apiService, apiClient } from './api.service';
```

### 服务文件导出

```js
// 创建实例并导出
export default new MemberService();

// 如果需要应用拦截器
const authService = new AuthService();
export default applyAuthInterceptor(authService);
```

## 文件注释

每个服务文件顶部添加说明：

```js
/**
 * Member Service
 * 会员服务 - 封装会员相关的 API 调用
 */
```

方法注释使用 JSDoc：

```js
/**
 * Update current member's profile
 * 
 * @param {Object} data - Profile data to update
 * @param {string} [data.companyName] - Company name
 * @param {string} [data.email] - Email
 * @returns {Promise<Object>} Updated member profile
 */
async updateProfile(data) { ... }
```

## Checklist

新建 Service 时确认：

- [ ] 文件名使用 `.service.js` 后缀
- [ ] 类名使用 `Service` 后缀
- [ ] 文件顶部有注释说明
- [ ] 使用 `API_PREFIX` 常量
- [ ] 请求数据 camelCase → snake_case
- [ ] 响应数据 snake_case → camelCase
- [ ] 私有方法使用 `_` 前缀
- [ ] 方法有 JSDoc 注释
- [ ] 在 `index.js` 中导出
- [ ] 需要日志的服务应用拦截器
