from typing import List, Tuple, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone, timedelta

from ...common.modules.exception import NotFoundError, ValidationError, CMessageTemplate
from ...common.modules.supabase.message_service import message_db_service
from ...common.modules.supabase.service import supabase_service
from ...common.modules.email.service import EmailService
from .schemas import (
    MessageCreate, MessageUpdate, ThreadCreate, ThreadMessageCreate,
    ThreadUpdate, BroadcastCreate
)


class MessageService:
    """消息业务逻辑服务类，所有数据库操作通过 message_db_service 执行"""

    TYPE_DIRECT = "direct"
    TYPE_THREAD = "thread"
    TYPE_BROADCAST = "broadcast"

    SENDER_ADMIN = "admin"
    SENDER_MEMBER = "member"
    SENDER_SYSTEM = "system"

    def __init__(self):
        self.email_service = EmailService()
        self.db = message_db_service

    async def _get_member_name(self, member_id: str) -> Optional[str]:
        return await self.db.get_member_name(member_id)

    async def _get_admin_name(self, admin_id: str) -> Optional[str]:
        return await self.db.get_admin_name(admin_id)

    async def _is_admin(self, user_id: str) -> bool:
        return await self.db.is_admin(user_id)

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

    async def _enrich_messages_with_senders_batch(self, messages: List[dict]) -> List[dict]:
        """批量添加发送者名称，避免 N+1 查询"""
        if not messages:
            return messages

        admin_ids = set()
        member_ids = set()

        for msg in messages:
            sender_type = msg.get('sender_type')
            sender_id = msg.get('sender_id')
            if sender_id:
                if sender_type == 'admin':
                    admin_ids.add(sender_id)
                elif sender_type == 'member':
                    member_ids.add(sender_id)

        admin_names = {}
        member_names = {}

        if admin_ids:
            admin_names = await self.db.get_admin_names_batch(list(admin_ids))

        if member_ids:
            member_names = await self.db.get_member_names_batch(list(member_ids))

        for msg in messages:
            sender_type = msg.get('sender_type')
            sender_id = msg.get('sender_id')

            if sender_type == 'admin':
                msg['sender_name'] = admin_names.get(sender_id, "System Admin")
            elif sender_type == 'member':
                msg['sender_name'] = member_names.get(sender_id)
            else:
                msg['sender_name'] = "System"

        return messages

    async def get_messages(
        self,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        is_important: Optional[bool] = None,
        is_read: Optional[bool] = None,
        is_admin: bool = False,
    ) -> Tuple[List[dict], int, int]:
        """获取用户的分页消息列表"""
        messages, total_count, unread_count = await self.db.get_messages_paginated(
            user_id=str(user_id),
            page=page,
            page_size=page_size,
            category=category,
            is_important=is_important,
            is_read=is_read,
            is_admin=is_admin
        )

        for message in messages:
            await self._enrich_message_with_sender(message)

        return messages, total_count, unread_count

    async def get_message_by_id(self, message_id: UUID, user_id: UUID) -> dict:
        """根据ID获取消息，如果用户是接收者则标记为已读"""
        message = await self.db.get_message_with_access_check(str(message_id), str(user_id))

        if not message:
            raise NotFoundError(resource_type="Message")

        if message.get('recipient_id') == str(user_id) and not message.get('is_read', False):
            await self.db.mark_as_read(str(message_id))
            message['is_read'] = True
            message['read_at'] = datetime.now(timezone.utc).isoformat()

        await self._enrich_message_with_sender(message)
        return message

    async def create_message(self, data: MessageCreate, sender_id: UUID) -> dict:
        """创建新消息"""
        is_admin = await self._is_admin(str(sender_id))

        message_data = {
            "id": str(uuid4()),
            "message_type": self.TYPE_DIRECT,
            "sender_id": str(sender_id),
            "sender_type": self.SENDER_ADMIN if is_admin else self.SENDER_MEMBER,
            "recipient_id": str(data.recipient_id),
            "subject": data.subject,
            "content": data.content,
            "category": getattr(data, 'category', "general"),
            "is_important": getattr(data, 'is_important', False),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        message = await self.db.insert_message(message_data)
        if not message:
            raise ValidationError(
                CMessageTemplate.VALIDATION_OPERATION_FAILED.format(operation="create message")
            )

        await self._enrich_message_with_sender(message)
        return message

    async def update_message(self, message_id: UUID, data: MessageUpdate, user_id: UUID) -> dict:
        """更新消息（标记已读/未读、重要性）"""
        message = await self.db.get_message_with_access_check(str(message_id), str(user_id))
        if not message:
            raise NotFoundError(resource_type="Message")

        update_data = {}
        if hasattr(data, 'is_read') and data.is_read is not None:
            update_data['is_read'] = data.is_read
            if data.is_read:
                update_data['read_at'] = datetime.now(timezone.utc).isoformat()

        if hasattr(data, 'is_important') and data.is_important is not None:
            update_data['is_important'] = data.is_important

        if not update_data:
            return message

        updated = await self.db.update_message(str(message_id), update_data)
        return updated

    async def delete_message(self, message_id: UUID, user_id: UUID) -> None:
        """软删除消息"""
        message = await self.db.get_message_with_access_check(str(message_id), str(user_id))
        if not message:
            raise NotFoundError(resource_type="Message")

        await self.db.soft_delete_message(str(message_id))

    async def get_unread_count_unified(self, user_id: UUID, is_admin: bool = False) -> dict:
        """获取用户未读消息数量"""
        count = await self.db.get_unread_count(str(user_id), is_admin)
        return {
            "unread_count": count,
            "direct_count": count,
            "thread_count": 0,
        }

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
            "recipient_id": str(recipient_id),
            "subject": data.subject,
            "content": data.content,
            "category": "general",
            "is_important": getattr(data, 'is_important', False),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        return await self.db.insert_message(message_data)

    async def mark_as_read_unified(self, message_id: UUID, user_id: UUID) -> dict:
        """标记消息为已读"""
        message = await self.db.get_message_by_id(str(message_id))
        if not message or message.get('recipient_id') != str(user_id):
            raise NotFoundError(resource_type="Message")

        await self.db.mark_as_read(str(message_id))
        message['is_read'] = True
        message['read_at'] = datetime.now(timezone.utc).isoformat()
        return message

    async def get_admin_threads(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        has_unread: Optional[bool] = None,
    ) -> Tuple[List[dict], int]:
        """获取管理员的所有线程（分页）"""
        threads, total_count = await self.db.get_threads_paginated(
            page=page,
            page_size=page_size,
            status=status
        )

        if not threads:
            return threads, total_count

        thread_ids = [t['id'] for t in threads]
        thread_stats = await self.db.get_thread_stats_batch(thread_ids, for_admin=True)

        member_ids = list(set(t.get('sender_id') for t in threads if t.get('sender_id')))
        member_names = await self.db.get_member_names_batch(member_ids)

        for thread in threads:
            stats = thread_stats.get(thread['id'], {'message_count': 0, 'unread_count': 0})
            thread['message_count'] = stats['message_count']
            thread['admin_unread_count'] = stats['unread_count']
            thread['unread_count'] = stats['unread_count']
            thread['member_name'] = member_names.get(thread.get('sender_id'))
            thread['member_id'] = thread.get('sender_id')
            thread['created_by'] = thread.get('sender_id')
            thread['assigned_to'] = None
            thread['last_message_at'] = thread.get('updated_at', thread.get('created_at'))
            thread['category'] = thread.get('category', 'general')

        return threads, total_count

    async def get_member_threads(
        self,
        member_id: UUID,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
    ) -> Tuple[List[dict], int]:
        """获取特定会员的线程"""
        threads, total_count = await self.db.get_threads_paginated(
            page=page,
            page_size=page_size,
            status=status,
            sender_id=str(member_id)
        )

        if not threads:
            return threads, total_count

        thread_ids = [t['id'] for t in threads]
        thread_stats = await self.db.get_thread_stats_batch(thread_ids, for_admin=False)
        member_name = await self.db.get_member_name(str(member_id))

        for thread in threads:
            stats = thread_stats.get(thread['id'], {'message_count': 0, 'unread_count': 0})
            thread['message_count'] = stats['message_count']
            thread['unread_count'] = stats['unread_count']
            thread['member_name'] = member_name
            thread['member_id'] = str(member_id)
            thread['created_by'] = str(member_id)
            thread['assigned_to'] = None
            thread['last_message_at'] = thread.get('updated_at', thread.get('created_at'))
            thread['category'] = thread.get('category', 'general')

        return threads, total_count

    async def create_thread(self, data: ThreadCreate, member_id: UUID) -> dict:
        """创建新消息线程"""
        thread_data = {
            "id": str(uuid4()),
            "message_type": self.TYPE_THREAD,
            "sender_id": str(member_id),
            "sender_type": self.SENDER_MEMBER,
            "recipient_id": str(member_id),
            "subject": data.subject,
            "content": f"Thread: {data.subject}",
            "category": getattr(data, 'category', "general"),
            "status": "open",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        thread = await self.db.insert_message(thread_data)

        if thread and hasattr(data, 'content') and data.content:
            first_message_data = ThreadMessageCreate(
                content=data.content,
                attachments=getattr(data, 'attachments', [])
            )
            await self.create_thread_message_unified(
                UUID(thread['id']),
                first_message_data,
                member_id,
                self.SENDER_MEMBER
            )

        return thread

    async def create_thread_message_unified(
        self,
        thread_id: UUID,
        data: ThreadMessageCreate,
        sender_id: UUID,
        sender_type: str
    ) -> dict:
        """在现有线程中创建消息"""
        thread = await self.db.get_thread_by_id(str(thread_id))
        if not thread:
            raise NotFoundError(resource_type="Thread")

        now = datetime.now(timezone.utc)
        message_id = str(uuid4())
        message_data = {
            "id": message_id,
            "message_type": self.TYPE_THREAD,
            "thread_id": str(thread_id),
            "sender_id": str(sender_id),
            "sender_type": sender_type,
            "recipient_id": thread['recipient_id'],
            "subject": thread['subject'],
            "content": data.content,
            "category": thread.get('category', 'general'),
            "is_important": getattr(data, 'is_important', False),
            "attachments": getattr(data, 'attachments', []),
            "created_at": now.isoformat(),
        }

        message = await self.db.insert_message(message_data)
        
        await self.db.update_thread_status(str(thread_id), {
            "updated_at": now.isoformat()
        })
        
        return message

    async def create_thread_message(
        self,
        thread_id: UUID,
        data: ThreadMessageCreate,
        sender_id: UUID,
        sender_type: str
    ) -> dict:
        """创建线程消息（别名方法）"""
        return await self.create_thread_message_unified(thread_id, data, sender_id, sender_type)

    async def get_thread_with_messages(self, thread_id: UUID, user_id: UUID) -> dict:
        """获取线程及其所有消息（批量查询优化）"""
        thread = await self.db.get_thread_by_id(str(thread_id))
        if not thread:
            raise NotFoundError(resource_type="Thread")

        is_admin = await self._is_admin(str(user_id))
        if not is_admin and thread.get('sender_id') != str(user_id):
            raise NotFoundError(resource_type="Thread")

        messages = await self.db.get_thread_messages_list(str(thread_id))
        member_name = await self._get_member_name(thread.get('sender_id'))

        reader_type = 'admin' if is_admin else 'member'
        await self.db.mark_thread_messages_as_read(str(thread_id), reader_type)

        await self._enrich_messages_with_senders_batch(messages)

        thread['member_name'] = member_name
        thread['member_id'] = thread.get('sender_id')
        thread['created_by'] = thread.get('sender_id')
        thread['assigned_to'] = None
        thread['last_message_at'] = messages[-1]['created_at'] if messages else thread.get('created_at')
        thread['unread_count'] = 0
        thread['category'] = thread.get('category', 'general')

        return {'thread': thread, 'messages': messages}

    async def update_thread(self, thread_id: UUID, data: ThreadUpdate, user_id: UUID) -> dict:
        """更新线程状态"""
        thread = await self.db.get_thread_by_id(str(thread_id))
        if not thread:
            raise NotFoundError(resource_type="Thread")

        is_admin = await self._is_admin(str(user_id))
        if not is_admin and thread.get('sender_id') != str(user_id):
            raise NotFoundError(resource_type="Thread")

        update_data = {}
        if hasattr(data, 'status') and data.status:
            update_data['status'] = data.status
        if hasattr(data, 'subject') and data.subject:
            update_data['subject'] = data.subject

        if not update_data:
            return thread

        updated = await self.db.update_thread_status(str(thread_id), update_data)
        return updated if updated else thread

    async def create_broadcast(self, data: BroadcastCreate, sender_id: UUID) -> dict:
        """创建并发送广播消息"""
        is_admin = await self._is_admin(str(sender_id))
        if not is_admin:
            raise ValidationError(CMessageTemplate.MESSAGE_BROADCAST_ADMIN_ONLY)

        if data.send_to_all:
            recipient_ids = await self.db.get_active_member_ids()
        else:
            recipient_ids = [str(rid) for rid in (data.recipient_ids or [])]

        if not recipient_ids:
            raise ValidationError(CMessageTemplate.MESSAGE_NO_RECIPIENTS)

        messages_to_insert = []
        broadcast_id = str(uuid4())

        for recipient_id in recipient_ids:
            messages_to_insert.append({
                "id": str(uuid4()),
                "message_type": self.TYPE_BROADCAST,
                "thread_id": broadcast_id,
                "sender_id": str(sender_id),
                "sender_type": self.SENDER_ADMIN,
                "recipient_id": recipient_id,
                "subject": data.subject,
                "content": data.content,
                "category": getattr(data, 'category', "announcement"),
                "is_important": getattr(data, 'is_important', False),
                "is_broadcast": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

        result = await self.db.insert_messages_batch(messages_to_insert)
        if not result:
            raise ValidationError(
                CMessageTemplate.VALIDATION_OPERATION_FAILED.format(operation="create broadcast")
            )

        return {
            "broadcast_id": broadcast_id,
            "recipient_count": len(recipient_ids),
            "messages": result
        }

    async def get_analytics(self, time_range: str = "7d") -> dict:
        """获取消息分析数据"""
        now = datetime.now(timezone.utc)

        if time_range == "7d":
            start_date = (now - timedelta(days=7)).isoformat()
        elif time_range == "30d":
            start_date = (now - timedelta(days=30)).isoformat()
        elif time_range == "90d":
            start_date = (now - timedelta(days=90)).isoformat()
        else:
            start_date = None

        data = await self.db.get_analytics_data(start_date)

        return {
            "total_messages": data['total_messages'],
            "unread_messages": data['unread_messages'],
            "response_time": data.get('response_time', 0.0),
            "messages_by_day": data.get('messages_by_day', []),
            "messages_by_category": data.get('messages_by_category', []),
            "response_time_by_day": data.get('response_time_by_day', []),
        }


service = MessageService()
