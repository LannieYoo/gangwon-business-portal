# 日志系统规范

## 1. 链路追踪

完整请求链路（同一 `trace_id`）：

```
前端 Hook → Component → Store → Service → Auth
                                    ↓
后端 Router → Auth/Service → Database
```

## 2. 日志处理流程

```
前端（原始数据） → HTTP POST /api/logs → 后端（格式化 + 写入）
后端（原始数据） → LoggingService → 格式化 + 写入
```

- 前端：只采集原始数据，通过 API 传输到后端
- 后端：统一负责日志格式化、message 生成、文件写入、数据库写入

## 3. 字段规范

### 3.1 通用字段（所有日志必有）

| 字段 | 类型 | 格式/取值 | 示例 |
|------|------|----------|------|
| `timestamp` | string | `yyyy-MM-dd HH:mm:ss.SSS` | `2025-12-23 12:33:53.407` |
| `source` | string | `frontend` \| `backend` | `backend` |
| `level` | string | `DEBUG` \| `INFO` \| `WARNING` \| `ERROR` \| `CRITICAL` | `INFO` |
| `message` | string | 后端生成，见 3.5 | `HTTP: GET /api/auth/me -> 200` |
| `layer` | string | 见第4节 Layer 定义 | `Router` |
| `module` | string | 相对项目根目录的文件路径 | `backend/src/auth/service.py` |
| `function` | string | 函数/方法名（不含类名） | `login` |
| `line_number` | number | 正整数，未知时为 `0` | `155` |

### 3.2 追踪字段（按需输出，不存在则不输出）

| 字段 | 类型 | 格式/取值 | 示例 |
|------|------|----------|------|
| `trace_id` | string | UUID v4（会话级，前端生成） | `fa8e02fc-dca6-40f9-aea5-248bc304f990` |
| `request_id` | string | `{trace_id}-{3位序号}` | `fa8e02fc-dca6-40f9-aea5-248bc304f990-044` |
| `user_id` | string | UUID v4（认证后获取） | `4bb4747c-d7f9-4456-a4c7-19615739cf6d` |
| `duration_ms` | number | 非负整数（毫秒） | `263` |

### 3.3 扩展字段（Layer 独有业务数据）

| 字段 | 类型 | 说明 |
|------|------|------|
| `extra_data` | object | 各 Layer 独有的业务字段（见第5节） |

### 3.4 前端传输格式

前端传输原始数据，包含 `timestamp`。后端只做统一格式化输出。

```json
{
  "timestamp": "2025-12-23 12:33:53.407",
  "source": "frontend",
  "level": "DEBUG",
  "message": "Hook: useCallback in App",
  "layer": "Hook",
  "module": "frontend/src/App.jsx",
  "function": "interceptedHook",
  "line_number": 140,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "duration_ms": 0,
  "extra_data": {
    "hook_name": "useCallback",
    "component_name": "App",
    "call_id": 1
  }
}
```

> 注意：`timestamp` 由前端生成，后端只做统一格式化输出。

### 3.5 message 格式规范

| Layer | 格式 | 示例 |
|-------|------|------|
| Hook（Effect） | `Effect: {component}` | `Effect: LoginForm` |
| Hook（Cleanup） | `Effect Cleanup: {component}` | `Effect Cleanup: LoginForm` |
| Hook（状态变化） | `State: {component}.{index}` | `State: LoginForm.0` |
| Hook（慢） | `Slow Hook: {hook} in {component}` | `Slow Hook: useMemo in DataTable` |
| Hook（错误） | `Hook Error: {hook} in {component}` | `Hook Error: useEffect in App` |
| Component（mount） | `Component: {name} mounted` | `Component: LoginForm mounted` |
| Component（unmount） | `Component: {name} unmounted` | `Component: LoginForm unmounted` |
| Store | `Store: {store}.{action}` | `Store: AuthStore.setLoading` |
| Service（前端） | `API {phase}: {method} {path} -> {status}` | `API Response: GET /api/auth/me -> 200` |
| Auth（前端） | `Auth: {method} {result}` | `Auth: getCurrentUser OK` |
| Router（前端） | `Route: {from} -> {to}` | `Route: /login -> /admin` |
| Router（后端） | `HTTP: {method} {path} -> {status}` | `HTTP: GET /api/auth/me -> 200` |
| Auth（后端） | `Auth: {method} {result}` | `Auth: decode_token OK` |
| Service（后端） | `Service: {method} {result}` | `Service: get_admin_by_id OK` |
| Database | `DB: {operation} {table} {result}` | `DB: SELECT admins OK` |
| System | `Server {event}: {detail}` | `Server started: http://0.0.0.0:8000` |
| Error | `{error_type}: {error_message}` | `ValueError: Invalid user ID format` |
| Audit | `Audit: {action} {result}` | `Audit: Admin Login successful` |
| Performance | `Slow {metric_name}: {target} ({duration}ms > {threshold}ms)` 或 `Perf: {metric_name} = {value}{unit}` | `Slow network_request: GET /api/users (5200ms > 1000ms)` |

