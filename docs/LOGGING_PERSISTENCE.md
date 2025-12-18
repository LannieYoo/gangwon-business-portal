# 日志持久化说明

## 问题

在 Render 等云平台上，容器重启时**本地文件系统会被清空**，所有存储在容器内的日志文件都会丢失。

## 解决方案

系统已实现**双重日志存储机制**：

### 1. 数据库日志（持久化）✅

- **存储位置**: Supabase PostgreSQL 数据库的 `app_logs` 表
- **持久性**: ✅ **永久保存**，不会因容器重启而丢失
- **配置**: 
  - `LOG_DB_ENABLED=true` - 启用数据库日志
  - `LOG_DB_MIN_LEVEL=INFO` - 记录 INFO 级别及以上的日志

### 2. 文件日志（临时）⚠️

- **存储位置**: `backend/logs/` 目录
- **持久性**: ❌ **临时存储**，容器重启会丢失
- **配置**: `LOG_ENABLE_FILE=false` - 在云平台上禁用文件日志

## Render 配置

在 `render.yaml` 中已配置：

```yaml
envVars:
  - key: LOG_DB_ENABLED
    value: "true"  # 启用数据库日志（持久化）
  - key: LOG_DB_MIN_LEVEL
    value: "INFO"  # 记录 INFO 及以上级别
  - key: LOG_ENABLE_FILE
    value: "false"  # 禁用文件日志（避免浪费资源）
```

## 查看日志

### 通过 API

```bash
# 获取所有日志
GET /api/v1/logging/logs?page=1&page_size=50

# 按级别过滤
GET /api/v1/logging/logs?level=ERROR

# 按时间范围过滤
GET /api/v1/logging/logs?start_date=2025-01-01&end_date=2025-01-31
```

### 通过 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入 Table Editor
3. 选择 `app_logs` 表
4. 查看、过滤和导出日志

## 总结

✅ **日志已持久化到数据库，不会因容器重启而丢失**

- 所有重要日志（INFO 级别及以上）都会写入 Supabase 数据库
- 文件日志在云平台上已禁用，避免浪费资源
- 可以通过 API 或 Supabase Dashboard 查看所有历史日志

