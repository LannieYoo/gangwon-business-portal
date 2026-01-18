import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from supabase import Client
from .client import get_supabase_client, get_unified_supabase_client

logger = logging.getLogger(__name__)


class SupabaseService:
    """统一的 Supabase 服务类，提供通用数据库操作方法"""
    
    def __init__(self):
        self.client = get_unified_supabase_client()
        self._raw_client: Client = get_supabase_client()

    async def get_by_id(self, table: str, id: str) -> Optional[Dict[str, Any]]:
        """根据 ID 获取单条记录"""
        result = self.client.table(table)\
            .select('*')\
            .eq('id', id)\
            .execute()
        
        return result.data[0] if result.data else None

    async def create_record(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新记录"""
        result = self.client.table(table)\
            .insert(data)\
            .execute()
        
        if not result.data:
            raise ValueError(f"Failed to create record in {table}")
        return result.data[0]

    async def update_record(self, table: str, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """更新记录"""
        result = self.client.table(table)\
            .update(data)\
            .eq('id', id)\
            .execute()
        
        if not result.data:
            raise ValueError(f"Failed to update record {id} in {table}")
        return result.data[0]

    async def delete_record(self, table: str, id: str) -> bool:
        """软删除记录（设置 deleted_at）"""
        result = self.client.table(table)\
            .update({'deleted_at': datetime.now(timezone.utc).isoformat()})\
            .eq('id', id)\
            .execute()
        
        return bool(result.data)

    async def hard_delete_record(self, table: str, id: str) -> bool:
        """硬删除记录"""
        self.client.table(table)\
            .delete()\
            .eq('id', id)\
            .execute()
        
        return True

    async def list_with_pagination(
        self, 
        table: str, 
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1, 
        page_size: int = 20,
        order_by: str = 'created_at',
        order_desc: bool = True,
        exclude_deleted: bool = True
    ) -> Tuple[List[Dict[str, Any]], int]:
        """分页查询记录列表"""
        count_filters = filters.copy() if filters else {}
        if exclude_deleted:
            count_filters['deleted_at'] = None
        
        total = await self.count_records(table, count_filters)
        
        query = self.client.table(table).select('*')
        
        if filters:
            for key, value in filters.items():
                if value is not None:
                    query = query.eq(key, value)
        
        if exclude_deleted:
            query = query.is_('deleted_at', 'null')
        
        query = query.order(order_by, desc=order_desc)
        
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        result = query.execute()
        records = result.data or []
        
        if table == 'projects':
            for record in records:
                app_count_result = self.client.table('project_applications')\
                    .select('*', count='exact')\
                    .eq('project_id', record['id'])\
                    .is_('deleted_at', 'null')\
                    .execute()
                record['applications_count'] = app_count_result.count or 0
        
        return records, total

    async def count_records(self, table: str, filters: Optional[Dict[str, Any]] = None) -> int:
        """统计记录数量"""
        query = self.client.table(table).select('*', count='exact')
        
        if filters:
            for key, value in filters.items():
                if value is not None:
                    if key == 'deleted_at' and value is None:
                        query = query.is_('deleted_at', 'null')
                    else:
                        query = query.eq(key, value)
        
        result = query.execute()
        return result.count or 0

    async def exists(self, table: str, filters: Dict[str, Any]) -> bool:
        """检查记录是否存在"""
        query = self.client.table(table).select('id')
        
        for key, value in filters.items():
            if value is not None:
                query = query.eq(key, value)
        
        query = query.limit(1)
        result = query.execute()
        
        return bool(result.data)

    async def get_member_by_business_number(self, business_number: str) -> Optional[Dict[str, Any]]:
        """根据事业者登录번호获取会员"""
        normalized_number = business_number.replace('-', '').replace(' ', '')
        
        result = self.client.table('members')\
            .select('*')\
            .eq('business_number', normalized_number)\
            .is_('deleted_at', 'null')\
            .execute()
        
        return result.data[0] if result.data else None

    async def get_member_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """根据邮箱获取会员"""
        result = self.client.table('members')\
            .select('*')\
            .eq('email', email)\
            .is_('deleted_at', 'null')\
            .execute()
        
        return result.data[0] if result.data else None

    async def get_member_by_reset_token(self, token: str) -> Optional[Dict[str, Any]]:
        """根据重置令牌获取会员"""
        result = self.client.table('members')\
            .select('*')\
            .eq('reset_token', token)\
            .is_('deleted_at', 'null')\
            .execute()
        
        return result.data[0] if result.data else None

    async def check_email_uniqueness(self, email: str, exclude_member_id: Optional[str] = None) -> bool:
        """检查邮箱是否已被使用"""
        query = self.client.table('members')\
            .select('id')\
            .eq('email', email)\
            .is_('deleted_at', 'null')
        
        if exclude_member_id:
            query = query.neq('id', exclude_member_id)
        
        result = query.execute()
        return len(result.data) == 0

    async def get_approved_members_count(self) -> int:
        """获取已批准会员总数"""
        result = self.client.table('members')\
            .select('*', count='exact')\
            .eq('approval_status', 'approved')\
            .is_('deleted_at', 'null')\
            .execute()
        
        return result.count or 0

    async def get_admin_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """根据邮箱获取管理员"""
        result = self.client.table('admins')\
            .select('*')\
            .eq('email', email)\
            .execute()
        
        return result.data[0] if result.data else None

    async def get_member_profile(self, member_id: str) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """获取会员及其档案信息（member_profiles 表已合并到 members 表）"""
        member = await self.get_by_id('members', member_id)
        if not member:
            return None, None
        
        profile_fields = [
            'industry', 'revenue', 'employee_count', 'founding_date',
            'region', 'address', 'representative', 'representative_birth_date',
            'representative_gender', 'legal_number', 'phone', 'website', 'logo_url',
            'contact_person_name', 'contact_person_department', 'contact_person_position',
            'main_business', 'description', 'cooperation_fields',
            'startup_type', 'ksic_major', 'ksic_sub', 'category',
            'participation_programs', 'investment_status'
        ]
        profile = {k: member.get(k) for k in profile_fields if k in member}
        profile['member_id'] = member_id
        
        return member, profile if profile else None

    async def update_member_profile(self, member_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新会员档案信息（member_profiles 表已合并到 members 表）"""
        update_data = {k: v for k, v in profile_data.items() if k != 'member_id'}
        
        result = self.client.table('members')\
            .update(update_data)\
            .eq('id', member_id)\
            .execute()
        
        return result.data[0] if result.data else None

    async def list_members_with_filters(self, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        """查询会员列表（支持高级过滤和搜索）"""
        search = kwargs.get('search')
        approval_status = kwargs.get('approval_status')
        region = kwargs.get('region')
        sort_by = kwargs.get('sort_by', 'created_at')
        sort_order = kwargs.get('sort_order', 'desc')
        
        query = self.client.table('members').select('*')
        
        if approval_status:
            query = query.eq('approval_status', approval_status)
        if region:
            query = query.eq('region', region)
        
        if search:
            query = query.or_(f'company_name.ilike.%{search}%,business_number.ilike.%{search}%')
        
        query = query.is_('deleted_at', 'null')
        
        query = query.order(sort_by, desc=(sort_order == 'desc'))
        
        result = query.execute()
        
        count_result = self.client.table('members')\
            .select('*', count='exact')\
            .is_('deleted_at', 'null')\
            .execute()
        
        return result.data or [], count_result.count or 0

    async def list_performance_records_with_filters(self, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        """查询绩效记录列表（支持高级过滤）"""
        sort_by = kwargs.get('sort_by', 'created_at')
        sort_order = kwargs.get('sort_order', 'desc')
        
        query = self.client.table('performance_records')\
            .select('*, members!performance_records_member_id_fkey(company_name, business_number)')\
            .is_('deleted_at', 'null')\
            .order(sort_by, desc=(sort_order == 'desc'))
        
        result = query.execute()
        
        records = []
        for record in (result.data or []):
            member_info = record.pop('members', None) or {}
            record['member_company_name'] = member_info.get('company_name', '')
            record['member_business_number'] = member_info.get('business_number', '')
            records.append(record)
        
        count_result = self.client.table('performance_records')\
            .select('*', count='exact')\
            .is_('deleted_at', 'null')\
            .execute()
        
        return records, count_result.count or 0

    async def list_projects_with_filters(self, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        """查询项目列表（支持高级过滤）"""
        sort_by = kwargs.get('sort_by', 'created_at')
        sort_order = kwargs.get('sort_order', 'desc')
        
        query = self.client.table('projects')\
            .select('*')\
            .is_('deleted_at', 'null')\
            .order(sort_by, desc=(sort_order == 'desc'))
        
        result = query.execute()
        projects = result.data or []
        
        if projects:
            project_ids = [p['id'] for p in projects]
            app_counts_result = self.client.table('project_applications')\
                .select('project_id')\
                .in_('project_id', project_ids)\
                .is_('deleted_at', 'null')\
                .execute()
            
            app_counts = {}
            for app in (app_counts_result.data or []):
                pid = app['project_id']
                app_counts[pid] = app_counts.get(pid, 0) + 1
            
            for project in projects:
                project['applications_count'] = app_counts.get(project['id'], 0)
        
        count_result = self.client.table('projects')\
            .select('*', count='exact')\
            .is_('deleted_at', 'null')\
            .execute()
        
        return projects, count_result.count or 0

    async def list_project_applications_with_filters(self, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        """查询项目申请列表（支持高级过滤）"""
        sort_by = kwargs.get('sort_by', 'submitted_at')
        sort_order = kwargs.get('sort_order', 'desc')
        project_id = kwargs.get('project_id')
        
        query = self.client.table('project_applications')\
            .select('*, projects(title), members(company_name, business_number)')
        
        if project_id:
            query = query.eq('project_id', project_id)
        
        query = query.order(sort_by, desc=(sort_order == 'desc'))
        
        result = query.execute()
        
        count_query = self.client.table('project_applications')\
            .select('*', count='exact')
        
        if project_id:
            count_query = count_query.eq('project_id', project_id)
        
        count_result = count_query.execute()
        
        return result.data or [], count_result.count or 0

    async def list_member_applications_with_filters(self, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        """查询会员的项目申请列表（支持搜索）"""
        sort_by = kwargs.get('sort_by', 'submitted_at')
        sort_order = kwargs.get('sort_order', 'desc')
        member_id = kwargs.get('member_id')
        search = kwargs.get('search')
        
        query = self.client.table('project_applications')\
            .select('*, projects(title), members(company_name, business_number)')\
            .is_('deleted_at', 'null')
        
        if member_id:
            query = query.eq('member_id', member_id)
        
        query = query.order(sort_by, desc=(sort_order == 'desc'))
        
        result = query.execute()
        
        data = result.data or []
        if search:
            search_lower = search.lower()
            data = [
                app for app in data 
                if app.get('projects', {}).get('title', '').lower().find(search_lower) >= 0
            ]
        
        return data, len(data)

    async def get_performance_records(self, **kwargs) -> List[Dict[str, Any]]:
        """获取绩效记录（用于仪表板）"""
        year = kwargs.get('year')
        quarter = kwargs.get('quarter')
        status = kwargs.get('status', 'approved')
        
        query = self.client.table('performance_records')\
            .select('*')\
            .eq('status', status)\
            .is_('deleted_at', 'null')
        
        if year:
            query = query.eq('year', year)
        if quarter:
            query = query.eq('quarter', quarter)
        
        result = query.execute()
        return result.data or []

    async def get_performance_records_for_chart(self, **kwargs) -> List[Dict[str, Any]]:
        """获取绩效记录（用于图表数据生成）"""
        year_filter = kwargs.get('year_filter')
        
        query = self.client.table('performance_records')\
            .select('*')\
            .eq('status', 'approved')\
            .is_('deleted_at', 'null')
        
        if year_filter:
            query = query.eq('year', year_filter)
        
        result = query.execute()
        return result.data or []

    async def export_performance_records(self, **kwargs) -> List[Dict[str, Any]]:
        """导出绩效记录"""
        query = self.client.table('performance_records')\
            .select('*')\
            .is_('deleted_at', 'null')\
            .order('created_at', desc=True)
        
        member_id = kwargs.get('member_id')
        year = kwargs.get('year')
        quarter = kwargs.get('quarter')
        status = kwargs.get('status')
        type_filter = kwargs.get('type')
        
        if member_id:
            query = query.eq('member_id', member_id)
        if year:
            query = query.eq('year', year)
        if quarter:
            query = query.eq('quarter', quarter)
        if status:
            query = query.eq('status', status)
        if type_filter:
            query = query.eq('type', type_filter)
        
        result = query.execute()
        return result.data or []

    async def export_projects(self, **kwargs) -> List[Dict[str, Any]]:
        """导出项目"""
        query = self.client.table('projects')\
            .select('*')\
            .is_('deleted_at', 'null')\
            .order('created_at', desc=True)
        
        status = kwargs.get('status')
        search = kwargs.get('search')
        
        if status:
            query = query.eq('status', status)
        if search:
            query = query.ilike('title', f'%{search}%')
        
        result = query.execute()
        return result.data or []

    async def export_project_applications(self, **kwargs) -> List[Dict[str, Any]]:
        """导出项目申请"""
        query = self.client.table('project_applications')\
            .select('*')\
            .is_('deleted_at', 'null')\
            .order('submitted_at', desc=True)
        
        project_id = kwargs.get('project_id')
        status = kwargs.get('status')
        
        if project_id:
            query = query.eq('project_id', project_id)
        if status:
            query = query.eq('status', status)
        
        result = query.execute()
        return result.data or []


supabase_service = SupabaseService()

__all__ = ['supabase_service', 'SupabaseService']