## 4. 日志层级（Layer）

### 前端

| Layer | 说明 |
|-------|------|
| `Hook` | React Hook（仅记录 useEffect 和状态变化） |
| `Component` | 组件生命周期 |
| `Store` | 状态管理（Zustand） |
| `Service` | API 调用（Axios拦截器） |
| `Auth` | 认证操作 |
| `Router` | 路由变化 |

### 后端

| Layer | 说明 |
|-------|------|
| `Router` | 路由/HTTP 请求 |
| `Auth` | 认证操作 |
| `Service` | 服务调用 |
| `Database` | 数据库操作 |
| `System` | 系统级日志（uvicorn、启动、关闭等） |

## 5. 各 Layer 的 extra_data 规范

> extra_data 仅包含该 Layer 独有的业务字段，追踪字段（trace_id 等）在顶层。

### 前端

#### Hook

**记录策略**：只记录有意义的 Hook 调用，减少噪音：
1. `useEffect` 执行和清理
2. `useState` 状态变化（记录新旧值，敏感数据脱敏）
3. 慢 Hook（执行时间 > 10ms）
4. Hook 错误

**message 格式**：
| 场景 | 格式 | 示例 |
|------|------|------|
| Effect 执行 | `Effect: {component}` | `Effect: LoginForm` |
| Effect 清理 | `Effect Cleanup: {component}` | `Effect Cleanup: LoginForm` |
| 状态变化 | `State: {component}.{index}` | `State: LoginForm.0` |
| 慢 Hook | `Slow Hook: {hook} in {component}` | `Slow Hook: useMemo in DataTable` |
| Hook 错误 | `Hook Error: {hook} in {component}` | `Hook Error: useEffect in App` |

**extra_data 字段**：

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `hook_name` | string | Hook 名称 | `useEffect`、`useState` |
| `component_name` | string | 组件名 | `LoginForm` |
| `event` | string | 事件类型：`effect`、`cleanup`、`state_change`、`slow`、`error` | `effect` |
| `has_cleanup` | boolean | useEffect 是否有清理函数（仅 effect 事件） | `true` |
| `deps_changed` | boolean | useEffect 依赖是否变化（仅 effect 事件） | `true` |
| `prev_value` | any | useState 旧值（脱敏，仅 state_change 事件） | `false` |
| `next_value` | any | useState 新值（脱敏，仅 state_change 事件） | `true` |
| `state_index` | number | useState 在组件中的索引（仅 state_change 事件） | `0` |
| `error_message` | string | 错误信息（仅 error 事件） | `Cannot read property...` |

#### Component

**记录策略**：记录组件 mount 和 unmount，unmount 时附带存活时长和渲染次数。

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `component_name` | string | 组件名 | `LoginForm` |
| `lifecycle` | string | `mount` \| `unmount` | `mount` |
| `render_count` | number | 渲染次数（仅 unmount 时） | `5` |
| `mount_duration_ms` | number | 组件存活时长（仅 unmount 时） | `3500` |

#### Store
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `store_name` | string | Store 名称 | `AuthStore`、`UIStore` |
| `action_name` | string | Action 名称 | `setLoading`、`setUser` |
| `changed_fields` | array | 变更的字段列表 | `["isLoading"]` |

