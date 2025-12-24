# Interceptor 模块规范

## 目录结构

```
interceptor/
├── __init__.py     # 模块入口 + 自动注册
├── config.py       # 配置类
├── router.py       # Router 层（HTTP 请求日志）
├── error.py        # Error 层（异常处理）
├── service.py      # Service 层拦截
├── auth.py         # Auth 层拦截
└── database.py     # Database 层拦截
```

## 快速配置

在 `main.py` 中一行代码配置所有拦截器：

```python
from src.common.modules.interceptor import setup_interceptors

app = FastAPI()
setup_interceptors(app, debug=settings.DEBUG)
```

## 架构层次

```
┌─────────────────────────────────────────┐
│  Error 层 (HTTP 中间件)                  │
│  - 异常捕获                              │
│  - 错误响应格式化                        │
├─────────────────────────────────────────┤
│  Router 层 (HTTP 中间件)                 │
│  - HTTP 请求/响应日志                    │
│  - 性能监控（慢请求警告）                │
├─────────────────────────────────────────┤
│  Auth 层 (装饰器)                        │
│  - 认证服务方法调用日志                  │
│  - AuthService 自动识别                  │
├─────────────────────────────────────────┤
│  Service 层 (装饰器)                     │
│  - 方法调用日志                          │
│  - 性能监控                              │
├─────────────────────────────────────────┤
│  Database 层 (客户端包装)                │
│  - SQL 操作日志                          │
│  - 查询性能监控                          │
└─────────────────────────────────────────┘
```


## 实现方式说明

| 层级 | 文件 | 实现方式 | 原因 |
|------|------|----------|------|
| Error | error.py | HTTP 中间件 | 全局异常捕获，统一错误响应 |
| Router | router.py | HTTP 中间件 | HTTP 请求是框架级别的，只能用中间件拦截 |
| Auth | auth.py | 装饰器 | 业务方法级别，装饰器能获取函数元信息 |
| Service | service.py | 装饰器 | 业务方法级别，装饰器能获取函数元信息 |
| Database | database.py | 客户端包装 | Supabase 是第三方库，只能包装客户端 |

## Error 层拦截

```python
from src.common.modules.interceptor import add_exception_middleware

add_exception_middleware(app, debug=True)
```

自动处理：
- `HTTPException` → 标准 HTTP 错误响应
- `ValidationError` → 422 验证错误
- 未捕获异常 → 500 内部错误（debug 模式显示详情）
- 自动添加 `X-Trace-Id` 和 `X-Request-Id` 响应头

## Router 层拦截

```python
from src.common.modules.interceptor import HTTPLoggingMiddleware

app.add_middleware(HTTPLoggingMiddleware, debug=True)
```

记录内容：
- 请求方法、路径、客户端 IP
- 响应状态码、耗时
- 慢请求警告（默认 > 1000ms）

## Service 层拦截

### 自动拦截

```python
from src.common.modules.interceptor import auto_intercept_services

# 自动拦截指定包下所有 *Service 类
intercepted = auto_intercept_services(
    package_name="src.modules",
    exclude_classes=["LoggingService"]  # 排除特定类
)
```

自动识别的 Auth 层类：
- `AuthService`
- `AuthenticationService`
- `LoginService`

这些类的日志会自动使用 `layer="Auth"` 而不是 `layer="Service"`。

### 手动拦截

```python
from src.common.modules.interceptor import intercept_service, intercept_method

# 拦截整个类（默认 layer="Service"）
@intercept_service
class MyService:
    async def my_method(self):
        pass

# 指定 layer
@intercept_service(layer="Auth")
class AuthService:
    async def login(self):
        pass

# 拦截单个方法
class MyService:
    @intercept_method
    async def my_method(self):
        pass
    
    @intercept_method(layer="Auth")
    async def authenticate(self):
        pass
```

## Database 层拦截

```python
from src.common.modules.interceptor import create_unified_client

# 创建带拦截的 Supabase 客户端
client = create_unified_client()

# 所有数据库操作自动记录日志
result = client.table("members").select("*").execute()
```

## 配置类

```python
from src.common.modules.interceptor import (
    MiddlewareConfig,
    ServiceConfig,
    DatabaseConfig
)

# 中间件配置
middleware_config = MiddlewareConfig(
    log_request_body=True,
    log_response_body=False,
    slow_request_threshold_ms=1000
)

# Service 配置
service_config = ServiceConfig(
    log_args=True,
    log_result=False,
    slow_method_threshold_ms=500
)

# Database 配置
database_config = DatabaseConfig(
    log_queries=True,
    slow_query_threshold_ms=200
)
```

## 敏感信息过滤

自动过滤敏感字段：

```python
from src.common.modules.interceptor import SENSITIVE_FIELDS, SENSITIVE_HEADERS

# 敏感字段（日志中显示为 ***）
SENSITIVE_FIELDS = {"password", "token", "secret", "api_key", ...}

# 敏感请求头
SENSITIVE_HEADERS = {"authorization", "cookie", "x-api-key", ...}
```

## 注意事项

1. `LoggingService` 必须排除，否则导致日志递归
2. 拦截器自动跳过健康检查等路径
3. 慢请求阈值可通过配置调整
4. 生产环境建议关闭 `debug` 模式
5. 拦截器不影响原有业务逻辑
