# 异常处理系统规范

## 1. 系统架构

### 1.1 异常处理流程

```
前端异常 → ExceptionHandler → ExceptionService → HTTP POST /api/exceptions → 后端
后端异常 → ExceptionMiddleware → ExceptionService → 日志系统 + 数据库
```

### 1.2 与日志系统集成

```
异常发生 → 异常分类 → 上下文收集 → 日志记录（ERROR/CRITICAL）→ 异常上报
```

## 2. 异常类型定义

### 2.1 前端异常类型

| 类型 | 说明 | 严重程度 |
|------|------|----------|
| `JAVASCRIPT_ERROR` | JavaScript 运行时异常 | LOW |
| `TYPE_ERROR` | 类型错误 | LOW |
| `REFERENCE_ERROR` | 引用错误 | LOW |
| `SYNTAX_ERROR` | 语法错误 | MEDIUM |
| `RANGE_ERROR` | 范围错误 | LOW |
| `UNHANDLED_PROMISE_REJECTION` | 未处理的 Promise 拒绝 | CRITICAL |
| `REACT_ERROR_BOUNDARY` | React 错误边界捕获 | CRITICAL |
| `REACT_RENDER_ERROR` | React 渲染错误 | HIGH |
| `NETWORK_ERROR` | 网络请求错误 | HIGH |
| `HTTP_ERROR` | HTTP 响应错误 | HIGH |
| `TIMEOUT_ERROR` | 请求超时 | MEDIUM |
| `CORS_ERROR` | 跨域错误 | HIGH |
| `RESOURCE_LOAD_ERROR` | 资源加载失败 | MEDIUM |
| `SCRIPT_LOAD_ERROR` | 脚本加载失败 | HIGH |
| `IMAGE_LOAD_ERROR` | 图片加载失败 | LOW |
| `MEMORY_ERROR` | 内存错误 | CRITICAL |
| `UNKNOWN_ERROR` | 未知错误 | MEDIUM |

### 2.2 后端异常类型

| 异常类 | HTTP 状态码 | 类型标识 | 说明 |
|--------|-------------|----------|------|
| `ValidationError` | 400 | `VALIDATION_ERROR` | 数据验证失败 |
| `AuthenticationError` | 401 | `AUTHENTICATION_ERROR` | 认证失败 |
| `AuthorizationError` | 403 | `AUTHORIZATION_ERROR` | 权限不足 |
| `NotFoundError` | 404 | `NOT_FOUND_ERROR` | 资源不存在 |
| `ConflictError` | 409 | `CONFLICT_ERROR` | 资源冲突 |
| `RateLimitError` | 429 | `RATE_LIMIT_ERROR` | 请求频率限制 |
| `DatabaseError` | 500 | `DATABASE_ERROR` | 数据库错误 |
| `ExternalServiceError` | 502 | `EXTERNAL_SERVICE_ERROR` | 外部服务错误 |
| `InternalError` | 500 | `INTERNAL_ERROR` | 内部错误 |

### 2.3 严重程度定义

| 级别 | 说明 | 日志级别 | 是否告警 |
|------|------|----------|----------|
| `LOW` | 低影响，不影响核心功能 | WARNING | 否 |
| `MEDIUM` | 中等影响，部分功能受限 | ERROR | 否 |
| `HIGH` | 高影响，主要功能受损 | ERROR | 是 |
| `CRITICAL` | 严重影响，系统不可用 | CRITICAL | 是 |

## 3. 异常记录格式

### 3.1 通用字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | string | 异常唯一标识 | `fe_1703318033407_abc123` |
| `timestamp` | string | 发生时间 | `2025-12-23 12:33:53.407` |
| `source` | string | 来源 | `frontend` \| `backend` |
| `type` | string | 异常类型 | `NETWORK_ERROR` |
| `severity` | string | 严重程度 | `HIGH` |
| `category` | string | 异常类别 | `NETWORK` |
| `recoverable` | boolean | 是否可恢复 | `true` |
| `user_impact` | string | 用户影响 | `HIGH` |

### 3.2 错误信息字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `error.name` | string | 错误名称 | `TypeError` |
| `error.message` | string | 错误消息 | `Cannot read property 'x' of undefined` |
| `error.stack` | string | 堆栈信息 | `TypeError: Cannot read...` |

### 3.3 上下文字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `context.url` | string | 发生页面 URL |
| `context.user_agent` | string | 浏览器信息 |
| `context.viewport` | object | 视口尺寸 |
| `context.memory` | object | 内存使用情况 |
| `context.connection` | object | 网络连接信息 |

### 3.4 追踪字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `trace_id` | string | 会话追踪 ID |
| `request_id` | string | 请求追踪 ID |
| `user_id` | string | 用户 ID |