#### Service
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `request_method` | string | HTTP 方法（大写） | `GET`、`POST`、`PUT`、`DELETE` |
| `request_path` | string | 请求路径（不含域名） | `/api/auth/me` |
| `response_status` | number | HTTP 状态码 | `200`、`401`、`500` |
| `base_url` | string | API 基础 URL | `http://localhost:8000` |
| `retry_attempt` | number | 重试次数（从0开始） | `0`、`1`、`2` |

#### Auth
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `method_name` | string | 方法名 | `login`、`logout`、`getCurrentUser` |
| `args_count` | number | 参数个数 | `0`、`1`、`2` |
| `result` | string | `SUCCESS` \| `FAILED` \| `PENDING` | `SUCCESS` |

#### Router

**记录策略**：记录路由变化，包含来源和目标路径，以及用户认证状态。

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `action` | string | 导航类型：`PUSH` \| `POP` \| `REPLACE` | `PUSH` |
| `from_path` | string | 来源路径 | `/login` |
| `to_path` | string | 目标路径 | `/admin/members` |
| `search` | string | 查询参数（有值才输出） | `?page=1` |
| `is_authenticated` | boolean | 是否已登录 | `true` |
| `user_role` | string | 用户角色（有值才输出） | `admin` \| `member` |

### 后端

#### Router
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `ip_address` | string | 客户端 IP | `127.0.0.1`、`192.168.1.100` |
| `user_agent` | string | User-Agent（截断至100字符） | `Mozilla/5.0 (Windows NT 10.0; Win64; x64)` |
| `request_method` | string | HTTP 方法（大写） | `GET`、`POST` |
| `request_path` | string | 请求路径 | `/api/auth/me` |
| `response_status` | number | HTTP 状态码 | `200`、`401`、`500` |

#### Auth / Service
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `method_name` | string | 方法名 | `decode_token`、`get_admin_by_id` |
| `arg_{name}` | any | 方法参数（敏感数据用 `[FILTERED]`） | `arg_admin_id: "uuid"`、`arg_token: "[FILTERED]"` |

#### Database
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `table_name` | string | 表名 | `admins`、`members` |
| `operation_type` | string | `SELECT` \| `INSERT` \| `UPDATE` \| `DELETE` | `SELECT` |
| `row_count` | number | 影响/返回行数 | `1`、`100` |

#### System
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `server` | string | 服务器类型 | `uvicorn`、`gunicorn` |
| `host` | string | 监听地址 | `0.0.0.0`、`127.0.0.1` |
| `port` | number | 监听端口 | `8000` |
| `workers` | number | 工作进程数 | `1`、`4` |

> 注意：System 日志目前为空是正常的，只有在服务器启动/关闭等系统事件时才会记录。
| `host` | string | 监听地址 | `0.0.0.0`、`127.0.0.1` |
| `port` | number | 监听端口 | `8000` |
| `workers` | number | 工作进程数 | `1`、`4` |

### 特殊日志类型

#### Error
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `error_type` | string | 异常类名 | `ValueError`、`TypeError`、`NotFoundError`、`AxiosError` |
| `error_message` | string | 异常消息 | `Invalid user ID format` |
| `stack_trace` | string | 堆栈信息（截断至2000字符） | `Traceback (most recent call last):...` |
| `error_code` | string | 应用错误码（可选） | `AUTH_001`、`DB_002` |
| `status_code` | number | HTTP 状态码（可选） | `400`、`404`、`500` |
| `request_method` | string | HTTP 方法（可选） | `GET`、`POST` |
| `request_path` | string | 请求路径（可选，后端为请求路径，前端 API 错误为 API 路径） | `/api/users/invalid` |
| `ip_address` | string | 客户端 IP（可选） | `127.0.0.1` |
| `page_url` | string | 前端页面 URL（仅前端 API 错误） | `http://localhost:3000/member/home` |
| `api_response` | object | API 响应信息（仅前端 API 错误） | `{"status": 401, "statusText": "Unauthorized"}` |

#### Audit
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `action` | string | `LOGIN` \| `LOGOUT` \| `CREATE` \| `UPDATE` \| `DELETE` \| `APPROVE` \| `ADMIN_LOGIN` | `LOGIN` |
| `result` | string | `SUCCESS` \| `FAILED` | `SUCCESS` |
| `ip_address` | string | 客户端 IP | `127.0.0.1` |
| `user_agent` | string | User-Agent | `Mozilla/5.0...` |
| `resource_type` | string | 资源类型（可选） | `member`、`admin` |
| `resource_id` | string | 资源 ID（可选） | `uuid` |

