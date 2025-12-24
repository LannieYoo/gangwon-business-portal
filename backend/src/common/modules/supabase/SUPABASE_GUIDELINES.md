# Supabase 模块规范

## 目录结构

```
supabase/
├── __init__.py           # 模块入口
├── client.py             # Supabase 客户端
├── service.py            # 统一服务（推荐使用）
├── message_service.py    # 消息数据访问服务
├── SUPABASE_GUIDELINES.md
└── SUPABASE_PYTHON_API.md
```

## 推荐使用方式

### 1. 统一服务 + Helper Methods（推荐）

```python
from ...common.modules.supabase.service import supabase_service

class MemberService:
    """业务模块使用 supabase_service 的 helper methods 进行数据库操作"""
    
    async def get_member_profile(self, member_id: str) -> dict:
        # 简单操作 - 使用 helper methods
        member = await supabase_service.get_by_id('members', member_id)
        if not member:
            raise NotFoundError("Member")
        return member
    
    async def create_member(self, member_data: dict) -> dict:
        # 简单创建 - 使用 helper methods
        return await supabase_service.create_record('members', member_data)
    
    async def update_member(self, member_id: str, update_data: dict) -> dict:
        # 简单更新 - 使用 helper methods
        return await supabase_service.update_record('members', member_id, update_data)
    
    async def delete_member(self, member_id: str) -> bool:
        # 软删除 - 使用 helper methods
        return await supabase_service.delete_record('members', member_id)
    
    async def list_members_with_filters(self, **kwargs):
        # 复杂查询 - 使用直接客户端
        query = supabase_service.client.table('members').select('*')
        
        # 应用复杂过滤条件
        if kwargs.get('search'):
            query = query.or_(f'company_name.ilike.%{kwargs["search"]}%,business_number.ilike.%{kwargs["search"]}%')
        
        if kwargs.get('approval_status'):
            query = query.eq('approval_status', kwargs['approval_status'])
        
        # 排除软删除
        query = query.is_('deleted_at', 'null')
        
        # 排序和分页
        query = query.order('created_at', desc=True)
        
        result = query.execute()
        return result.data or []
```

### 2. 专用数据访问服务（复杂业务场景）

```python
# 数据访问层 - common/modules/supabase/message_service.py
class MessageService(SupabaseService):
    """专用的消息数据访问服务，处理复杂的消息相关数据库操作"""
    
    async def get_threads_paginated(self, page: int, page_size: int, **filters):
        # 复杂的分页查询逻辑
        query = self.client.table('messages').select('*', count='exact')
        # ... 复杂查询逻辑
        return result.data, result.count
    
    async def get_thread_stats_batch(self, thread_ids: List[str]):
        # 批量统计查询
        # ... 复杂聚合逻辑
        return stats

# 业务逻辑层 - modules/messages/service.py  
class MessageService:
    """消息业务逻辑服务，调用数据访问层并处理业务规则"""
    
    def __init__(self):
        self.db = message_db_service  # 使用专用数据访问服务
    
    async def create_thread(self, data: ThreadCreate, member_id: UUID) -> dict:
        # 业务逻辑处理
        thread_data = {
            "id": str(uuid4()),
            "sender_id": str(member_id),
            "subject": data.subject,
            # ... 业务数据处理
        }
        
        # 调用数据访问层
        thread = await self.db.insert_message(thread_data)
        
        # 后续业务处理（如发送通知等）
        return thread
```

## supabase_service 提供的 Helper Methods

```python
class SupabaseService:
    """统一的 Supabase 服务，提供通用的数据库操作方法"""
    
    # 基础 CRUD 操作
    async def get_by_id(self, table: str, id: str) -> Optional[dict]:
        """通用的根据ID查询"""
        
    async def create_record(self, table: str, data: dict) -> dict:
        """通用的创建记录"""
        
    async def update_record(self, table: str, id: str, data: dict) -> dict:
        """通用的更新记录"""
        
    async def delete_record(self, table: str, id: str) -> bool:
        """通用的删除记录（软删除）"""
    
    async def hard_delete_record(self, table: str, id: str) -> bool:
        """通用的硬删除记录"""
    
    # 查询辅助方法
    async def list_with_pagination(
        self, 
        table: str, 
        filters: dict = None,
        page: int = 1, 
        page_size: int = 20,
        order_by: str = 'created_at',
        order_desc: bool = True,
        exclude_deleted: bool = True
    ) -> Tuple[List[dict], int]:
        """通用的分页查询"""
        
    async def count_records(self, table: str, filters: dict = None) -> int:
        """通用的记录计数"""
        
    async def exists(self, table: str, filters: dict) -> bool:
        """检查记录是否存在"""
    
    # 向后兼容的业务方法
    async def get_member_by_business_number(self, business_number: str) -> Optional[dict]:
        """业务特定的查询方法"""
        
    async def get_member_by_email(self, email: str) -> Optional[dict]:
        """业务特定的查询方法"""
```

