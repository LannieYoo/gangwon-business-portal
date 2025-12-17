"""
Supabase Service Layer
提供常用的数据库操作方法
"""
from typing import List, Dict, Any, Optional
from uuid import uuid4
from supabase import Client

from .client import get_supabase_client


class SupabaseService:
    """Supabase 服务类"""
    
    def __init__(self):
        self.client: Client = get_supabase_client()
    
    # ============================================================================
    # 通用查询方法
    # ============================================================================
    
    async def count_records(self, table_name: str, filters: Optional[Dict[str, Any]] = None) -> int:
        """统计记录数"""
        query = self.client.table(table_name).select('*', count='exact')
        
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        result = query.execute()
        return result.count or 0
    
    async def execute_raw_query(self, query: str) -> List[Dict[str, Any]]:
        """执行原始SQL查询（通过RPC）"""
        # 注意：这需要在 Supabase 中创建相应的 RPC 函数
        result = self.client.rpc('execute_sql', {'query': query}).execute()
        return result.data
    
    # ============================================================================
    # Members 相关操作
    # ============================================================================
    
    async def get_members(self, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """获取会员列表"""
        result = self.client.table('members')\
            .select('*')\
            .range(offset, offset + limit - 1)\
            .execute()
        return result.data
    
    async def get_member_by_id(self, member_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取会员"""
        result = self.client.table('members')\
            .select('*')\
            .eq('id', member_id)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def create_member(self, member_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新会员"""
        result = self.client.table('members')\
            .insert(member_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create member: no data returned")
        return result.data[0]
    
    async def update_member(self, member_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新会员信息"""
        result = self.client.table('members')\
            .update(update_data)\
            .eq('id', member_id)\
            .execute()
        if not result.data:
            raise ValueError(f"Failed to update member {member_id}: no data returned")
        return result.data[0]
    
    async def delete_member(self, member_id: str) -> bool:
        """删除会员"""
        self.client.table('members')\
            .delete()\
            .eq('id', member_id)\
            .execute()
        return True
    
    async def get_member_by_business_number(self, business_number: str) -> Optional[Dict[str, Any]]:
        """根据事业者登录번호获取会员"""
        # 标准化事业者登录번호（移除破折号和空格）
        normalized = business_number.replace("-", "").replace(" ", "")
        
        # 查询时也标准化数据库中的值进行比较
        result = self.client.table('members')\
            .select('*')\
            .execute()
        
        # 在客户端进行标准化比较
        for member in result.data or []:
            db_normalized = member.get('business_number', '').replace("-", "").replace(" ", "")
            if db_normalized == normalized:
                return member
        return None
    
    async def get_member_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """根据邮箱获取会员"""
        result = self.client.table('members')\
            .select('*')\
            .eq('email', email)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def get_member_by_reset_token(self, token: str) -> Optional[Dict[str, Any]]:
        """根据重置令牌获取会员"""
        result = self.client.table('members')\
            .select('*')\
            .eq('reset_token', token)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def check_email_uniqueness(self, email: str, exclude_member_id: Optional[str] = None) -> bool:
        """检查邮箱是否已被使用"""
        query = self.client.table('members')\
            .select('id')\
            .eq('email', email)
        
        if exclude_member_id:
            query = query.neq('id', exclude_member_id)
        
        result = query.execute()
        return len(result.data) == 0
    
    async def list_members_with_filters(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        industry: Optional[str] = None,
        region: Optional[str] = None,
        approval_status: Optional[str] = None,
        status: Optional[str] = None,
    ) -> tuple[List[Dict[str, Any]], int]:
        """获取会员列表（带筛选和分页）"""
        # 构建查询
        query = self.client.table('members').select('*')
        
        # 应用筛选
        if approval_status:
            query = query.eq('approval_status', approval_status)
        if status:
            query = query.eq('status', status)
        
        # 获取总数（创建新的查询来获取总数）
        count_query = self.client.table('members').select('*', count='exact')
        if approval_status:
            count_query = count_query.eq('approval_status', approval_status)
        if status:
            count_query = count_query.eq('status', status)
        count_result = count_query.execute()
        total = count_result.count or 0
        
        # 应用分页
        offset = (page - 1) * page_size
        query = query.order('created_at', desc=True)\
            .range(offset, offset + page_size - 1)
        
        # 执行查询
        result = query.execute()
        members = result.data or []
        
        # 获取每个会员的档案信息
        member_ids = [str(m['id']) for m in members]
        
        profiles_map = {}
        
        if member_ids:
            # 批量获取档案
            profiles_result = self.client.table('member_profiles')\
                .select('*')\
                .in_('member_id', member_ids)\
                .execute()
            
            for profile in profiles_result.data or []:
                profile_member_id = str(profile['member_id'])
                profiles_map[profile_member_id] = profile
        
        # 合并会员和档案数据，并应用搜索和筛选
        filtered_members = []
        for member in members:
            member_id = str(member['id'])
            profile = profiles_map.get(member_id)
            
            # 应用搜索筛选（在客户端进行，因为 Supabase 的 ilike 不支持跨表搜索）
            if search:
                search_lower = search.lower()
                company_name_match = search_lower in (member.get('company_name') or '').lower()
                business_number_match = search_lower in (member.get('business_number') or '').lower()
                if not (company_name_match or business_number_match):
                    continue
            
            # 应用行业筛选
            if industry:
                if not profile or profile.get('industry') != industry:
                    continue
            
            # 应用地区筛选
            if region:
                if not profile or profile.get('region') != region:
                    continue
            
            # 添加档案信息到会员对象，并将常用字段提升到顶层
            if profile:
                member['profile'] = profile
                # 将常用字段提升到顶层，方便前端访问
                member['address'] = profile.get('address')
                member['representative'] = profile.get('representative')
                member['legal_number'] = profile.get('legal_number')
                member['phone'] = profile.get('phone')
                member['industry'] = profile.get('industry')
                member['region'] = profile.get('region')
            else:
                member['profile'] = None
                member['address'] = None
                member['representative'] = None
                member['legal_number'] = None
                member['phone'] = None
                member['industry'] = None
                member['region'] = None
            
            filtered_members.append(member)
        
        # 如果应用了搜索或筛选，需要重新计算总数
        if search or industry or region:
            # 重新获取所有符合条件的会员来计算总数
            all_query = self.client.table('members').select('*')
            if approval_status:
                all_query = all_query.eq('approval_status', approval_status)
            if status:
                all_query = all_query.eq('status', status)
            
            all_result = all_query.execute()
            all_members = all_result.data or []
            
            # 获取所有档案
            all_member_ids = [str(m['id']) for m in all_members]
            all_profiles_map = {}
            if all_member_ids:
                all_profiles_result = self.client.table('member_profiles')\
                    .select('*')\
                    .in_('member_id', all_member_ids)\
                    .execute()
                for profile in all_profiles_result.data or []:
                    all_profiles_map[str(profile['member_id'])] = profile
            
            # 重新计算总数
            total = 0
            for member in all_members:
                member_id = str(member['id'])
                profile = all_profiles_map.get(member_id)
                
                if search:
                    search_lower = search.lower()
                    company_name_match = search_lower in (member.get('company_name') or '').lower()
                    business_number_match = search_lower in (member.get('business_number') or '').lower()
                    if not (company_name_match or business_number_match):
                        continue
                
                if industry:
                    if not profile or profile.get('industry') != industry:
                        continue
                
                if region:
                    if not profile or profile.get('region') != region:
                        continue
                
                total += 1
        
        return filtered_members, total
    
    # ============================================================================
    # Member Profile 相关操作
    # ============================================================================
    
    async def get_member_profile(self, member_id: str) -> tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """获取会员和档案"""
        # 获取会员
        member = await self.get_member_by_id(member_id)
        if not member:
            return None, None
        
        # 获取档案
        result = self.client.table('member_profiles')\
            .select('*')\
            .eq('member_id', member_id)\
            .limit(1)\
            .execute()
        profile = result.data[0] if result.data else None
        
        # 将常用字段提升到 member 对象顶层，方便前端访问
        if profile:
            member['address'] = profile.get('address')
            member['representative'] = profile.get('representative')
            member['representativeName'] = profile.get('representative')  # 兼容前端使用的字段名
            member['legalNumber'] = profile.get('legal_number')
            member['phone'] = profile.get('phone')
            member['industry'] = profile.get('industry')
            member['region'] = profile.get('region')
        
        return member, profile
    
    async def get_member_profile_by_id(self, member_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取会员档案"""
        result = self.client.table('member_profiles')\
            .select('*')\
            .eq('member_id', member_id)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def create_member_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建会员档案"""
        result = self.client.table('member_profiles')\
            .insert(profile_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create member profile: no data returned")
        return result.data[0]
    
    async def update_member_profile(self, member_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新会员档案（如果不存在则创建）"""
        # 先检查是否存在
        profile = await self.get_member_profile_by_id(member_id)
        
        if profile:
            # 更新
            result = self.client.table('member_profiles')\
                .update(profile_data)\
                .eq('member_id', member_id)\
                .execute()
            if not result.data:
                raise ValueError(f"Failed to update member profile {member_id}: no data returned")
            return result.data[0]
        else:
            # 创建
            profile_data['member_id'] = member_id
            result = self.client.table('member_profiles')\
                .insert(profile_data)\
                .execute()
            if not result.data:
                raise ValueError(f"Failed to create member profile {member_id}: no data returned")
            return result.data[0]
    
    # ============================================================================
    # User/Auth 相关操作（Admin）
    # ============================================================================
    
    async def get_admin_by_id(self, admin_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取管理员"""
        result = self.client.table('admins')\
            .select('*')\
            .eq('id', admin_id)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def get_admin_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """根据邮箱获取管理员"""
        result = self.client.table('admins')\
            .select('*')\
            .eq('email', email)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    # ============================================================================
    # Dashboard 相关操作
    # ============================================================================
    
    async def get_approved_members_count(self) -> int:
        """获取已批准会员总数"""
        result = self.client.table('members')\
            .select('*', count='exact')\
            .eq('approval_status', 'approved')\
            .execute()
        return result.count or 0
    
    async def get_performance_records(
        self, 
        year: Optional[int] = None, 
        quarter: Optional[int] = None,
        status: str = 'approved'
    ) -> List[Dict[str, Any]]:
        """获取绩效记录"""
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
    
    async def get_performance_records_for_chart(
        self, 
        year_filter: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """获取用于图表的绩效记录"""
        query = self.client.table('performance_records')\
            .select('*')\
            .eq('status', 'approved')\
            .is_('deleted_at', 'null')
        
        if year_filter:
            query = query.eq('year', year_filter)
        
        result = query.execute()
        return result.data or []
    
    # ============================================================================
    # Upload/Attachment 相关操作
    # ============================================================================
    
    async def create_attachment(self, attachment_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建附件记录"""
        result = self.client.table('attachments')\
            .insert(attachment_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create attachment: no data returned")
        return result.data[0]
    
    async def get_attachment_by_id(self, attachment_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取附件"""
        result = self.client.table('attachments')\
            .select('*')\
            .eq('id', attachment_id)\
            .is_('deleted_at', 'null')\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def delete_attachment(self, attachment_id: str) -> bool:
        """软删除附件记录（设置 deleted_at）"""
        from datetime import datetime, timezone
        self.client.table('attachments')\
            .update({'deleted_at': datetime.now(timezone.utc).isoformat()})\
            .eq('id', attachment_id)\
            .execute()
        return True
    
    async def get_attachments_by_resource(self, resource_type: str, resource_id: str) -> List[Dict[str, Any]]:
        """根据资源类型和ID获取附件列表"""
        result = self.client.table('attachments')\
            .select('*')\
            .eq('resource_type', resource_type)\
            .eq('resource_id', resource_id)\
            .is_('deleted_at', 'null')\
            .order('uploaded_at', desc=True)\
            .execute()
        return result.data or []
    
    # ============================================================================
    # Performance Record 相关操作
    # ============================================================================
    
    async def get_performance_record_by_id(self, performance_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取绩效记录"""
        result = self.client.table('performance_records')\
            .select('*')\
            .eq('id', performance_id)\
            .is_('deleted_at', 'null')\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def create_performance_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建绩效记录"""
        result = self.client.table('performance_records')\
            .insert(record_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create performance record: no data returned")
        return result.data[0]
    
    async def update_performance_record(self, performance_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新绩效记录"""
        result = self.client.table('performance_records')\
            .update(update_data)\
            .eq('id', performance_id)\
            .execute()
        if not result.data:
            raise ValueError("Failed to update performance record: no data returned")
        return result.data[0]
    
    async def delete_performance_record(self, performance_id: str) -> bool:
        """软删除绩效记录（设置 deleted_at）"""
        from datetime import datetime, timezone
        self.client.table('performance_records')\
            .update({'deleted_at': datetime.now(timezone.utc).isoformat()})\
            .eq('id', performance_id)\
            .execute()
        return True
    
    async def list_performance_records_with_filters(
        self,
        member_id: Optional[str] = None,
        year: Optional[int] = None,
        quarter: Optional[int] = None,
        status: Optional[str] = None,
        type: Optional[str] = None,
        search_keyword: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        order_by: str = "created_at",
        order_desc: bool = True,
    ) -> tuple[List[Dict[str, Any]], int]:
        """
        获取绩效记录列表（带筛选和分页）
        
        Args:
            search_keyword: 搜索关键词，用于搜索企业名称、营业执照号、年度等
        
        Returns:
            Tuple of (records list, total count)
        """
        query = self.client.table('performance_records').select('*', count='exact').is_('deleted_at', 'null')
        
        # 如果有搜索关键词，先通过 member 表筛选
        matched_member_ids = None
        search_year = None
        if search_keyword and search_keyword.strip():
            keyword = search_keyword.strip()
            
            # 检查是否是数字（可能是年度）
            if keyword.isdigit():
                search_year = int(keyword)
            
            # 查询匹配的 member IDs（企业名称或营业执照号）
            matched_ids = set()
            
            # 查询企业名称匹配的 members
            try:
                # 获取所有 members，然后在 Python 中过滤（对于小数据集足够快）
                # 或者使用 Supabase 的 textSearch 功能
                all_members = self.client.table('members').select('id, company_name, business_number').execute()
                
                if all_members.data:
                    keyword_lower = keyword.lower()
                    for member in all_members.data:
                        company_name = (member.get('company_name') or '').lower()
                        business_number = (member.get('business_number') or '').lower()
                        
                        if keyword_lower in company_name or keyword_lower in business_number:
                            matched_ids.add(member['id'])
                
                matched_member_ids = list(matched_ids) if matched_ids else []
            except Exception:
                # 如果查询失败，matched_member_ids 保持为 None
                matched_member_ids = []
        
        # 应用筛选
        if member_id:
            query = query.eq('member_id', member_id)
        elif matched_member_ids is not None:
            # 如果有搜索关键词匹配的 member IDs
            if matched_member_ids:
                query = query.in_('member_id', matched_member_ids)
            elif search_year is None:
                # 没有匹配的 member 且不是年度搜索，返回空
                return [], 0
        
        # 年度筛选
        if year:
            query = query.eq('year', year)
        elif search_year is not None and matched_member_ids is None:
            # 如果搜索关键词是数字且没有匹配的 member，按年度筛选
            query = query.eq('year', search_year)
        
        if quarter:
            query = query.eq('quarter', quarter)
        if status:
            query = query.eq('status', status)
        if type:
            query = query.eq('type', type)
        
        # 排序
        if order_desc:
            query = query.order(order_by, desc=True)
        else:
            query = query.order(order_by, desc=False)
        
        # 分页
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        result = query.execute()
        records = result.data or []
        total_count = result.count or 0
        
        # 如果同时有年度搜索和 member 匹配，需要在结果中进一步过滤
        if search_year is not None and matched_member_ids:
            # 过滤出匹配年度或 member_id 的记录
            matched_member_ids_set = set(matched_member_ids)
            filtered_records = [
                r for r in records 
                if r.get('year') == search_year or str(r.get('member_id')) in matched_member_ids_set
            ]
            records = filtered_records
            # 更新总数（这里简化处理，实际应该重新查询总数）
            total_count = len(filtered_records)
        
        # 批量获取 member 信息（避免 N+1 查询）
        if records:
            member_ids = list(set([str(r["member_id"]) for r in records]))
            members_map = {}
            
            # 批量查询 members
            try:
                members_result = self.client.table('members')\
                    .select('id, company_name, business_number')\
                    .in_('id', member_ids)\
                    .execute()
                
                if members_result.data:
                    for member in members_result.data:
                        members_map[str(member['id'])] = {
                            "company_name": member.get("company_name"),
                            "business_number": member.get("business_number"),
                        }
            except Exception:
                # 如果批量查询失败，回退到逐个查询（但这种情况应该很少）
                pass
            
            # 添加 member 信息到每个记录
            for record in records:
                member_id = str(record["member_id"])
                if member_id in members_map:
                    record["member_company_name"] = members_map[member_id]["company_name"]
                    record["member_business_number"] = members_map[member_id]["business_number"]
                else:
                    record["member_company_name"] = None
                    record["member_business_number"] = None
        
        return records, total_count
    
    async def export_performance_records(
        self,
        member_id: Optional[str] = None,
        year: Optional[int] = None,
        quarter: Optional[int] = None,
        status: Optional[str] = None,
        type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        导出绩效记录（无分页限制）
        """
        query = self.client.table('performance_records').select('*').is_('deleted_at', 'null')
        
        # 应用筛选
        if member_id:
            query = query.eq('member_id', member_id)
        if year:
            query = query.eq('year', year)
        if quarter:
            query = query.eq('quarter', quarter)
        if status:
            query = query.eq('status', status)
        if type:
            query = query.eq('type', type)
        
        # 排序
        query = query.order('submitted_at', desc=True)
        
        result = query.execute()
        return result.data or []
    
    # ============================================================================
    # Performance Review 相关操作
    # ============================================================================
    
    async def create_performance_review(self, review_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建绩效审核记录

        注意：Supabase 中的 performance_reviews.id 字段为 NOT NULL 且无默认值，
        因此在插入记录时必须显式提供 UUID。
        """
        # Ensure ID is present to satisfy NOT NULL constraint in Supabase
        if not review_data.get("id"):
            review_data = {
                **review_data,
                "id": str(uuid4()),
            }

        result = self.client.table('performance_reviews')\
            .insert(review_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create performance review: no data returned")
        return result.data[0]
    
    async def get_performance_reviews_by_performance_id(self, performance_id: str) -> List[Dict[str, Any]]:
        """根据绩效记录ID获取所有审核记录"""
        result = self.client.table('performance_reviews')\
            .select('*')\
            .eq('performance_id', performance_id)\
            .order('reviewed_at', desc=True)\
            .execute()
        return result.data or []
    
    # ============================================================================
    # Project 相关操作
    # ============================================================================
    
    async def get_project_by_id(self, project_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取项目"""
        result = self.client.table('projects')\
            .select('*')\
            .eq('id', project_id)\
            .is_('deleted_at', 'null')\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新项目"""
        result = self.client.table('projects')\
            .insert(project_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create project: no data returned")
        return result.data[0]
    
    async def update_project(self, project_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新项目"""
        result = self.client.table('projects')\
            .update(update_data)\
            .eq('id', project_id)\
            .execute()
        if not result.data:
            raise ValueError("Failed to update project: no data returned")
        return result.data[0]
    
    async def delete_project(self, project_id: str) -> bool:
        """软删除项目（设置 deleted_at）"""
        from datetime import datetime, timezone
        self.client.table('projects')\
            .update({'deleted_at': datetime.now(timezone.utc).isoformat()})\
            .eq('id', project_id)\
            .execute()
        return True
    
    async def list_projects_with_filters(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        order_by: str = "created_at",
        order_desc: bool = True,
    ) -> tuple[List[Dict[str, Any]], int]:
        """
        获取项目列表（带筛选和分页）
        
        Returns:
            Tuple of (projects list, total count)
        """
        query = self.client.table('projects').select('*', count='exact').is_('deleted_at', 'null')
        
        # 应用筛选
        if status:
            query = query.eq('status', status)
        else:
            # 默认只显示 active 项目
            query = query.eq('status', 'active')
        
        # 搜索（在客户端进行，因为 Supabase 的 ilike 可能不支持多字段搜索）
        if search:
            # 先获取所有符合条件的项目，然后在客户端进行搜索
            all_query = self.client.table('projects').select('*').is_('deleted_at', 'null')
            if status:
                all_query = all_query.eq('status', status)
            else:
                all_query = all_query.eq('status', 'active')
            
            all_result = all_query.execute()
            all_projects = all_result.data or []
            
            # 客户端搜索
            search_lower = search.lower()
            filtered_projects = []
            for project in all_projects:
                title_match = search_lower in (project.get('title') or '').lower()
                desc_match = search_lower in (project.get('description') or '').lower()
                if title_match or desc_match:
                    filtered_projects.append(project)
            
            # 计算总数
            total = len(filtered_projects)
            
            # 应用分页
            offset = (page - 1) * page_size
            paginated_projects = filtered_projects[offset:offset + page_size]
            
            return paginated_projects, total
        
        # 排序
        if order_desc:
            query = query.order(order_by, desc=True)
        else:
            query = query.order(order_by, desc=False)
        
        # 分页
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        result = query.execute()
        return result.data or [], result.count or 0
    
    async def export_projects(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        导出项目（无分页限制）
        """
        query = self.client.table('projects').select('*').is_('deleted_at', 'null')
        
        # 应用筛选
        if status:
            query = query.eq('status', status)
        
        # 搜索
        if search:
            all_result = query.execute()
            all_projects = all_result.data or []
            search_lower = search.lower()
            filtered_projects = []
            for project in all_projects:
                title_match = search_lower in (project.get('title') or '').lower()
                desc_match = search_lower in (project.get('description') or '').lower()
                if title_match or desc_match:
                    filtered_projects.append(project)
            return filtered_projects
        
        # 排序
        query = query.order('created_at', desc=True)
        
        result = query.execute()
        return result.data or []
    
    async def get_project_application_count(self, project_id: str) -> int:
        """获取项目的申请数量"""
        result = self.client.table('project_applications')\
            .select('*', count='exact')\
            .eq('project_id', project_id)\
            .execute()
        return result.count or 0
    
    # ============================================================================
    # Project Application 相关操作
    # ============================================================================
    
    async def get_project_application_by_id(self, application_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取项目申请"""
        result = self.client.table('project_applications')\
            .select('*')\
            .eq('id', application_id)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    
    async def create_project_application(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建项目申请"""
        result = self.client.table('project_applications')\
            .insert(application_data)\
            .execute()
        if not result.data:
            raise ValueError("Failed to create project application: no data returned")
        return result.data[0]
    
    async def update_project_application(self, application_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新项目申请"""
        result = self.client.table('project_applications')\
            .update(update_data)\
            .eq('id', application_id)\
            .execute()
        if not result.data:
            raise ValueError("Failed to update project application: no data returned")
        return result.data[0]
    
    async def check_duplicate_application(self, member_id: str, project_id: str) -> bool:
        """检查是否存在重复申请"""
        result = self.client.table('project_applications')\
            .select('id')\
            .eq('member_id', member_id)\
            .eq('project_id', project_id)\
            .execute()
        return len(result.data) > 0
    
    async def list_project_applications_with_filters(
        self,
        project_id: Optional[str] = None,
        member_id: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        order_by: str = "submitted_at",
        order_desc: bool = True,
    ) -> tuple[List[Dict[str, Any]], int]:
        """
        获取项目申请列表（带筛选和分页）
        
        Returns:
            Tuple of (applications list, total count)
        """
        # Join with projects and members to get project title and company name
        query = self.client.table('project_applications').select(
            '*,'
            'projects(title),'
            'members(company_name)',
            count='exact'
        )
        
        # 应用筛选
        if project_id:
            query = query.eq('project_id', project_id)
        if member_id:
            query = query.eq('member_id', member_id)
        if status:
            query = query.eq('status', status)
        
        # 排序
        if order_desc:
            query = query.order(order_by, desc=True)
        else:
            query = query.order(order_by, desc=False)
        
        # 分页
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        result = query.execute()
        
        # Flatten the nested data structure
        applications = []
        for app in result.data or []:
            flattened_app = {
                **app,
                'project_title': app.get('projects', {}).get('title') if app.get('projects') else None,
                'company_name': app.get('members', {}).get('company_name') if app.get('members') else None,
            }
            # Remove nested objects to avoid serialization issues
            flattened_app.pop('projects', None)
            flattened_app.pop('members', None)
            applications.append(flattened_app)
        
        return applications, result.count or 0
    
    async def export_project_applications(
        self,
        project_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        导出项目申请（无分页限制）
        """
        query = self.client.table('project_applications').select('*')
        
        # 应用筛选
        if project_id:
            query = query.eq('project_id', project_id)
        if status:
            query = query.eq('status', status)
        
        # 排序
        query = query.order('submitted_at', desc=True)
        
        result = query.execute()
        return result.data or []


# 创建全局服务实例
supabase_service = SupabaseService()