#### Performance
| 字段 | 类型 | 取值 | 示例 |
|------|------|------|------|
| `metric_name` | string | 指标名称 | `network_request`、`memory_usage`、`render_time` |
| `metric_value` | number | 指标值 | `5200`、`44592987` |
| `metric_unit` | string | 单位 | `ms`、`bytes` |
| `threshold_ms` | number | 阈值（毫秒） | `1000` |
| `is_slow` | boolean | 是否超过阈值 | `true` |
| `component_name` | string | 组件/目标名称（可选） | `App`、`GET /api/users` |

## 6. 日志文件

| 文件 | 用途 | 写入方式 | 数据库表 |
|------|------|----------|----------|
| app.log | 应用日志（前后端） | 实时写入 | app_logs |
| error.log | 错误日志 | 实时写入 | error_logs |
| audit.log | 审计日志 | 实时写入 | audit_logs |
| performance.log | 性能日志 | 实时写入 | performance_logs |
| system.log | 系统日志（uvicorn等） | 实时写入 | system_logs |

## 7. AOP 架构

### 前端

| 层级 | 实现方式 | 实现文件 | 日志内容 |
|------|----------|----------|----------|
| Hook | 拦截器 | `hook.interceptor.js` | useEffect 执行/清理、useState 状态变化、慢 Hook、错误 |
| Component | 拦截器 | `hook.interceptor.js` | 组件 mount/unmount（通过 useEffect 空依赖实现） |
| Store | Zustand 中间件 | `storeLogger.js` | 状态变更、action 名、变更字段 |
| Service | Axios 拦截器 | `api.interceptor.js` | API 请求/响应、状态码、耗时 |
| Auth | 拦截器 | `auth.interceptor.js` | 认证操作、token 状态 |
| Router | 拦截器 | `router.interceptor.js` | 路由变化、来源/目标路径、认证状态 |
| Performance | 拦截器 | `performance.interceptor.js` | 慢请求、内存使用、Web Vitals |

### 后端

| 层级 | 实现方式 | 实现文件 | 日志内容 |
|------|----------|----------|----------|
| Router | HTTP 中间件 | `middleware.py` | HTTP 请求/响应、状态码、耗时 |
| Auth | 装饰器 | `service.py` | 认证方法调用、参数、耗时 |
| Service | 装饰器 | `service.py` | 方法调用、参数、耗时 |
| Database | 客户端包装 | `database.py` | SQL 操作、表名、耗时 |
| Audit | 装饰器/手动调用 | `audit/service.py` | 业务操作审计（登录、创建、删除等） |
| Performance | 拦截器 | `performance.interceptor.js` | 慢请求、内存使用、Web Vitals |

自动识别 Auth 层的类名：`AuthService`、`AuthenticationService`、`LoginService`

### 审计日志触发方式

审计日志与其他日志不同，需要明确的业务语义，因此使用以下方式触发：

1. **装饰器方式** - 用于需要审计的业务方法：
```python
@audit_log(action="APPROVE", resource_type="member")
async def approve_member(self, member_id: UUID):
    ...
```

2. **手动调用** - 用于复杂业务逻辑：
```python
await logging_service.audit(AuditLogCreate(
    action="LOGIN",
    user_id=user.id,
    resource_type="admin",
    ip_address=request.client.host,
    result="SUCCESS"
))
```


## 8. 目录结构

### 前端

