from typing import Dict, Any, List, Optional, Tuple
from .service import SupabaseService
from ...utils.formatters import now_iso


class MessageService(SupabaseService):
    """消息管理服务类，处理统一消息表的所有数据库操作"""
    
    TYPE_DIRECT = "direct"
    TYPE_THREAD = "thread"
    TYPE_BROADCAST = "broadcast"
    
    SENDER_ADMIN = "admin"
    SENDER_MEMBER = "member"
    SENDER_SYSTEM = "system"
    
    async def get_message_by_id(self, message_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取消息"""
        result = self.client.table('messages')\
            .select('*')\
            .eq('id', message_id)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def create_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建消息"""
        result = self.client.table('messages')\
            .insert(message_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create message: no data returned")
        return result.data[0]
    
    async def update_message(self, message_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新消息"""
        result = self.client.table('messages')\
            .update(update_data)\
            .eq('id', message_id)\
            .execute()
        if not result.data:
            raise ValueError(f"Failed to update message {message_id}: no data returned")
        return result.data[0]

    async def delete_message(self, message_id: str) -> bool:
        """删除消息（硬删除）"""
        self.client.table('messages')\
            .delete()\
            .eq('id', message_id)\
            .execute()
        return True
    
    async def get_member_name(self, member_id: str) -> Optional[str]:
        """获取会员公司名称"""
        if not member_id:
            return None
        result = self.client.table('members').select('company_name').eq('id', member_id).execute()
        return result.data[0]['company_name'] if result.data else None
    
    async def get_member_names_batch(self, member_ids: List[str]) -> Dict[str, str]:
        """批量获取会员公司名称"""
        if not member_ids:
            return {}
        unique_ids = list(set(mid for mid in member_ids if mid))
        if not unique_ids:
            return {}
        result = self.client.table('members').select('id, company_name').in_('id', unique_ids).execute()
        return {m['id']: m['company_name'] for m in (result.data or [])}
    
    async def get_admin_name(self, admin_id: str) -> Optional[str]:
        """获取管理员名称"""
        if not admin_id:
            return "System Admin"
        result = self.client.table('admins').select('full_name').eq('id', admin_id).execute()
        return result.data[0]['full_name'] if result.data else "System Admin"
    
    async def get_admin_names_batch(self, admin_ids: List[str]) -> Dict[str, str]:
        """批量获取管理员名称"""
        if not admin_ids:
            return {}
        unique_ids = list(set(aid for aid in admin_ids if aid))
        if not unique_ids:
            return {}
        result = self.client.table('admins').select('id, full_name').in_('id', unique_ids).execute()
        return {a['id']: a['full_name'] for a in (result.data or [])}
    
    async def is_admin(self, user_id: str) -> bool:
        """检查用户是否是管理员"""
        if not user_id:
            return False
        result = self.client.table('admins').select('id').eq('id', user_id).execute()
        return len(result.data) > 0
    
    async def get_unread_count(self, user_id: str, is_admin: bool = False) -> int:
        """获取未读消息数量（线程内的消息 + 直接消息）"""
        if is_admin:
            # 管理员：统计线程内会员发送的未读消息 + 直接消息（系统通知）
            total_count = 0
            
            # 1. 线程内会员发送的未读消息
            thread_query = self.client.table('messages').select('id', count='exact')
            thread_query = thread_query.not_.is_('thread_id', 'null')
            thread_query = thread_query.eq('sender_type', self.SENDER_MEMBER)
            thread_query = thread_query.eq('is_read', False)
            thread_result = thread_query.execute()
            total_count += thread_result.count or 0
            
            # 2. 直接消息（发送给管理员的系统通知）
            direct_query = self.client.table('messages').select('id', count='exact')
            direct_query = direct_query.eq('message_type', self.TYPE_DIRECT)
            direct_query = direct_query.eq('recipient_id', user_id)
            direct_query = direct_query.eq('is_read', False)
            direct_result = direct_query.execute()
            total_count += direct_result.count or 0
            
            return total_count
        else:
            # 会员：统计线程内管理员回复 + 系统直接消息
            # 需要先获取该会员的所有线程ID
            threads_query = self.client.table('messages').select('id')
            threads_query = threads_query.eq('message_type', self.TYPE_THREAD)
            threads_query = threads_query.is_('thread_id', 'null')
            threads_query = threads_query.eq('sender_id', user_id)
            threads_result = threads_query.execute()
            thread_ids = [t['id'] for t in (threads_result.data or [])]
            
            # 统计未读消息
            total_count = 0
            
            # 1. 线程内管理员发送的未读消息
            if thread_ids:
                thread_query = self.client.table('messages').select('id', count='exact')
                thread_query = thread_query.in_('thread_id', thread_ids)
                thread_query = thread_query.eq('sender_type', self.SENDER_ADMIN)
                thread_query = thread_query.eq('is_read', False)
                thread_result = thread_query.execute()
                total_count += thread_result.count or 0
            
            # 2. 直接消息（系统通知）
            direct_query = self.client.table('messages').select('id', count='exact')
            direct_query = direct_query.eq('message_type', self.TYPE_DIRECT)
            direct_query = direct_query.eq('recipient_id', user_id)
            direct_query = direct_query.eq('is_read', False)
            direct_result = direct_query.execute()
            total_count += direct_result.count or 0
            
            return total_count
    
    async def get_threads_paginated(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        sender_id: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """获取分页的 thread 列表"""
        query = self.client.table('messages').select('*', count='exact')
        query = query.eq('message_type', self.TYPE_THREAD).is_('thread_id', 'null')
        
        if status:
            query = query.eq('status', status)
        if sender_id:
            query = query.eq('sender_id', sender_id)
        
        count_result = query.execute()
        total_count = count_result.count or 0
        
        offset = (page - 1) * page_size
        threads_query = self.client.table('messages').select('*')
        threads_query = threads_query.eq('message_type', self.TYPE_THREAD).is_('thread_id', 'null')
        
        if status:
            threads_query = threads_query.eq('status', status)
        if sender_id:
            threads_query = threads_query.eq('sender_id', sender_id)
        
        threads_query = threads_query.order('created_at', desc=True)
        threads_query = threads_query.range(offset, offset + page_size - 1)
        
        result = threads_query.execute()
        return result.data or [], total_count
    
    async def get_thread_stats_batch(self, thread_ids: List[str], for_admin: bool = False) -> Dict[str, Dict[str, int]]:
        """批量获取 thread 的消息统计"""
        if not thread_ids:
            return {}
        
        query = self.client.table('messages').select('thread_id, sender_type, is_read')
        query = query.in_('thread_id', thread_ids)
        result = query.execute()
        
        stats = {tid: {'message_count': 0, 'unread_count': 0} for tid in thread_ids}
        
        for msg in (result.data or []):
            tid = msg['thread_id']
            if tid in stats:
                stats[tid]['message_count'] += 1
                if not msg['is_read']:
                    if for_admin and msg['sender_type'] == self.SENDER_MEMBER:
                        stats[tid]['unread_count'] += 1
                    elif not for_admin and msg['sender_type'] == self.SENDER_ADMIN:
                        stats[tid]['unread_count'] += 1
        
        return stats

    async def get_thread_by_id(self, thread_id: str) -> Optional[Dict[str, Any]]:
        """获取单个 thread"""
        result = self.client.table('messages')\
            .select('*')\
            .eq('id', thread_id)\
            .eq('message_type', self.TYPE_THREAD)\
            .is_('thread_id', 'null')\
            .execute()
        return result.data[0] if result.data else None
    
    async def get_thread_messages_list(self, thread_id: str) -> List[Dict[str, Any]]:
        """获取 thread 下的所有消息（包含附件）"""
        result = self.client.table('messages')\
            .select('*')\
            .eq('thread_id', thread_id)\
            .order('created_at', desc=False)\
            .execute()
        
        messages = result.data or []
        if not messages:
            return messages
        
        for msg in messages:
            if msg.get('attachments') is None:
                msg['attachments'] = []
            elif not isinstance(msg.get('attachments'), list):
                msg['attachments'] = []
        
        return messages
    
    async def mark_thread_messages_as_read(
        self, 
        thread_id: str, 
        reader_type: str
    ) -> int:
        """标记 thread 中的消息为已读"""
        sender_type = self.SENDER_MEMBER if reader_type == 'admin' else self.SENDER_ADMIN
        
        result = self.client.table('messages')\
            .update({
                'is_read': True,
                'read_at': now_iso()
            })\
            .eq('thread_id', thread_id)\
            .eq('sender_type', sender_type)\
            .eq('is_read', False)\
            .execute()
        
        return len(result.data) if result.data else 0
    
    async def create_direct_message(
        self,
        sender_id: Optional[str],
        recipient_id: str,
        subject: str,
        content: str,
        category: str = "general",
        priority: str = "normal",
        sender_type: str = "member"
    ) -> Dict[str, Any]:
        """创建直接消息"""
        message_data = {
            "message_type": "direct",
            "sender_id": sender_id,
            "sender_type": sender_type,
            "recipient_id": recipient_id,
            "subject": subject,
            "content": content,
            "category": category,
            "priority": priority,
            "status": "sent",
            "is_read": False,
            "is_important": priority in ["high", "urgent"],
            "is_broadcast": False,
            "sent_at": now_iso(),
        }
        return await self.create_message(message_data)
    
    async def get_direct_messages_for_user(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        is_read: Optional[bool] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """获取用户的直接消息"""
        filters = {
            "message_type": "direct",
            "recipient_id": user_id
        }
        if is_read is not None:
            filters["is_read"] = is_read
        
        total = await self.count_records('messages', filters)
        
        query = self.client.table('messages').select('*')
        
        for key, value in filters.items():
            query = query.eq(key, value)
        
        query = query.order('created_at', desc=True)\
                    .range(offset, offset + limit - 1)
        
        result = query.execute()
        return result.data or [], total
    
    async def mark_message_as_read(self, message_id: str, user_id: str) -> Dict[str, Any]:
        """标记消息为已读"""
        update_data = {
            "is_read": True,
            "read_at": now_iso()
        }
        
        message = await self.get_message_by_id(message_id)
        if not message or message.get("recipient_id") != user_id:
            raise ValueError("Message not found or access denied")
        
        return await self.update_message(message_id, update_data)
    
    async def get_unread_count_for_user(self, user_id: str) -> int:
        """获取用户未读消息数量"""
        filters = {
            "recipient_id": user_id,
            "is_read": False
        }
        return await self.count_records('messages', filters)

    async def create_thread_message(
        self,
        thread_id: str,
        sender_id: Optional[str],
        recipient_id: str,
        subject: str,
        content: str,
        parent_id: Optional[str] = None,
        sender_type: str = "member"
    ) -> Dict[str, Any]:
        """创建线程消息"""
        message_data = {
            "message_type": "thread",
            "thread_id": thread_id,
            "parent_id": parent_id,
            "sender_id": sender_id,
            "sender_type": sender_type,
            "recipient_id": recipient_id,
            "subject": subject,
            "content": content,
            "category": "thread",
            "status": "sent",
            "is_read": False,
            "is_broadcast": False,
            "sent_at": now_iso(),
        }
        return await self.create_message(message_data)
    
    async def get_thread_messages(
        self,
        thread_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        """获取线程中的所有消息"""
        filters = {
            "message_type": "thread",
            "thread_id": thread_id
        }
        
        total = await self.count_records('messages', filters)
        
        query = self.client.table('messages').select('*')
        
        for key, value in filters.items():
            query = query.eq(key, value)
        
        query = query.order('created_at', desc=False)\
                    .range(offset, offset + limit - 1)
        
        result = query.execute()
        return result.data or [], total
    
    async def create_broadcast_message(
        self,
        sender_id: Optional[str],
        subject: str,
        content: str,
        category: str = "announcement",
        priority: str = "normal",
        sender_type: str = "admin"
    ) -> Dict[str, Any]:
        """创建广播消息模板"""
        message_data = {
            "message_type": "broadcast",
            "sender_id": sender_id,
            "sender_type": sender_type,
            "subject": subject,
            "content": content,
            "category": category,
            "priority": priority,
            "status": "sent",
            "is_read": False,
            "is_important": priority in ["high", "urgent"],
            "is_broadcast": True,
            "broadcast_count": 0,
            "sent_at": now_iso(),
        }
        return await self.create_message(message_data)
    
    async def send_broadcast_to_recipients(
        self,
        broadcast_template_id: str,
        recipient_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """向多个接收者发送广播消息"""
        template = await self.get_message_by_id(broadcast_template_id)
        if not template or template.get("message_type") != "broadcast":
            raise ValueError("Invalid broadcast template")
        
        created_messages = []
        for recipient_id in recipient_ids:
            message_data = {
                "message_type": "broadcast",
                "thread_id": broadcast_template_id,
                "sender_id": template["sender_id"],
                "sender_type": template["sender_type"],
                "recipient_id": recipient_id,
                "subject": template["subject"],
                "content": template["content"],
                "category": template["category"],
                "priority": template["priority"],
                "status": "sent",
                "is_read": False,
                "is_important": template["is_important"],
                "is_broadcast": True,
                "sent_at": now_iso(),
            }
            
            created_message = await self.create_message(message_data)
            created_messages.append(created_message)
        
        await self.update_message(broadcast_template_id, {
            "broadcast_count": len(recipient_ids)
        })
        
        return created_messages
    
    async def get_broadcast_messages(
        self,
        limit: int = 20,
        offset: int = 0,
        category: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """获取广播消息模板列表"""
        query = self.client.table('messages').select('*', count='exact')
        query = query.eq('message_type', 'broadcast').is_('recipient_id', 'null')
        
        if category:
            query = query.eq('category', category)
        
        count_result = query.execute()
        total = count_result.count or 0
        
        data_query = self.client.table('messages').select('*')
        data_query = data_query.eq('message_type', 'broadcast').is_('recipient_id', 'null')
        
        if category:
            data_query = data_query.eq('category', category)
        
        data_query = data_query.order('created_at', desc=True).range(offset, offset + limit - 1)
        
        result = data_query.execute()
        return result.data or [], total

    async def get_messages_paginated(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        is_important: Optional[bool] = None,
        is_read: Optional[bool] = None,
        message_type: Optional[str] = None,
        is_admin: bool = False
    ) -> Tuple[List[Dict[str, Any]], int, int]:
        """获取用户消息列表（分页）"""
        query = self.client.table('messages').select('*', count='exact')
        
        if is_admin:
            query = query.eq('message_type', 'direct')
            query = query.eq('recipient_id', user_id)
        else:
            query = query.eq('recipient_id', user_id)
        
        if message_type:
            query = query.eq('message_type', message_type)
        if category:
            query = query.eq('category', category)
        if is_important is not None:
            query = query.eq('is_important', is_important)
        if is_read is not None:
            query = query.eq('is_read', is_read)
        
        count_result = query.execute()
        total_count = count_result.count or 0
        
        unread_query = self.client.table('messages').select('id', count='exact')
        if is_admin:
            unread_query = unread_query.eq('message_type', 'direct').eq('is_read', False)
            unread_query = unread_query.eq('recipient_id', user_id)
        else:
            unread_query = unread_query.eq('recipient_id', user_id).eq('is_read', False)
        
        if message_type:
            unread_query = unread_query.eq('message_type', message_type)
        if category:
            unread_query = unread_query.eq('category', category)
        if is_important is not None:
            unread_query = unread_query.eq('is_important', is_important)
        
        unread_result = unread_query.execute()
        unread_count = unread_result.count or 0
        
        offset = (page - 1) * page_size
        messages_query = self.client.table('messages').select('*')
        
        if is_admin:
            messages_query = messages_query.eq('message_type', 'direct')
            messages_query = messages_query.eq('recipient_id', user_id)
        else:
            messages_query = messages_query.eq('recipient_id', user_id)
        
        if message_type:
            messages_query = messages_query.eq('message_type', message_type)
        if category:
            messages_query = messages_query.eq('category', category)
        if is_important is not None:
            messages_query = messages_query.eq('is_important', is_important)
        if is_read is not None:
            messages_query = messages_query.eq('is_read', is_read)
        
        messages_query = messages_query.order('created_at', desc=True)
        messages_query = messages_query.range(offset, offset + page_size - 1)
        
        result = messages_query.execute()
        return result.data or [], total_count, unread_count
    
    async def get_message_with_access_check(
        self,
        message_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """获取消息并检查访问权限"""
        result = self.client.table('messages').select('*').eq('id', message_id).execute()
        
        if not result.data:
            return None
        
        message = result.data[0]
        
        if message.get('sender_id') != user_id and message.get('recipient_id') != user_id:
            return None
        
        return message
    
    async def mark_as_read(self, message_id: str) -> Dict[str, Any]:
        """标记消息为已读"""
        update_data = {
            'is_read': True,
            'read_at': now_iso()
        }
        result = self.client.table('messages').update(update_data).eq('id', message_id).execute()
        return result.data[0] if result.data else {}
    
    async def soft_delete_message(self, message_id: str) -> bool:
        """软删除消息"""
        self.client.table('messages')\
            .update({'deleted_at': now_iso()})\
            .eq('id', message_id)\
            .execute()
        return True
    
    async def insert_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """插入消息"""
        result = self.client.table('messages').insert(message_data).execute()
        return result.data[0] if result.data else None
    
    async def insert_messages_batch(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """批量插入消息"""
        if not messages:
            return []
        result = self.client.table('messages').insert(messages).execute()
        return result.data or []
    
    async def update_thread_status(self, thread_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新 thread 状态"""
        result = self.client.table('messages')\
            .update(update_data)\
            .eq('id', thread_id)\
            .eq('message_type', self.TYPE_THREAD)\
            .execute()
        return result.data[0] if result.data else None
    
    async def get_active_member_ids(self) -> List[str]:
        """获取所有活跃会员ID"""
        result = self.client.table('members').select('id').eq('status', 'active').execute()
        return [m['id'] for m in (result.data or [])]
    
    async def get_analytics_data(self, start_date: Optional[str] = None) -> Dict[str, Any]:
        """获取分析数据"""
        from datetime import datetime as dt
        
        total_query = self.client.table('messages').select('id', count='exact')
        if start_date:
            total_query = total_query.gte('created_at', start_date)
        total_result = total_query.execute()
        
        unread_query = self.client.table('messages').select('id', count='exact').eq('is_read', False)
        if start_date:
            unread_query = unread_query.gte('created_at', start_date)
        unread_result = unread_query.execute()
        
        messages_by_day = []
        messages_by_category = []
        response_time_by_day = []
        avg_response_time = 0.0
        
        messages_query = self.client.table('messages').select('created_at, category, thread_id, sender_type')
        if start_date:
            messages_query = messages_query.gte('created_at', start_date)
        messages_result = messages_query.execute()
        
        if messages_result.data:
            day_counts = {}
            category_counts = {}
            
            thread_messages = {}
            
            for msg in messages_result.data:
                if msg.get('created_at'):
                    day = msg['created_at'][:10]
                    day_counts[day] = day_counts.get(day, 0) + 1
                
                category = msg.get('category') or 'general'
                category_counts[category] = category_counts.get(category, 0) + 1
                
                thread_id = msg.get('thread_id')
                if thread_id:
                    if thread_id not in thread_messages:
                        thread_messages[thread_id] = []
                    thread_messages[thread_id].append(msg)
            
            messages_by_day = [
                {'date': day, 'count': count}
                for day, count in sorted(day_counts.items())
            ]
            messages_by_category = [
                {'category': cat, 'count': count}
                for cat, count in category_counts.items()
            ]
            
            response_times = []
            day_response_times = {}
            
            for thread_id, msgs in thread_messages.items():
                sorted_msgs = sorted(msgs, key=lambda x: x.get('created_at', ''))
                
                first_member_msg = None
                first_admin_reply = None
                
                for msg in sorted_msgs:
                    sender_type = msg.get('sender_type')
                    if sender_type == 'member' and first_member_msg is None:
                        first_member_msg = msg
                    elif sender_type == 'admin' and first_member_msg and first_admin_reply is None:
                        first_admin_reply = msg
                        break
                
                if first_member_msg and first_admin_reply:
                    try:
                        created_at = first_member_msg['created_at']
                        replied_at = first_admin_reply['created_at']
                        created = dt.fromisoformat(created_at.replace('Z', '+00:00'))
                        replied = dt.fromisoformat(replied_at.replace('Z', '+00:00'))
                        response_minutes = (replied - created).total_seconds() / 60
                        
                        if response_minutes >= 0:
                            response_times.append(response_minutes)
                            day = created_at[:10]
                            if day not in day_response_times:
                                day_response_times[day] = []
                            day_response_times[day].append(response_minutes)
                    except (ValueError, TypeError):
                        pass
            
            if response_times:
                avg_response_time = sum(response_times) / len(response_times)
            
            response_time_by_day = [
                {'date': day, 'responseTime': round(sum(times) / len(times), 1)}
                for day, times in sorted(day_response_times.items())
            ]
        
        return {
            'total_messages': total_result.count or 0,
            'unread_messages': unread_result.count or 0,
            'messages_by_day': messages_by_day,
            'messages_by_category': messages_by_category,
            'response_time': round(avg_response_time, 1),
            'response_time_by_day': response_time_by_day,
        }


message_db_service = MessageService()
