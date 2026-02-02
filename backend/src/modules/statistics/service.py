from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime, date, timedelta
import calendar
import json
import re

from ...common.modules.supabase.service import supabase_service
from .schemas import StatisticsQuery, StatisticsItem, Gender
import logging

logger = logging.getLogger(__name__)


def calculate_age(birth_date: Optional[date]) -> Optional[int]:
    """计算年龄"""
    if not birth_date:
        return None
    today = date.today()
    age = today.year - birth_date.year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    return age


def calculate_work_years(founding_date: Optional[date]) -> Optional[int]:
    """计算业力（成立年限）"""
    if not founding_date:
        return None
    today = date.today()
    years = today.year - founding_date.year
    if (today.month, today.day) < (founding_date.month, founding_date.day):
        years -= 1
    return max(0, years)  # 确保不返回负数


def ensure_list(value) -> List[str]:
    """确保返回值是列表格式

    处理数据库中可能的多种格式:
    - None -> []
    - [] -> []
    - ["A", "B"] -> ["A", "B"]
    - "A" -> ["A"]
    - "A,B" -> ["A", "B"]
    - '["A", "B"]' (JSON string) -> ["A", "B"]
    """
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        # 尝试解析 JSON 字符串
        if value.startswith('['):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass
        # 处理逗号分隔的字符串
        if ',' in value:
            return [v.strip() for v in value.split(',') if v.strip()]
        # 单个字符串
        return [value] if value.strip() else []
    return []


def ensure_float(value, default: float = 0.0) -> float:
    """确保返回值是 float 格式"""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def ensure_int(value, default: int = 0) -> int:
    """确保返回值是 int 格式"""
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def sanitize_search_query(query: str) -> str:
    """清理搜索关键词中的 PostgREST 特殊字符，防止过滤语法被破坏"""
    # 移除可能破坏 PostgREST or_() 语法的特殊字符
    return re.sub(r'[,.()\{\}]', '', query).strip()