```
frontend/src/shared/
├── stores/
│   ├── authStore.js           # 认证状态
│   ├── uiStore.js             # UI 状态
│   ├── storeLogger.js         # Store 日志中间件
│   └── index.js               # 统一导出
│
├── logger/
│   ├── index.js               # 统一导出入口
│   ├── core.js                # 日志核心：级别、格式化
│   ├── transport.js           # 日志传输：实时上报
│   ├── context.js             # 上下文：traceId、requestId
│   ├── dedup.js               # 日志去重
│   └── config.js              # 日志配置（级别、传输、性能监控等）
│
├── interceptors/
│   ├── api.interceptor.js     # API 请求/响应拦截（Service 层）
│   ├── auth.interceptor.js    # 认证拦截（Auth 层）
│   ├── component.interceptor.js # 组件拦截（Component 层，API 兼容层）
│   ├── hook.interceptor.js    # Hook 拦截（Hook 层 + Component 生命周期）
│   ├── router.interceptor.js  # 路由拦截（Router 层）
│   └── performance.interceptor.js # 性能监控（Performance 层）
│
└── main.jsx                   # 拦截器初始化入口
```

### 后端

```
backend/src/common/modules/
├── logger/
│   ├── __init__.py         # 统一导出入口
│   ├── service.py          # LoggingService 统一入口
│   ├── schemas.py          # Pydantic 数据模型
│   ├── db_writer.py        # 数据库写入
│   ├── file_writer.py      # 文件写入
│   ├── request.py          # 请求上下文
│   ├── router.py           # 日志 API 路由
│   ├── config.py           # 日志配置
│   ├── formatter.py        # 日志格式化
│   ├── handlers.py         # 日志处理器
│   ├── filters.py          # 日志过滤器
│   └── startup.py          # 启动时日志配置
│
└── interceptor/
    ├── __init__.py         # 统一导出入口
    ├── config.py           # 配置类
    ├── router.py           # Router 层
    ├── service.py          # Service 层
    ├── auth.py             # Auth 层
    └── database.py         # Database 层
```

## 9. 日志格式示例（后端输出）

### Hook（前端）

#### Effect 执行
```json
{
  "timestamp": "2025-12-23 12:33:53.407",
  "source": "frontend",
  "level": "DEBUG",
  "message": "Effect: LoginForm",
  "layer": "Hook",
  "module": "frontend/src/member/components/LoginForm.jsx",
  "function": "wrappedEffect",
  "line_number": 220,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "hook_name": "useEffect",
    "component_name": "LoginForm",
    "event": "effect",
    "has_cleanup": true,
    "deps_changed": true
  }
}
```

#### 状态变化
```json
{
  "timestamp": "2025-12-23 12:33:53.450",
  "source": "frontend",
  "level": "DEBUG",
  "message": "State: LoginForm.0",
  "layer": "Hook",
  "module": "frontend/src/member/components/LoginForm.jsx",
  "function": "interceptedUseState",
  "line_number": 180,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "hook_name": "useState",
    "component_name": "LoginForm",
    "event": "state_change",
    "state_index": 0,
    "prev_value": false,
    "next_value": true
  }
}
```

#### 慢 Hook
```json
{
  "timestamp": "2025-12-23 12:33:53.500",
  "source": "frontend",
  "level": "WARNING",
  "message": "Slow Hook: useMemo in DataTable",
  "layer": "Hook",
  "module": "frontend/src/shared/components/DataTable.jsx",
  "function": "interceptedHook",
  "line_number": 153,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "duration_ms": 25,
  "extra_data": {
    "hook_name": "useMemo",
    "component_name": "DataTable",
    "event": "slow"
  }
}
```

### Component（前端）

#### mount
```json
{
  "timestamp": "2025-12-23 12:33:53.500",
  "source": "frontend",
  "level": "DEBUG",
  "message": "Component: LoginForm mounted",
  "layer": "Component",
  "module": "frontend/src/shared/interceptors/hook.interceptor.js",
  "function": "interceptedHook",
  "line_number": 138,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "component_name": "LoginForm",
    "lifecycle": "mount"
  }
}
```

#### unmount
```json
{
  "timestamp": "2025-12-23 12:33:56.800",
  "source": "frontend",
  "level": "DEBUG",
  "message": "Component: LoginForm unmounted",
  "layer": "Component",
  "module": "frontend/src/shared/interceptors/hook.interceptor.js",
  "function": "wrappedCleanup",
  "line_number": 280,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "component_name": "LoginForm",
    "lifecycle": "unmount",
    "render_count": 5,
    "mount_duration_ms": 3300
  }
}
```

### Store（前端）

