"""
Auth Interceptor - 认证服务拦截器

职责：拦截认证相关服务方法，记录 Auth 层日志
- 登录/登出
- Token 验证
- 权限检查

使用 service.py 中的通用装饰器，指定 layer="Auth"
"""

from typing import Type, TypeVar, Optional
from .config import InterceptorConfig
from .service import intercept_service as _intercept_service, intercept_method

T = TypeVar('T')


def intercept_auth_service(
    cls: Optional[Type[T]] = None,
    *,
    config: Optional[InterceptorConfig] = None,
) -> Type[T]:
    """
    Auth 服务类装饰器
    
    Usage:
        @intercept_auth_service
        class AuthService:
            async def login(self, email: str, password: str):
                ...
            
            async def decode_token(self, token: str):
                ...
    """
    return _intercept_service(cls, config=config, layer="Auth")


def intercept_auth_method(
    config: Optional[InterceptorConfig] = None,
    log_args: bool = True,
    log_result: bool = False,
):
    """
    Auth 方法装饰器
    
    Usage:
        @intercept_auth_method()
        async def verify_token(self, token: str):
            ...
    """
    return intercept_method(
        config=config,
        log_args=log_args,
        log_result=log_result,
        layer="Auth"
    )


__all__ = [
    "intercept_auth_service",
    "intercept_auth_method",
]
