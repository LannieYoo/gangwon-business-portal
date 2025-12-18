# 日志架构说明

## 概述

系统实现了4种类型的日志，所有日志都**异步写入** Supabase 数据库，确保不会阻塞主业务流程。

## 日志类型与异步实现

### 1. 应用日志 (app.log) → `app_logs` 表

**实现方式**: 
- ✅ **异步批处理** - 使用 `asyncio.Queue` + 后台异步 worker 循环
- ✅ **批量插入** - 每 50 条或每 5 秒批量写入一次（可配置）
- ✅ **非阻塞** - 日志写入完全异步，不阻塞请求处理

**代码位置**: `backend/src/common/modules/logger/db_writer.py`

**配置**:
- `LOG_DB_ENABLED=true` - 启用数据库日志
- `LOG_DB_MIN_LEVEL=DEBUG` - 所有级别都写入（当前配置）
- `LOG_DB_BATCH_SIZE=50` - 批处理大小
- `LOG_DB_BATCH_INTERVAL=5.0` - 批处理间隔（秒）

**日志级别**: 
- ✅ **DEBUG** - 调试信息
- ✅ **INFO** - 一般信息
- ✅ **WARNING** - 警告
- ✅ **ERROR** - 错误
- ✅ **CRITICAL** - 严重错误

---

### 2. 异常日志 (error.log) → `error_logs` 表

**实现方式**: 
- ✅ **异步后台线程** - 使用 `threading.Thread` (daemon=True)
- ✅ **Fire-and-forget** - 不等待结果，立即返回
- ✅ **非阻塞** - 完全异步，不阻塞异常处理流程

**代码位置**: `backend/src/common/modules/exception/service.py`

**配置**:
- 无级别过滤 - **所有异常都写入**

**日志级别**: 
- ✅ **所有异常** - 无论级别，所有异常都会写入 `error_logs` 表

---

### 3. 审计日志 (audit.log) → `audit_logs` 表

**实现方式**: 
- ✅ **异步线程池** - 使用 `asyncio.to_thread()` 
- ✅ **非阻塞** - 在异步上下文中执行，不阻塞请求
- ✅ **单条插入** - 每条审计日志立即写入

**代码位置**: `backend/src/common/modules/audit/service.py`

**配置**:
- 无级别过滤 - **所有审计日志都写入**

**日志级别**: 
- ✅ **所有审计操作** - 登录、创建、更新、删除、审批等所有操作

---

### 4. 系统日志 (system.log) → `system_logs` 表

**实现方式**: 
- ✅ **异步后台线程** - 使用 `threading.Thread` (daemon=True)
- ✅ **Fire-and-forget** - 不等待结果，立即返回
- ✅ **非阻塞** - Python 标准 logging 模块的日志写入完全异步

**代码位置**: `backend/src/common/modules/logger/handlers.py` (DatabaseSystemLogHandler)

**配置**:
- `LOG_DB_ENABLED=true` - 启用数据库日志
- `LOG_DB_MIN_LEVEL=DEBUG` - 所有级别都写入（当前配置）

**日志级别**: 
- ✅ **DEBUG** - 调试信息
- ✅ **INFO** - 一般信息
- ✅ **WARNING** - 警告
- ✅ **ERROR** - 错误
- ✅ **CRITICAL** - 严重错误

---

## 性能分析

### 异步机制保障

所有4种日志都采用**异步写入**机制：

1. **应用日志**: 
   - 异步队列 + 批处理 = **最高效**
   - 批量插入减少数据库连接开销
   - 适合高频日志场景

2. **异常日志**: 
   - 后台线程异步写入
   - 单条插入，但异常频率低，影响小

3. **审计日志**: 
   - 异步线程池写入
   - 单条插入，但审计操作频率可控

4. **系统日志**: 
   - 后台线程异步写入
   - 单条插入，系统日志频率中等

### Supabase 性能

- ✅ **连接池**: Supabase Python 客户端使用连接池，自动管理连接
- ✅ **批量插入**: 应用日志使用批量插入，减少网络往返
- ✅ **异步非阻塞**: 所有写入都是异步的，不会阻塞主业务逻辑
- ✅ **错误处理**: 所有写入都有错误处理，失败不会影响主流程

### 性能瓶颈评估

**结论**: ✅ **没有性能瓶颈**

原因：
1. **完全异步**: 所有日志写入都是异步的，不阻塞请求处理
2. **批量处理**: 应用日志（最频繁）使用批量插入，效率最高
3. **Supabase 优化**: Supabase 本身针对高并发写入进行了优化
4. **错误隔离**: 日志写入失败不会影响业务逻辑

---

## 当前配置总结

### Render 部署配置 (render.yaml)

```yaml
envVars:
  - key: LOG_DB_ENABLED
    value: "true"  # 启用所有数据库日志
  - key: LOG_DB_MIN_LEVEL
    value: "DEBUG"  # 所有级别都写入数据库
```

### 日志级别配置

| 日志类型 | 数据库表 | 级别过滤 | 写入级别 |
|---------|---------|---------|---------|
| **应用日志** | `app_logs` | ✅ 是 | DEBUG/INFO/WARNING/ERROR/CRITICAL |
| **异常日志** | `error_logs` | ❌ 否 | 所有异常 |
| **审计日志** | `audit_logs` | ❌ 否 | 所有审计操作 |
| **系统日志** | `system_logs` | ✅ 是 | DEBUG/INFO/WARNING/ERROR/CRITICAL |

---

## 优化建议

### 如果日志量过大

1. **调整应用日志级别**:
   ```yaml
   LOG_DB_MIN_LEVEL: "INFO"  # 只记录 INFO 及以上
   ```

2. **调整批处理参数**:
   ```python
   LOG_DB_BATCH_SIZE: 100  # 增加批处理大小
   LOG_DB_BATCH_INTERVAL: 10.0  # 增加批处理间隔
   ```

3. **定期清理旧日志**:
   - 建议保留 90 天内的日志
   - 可以通过 Supabase 定时任务或数据库维护脚本实现

---

## 总结

✅ **所有4种日志都是异步写入，没有性能瓶颈**

- 应用日志：异步批处理（最高效）
- 异常日志：异步后台线程
- 审计日志：异步线程池
- 系统日志：异步后台线程

所有日志都永久存储在 Supabase 数据库中，即使容器重启也不会丢失。

