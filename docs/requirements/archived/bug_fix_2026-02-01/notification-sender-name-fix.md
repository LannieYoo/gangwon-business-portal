# 通知发送者名称显示修复

## 问题描述

在通知历史页面和通知详情模态框中，所有通知的发送者都显示为 "System"，即使是会员提交实绩、申请项目或注册时发送的通知。

## 根本原因

1. **后端问题**: 在创建通知时，`sender_id` 被设置为 `None`，导致 `sender_type` 被设置为 `system`
2. **前端显示**: 前端正确地使用了 `notification.senderName || "System"`，但后端没有提供正确的 `senderName`

## 解决方案

### 1. 修改 `messages/service.py` 中的 `create_direct_message` 方法

**文件**: `backend/src/modules/messages/service.py`

**修改前**:
```python
async def create_direct_message(
    self,
    sender_id: Optional[UUID],
    recipient_id: UUID,
    data: MessageCreate
) -> dict:
    """创建直接消息"""
    message_data = {
        "id": str(uuid4()),
        "message_type": self.TYPE_DIRECT,
        "sender_id": str(sender_id) if sender_id else None,
        "sender_type": self.SENDER_ADMIN if sender_id else self.SENDER_SYSTEM,
        # ...
    }
    return await self.db.insert_message(message_data)
```

**修改后**:
```python
async def create_direct_message(
    self,
    sender_id: Optional[UUID],
    recipient_id: UUID,
    data: MessageCreate
) -> dict:
    """创建直接消息"""
    # Determine sender type
    sender_type = self.SENDER_SYSTEM
    if sender_id:
        is_admin = await self._is_admin(str(sender_id))
        sender_type = self.SENDER_ADMIN if is_admin else self.SENDER_MEMBER
    
    message_data = {
        "id": str(uuid4()),
        "message_type": self.TYPE_DIRECT,
        "sender_id": str(sender_id) if sender_id else None,
        "sender_type": sender_type,
        # ...
    }
    return await self.db.insert_message(message_data)
```

**说明**: 现在会正确检查发送者是管理员还是会员，而不是简单地假设所有有 `sender_id` 的都是管理员。

### 2. 修改实绩提交通知

**文件**: `backend/src/modules/performance/service.py`

**修改**: 将 `sender_id=None` 改为 `sender_id=member_id`

```python
await message_service.create_direct_message(
    sender_id=member_id,  # Use member_id as sender to show company name
    recipient_id=UUID(admin_id),
    data=MessageCreate(
        subject=f"[실적 관리] 새로운 실적 제출",
        content=f"회사명: {company_name}\n기간: {updated.get('period', '알 수 없음')}\n\n새로운 실적이 제출되었습니다. 검토가 필요합니다.",
        recipient_id=UUID(admin_id),
    ),
)
```

### 3. 修改会员注册通知

**文件**: `backend/src/modules/user/service.py`

**修改**: 将 `sender_id=None` 改为 `sender_id=UUID(member['id'])`

```python
await message_service.create_direct_message(
    sender_id=UUID(member['id']),  # Use member_id as sender to show company name
    recipient_id=UUID(admin_id),
    data=MessageCreate(
        subject=f"[회원 관리] 새로운 회원 가입 신청",
        content=f"회사명: {member['company_name']}\n사업자번호: {member['business_number']}\n이메일: {member['email']}\n\n승인 대기 중입니다.",
        recipient_id=UUID(admin_id),
    ),
)
```

### 4. 修改项目申请通知

**文件**: `backend/src/modules/project/service.py`

**修改**: 将 `sender_id=None` 改为 `sender_id=member_id`

```python
await message_service.create_direct_message(
    sender_id=member_id,  # Use member_id as sender to show company name
    recipient_id=UUID(admin_id),
    data=MessageCreate(
        subject=f"[사업 관리] 새로운 사업 신청",
        content=f"회사명: {company_name}\n신청자: {data.applicant_name}\n사업명: {project.get('title', '알 수 없음')}\n\n새로운 사업 신청이 접수되었습니다. 검토가 필요합니다.",
        recipient_id=UUID(admin_id),
    ),
)
```

## 影响范围

### 修改的通知类型

1. **实绩提交通知** - 现在显示会员公司名称
2. **会员注册通知** - 现在显示会员公司名称
3. **项目申请通知** - 现在显示会员公司名称

### 保持不变的通知类型

以下通知仍然显示为 "System"，因为它们是管理员操作后发送给会员的系统通知：

1. **实绩审核通知** (批准/拒绝/要求补充)
2. **会员审核通知** (批准/拒绝)
3. **项目审核通知** (批准/拒绝)

## 测试

### 测试脚本

创建了以下测试脚本：

1. `backend/check_messages.py` - 检查数据库中的消息数据
2. `backend/test_sender_display.py` - 测试发送者名称显示逻辑

### 测试步骤

1. 运行后端服务器
2. 会员提交新的实绩
3. 管理员检查通知历史
4. 验证发送者显示为会员公司名称而不是 "System"

## 前端验证

前端代码已经正确实现，无需修改：

**文件**: `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationDetailModal.jsx`

```jsx
<span>
  {t("support.sender")}: {notification.senderName || "System"}
</span>
```

后端的 `_enrich_message_with_sender` 方法会自动添加 `senderName` 字段：

```python
async def _enrich_message_with_sender(self, message: dict) -> dict:
    """根据发送者类型添加发送者名称"""
    sender_type = message.get('sender_type')
    if sender_type == 'admin':
        message['sender_name'] = await self._get_admin_name(message.get('sender_id'))
    elif sender_type == 'member':
        message['sender_name'] = await self._get_member_name(message.get('sender_id'))
    else:
        message['sender_name'] = "System"
    return message
```

## 注意事项

1. **现有数据**: 修改前创建的通知仍然显示为 "System"，因为它们的 `sender_id` 为 `None`，`sender_type` 为 `system`
2. **新数据**: 修改后创建的通知将正确显示会员公司名称
3. **性能**: 使用了批量查询 (`get_member_names_batch`, `get_admin_names_batch`) 来避免 N+1 查询问题

## 完成状态

- [x] 修改 `create_direct_message` 方法
- [x] 修改实绩提交通知
- [x] 修改会员注册通知
- [x] 修改项目申请通知
- [x] 创建测试脚本
- [x] 验证前端显示逻辑
- [ ] 端到端测试（需要重启后端服务器并提交新数据）

## 相关文件

- `backend/src/modules/messages/service.py`
- `backend/src/modules/performance/service.py`
- `backend/src/modules/user/service.py`
- `backend/src/modules/project/service.py`
- `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationDetailModal.jsx`
- `frontend/src/member/modules/support/hooks/useNotificationHistory.js`
