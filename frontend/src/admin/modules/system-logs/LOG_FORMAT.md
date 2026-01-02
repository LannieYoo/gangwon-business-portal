# 日志显示格式规范

## 统一列格式

所有日志查看器（应用日志、异常、性能、审计、系统）使用统一的列格式：

| 时间 | 级别 | 来源 | 层级 | 模块 | 文件 | 消息 | 操作 |
|------|------|------|------|------|------|------|------|

## 字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| 时间 | 日志记录时间 (EST) | 2026-01-03 02:00:39 |
| 级别 | DEBUG/INFO/WARNING/ERROR/CRITICAL | INFO |
| 来源 | backend / frontend | backend |
| 层级 | Router/Service/Database/Auth/Component/Store/Performance | Router |
| 模块 | 模块路径（去掉 src. 前缀和文件名） | common.modules.interceptor |
| 文件 | 文件名（后端加 .py 后缀） | router.py |
| 消息 | 日志内容 | HTTP: GET /api/... |
| 操作 | 复制/删除/清理 | - |

## 后端日志示例

| 时间 | 级别 | 来源 | 层级 | 模块 | 文件 | 消息 |
|------|------|------|------|------|------|------|
| 2026-01-03 02:00:39 | INFO | backend | Router | common.modules.interceptor | router.py | HTTP: GET /api/member/messages/unread-count -> 200 |
| 2026-01-03 02:00:38 | INFO | backend | Service | common.modules.member | service.py | Service: get_unread_count OK |
| 2026-01-03 02:00:37 | DEBUG | backend | Database | common.modules.interceptor | database.py | DB SELECT messages OK (12.5ms) |

## 前端日志示例

| 时间 | 级别 | 来源 | 层级 | 模块 | 文件 | 消息 |
|------|------|------|------|------|------|------|
| 2026-01-03 02:00:44 | INFO | frontend | Service | - | index-CddmaCi5.js | API Success: GET /api/member/messages/unread-count |
| 2026-01-03 02:00:40 | WARNING | frontend | Component | - | index-CddmaCi5.js | Slow render: MessageList (520ms) |

> 注：前端打包后模块路径丢失，模块列显示 `-`，文件列显示打包后的哈希文件名。

## 模块路径转换规则

**后端：**
- 原始：`src.common.modules.interceptor.router`
- 模块列：`common.modules.interceptor`（去掉 `src.` 前缀和最后的文件名）
- 文件列：`router.py`（最后一部分 + `.py` 后缀）

**前端：**
- 打包后：`index-CddmaCi5.js`
- 模块列：`-`（无模块路径）
- 文件列：`index-CddmaCi5.js`（原样显示）

## 展开详情

点击日志行展开后显示：
- Trace ID（如有）
- Request ID（如有）
- User ID（如有）
- Extra Data（额外数据，JSON 格式）

## Extra Data 格式

各类型日志的 extra_data 内容：

### 应用日志 (App Log)
```json
{
  "request_method": "GET",
  "request_path": "/api/member/messages/unread-count",
  "response_status": 200,
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0..."
}
```

### 性能日志 (Performance Log)
```json
{
  "metric_name": "slow_api_response",
  "metric_value": 1250.5,
  "metric_unit": "ms",
  "threshold_ms": 1000,
  "is_slow": true,
  "request_method": "GET",
  "request_path": "/api/member/list",
  "response_status": 200
}
```

### 异常日志 (Error Log)
```json
{
  "error_type": "ValidationError",
  "stack_trace": "Traceback (most recent call last):\n  File...",
  "context": {
    "request_method": "POST",
    "request_path": "/api/member/create"
  }
}
```

### 审计日志 (Audit Log)
```json
{
  "action": "LOGIN",
  "resource_type": "user",
  "resource_id": "uuid-xxx",
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0...",
  "old_value": null,
  "new_value": {"status": "active"}
}
```

### 系统日志 (System Log)
```json
{
  "server": "uvicorn",
  "host": "0.0.0.0",
  "port": 8000,
  "workers": 1
}
```

> 注：如果 extra_data 只包含 `logger_name` 且与 module 相同，则不显示。

## 层级说明

| 层级 | 说明 |
|------|------|
| Router | HTTP 请求/响应层 |
| Service | 业务逻辑层 |
| Database | 数据库操作层 |
| Auth | 认证授权层 |
| Component | 前端组件层 |
| Store | 前端状态管理层 |
| Performance | 性能监控层 |
| System | 系统级日志 |
| Exception | 异常/错误层 |
