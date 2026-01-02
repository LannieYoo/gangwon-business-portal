"""
Health Check Module
系统健康检查模块 - 可插拔设计，支持迁移到其他项目

迁移步骤:
    1. 复制整个 health 文件夹到新项目
    2. 修改 adapter.py 中的 import 路径
    3. 在 main.py 中注册路由: app.include_router(router)

使用方式:
    # 1. 使用默认配置
    from modules.health import router
    app.include_router(router)
    
    # 2. 自定义配置
    from modules.health import HealthService, HealthModuleConfig, ServiceConfig
    
    config = HealthModuleConfig(
        external_services={
            "api": ServiceConfig(name="my-api", url="https://api.example.com", type="api"),
        }
    )
    HealthService.configure(config=config)
"""

from .router import router
from .service import HealthService
from .config import HealthModuleConfig, ServiceConfig, configure, get_default_config

__all__ = [
    "router",
    "HealthService",
    "HealthModuleConfig",
    "ServiceConfig",
    "configure",
    "get_default_config",
]