## 4. 目录结构

```
frontend/
├── src/
│   ├── main.jsx              # 全局异常处理器挂载点
│   │
│   └── shared/
│       ├── exception/
│       │   ├── index.js              # 统一导出入口
│       │   ├── handler.js            # 异常处理核心
│       │   ├── service.js            # 异常上报服务
│       │   └── global.js             # 全局异常处理器
│       │
│       ├── interceptors/
│       │   ├── api.error.classifier.js # API 错误分类器
│       │   └── api.error.recovery.js   # API 错误恢复策略
│       │
│       ├── hooks/
│       │   ├── useComponentException.js  # 组件异常处理 Hook
│       │   ├── useHookException.js       # Hook 异常处理
│       │   ├── useStoreException.js      # Store 异常处理
│       │   ├── useAuthException.js       # 认证异常处理
│       │   └── usePerformanceException.js # 性能异常处理
│       │
│       └── components/
│           └── ErrorBoundary.jsx     # React 错误边界组件

backend/src/
├── main.py                   # 异常处理器注册点
│
└── common/modules/
    ├── exception/
    │   ├── __init__.py       # 模块导出
    │   ├── exceptions.py     # 自定义异常类
    │   ├── handlers.py       # FastAPI 异常处理器
    │   ├── classifier.py     # 异常分类器
    │   ├── recorder.py       # 异常记录器
    │   ├── monitor.py        # 异常监控
    │   ├── service.py        # 异常服务
    │   ├── schemas.py        # Pydantic 模型
    │   ├── router.py         # API 路由
    │   └── responses.py      # 响应格式
    │
    └── interceptor/
        └── middleware.py     # HTTP 中间件（ExceptionMiddleware）
```

### 4.1 前端挂载点 (main.jsx)

```javascript
import { globalExceptionHandler } from '@shared/exception';

// 安装全局异常处理器
globalExceptionHandler.install();

// 渲染应用
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

### 4.2 后端挂载点 (main.py)

```python
from src.common.modules.exception import register_exception_handlers

app = FastAPI()
register_exception_handlers(app)
```

## 5. 前端异常处理

### 5.1 异常处理流程

```javascript
// 1. 捕获异常
window.onerror = (message, source, lineno, colno, error) => {
  exceptionService.reportException(error, { source, lineno, colno });
};

// 2. Promise 拒绝
window.onunhandledrejection = (event) => {
  exceptionService.reportException(event.reason, { promise: event.promise });
};

// 3. React 错误边界
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    exceptionService.reportException(error, { componentStack: errorInfo.componentStack });
  }
}
```

### 5.2 异常上报配置

```javascript
const DEFAULT_CONFIG = {
  // 实时上报（每条异常立即发送）
  // 异常是低频事件，实时上报确保及时发现问题
  
  // 重试配置
  maxRetries: 3,              // 最大重试次数
  retryDelays: [1000, 2000, 4000], // 重试延迟（指数退避）
  requestTimeout: 5000,       // 请求超时（毫秒）
  
  // 去重配置
  deduplicationWindow: 10000, // 去重时间窗口（毫秒）
  
  // 上报端点
  endpoint: '/api/v1/exceptions/frontend',
  
  // 过滤配置
  enableFiltering: true,
  maxStackLength: 5000,       // 最大堆栈长度
  
  // 会话限制
  maxErrorsPerSession: 100    // 每个会话最大异常数（防止异常风暴）
};
```

> 注意：异常采用实时上报模式，每条异常立即发送到后端。失败时进入重试队列。

### 5.3 使用示例

```javascript
import { exceptionService } from '@shared/exception';

// 手动上报异常
try {
  riskyOperation();
} catch (error) {
  await exceptionService.reportException(error, {
    operation: 'riskyOperation',
    params: { id: 123 }
  });
}

// 获取统计信息
const stats = exceptionService.getStats();
console.log(stats.performance.totalProcessed);
```

## 6. 后端异常处理

### 6.1 抛出异常

```python
from src.common.modules.exception import (
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
)

# 验证错误（带字段错误）
raise ValidationError(
    "Invalid email format",
    field_errors={"email": "Invalid format"}
)

# 资源不存在
raise NotFoundError("Member")

# 认证失败
raise AuthenticationError("Invalid credentials")

# 权限不足
raise AuthorizationError("Admin access required")
```

### 6.2 注册异常处理器

```python
# main.py
from src.common.modules.exception import register_exception_handlers

app = FastAPI()
register_exception_handlers(app)
```

### 6.3 自定义异常

```python
from src.common.modules.exception import BaseCustomException, ExceptionType

class CustomError(BaseCustomException):
    """自定义异常"""
    
    @property
    def http_status_code(self) -> int:
        return 422
    
    @property
    def exception_type(self) -> ExceptionType:
        return ExceptionType.VALIDATION_ERROR
