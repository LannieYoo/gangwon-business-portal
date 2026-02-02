# 管理员通知历史修复

## 问题描述

管理员通知历史页面显示"暂无通知"，即使后端已经正确发送了系统通知给管理员。

## 根本原因

### 1. 后端 API 不支持过滤参数
管理员消息端点 (`/api/admin/messages`) 缺少 `message_type` 过滤参数，而会员端点已经支持此参数。

### 2. **数据库字段名错误（主要问题）**
后端代码在查询活跃管理员时使用了错误的字段名：
- **错误**：`.eq('status', 'active')`
- **正确**：`.eq('is_active', 'true')`

`admins` 表使用 `is_active` 字段（布尔值），而不是 `status` 字段。这导致查询返回空数组，所以从未发送过任何通知给管理员。

### 3. 前端过滤效率低
前端获取所有消息后在客户端过滤，导致查询效率低且可能遗漏数据。

## 解决方案

### 1. 修复数据库字段名（关键修复）

修复三个文件中查询活跃管理员的代码：

**`backend/src/modules/user/service.py`**
**`backend/src/modules/performance/service.py`**
**`backend/src/modules/project/service.py`**

```python
# 错误的代码
admins_result = supabase_service.client.table('admins').select('id').eq('status', 'active').execute()

# 正确的代码
admins_result = supabase_service.client.table('admins').select('id').eq('is_active', 'true').execute()
```

### 2. 后端修改 (`backend/src/modules/messages/router.py`)

为管理员消息端点添加 `message_type` 过滤参数：

```python
@router.get(
    "/api/admin/messages",
    response_model=MessageListResponse,
    tags=["messages", "admin"],
    summary="Get messages (admin)",
)
async def get_messages(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=1000)] = 20,
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    is_important: Optional[bool] = Query(None, description="Filter by important status"),
    message_type: Optional[str] = Query(None, description="Filter by message type (direct, thread, broadcast)"),  # 新增
    current_user = Depends(get_current_admin_user),
):
    messages, total, unread_count = await service.get_messages(
        current_user["id"],
        page=page,
        page_size=page_size,
        is_read=is_read,
        is_important=is_important,
        message_type=message_type,  # 新增
        is_admin=True,
    )
    # ...
```

### 3. 前端服务修改 (`frontend/src/admin/modules/messages/services/messages.service.js`)

添加 `messageType` 参数支持：

```javascript
async getMessages(params) {
  const queryParams = {
    page: params.page,
    page_size: params.pageSize,
  };
  if (params.isRead !== undefined) queryParams.is_read = params.isRead;
  if (params.isImportant !== undefined) queryParams.is_important = params.isImportant;
  if (params.messageType !== undefined) queryParams.message_type = params.messageType;  // 新增

  const response = await apiService.get(BASE_URL, queryParams);
  // ...
}
```

### 4. 前端组件修改 (`frontend/src/admin/modules/messages/NotificationHistory.jsx`)

使用后端过滤而不是前端过滤：

```javascript
const loadNotifications = useCallback(async () => {
  setLoading(true);
  try {
    const response = await messagesService.getMessages({
      page: 1,
      pageSize: 100,
      messageType: 'direct', // 只查询直接消息（系统通知）
    });
    
    setNotifications(response.items || []);
    setFilteredNotifications(response.items || []);
  } catch (error) {
    console.error('Failed to load notifications:', error);
    setNotifications([]);
    setFilteredNotifications([]);
  } finally {
    setLoading(false);
  }
}, []);
```

## 性能提升

1. **数据库查询优化**：直接在数据库层面过滤 `message_type='direct'`，利用索引提高查询效率
2. **网络传输减少**：只传输需要的直接消息，不传输线程消息和广播消息
3. **前端处理简化**：不需要在前端过滤，直接渲染后端返回的数据
4. **查询准确性**：不受分页限制，能查询到所有直接消息

## 系统通知发送逻辑

管理员会收到以下系统通知：

### 1. 新会员注册通知
- **文件**：`backend/src/modules/user/service.py`
- **触发**：会员注册时
- **主题**：`[회원 관리] 새로운 회원 가입 신청`
- **接收者**：所有活跃管理员

### 2. 实绩提交通知
- **文件**：`backend/src/modules/performance/service.py`
- **触发**：会员提交实绩时
- **主题**：`[실적 관리] 새로운 실적 제출`
- **接收者**：所有活跃管理员

### 3. 事业申请通知
- **文件**：`backend/src/modules/project/service.py`
- **触发**：会员申请事业时
- **主题**：`[사업 관리] 새로운 사업 신청`
- **接收者**：所有活跃管理员

## 验证步骤

1. **重启后端服务**（应用字段名修复）
2. 以会员身份注册新账号或提交实绩/事业申请
3. 检查后端日志，确认通知发送成功
4. 以管理员身份登录
5. 点击小铃铛，查看"系统通知"区域（应该能看到未读数量）
6. 点击"查看全部"跳转到通知历史页面
7. 确认能看到系统通知

## 相关文件

- `backend/src/modules/user/service.py` - **修复 is_active 字段名**
- `backend/src/modules/performance/service.py` - **修复 is_active 字段名**
- `backend/src/modules/project/service.py` - **修复 is_active 字段名**
- `backend/src/modules/messages/router.py` - 添加 message_type 参数
- `frontend/src/admin/modules/messages/services/messages.service.js` - 添加 messageType 参数支持
- `frontend/src/admin/modules/messages/NotificationHistory.jsx` - 使用后端过滤

## 测试脚本

创建了 `backend/test_admin_notifications.py` 用于检查：
- 管理员列表
- 直接消息列表
- 发给管理员的消息数量

运行方式：
```bash
cd backend
uv run python test_admin_notifications.py
```

## 注意事项

1. 后端的 `message_service.get_messages_paginated()` 方法已经支持 `message_type` 参数
2. 管理员的直接消息查询使用 `recipient_id=admin_id` 和 `message_type='direct'` 双重过滤
3. 与会员端的通知历史实现保持一致