```json
{
  "timestamp": "2025-12-23 12:33:53.734",
  "source": "frontend",
  "level": "INFO",
  "message": "Store: AuthStore.setLoading",
  "layer": "Store",
  "module": "frontend/src/shared/stores/authStore.js",
  "function": "loggedSet",
  "line_number": 25,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "store_name": "AuthStore",
    "action_name": "setLoading",
    "changed_fields": ["isLoading"]
  }
}
```

### Service（前端）

```json
{
  "timestamp": "2025-12-23 12:33:53.807",
  "source": "frontend",
  "level": "DEBUG",
  "message": "API Response: GET /api/auth/me -> 200",
  "layer": "Service",
  "module": "frontend/src/shared/interceptors/api.interceptor.js",
  "function": "response",
  "line_number": 85,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-044",
  "duration_ms": 263,
  "extra_data": {
    "request_method": "GET",
    "request_path": "/api/auth/me",
    "response_status": 200,
    "base_url": "http://localhost:8000",
    "retry_attempt": 0
  }
}
```

### Auth（前端）

```json
{
  "timestamp": "2025-12-23 12:33:53.736",
  "source": "frontend",
  "level": "DEBUG",
  "message": "Auth: getCurrentUser OK",
  "layer": "Auth",
  "module": "frontend/src/shared/interceptors/auth.interceptor.js",
  "function": "getCurrentUser",
  "line_number": 65,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "user_id": "4bb4747c-d7f9-4456-a4c7-19615739cf6d",
  "duration_ms": 280,
  "extra_data": {
    "method_name": "getCurrentUser",
    "args_count": 0,
    "result": "SUCCESS"
  }
}
```

### Router（前端）

```json
{
  "timestamp": "2025-12-23 12:33:53.726",
  "source": "frontend",
  "level": "INFO",
  "message": "Route: /login -> /admin",
  "layer": "Router",
  "module": "frontend/src/shared/interceptors/router.interceptor.js",
  "function": "logRouteChange",
  "line_number": 45,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "action": "PUSH",
    "from_path": "/login",
    "to_path": "/admin",
    "is_authenticated": true,
    "user_role": "admin"
  }
}
```

### Router（后端）

```json
{
  "timestamp": "2025-12-23 12:33:53.694",
  "source": "backend",
  "level": "INFO",
  "message": "HTTP: GET /api/auth/me -> 200",
  "layer": "Router",
  "module": "backend/src/common/modules/interceptor/router.py",
  "function": "dispatch",
  "line_number": 155,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-044",
  "duration_ms": 263,
  "extra_data": {
    "ip_address": "127.0.0.1",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "request_method": "GET",
    "request_path": "/api/auth/me",
    "response_status": 200
  }
}
```

### Auth（后端）

```json
{
  "timestamp": "2025-12-23 12:33:53.594",
  "source": "backend",
  "level": "DEBUG",
  "message": "Auth: decode_token OK",
  "layer": "Auth",
  "module": "backend/src/common/modules/interceptor/auth.py",
  "function": "decode_token",
  "line_number": 55,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-044",
  "duration_ms": 2,
  "extra_data": {
    "method_name": "decode_token",
    "arg_token": "[FILTERED]"
  }
}
```

### Service（后端）

```json
{
  "timestamp": "2025-12-23 12:33:53.594",
  "source": "backend",
  "level": "DEBUG",
  "message": "Service: get_admin_by_id OK",
  "layer": "Service",
  "module": "backend/src/common/modules/interceptor/service.py",
  "function": "get_admin_by_id",
  "line_number": 87,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-044",
  "user_id": "4bb4747c-d7f9-4456-a4c7-19615739cf6d",
  "duration_ms": 161,
  "extra_data": {
    "method_name": "get_admin_by_id",
    "arg_admin_id": "4bb4747c-d7f9-4456-a4c7-19615739cf6d"
  }
}
```

### Database（后端）

```json
{
  "timestamp": "2025-12-23 12:33:53.594",
  "source": "backend",
  "level": "DEBUG",
  "message": "DB: SELECT admins OK",
  "layer": "Database",
  "module": "backend/src/common/modules/interceptor/database.py",
  "function": "log_operation",
  "line_number": 68,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-044",
  "duration_ms": 160,
  "extra_data": {
    "table_name": "admins",
    "operation_type": "SELECT",
    "row_count": 1
  }
}
```

