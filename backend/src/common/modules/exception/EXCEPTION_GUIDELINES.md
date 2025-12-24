# Exception 异常处理模块

## 概述

提供统一的异常处理系统，包括自定义异常类、异常分类、上下文收集和日志集成。

## 文件结构

```
exception/
├── __init__.py       # 模块导出
├── exceptions.py     # 自定义异常类
├── handlers.py       # FastAPI 异常处理器
├── classifier.py     # 异常分类器
├── recorder.py       # 异常记录器
├── monitor.py        # 异常监控
├── service.py        # 异常服务
├── schemas.py        # Pydantic 模型
├── router.py         # API 路由
└── responses.py      # 响应格式
```

## 异常类型

| 异常类 | HTTP 状态码 | 用途 |
|--------|-------------|------|
| `ValidationError` | 400 | 数据验证失败 |
| `AuthenticationError` | 401 | 认证失败 |
| `AuthorizationError` | 403 | 权限不足 |
| `NotFoundError` | 404 | 资源不存在 |
| `ConflictError` | 409 | 资源冲突 |
| `RateLimitError` | 429 | 请求频率限制 |
| `DatabaseError` | 500 | 数据库错误 |
| `ExternalServiceError` | 502 | 外部服务错误 |
| `InternalError` | 500 | 内部错误 |

## 使用方式

### 抛出异常

```python
from ...common.modules.exception import (
    ValidationError,
    NotFoundError,
    AuthenticationError,
)

# 验证错误
raise ValidationError(
    "Invalid email format",
    field_errors={"email": "Invalid format"}
)

# 资源不存在
raise NotFoundError("Member")

# 认证失败
raise AuthenticationError("Invalid credentials")
```

### 注册异常处理器

```python
# main.py
from src.common.modules.exception import register_exception_handlers

app = FastAPI()
register_exception_handlers(app)
```

## 响应格式

```json
{
  "error": {
    "type": "ValidationError",
    "message": "Validation failed",
    "code": "ValidationError",
    "field_errors": {
      "email": "Invalid format"
    }
  },
  "trace_id": "abc123",
  "request_id": "req-456"
}
```

## 扩展异常

```python
from ...common.modules.exception import BaseCustomException, ExceptionType

class CustomError(BaseCustomException):
    """自定义异常"""
    
    @property
    def http_status_code(self) -> int:
        return 422
    
    @property
    def exception_type(self) -> ExceptionType:
        return ExceptionType.VALIDATION_ERROR
```
