# Audit 模块规范

## 目录结构

```
audit/
├── __init__.py     # 模块入口
├── decorator.py    # 审计装饰器
├── service.py      # 审计服务
└── schemas.py      # 数据模型
```

## 使用方式

### 1. 装饰器方式（推荐）

```python
from src.common.modules.audit import audit_log

@audit_log(action="login", resource_type="member")
async def login(request: Request, credentials: LoginRequest):
    # 登录逻辑
    return token_response

@audit_log(action="create", resource_type="performance")
async def create_performance(
    request: Request,
    data: PerformanceCreate,
    current_user: Member
):
    # 创建逻辑
    return created_record

@audit_log(
    action="update",
    resource_type="member",
    get_resource_id=lambda result: result.id if result else None
)
async def update_member(member_id: UUID, data: MemberUpdate):
    # 更新逻辑
    return updated_member
```

### 2. 手动调用方式

```python
from src.common.modules.audit import audit_log_service

await audit_log_service.create_audit_log_via_api(
    action="custom_action",
    user_id=user.id,
    resource_type="custom_resource",
    resource_id=resource_id,
    ip_address=request.client.host,
    user_agent=request.headers.get("user-agent"),
    trace_id=request.state.trace_id,
    request_method=request.method,
    request_path=str(request.url.path)
)
```

## 支持的 Action 类型

| Action | 说明 |
|--------|------|
| `login` | 会员登录 |
| `admin_login` | 管理员登录 |
| `logout` | 登出 |
| `create` | 创建资源 |
| `update` | 更新资源 |
| `delete` | 删除资源 |
| `approve` | 审批通过 |
| `reject` | 审批拒绝 |
| `export` | 数据导出 |

## 支持的 Resource 类型

- `member` - 会员
- `performance` - 绩效记录
- `project` - 项目
- `application` - 项目申请
- `notice` - 公告
- `inquiry` - 咨询
- `message` - 消息
- `thread` - 消息线程

## 双写机制

审计日志同时写入：
1. 数据库 `audit_logs` 表
2. 文件 `logs/audit.log`

任一写入失败不影响另一个，确保审计记录的可靠性。

## 自动提取信息

装饰器自动从请求中提取：
- `user_id` - 从 `current_user` 或 `current_admin` 参数
- `resource_id` - 从路径参数或返回结果
- `ip_address` - 从请求头 `X-Forwarded-For`、`X-Real-IP` 或 `client.host`
- `user_agent` - 从请求头
- `trace_id` - 从请求头 `X-Trace-ID` 或 `request.state`

## 查询审计日志

```python
from src.common.modules.audit import audit_log_service
from src.common.modules.audit.schemas import AuditLogListQuery

# 查询审计日志
response = await audit_log_service.list_audit_logs(
    db=db_session,
    query=AuditLogListQuery(
        user_id=user_id,
        action="login",
        resource_type="member",
        start_date=start_date,
        end_date=end_date,
        page=1,
        page_size=20
    )
)
```

## 注意事项

1. 装饰器不会阻止原函数执行，审计失败只记录警告
2. 审计日志保留期限：7年（政府合规要求）
3. 登录/登出操作不需要 `resource_id`
4. 确保路由函数包含 `request: Request` 参数以获取客户端信息