# 企业统计与报告服务类
class StatisticsService:
    def _aggregate_performance_data(self, member_id: str) -> Dict[str, Any]:
        """聚合会员的业绩数据（同步方法）"""
        try:
            # 查询该会员的所有已提交的业绩记录（排除草稿状态）
            result = supabase_service.client.table("performance_records")\
                .select("data_json, year, type, status")\
                .eq("member_id", member_id)\
                .neq("status", "draft")\
                .is_("deleted_at", "null")\
                .order("year", desc=True)\
                .execute()
        except Exception as e:
            logger.error(f"Error fetching performance data for member {member_id}: {e}")
            return {
                "export_amount": 0.0,
                "total_investment": 0.0,
                "patent_count": 0,
                "latest_revenue": 0.0
            }
        
        total_export = 0.0
        total_investment = 0.0
        patent_count = 0
        latest_revenue = 0.0
        
        if result.data:
            # 获取最新年份
            latest_year = result.data[0].get("year") if result.data else None
            
            for record in result.data:
                data_json = record.get("data_json", {})
                record_type = record.get("type")
                record_year = record.get("year")
                
                # 处理销售类型记录（sales）
                if record_type == "sales":
                    sales_employment = data_json.get("salesEmployment", {})
                    
                    # 聚合出口额（只取最新年份）
                    if record_year == latest_year:
                        export_data = sales_employment.get("export", {})
                        current_export = export_data.get("currentYear", 0)
                        if current_export:
                            try:
                                total_export += float(current_export)
                            except (ValueError, TypeError):
                                pass
                        
                        # 获取销售额（只取最新年份）
                        sales_data = sales_employment.get("sales", {})
                        current_revenue = sales_data.get("currentYear", 0)
                        if current_revenue:
                            try:
                                latest_revenue = float(current_revenue)
                            except (ValueError, TypeError):
                                pass
                
                # 处理政府支持类型记录（support）
                elif record_type == "support":
                    gov_support = data_json.get("governmentSupport", [])
                    if isinstance(gov_support, list):
                        for support in gov_support:
                            amount = support.get("supportAmount", 0)
                            if amount:
                                try:
                                    # 金额单位是千元，转换为元
                                    total_investment += float(amount) * 1000
                                except (ValueError, TypeError):
                                    pass
                
                # 处理知识产权类型记录（ip）
                elif record_type == "ip":
                    ip_data = data_json.get("intellectualProperty", [])
                    if isinstance(ip_data, list):
                        patent_count += len(ip_data)
        
        return {
            "export_amount": total_export,
            "total_investment": total_investment,
            "patent_count": patent_count,
            "latest_revenue": latest_revenue
        }

    async def get_statistics_report(
        self, query: StatisticsQuery
    ) -> Tuple[List[Dict[str, Any]], int]:
        """获取并筛选企业统计报告"""
        sb_query = supabase_service.client.table("members").select("*", count="exact")

        # 1. 关键词搜索（企业名称或事业者编号）
        if query.search_query:
            safe_query = sanitize_search_query(query.search_query)
            if safe_query:
                sb_query = sb_query.or_(
                    f"company_name.ilike.%{safe_query}%,"
                    f"business_number.ilike.%{safe_query}%"
                )

        # 2. 时间筛选（年度/季度/月份）
        if query.year:
            if query.month:
                # 精确到月份
                start_date = f"{query.year}-{query.month:02d}-01"
                if query.month == 12:
                    end_date = f"{query.year}-12-31"
                else:
                    end_date = f"{query.year}-{query.month+1:02d}-01"
                sb_query = sb_query.gte("founding_date", start_date).lt("founding_date", end_date)
            elif query.quarter:
                # 精确到季度
                quarter_months = {1: (1, 3), 2: (4, 6), 3: (7, 9), 4: (10, 12)}
                start_month, end_month = quarter_months[query.quarter]
                start_date = f"{query.year}-{start_month:02d}-01"
                last_day = calendar.monthrange(query.year, end_month)[1]
                end_date = f"{query.year}-{end_month:02d}-{last_day:02d}"
                sb_query = sb_query.gte("founding_date", start_date).lte("founding_date", end_date)
            else:
                # 只筛选年度
                sb_query = sb_query.gte("founding_date", f"{query.year}-01-01")\
                                 .lte("founding_date", f"{query.year}-12-31")

        # 3. 产业筛选 - 标准产业分类
        if query.major_industry_codes:
            sb_query = sb_query.in_("ksic_major", query.major_industry_codes)
        
        if query.sub_industry_codes:
            sb_query = sb_query.in_("ksic_sub", query.sub_industry_codes)
        
        # 产业筛选 - 江原道主导产业
        if query.gangwon_industry_codes:
            sb_query = sb_query.in_("main_industry_ksic_major", query.gangwon_industry_codes)
        
        if query.gangwon_industry_sub_codes:
            # main_industry_ksic_codes 是 text 类型（存储 JSON 数组字符串），使用 like 匹配
            sub_conditions = []
            for code in query.gangwon_industry_sub_codes:
                sub_conditions.append(f'main_industry_ksic_codes.like.*{code}*')
            if sub_conditions:
                sb_query = sb_query.or_(",".join(sub_conditions))

        # 产业筛选 - 江原道7大未来产业
        if query.gangwon_future_industries:
            sb_query = sb_query.in_("gangwon_industry", query.gangwon_future_industries)

        # 产业筛选 - 未来有望新技术
        if query.future_technologies:
            sb_query = sb_query.in_("future_tech", query.future_technologies)

        # 企业分类
        if query.startup_types:
            sb_query = sb_query.in_("startup_type", query.startup_types)

        if query.business_fields:
            sb_query = sb_query.in_("business_field", query.business_fields)

        if query.cooperation_fields:
            # cooperation_fields 是 text 类型（存储 JSON 数组字符串），使用 like 匹配
            coop_conditions = []
            for field in query.cooperation_fields:
                coop_conditions.append(f'cooperation_fields.like.*{field}*')
            if coop_conditions:
                sb_query = sb_query.or_(",".join(coop_conditions))

        # 4. 政策关联筛选（OR 逻辑）
        if query.policy_tags:
            # 构建 OR 条件：任意一个标签匹配即可
            # participation_programs 是 text 类型（存储 JSON 数组字符串），
            # 不能使用 cd/cs 等数组操作符，改用 like 进行文本匹配
            policy_conditions = []
            for tag in query.policy_tags:
                policy_conditions.append(f'participation_programs.like.*{tag}*')

            if policy_conditions:
                sb_query = sb_query.or_(",".join(policy_conditions))

        # 5. 企业属性筛选（创业阶段）
        if query.startup_stages:
            sb_query = sb_query.in_("startup_stage", query.startup_stages)

        # 6. 业历工龄筛选
        current_year = datetime.now().year
        if query.min_work_years is not None:
            founding_before = f"{current_year - query.min_work_years}-12-31"
            sb_query = sb_query.lte("founding_date", founding_before)
        if query.max_work_years is not None:
            founding_after = f"{current_year - query.max_work_years}-01-01"
            sb_query = sb_query.gte("founding_date", founding_after)

        # 7. 代表者特征筛选
        if query.gender:
            sb_query = sb_query.eq("representative_gender", query.gender.value)

        # 年龄筛选：将年龄转换为出生日期范围，下推到数据库层
        today = date.today()
        if query.min_age is not None:
            # 最小年龄 N 岁 → 出生日期 <= today - N 年（即至少 N 岁）
            max_birth = date(today.year - query.min_age, today.month, today.day)
            sb_query = sb_query.lte("representative_birth_date", max_birth.isoformat())
        if query.max_age is not None:
            # 最大年龄 N 岁 → 出生日期 >= today - (N+1) 年 + 1 天（即不超过 N 岁）
            min_birth = date(today.year - query.max_age - 1, today.month, today.day) + timedelta(days=1)
            sb_query = sb_query.gte("representative_birth_date", min_birth.isoformat())

        # 8. 营收和员工数筛选
        if query.min_revenue is not None:
            sb_query = sb_query.gte("revenue", query.min_revenue)
        if query.max_revenue is not None:
            sb_query = sb_query.lte("revenue", query.max_revenue)
        
        if query.min_employees is not None:
            sb_query = sb_query.gte("employee_count", query.min_employees)
        if query.max_employees is not None:
            sb_query = sb_query.lte("employee_count", query.max_employees)

        # 9. 所在地筛选
        if query.region:
            sb_query = sb_query.eq("region", query.region)

        # 排序
        # 注意：patent_count 和 total_investment 不在 members 表中，需要在应用层排序
        order_field = query.sort_by.value
        if order_field in ["patent_count", "total_investment"]:
            # 这些字段需要在应用层排序，数据库层使用 company_name 排序
            sb_column = "company_name"
            need_app_sort = True
        else:
            field_map = {
                "enterprise_name": "company_name",
                "annual_revenue": "revenue"
            }
            sb_column = field_map.get(order_field, "company_name")
            need_app_sort = False
        
        sb_query = sb_query.order(sb_column, desc=(query.sort_order.value == "desc"))

        # 分页：如果有投资或专利筛选，需要先获取所有数据再过滤，所以暂时不分页
        has_app_filter = (
            query.has_investment is not None or 
            query.min_investment is not None or 
            query.max_investment is not None or 
            query.min_patents is not None or 
            query.max_patents is not None
        )
        
        if not has_app_filter:
            # 没有应用层筛选，可以直接在数据库层分页
            offset = (query.page - 1) * query.page_size
            sb_query = sb_query.range(offset, offset + query.page_size - 1)
        else:
            # 有应用层筛选，需要获取更多数据（最多1000条）
            sb_query = sb_query.limit(1000)

        # 执行查询
        result = sb_query.execute()
        
        # 处理结果
        items = []
        for row in (result.data or []):
            # 计算业力（成立年限）
            work_years = None
            founding_date_str = row.get("founding_date")
            if founding_date_str:
                try:
                    founding_date = datetime.strptime(founding_date_str, "%Y-%m-%d").date()
                    work_years = calculate_work_years(founding_date)
                except (ValueError, TypeError):
                    pass
            
            # 聚合业绩数据
            member_id = str(row.get("id"))
            perf_data = self._aggregate_performance_data(member_id)
            
            # 使用 members 表的 revenue，如果没有则使用业绩数据的最新销售额
            annual_revenue = ensure_float(row.get("revenue"))
            if annual_revenue == 0 and perf_data["latest_revenue"] > 0:
                annual_revenue = perf_data["latest_revenue"]
            
            # 计算代表者年龄
            representative_age = None
            birth_date_str = row.get("representative_birth_date")
            if birth_date_str:
                try:
                    birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
                    today = datetime.now().date()
                    representative_age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                except (ValueError, TypeError):
                    pass
            
            # 提取时间维度（从 founding_date 或查询参数）
            year = None
            quarter = None
            month = None
            if founding_date_str:
                try:
                    founding_date = datetime.strptime(founding_date_str, "%Y-%m-%d").date()
                    year = founding_date.year
                    month = founding_date.month
                    quarter = (month - 1) // 3 + 1
                except (ValueError, TypeError):
                    pass
            
            items.append({
                # 时间维度
                "year": year,
                "quarter": quarter,
                "month": month,
                
                # 基本信息
                "business_reg_no": row.get("business_number"),
                "enterprise_name": row.get("company_name"),
                
                # 快速筛选组
                "policy_tags": ensure_list(row.get("participation_programs")),
                
                # 企业特征组
                "ksic_major": row.get("ksic_major"),
                "ksic_sub": row.get("ksic_sub"),
                "gangwon_industry": row.get("main_industry_ksic_major"),
                "gangwon_industry_sub": row.get("main_industry_ksic_codes"),
                "gangwon_future_industry": row.get("gangwon_industry"),
                "future_tech": row.get("future_tech"),
                "work_years": work_years,
                "startup_stage": row.get("startup_stage"),
                "region": row.get("region"),
                
                # 经营指标组
                "total_investment": perf_data["total_investment"],
                "annual_revenue": annual_revenue,
                "export_amount": perf_data["export_amount"],
                "employee_count": ensure_int(row.get("employee_count")),
                "patent_count": perf_data["patent_count"],
                
                # 代表者信息组
                "representative_gender": row.get("representative_gender"),
                "representative_age": representative_age,
            })

        # 应用层过滤：投资和专利筛选（因为这些字段不在 members 表中）
        filtered_items = []
        for item in items:
            # 投资情况筛选
            if query.has_investment is not None:
                if query.has_investment and item["total_investment"] <= 0:
                    continue
                if not query.has_investment and item["total_investment"] > 0:
                    continue
            
            if query.min_investment is not None and item["total_investment"] < query.min_investment:
                continue
            if query.max_investment is not None and item["total_investment"] > query.max_investment:
                continue
            
            # 专利筛选
            if query.min_patents is not None and item["patent_count"] < query.min_patents:
                continue
            if query.max_patents is not None and item["patent_count"] > query.max_patents:
                continue
            
            filtered_items.append(item)
        
        # 应用层排序：如果按 patent_count 或 total_investment 排序
        if need_app_sort:
            sort_key = query.sort_by.value
            reverse = (query.sort_order.value == "desc")
            filtered_items.sort(key=lambda x: x.get(sort_key, 0), reverse=reverse)
        
        # 计算总数
        if has_app_filter:
            # 有应用层过滤，使用过滤后的数量
            total_count = len(filtered_items)
            # 应用层分页
            offset = (query.page - 1) * query.page_size
            filtered_items = filtered_items[offset:offset + query.page_size]
        else:
            # 没有应用层过滤，使用数据库返回的总数
            total_count = result.count or 0

        return filtered_items, total_count

    async def get_export_data(self, query: StatisticsQuery) -> List[Dict[str, Any]]:
        """获取所有 member 字段的导出数据"""
        # 直接查询数据库获取所有字段
        sb_query = supabase_service.client.table("members").select("*", count="exact")

        # 应用所有筛选条件（复用查询逻辑）
        # 1. 关键词搜索
        if query.search_query:
            safe_query = sanitize_search_query(query.search_query)
            if safe_query:
                sb_query = sb_query.or_(
                    f"company_name.ilike.%{safe_query}%,"
                    f"business_number.ilike.%{safe_query}%"
                )

        # 2. 时间筛选
        if query.year:
            if query.month:
                start_date = f"{query.year}-{query.month:02d}-01"
                if query.month == 12:
                    end_date = f"{query.year}-12-31"
                else:
                    end_date = f"{query.year}-{query.month+1:02d}-01"
                sb_query = sb_query.gte("founding_date", start_date).lt("founding_date", end_date)
            elif query.quarter:
                quarter_months = {1: (1, 3), 2: (4, 6), 3: (7, 9), 4: (10, 12)}
                start_month, end_month = quarter_months[query.quarter]
                start_date = f"{query.year}-{start_month:02d}-01"
                last_day = calendar.monthrange(query.year, end_month)[1]
                end_date = f"{query.year}-{end_month:02d}-{last_day:02d}"
                sb_query = sb_query.gte("founding_date", start_date).lte("founding_date", end_date)
            else:
                sb_query = sb_query.gte("founding_date", f"{query.year}-01-01")\
                                 .lte("founding_date", f"{query.year}-12-31")

        # 3. 产业筛选 - 标准产业分类
        if query.major_industry_codes:
            sb_query = sb_query.in_("ksic_major", query.major_industry_codes)
        
        if query.sub_industry_codes:
            sb_query = sb_query.in_("ksic_sub", query.sub_industry_codes)
        
        # 产业筛选 - 江原道主导产业
        if query.gangwon_industry_codes:
            sb_query = sb_query.in_("main_industry_ksic_major", query.gangwon_industry_codes)
        
        if query.gangwon_industry_sub_codes:
            # main_industry_ksic_codes 是 text 类型（存储 JSON 数组字符串），使用 like 匹配
            sub_conditions = []
            for code in query.gangwon_industry_sub_codes:
                sub_conditions.append(f'main_industry_ksic_codes.like.*{code}*')
            if sub_conditions:
                sb_query = sb_query.or_(",".join(sub_conditions))

        # 产业筛选 - 江原道7大未来产业
        if query.gangwon_future_industries:
            sb_query = sb_query.in_("gangwon_industry", query.gangwon_future_industries)

        # 产业筛选 - 未来有望新技术
        if query.future_technologies:
            sb_query = sb_query.in_("future_tech", query.future_technologies)

        # 企业分类
        if query.startup_types:
            sb_query = sb_query.in_("startup_type", query.startup_types)

        if query.business_fields:
            sb_query = sb_query.in_("business_field", query.business_fields)

        if query.cooperation_fields:
            # cooperation_fields 是 text 类型（存储 JSON 数组字符串），使用 like 匹配
            coop_conditions = []
            for field in query.cooperation_fields:
                coop_conditions.append(f'cooperation_fields.like.*{field}*')
            if coop_conditions:
                sb_query = sb_query.or_(",".join(coop_conditions))

        # 4. 政策关联筛选
        if query.policy_tags:
            # participation_programs 是 text 类型，使用 like 进行文本匹配
            policy_conditions = []
            for tag in query.policy_tags:
                policy_conditions.append(f'participation_programs.like.*{tag}*')
            if policy_conditions:
                sb_query = sb_query.or_(",".join(policy_conditions))

        # 5. 企业属性筛选（创业阶段）
        if query.startup_stages:
            sb_query = sb_query.in_("startup_stage", query.startup_stages)

        # 6. 业历工龄筛选
        current_year = datetime.now().year
        if query.min_work_years is not None:
            founding_before = f"{current_year - query.min_work_years}-12-31"
            sb_query = sb_query.lte("founding_date", founding_before)
        if query.max_work_years is not None:
            founding_after = f"{current_year - query.max_work_years}-01-01"
            sb_query = sb_query.gte("founding_date", founding_after)

        # 7. 代表者特征筛选
        if query.gender:
            sb_query = sb_query.eq("representative_gender", query.gender.value)

        # 年龄筛选：将年龄转换为出生日期范围，下推到数据库层
        today = date.today()
        if query.min_age is not None:
            max_birth = date(today.year - query.min_age, today.month, today.day)
            sb_query = sb_query.lte("representative_birth_date", max_birth.isoformat())
        if query.max_age is not None:
            min_birth = date(today.year - query.max_age - 1, today.month, today.day) + timedelta(days=1)
            sb_query = sb_query.gte("representative_birth_date", min_birth.isoformat())

        # 8. 营收和员工数筛选
        if query.min_revenue is not None:
            sb_query = sb_query.gte("revenue", query.min_revenue)
        if query.max_revenue is not None:
            sb_query = sb_query.lte("revenue", query.max_revenue)
        
        if query.min_employees is not None:
            sb_query = sb_query.gte("employee_count", query.min_employees)
        if query.max_employees is not None:
            sb_query = sb_query.lte("employee_count", query.max_employees)

        # 9. 所在地筛选
        if query.region:
            sb_query = sb_query.eq("region", query.region)

        # 排序
        # 注意：patent_count 和 total_investment 不在 members 表中
        order_field = query.sort_by.value
        if order_field in ["patent_count", "total_investment"]:
            # 这些字段需要在应用层排序，数据库层使用 company_name 排序
            sb_column = "company_name"
        else:
            field_map = {
                "enterprise_name": "company_name",
                "annual_revenue": "revenue"
            }
            sb_column = field_map.get(order_field, "company_name")
        
        sb_query = sb_query.order(sb_column, desc=(query.sort_order.value == "desc"))

        # 限制最大导出数量
        sb_query = sb_query.limit(5000)

        # 执行查询
        result = sb_query.execute()
        
        # 处理结果 - 返回所有字段（年龄筛选已在数据库层完成）
        return result.data or []

    def _mask_name(self, name: str) -> str:
        """姓名脱敏处理"""
        if not name:
            return ""
        if len(name) <= 1:
            return "*"
        if len(name) == 2:
            return name[0] + "*"
        return name[0] + "*" * (len(name) - 2) + name[-1]


service = StatisticsService()