```

## 7. API 响应格式

### 7.1 错误响应

```json
{
  "error": {
    "type": "ValidationError",
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "field_errors": {
      "email": "Invalid format",
      "password": "Too short"
    }
  },
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-044"
}
```

### 7.2 HTTP 状态码映射

| 状态码 | 异常类型 | 说明 |
|--------|----------|------|
| 400 | `ValidationError` | 请求参数错误 |
| 401 | `AuthenticationError` | 未认证 |
| 403 | `AuthorizationError` | 无权限 |
| 404 | `NotFoundError` | 资源不存在 |
| 409 | `ConflictError` | 资源冲突 |
| 429 | `RateLimitError` | 请求过于频繁 |
| 500 | `InternalError` / `DatabaseError` | 服务器内部错误 |
| 502 | `ExternalServiceError` | 外部服务错误 |

## 8. 异常日志集成

### 8.1 日志级别映射

| 严重程度 | 日志级别 | 写入文件 |
|----------|----------|----------|
| `LOW` | WARNING | app.log |
| `MEDIUM` | ERROR | app.log, error.log |
| `HIGH` | ERROR | app.log, error.log |
| `CRITICAL` | CRITICAL | app.log, error.log |

### 8.2 异常日志格式

```json
{
  "timestamp": "2025-12-23 12:33:54.100",
  "source": "backend",
  "level": "ERROR",
  "message": "ValidationError: Invalid email format",
  "layer": "Router",
  "module": "backend/src/modules/user/router.py",
  "function": "register",
  "line_number": 45,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-044",
  "extra_data": {
    "error_type": "ValidationError",
    "error_message": "Invalid email format",
    "field_errors": {"email": "Invalid format"},
    "request_method": "POST",
    "request_path": "/api/v1/users/register"
  }
}
```

## 9. 异常监控

### 9.1 监控指标

| 指标 | 说明 |
|------|------|
| `total_exceptions` | 异常总数 |
| `exceptions_by_type` | 按类型统计 |
| `exceptions_by_severity` | 按严重程度统计 |
| `exception_rate` | 异常发生率 |
| `recovery_rate` | 恢复成功率 |

### 9.2 告警规则

| 条件 | 告警级别 |
|------|----------|
| CRITICAL 异常 | 立即告警 |
| 1分钟内 > 10 个 HIGH 异常 | 高优先级告警 |
| 5分钟内 > 50 个异常 | 中优先级告警 |
| 异常率 > 5% | 低优先级告警 |

## 10. 最佳实践

### 10.1 异常抛出原则

- 使用具体的异常类型，避免使用通用 `Exception`
- 提供有意义的错误消息
- 包含足够的上下文信息用于调试
- 敏感信息（密码、token）不要包含在错误消息中

### 10.2 异常处理原则

- 在合适的层级捕获和处理异常
- 不要吞掉异常，至少记录日志
- 区分可恢复和不可恢复的异常
- 为用户提供友好的错误提示

### 10.3 前端异常处理

```javascript
// ✅ 正确：捕获并上报
try {
  await apiCall();
} catch (error) {
  exceptionService.reportException(error, { api: 'apiCall' });
  showUserFriendlyError('操作失败，请稍后重试');
}

// ❌ 错误：吞掉异常
try {
  await apiCall();
} catch (error) {
  // 什么都不做
}
```

### 10.4 后端异常处理

```python
# ✅ 正确：使用具体异常类型
if not user:
    raise NotFoundError("User")

# ❌ 错误：使用通用异常
if not user:
    raise Exception("User not found")

# ✅ 正确：包含上下文
raise ValidationError(
    "Invalid email format",
    field_errors={"email": "Must be a valid email address"}
)

# ❌ 错误：缺少上下文
raise ValidationError("Invalid input")
```

## 11. 数据库表结构

### 11.1 异常记录表 (exception_logs)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `exception_id` | VARCHAR | 异常唯一标识 |
| `timestamp` | TIMESTAMP | 发生时间 |
| `source` | VARCHAR | 来源 (frontend/backend) |
| `type` | VARCHAR | 异常类型 |
| `severity` | VARCHAR | 严重程度 |
| `category` | VARCHAR | 异常类别 |
| `error_name` | VARCHAR | 错误名称 |
| `error_message` | TEXT | 错误消息 |
| `error_stack` | TEXT | 堆栈信息 |
| `context` | JSONB | 上下文信息 |
| `trace_id` | VARCHAR | 追踪 ID |
| `request_id` | VARCHAR | 请求 ID |
| `user_id` | UUID | 用户 ID |
| `created_at` | TIMESTAMP | 创建时间 |
