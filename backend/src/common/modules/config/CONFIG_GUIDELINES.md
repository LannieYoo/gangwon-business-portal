# Config 配置模块

## 概述

提供应用配置管理，使用 Pydantic Settings 从环境变量加载配置。

## 文件结构

```
config/
├── __init__.py       # 模块导出
└── settings.py       # 配置定义
```

## 使用方式

```python
from ...common.modules.config import settings

# 访问配置
database_url = settings.DATABASE_URL
debug_mode = settings.DEBUG
secret_key = settings.SECRET_KEY
```

## 配置项

### 应用配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `APP_NAME` | 应用名称 | Gangwon Business Portal |
| `APP_VERSION` | 应用版本 | 1.0.0 |
| `DEBUG` | 调试模式 | false |

### 数据库配置

| 配置项 | 说明 | 必填 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `DIRECT_URL` | 直连 URL（用于迁移） | ❌ |

### Supabase 配置

| 配置项 | 说明 | 必填 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `SUPABASE_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_KEY` | Supabase service key | ❌ |

### JWT 配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `SECRET_KEY` | JWT 密钥 | ✅ 必填 |
| `ALGORITHM` | 加密算法 | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 过期时间 | 1440 (24h) |

### CORS 配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `ALLOWED_ORIGINS` | 允许的源（逗号分隔） | localhost:5173,3000 |

### 邮件配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `EMAIL_SMTP_HOST` | SMTP 服务器 | smtp.gmail.com |
| `EMAIL_SMTP_PORT` | SMTP 端口 | 587 |
| `EMAIL_SMTP_USER` | SMTP 用户名 | - |
| `EMAIL_SMTP_PASSWORD` | SMTP 密码 | - |
| `EMAIL_FROM` | 发件人地址 | noreply@gangwon-portal.kr |

### 文件上传配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `MAX_UPLOAD_SIZE` | 最大上传大小 | 10MB |
| `MAX_IMAGE_SIZE` | 最大图片大小 | 5MB |
| `MAX_DOCUMENT_SIZE` | 最大文档大小 | 10MB |
| `ALLOWED_IMAGE_EXTENSIONS` | 允许的图片格式 | jpg,jpeg,png,gif,webp |
| `ALLOWED_DOCUMENT_EXTENSIONS` | 允许的文档格式 | pdf,doc,docx,xls,xlsx... |

### 日志配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `LOG_LEVEL` | 日志级别 | WARNING |
| `LOG_ENABLE_FILE` | 启用文件日志 | true |
| `LOG_ENABLE_CONSOLE` | 启用控制台日志 | true |
| `LOG_CLEAR_ON_STARTUP` | 启动时清理日志 | true |
| `LOG_DB_ENABLED` | 启用数据库日志 | true |
| `LOG_DB_SYSTEM_MIN_LEVEL` | 系统日志最低级别 | WARNING |
| `LOG_DB_APP_MIN_LEVEL` | 应用日志最低级别 | INFO |

### Nice D&B API 配置（可选）

| 配置项 | 说明 |
|--------|------|
| `NICE_DNB_API_KEY` | API Key |
| `NICE_DNB_API_SECRET_KEY` | API Secret |
| `NICE_DNB_API_URL` | API URL |

## 环境变量文件

```bash
# .env.local
# 数据库
DATABASE_URL=postgresql://user:pass@host:5432/db

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx

# JWT
SECRET_KEY=your-secret-key

# 应用
DEBUG=false
LOG_LEVEL=INFO

# 邮件（可选）
EMAIL_SMTP_USER=your@email.com
EMAIL_SMTP_PASSWORD=your-password

# CORS（可选，逗号分隔）
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 添加新配置

```python
# settings.py
class Settings(BaseSettings):
    # 新增配置项
    NEW_CONFIG: str = "default_value"
    NEW_OPTIONAL: str | None = None
    
    class Config:
        env_file = ".env.local"
```