### Error（错误日志）

```json
{
  "timestamp": "2025-12-23 12:33:54.100",
  "source": "backend",
  "level": "ERROR",
  "message": "ValueError: Invalid user ID format",
  "layer": "Router",
  "module": "backend/src/common/modules/interceptor/error.py",
  "function": "dispatch",
  "line_number": 180,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "request_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990-045",
  "extra_data": {
    "error_type": "ValueError",
    "error_message": "Invalid user ID format",
    "stack_trace": "Traceback (most recent call last):\n  File ...",
    "request_method": "GET",
    "request_path": "/api/users/invalid",
    "ip_address": "127.0.0.1"
  }
}
```

#### Error - 前端 API 错误示例

前端 API 调用失败时，会包含具体的 API 请求信息：

```json
{
  "timestamp": "2025-12-23 12:33:54.100",
  "source": "frontend",
  "level": "ERROR",
  "message": "AxiosError: Request failed with status code 401",
  "layer": "Exception",
  "module": "",
  "function": "record_direct",
  "line_number": 93,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "error_type": "AxiosError",
    "error_message": "Request failed with status code 401",
    "stack_trace": "AxiosError: Request failed with status code 401\n    at settle ...",
    "request_method": "GET",
    "request_path": "/api/v1/messages/member/unread-count",
    "ip_address": "127.0.0.1",
    "page_url": "http://localhost:3000/member/home",
    "api_response": {
      "status": 401,
      "statusText": "Unauthorized"
    }
  }
}
```

### Audit（审计日志）

```json
{
  "timestamp": "2025-12-23 12:33:55.200",
  "source": "backend",
  "level": "INFO",
  "message": "Audit: Admin Login successful",
  "layer": "Auth",
  "module": "backend/src/auth/service.py",
  "function": "admin_login",
  "line_number": 120,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "user_id": "4bb4747c-d7f9-4456-a4c7-19615739cf6d",
  "extra_data": {
    "action": "ADMIN_LOGIN",
    "result": "SUCCESS",
    "ip_address": "127.0.0.1",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "resource_type": "admin"
  }
}
```

> 注意：审计日志使用装饰器 `@audit_log()` 或手动调用 `logging_service.audit()` 触发，不使用拦截器方式。

### Performance（性能日志）

```json
{
  "timestamp": "2025-12-23 12:33:56.300",
  "source": "frontend",
  "level": "WARNING",
  "message": "Slow network_request: GET /api/users (5200ms > 1000ms)",
  "layer": "Performance",
  "module": "frontend/src/shared/interceptors/performance.interceptor.js",
  "function": "interceptedFetch",
  "line_number": 76,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "duration_ms": 5200,
  "extra_data": {
    "metric_name": "network_request",
    "metric_value": 5200,
    "metric_unit": "ms",
    "threshold_ms": 1000,
    "is_slow": true,
    "method": "GET",
    "url": "/api/users",
    "status": 200
  }
}
```

#### Performance - 内存监控示例

```json
{
  "timestamp": "2025-12-23 12:33:56.300",
  "source": "frontend",
  "level": "INFO",
  "message": "Perf: memory_usage = 44592987bytes",
  "layer": "Performance",
  "module": "frontend/src/shared/interceptors/performance.interceptor.js",
  "function": "monitorMemoryUsage",
  "line_number": 250,
  "trace_id": "fa8e02fc-dca6-40f9-aea5-248bc304f990",
  "extra_data": {
    "metric_name": "memory_usage",
    "metric_value": 44592987,
    "metric_unit": "bytes",
    "is_slow": false,
    "used": 44592987,
    "total": 67108864,
    "usage_percentage": 66
  }
}
```

### System（系统日志）

```json
{
  "timestamp": "2025-12-23 12:33:50.000",
  "source": "backend",
  "level": "INFO",
  "message": "Server started: http://0.0.0.0:8000",
  "layer": "System",
  "module": "uvicorn.server",
  "function": "serve",
  "line_number": 0,
  "extra_data": {
    "server": "uvicorn",
    "host": "0.0.0.0",
    "port": 8000,
    "workers": 1
  }
}
```
