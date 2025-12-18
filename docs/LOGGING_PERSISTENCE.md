# 日志持久化说明

## 问题

在 Render 等云平台上，容器重启时**本地文件系统会被清空**，所有存储在容器内的日志文件都会丢失。

## 解决方案

系统已实现**双重日志存储机制**，两者互补：

### 1. 文件日志（实时排查）📝

- **存储位置**: `backend/logs/` 目录
- **用途**: 
  - ✅ **容器运行期间实时查看** - 通过 Render Dashboard 的 Logs 标签页实时查看
  - ✅ **快速排查问题** - 可以直接 tail 日志文件，查看最新错误
  - ✅ **完整日志记录** - 记录所有级别的日志（DEBUG/INFO/WARNING/ERROR）
- **持久性**: ⚠️ **容器重启后会丢失**，但运行期间完全可用
- **配置**: `LOG_ENABLE_FILE=true` - 启用文件日志

### 2. 数据库日志（永久存储）💾

- **存储位置**: Supabase PostgreSQL 数据库的 `app_logs` 表
- **用途**: 
  - ✅ **永久保存** - 不会因容器重启而丢失
  - ✅ **历史查询** - 可以查询任意时间段的日志
  - ✅ **高级过滤** - 支持复杂的查询和过滤
  - ✅ **所有日志** - 包括应用日志、异常日志、审计日志
- **持久性**: ✅ **永久保存**，不会因容器重启而丢失
- **配置**: 
  - `LOG_DB_ENABLED=true` - 启用数据库日志
  - `LOG_DB_MIN_LEVEL=DEBUG` - **所有日志级别都写入数据库**（实现永久存储）

## Render 配置

在 `render.yaml` 中已配置：

```yaml
envVars:
  - key: LOG_DB_ENABLED
    value: "true"  # 启用数据库日志（永久存储）
  - key: LOG_DB_MIN_LEVEL
    value: "DEBUG"  # 所有日志级别都写入数据库，实现永久存储
  - key: LOG_ENABLE_FILE
    value: "true"  # 启用文件日志（容器运行期间实时查看）
```

### 双重保障策略

- **文件日志**: 用于实时排查，容器运行期间完全可用
- **数据库日志**: **所有日志永久保存**，即使容器重启也不丢失
- **互补作用**: 文件日志方便实时查看，数据库日志确保所有历史记录永久保存
- **日志类型**: 
  - ✅ 应用日志（app.log）→ 写入 `app_logs` 表
  - ✅ 异常日志（error.log）→ 写入 `error_logs` 表（专门的错误日志表）
  - ✅ 审计日志（audit.log）→ 写入 `audit_logs` 表
  - ✅ 系统日志（system.log）→ 写入 `system_logs` 表（Python 标准 logging 模块的日志）

## 查看日志

### 1. 实时查看文件日志（推荐用于排查问题）

#### 通过 Render Dashboard
1. 登录 Render Dashboard
2. 选择你的服务
3. 点击 **Logs** 标签页
4. 实时查看日志输出（类似 `tail -f`）

#### 通过 Render CLI（如果可用）
```bash
render logs --service gangwon-portal-backend --tail
```

### 2. 查看数据库日志（用于历史查询）

#### 通过 API

```bash
# 获取所有日志
GET /api/v1/logging/logs?page=1&page_size=50

# 按级别过滤
GET /api/v1/logging/logs?level=ERROR

# 按时间范围过滤
GET /api/v1/logging/logs?start_date=2025-01-01&end_date=2025-01-31
```

#### 通过 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入 Table Editor
3. 选择 `app_logs` 表
4. 查看、过滤和导出日志

## 总结

✅ **所有日志已永久存储到 Supabase 数据库**

- **文件日志**: 容器运行期间可实时查看，方便快速排查问题
- **数据库日志**: **所有日志永久保存**，包括：
  - ✅ 所有级别的应用日志（DEBUG/INFO/WARNING/ERROR/CRITICAL）
  - ✅ 所有异常日志（自动转换为 ERROR 级别）
  - ✅ 所有审计日志（独立的 `audit_logs` 表）
- **持久化保障**: 
  - 即使容器重启，所有日志都保存在 Supabase 数据库中
  - 可以通过 API 或 Supabase Dashboard 查询任意历史记录
  - 支持高级过滤、搜索和导出

⚠️ **注意事项**: 
- 文件日志在容器重启后会丢失，但运行期间完全可用
- **数据库日志会永久保存所有记录**，实现真正的永久存储
- 建议同时启用两者：文件日志用于实时排查，数据库日志用于永久存储