## 设计原则

1. **简单直接**：业务模块优先使用 `supabase_service` 的 helper methods
2. **避免重复**：通过 helper methods 减少重复的 CRUD 代码
3. **分层清晰**：复杂业务场景使用专用数据访问服务 + 业务逻辑服务
4. **职责分离**：数据访问层专注数据库操作，业务逻辑层专注业务规则
5. **易于维护**：减少抽象层，代码更容易理解和修改

## 使用指南

### 何时使用 Helper Methods

✅ **适合使用 helper methods 的场景**：
- 简单的 CRUD 操作
- 基础的查询和过滤
- 标准的分页查询
- 记录存在性检查

```python
# ✅ 推荐：使用 helper methods
member = await supabase_service.get_by_id('members', member_id)
new_member = await supabase_service.create_record('members', member_data)
updated_member = await supabase_service.update_record('members', member_id, update_data)
await supabase_service.delete_record('members', member_id)
```

### 何时使用直接客户端

✅ **适合使用直接客户端的场景**：
- 复杂的联表查询
- 聚合和统计查询
- 自定义排序和过滤
- 批量操作

```python
# ✅ 推荐：复杂查询使用直接客户端
result = supabase_service.client.table('performance_records')\
    .select('*, members(company_name)')\
    .eq('status', 'approved')\
    .gte('created_at', start_date)\
    .lte('created_at', end_date)\
    .order('created_at', desc=True)\
    .execute()
```

### 何时创建专用数据访问服务

✅ **适合创建专用服务的场景**：
- 业务逻辑复杂，需要多个数据库操作
- 需要复杂的数据转换和聚合
- 有特殊的性能优化需求
- 需要批量操作和事务处理

```python
# ✅ 推荐：复杂业务创建专用服务
class MessageService(SupabaseService):
    """专用的消息数据访问服务"""
    
    async def get_threads_with_stats(self, user_id: str, **filters):
        # 复杂的多表查询和统计逻辑
        pass
```

## 常用查询模式

### 基础查询

```python
# 根据ID查询
member = await supabase_service.get_by_id('members', member_id)

# 条件查询
result = supabase_service.client.table('members')\
    .select('*')\
    .eq('status', 'active')\
    .execute()

# 分页查询
members, total = await supabase_service.list_with_pagination(
    table='members',
    filters={'status': 'active'},
    page=1,
    page_size=20
)
```

### 软删除

```python
# 所有删除操作都是软删除（设置 deleted_at）
await supabase_service.delete_record('members', member_id)

# 查询时自动过滤软删除的记录（helper methods 自动处理）
members, total = await supabase_service.list_with_pagination(
    table='members',
    exclude_deleted=True  # 默认为 True
)

# 直接查询时需要手动过滤
result = supabase_service.client.table('members')\
    .select('*')\
    .is_('deleted_at', 'null')\
    .execute()
```

### 复杂查询

```python
# 对于复杂的业务查询，直接使用 client
result = supabase_service.client.table('performance_records')\
    .select('*, members(company_name)')\
    .eq('status', 'approved')\
    .gte('created_at', start_date)\
    .lte('created_at', end_date)\
    .order('created_at', desc=True)\
    .execute()
```

## 架构层次

```
业务模块 (modules/*/service.py)
    ↓ 使用
统一服务 (supabase/service.py) - Helper Methods + 直接客户端
    ↓ 继承
专用数据访问服务 (supabase/message_service.py) - 复杂数据操作
    ↓ 使用
Supabase 客户端 (supabase/client.py)
```

## 注意事项

1. **优先使用 helper methods**：减少重复代码，提高一致性
2. **复杂查询使用直接客户端**：保持灵活性和性能
3. **专用服务用于复杂场景**：如消息系统等需要复杂数据操作的业务
4. **所有服务方法都是异步的**：需要使用 `await`
5. **删除操作默认为软删除**：使用 `delete_record` 进行软删除
6. **查询结果需要处理 None 值**：数据库查询可能返回空结果
7. **错误处理要完善**：数据库操作可能失败，需要适当的异常处理

## 迁移指南

### 从旧的专用服务迁移

```python
# ❌ 旧方式：使用专用服务
from ...common.modules.supabase import get_member_service
member_service = get_member_service()
member = await member_service.get_member_by_id(member_id)

# ✅ 新方式：使用 helper methods
from ...common.modules.supabase.service import supabase_service
member = await supabase_service.get_by_id('members', member_id)
```

### 保持向后兼容

```python
# ✅ 现有的业务方法仍然可用
member = await supabase_service.get_member_by_business_number(business_number)
admin = await supabase_service.get_admin_by_email(email)
```
