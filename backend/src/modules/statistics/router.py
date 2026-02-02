from fastapi import APIRouter, Depends, Query, Response
from typing import List, Optional
from .schemas import StatisticsQuery, StatisticsResponse, SortField, SortOrder, Gender
from .service import service as statistics_service
from ..user.dependencies import get_current_admin_user
from ...common.modules.export.exporter import ExportService
from datetime import datetime

router = APIRouter(prefix="/api/admin/statistics", tags=["管理员统计接口"])


@router.get("/report", response_model=StatisticsResponse)
async def get_statistics_report(
    # 时间筛选
    year: Optional[int] = Query(None, description="年度筛选"),
    quarter: Optional[int] = Query(None, ge=1, le=4, description="季度筛选 (1-4)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="月份筛选 (1-12)"),
    
    # 产业筛选 - 标准产业分类
    major_industry_codes: List[str] = Query([], description="KSIC 大类代码"),
    sub_industry_codes: List[str] = Query([], description="KSIC 中类代码"),
    
    # 产业筛选 - 江原道主导产业
    gangwon_industry_codes: List[str] = Query([], description="江原道主导产业代码"),
    gangwon_industry_sub_codes: List[str] = Query([], description="江原道主导产业中分类代码"),
    
    # 产业筛选 - 江原道7大未来产业
    gangwon_future_industries: List[str] = Query([], description="江原道7大未来产业"),
    
    # 产业筛选 - 未来有望新技术
    future_technologies: List[str] = Query([], description="未来有望新技术"),
    
    # 企业分类
    startup_types: List[str] = Query([], description="创业类型"),
    business_fields: List[str] = Query([], description="业务领域"),
    cooperation_fields: List[str] = Query([], description="合作领域"),
    
    # 政策关联筛选
    policy_tags: List[str] = Query([], description="参与项目标签"),
    
    # 投资筛选
    has_investment: Optional[bool] = Query(None, description="是否有投资"),
    min_investment: Optional[float] = Query(None, ge=0, description="最小投资额"),
    max_investment: Optional[float] = Query(None, ge=0, description="最大投资额"),
    
    # 专利筛选
    min_patents: Optional[int] = Query(None, ge=0, description="最小专利数"),
    max_patents: Optional[int] = Query(None, ge=0, description="最大专利数"),
    
    # 代表者特征
    gender: Optional[Gender] = Query(None, description="代表者性别"),
    min_age: Optional[int] = Query(None, ge=0, le=150, description="最小年龄"),
    max_age: Optional[int] = Query(None, ge=0, le=150, description="最大年龄"),
    
    # 企业属性
    startup_stages: List[str] = Query([], description="创业阶段"),
    min_work_years: Optional[int] = Query(None, ge=0, description="最小工龄"),
    max_work_years: Optional[int] = Query(None, ge=0, description="最大工龄"),
    
    # 经营成果
    min_revenue: Optional[float] = Query(None, ge=0, description="最小年营收"),
    max_revenue: Optional[float] = Query(None, ge=0, description="最大年营收"),
    min_employees: Optional[int] = Query(None, ge=0, description="最小员工数"),
    max_employees: Optional[int] = Query(None, ge=0, description="最大员工数"),
    
    # 所在地
    region: Optional[str] = Query(None, description="所在地"),
    
    # 搜索与分页
    search_query: Optional[str] = Query(None, description="关键词搜索"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    sort_by: SortField = Query(SortField.ENTERPRISE_NAME, description="排序字段"),
    sort_order: SortOrder = Query(SortOrder.ASC, description="排序方向"),
    
    current_admin: dict = Depends(get_current_admin_user)
):
    """获取企业统计列表"""
    query = StatisticsQuery(
        year=year,
        quarter=quarter,
        month=month,
        major_industry_codes=major_industry_codes,
        sub_industry_codes=sub_industry_codes,
        gangwon_industry_codes=gangwon_industry_codes,
        gangwon_industry_sub_codes=gangwon_industry_sub_codes,
        gangwon_future_industries=gangwon_future_industries,
        future_technologies=future_technologies,
        startup_types=startup_types,
        business_fields=business_fields,
        cooperation_fields=cooperation_fields,
        policy_tags=policy_tags,
        has_investment=has_investment,
        min_investment=min_investment,
        max_investment=max_investment,
        min_patents=min_patents,
        max_patents=max_patents,
        gender=gender,
        min_age=min_age,
        max_age=max_age,
        startup_stages=startup_stages,
        min_work_years=min_work_years,
        max_work_years=max_work_years,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
        min_employees=min_employees,
        max_employees=max_employees,
        region=region,
        search_query=search_query,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    items, total = await statistics_service.get_statistics_report(query)
    
    return StatisticsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/export")
async def export_statistics(
    year: Optional[int] = Query(None),
    quarter: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    major_industry_codes: List[str] = Query([]),
    sub_industry_codes: List[str] = Query([]),
    gangwon_industry_codes: List[str] = Query([]),
    gangwon_industry_sub_codes: List[str] = Query([]),
    gangwon_future_industries: List[str] = Query([]),
    future_technologies: List[str] = Query([]),
    startup_types: List[str] = Query([]),
    business_fields: List[str] = Query([]),
    cooperation_fields: List[str] = Query([]),
    policy_tags: List[str] = Query([]),
    has_investment: Optional[bool] = Query(None),
    min_investment: Optional[float] = Query(None),
    max_investment: Optional[float] = Query(None),
    min_patents: Optional[int] = Query(None),
    max_patents: Optional[int] = Query(None),
    gender: Optional[Gender] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None),
    startup_stages: List[str] = Query([]),
    min_work_years: Optional[int] = Query(None),
    max_work_years: Optional[int] = Query(None),
    min_revenue: Optional[float] = Query(None),
    max_revenue: Optional[float] = Query(None),
    min_employees: Optional[int] = Query(None),
    max_employees: Optional[int] = Query(None),
    region: Optional[str] = Query(None),
    sort_by: SortField = Query(SortField.ENTERPRISE_NAME),
    sort_order: SortOrder = Query(SortOrder.ASC),
    current_admin: dict = Depends(get_current_admin_user)
):
    """导出企业统计 Excel"""
    query = StatisticsQuery(
        year=year,
        quarter=quarter,
        month=month,
        major_industry_codes=major_industry_codes,
        sub_industry_codes=sub_industry_codes,
        gangwon_industry_codes=gangwon_industry_codes,
        gangwon_industry_sub_codes=gangwon_industry_sub_codes,
        gangwon_future_industries=gangwon_future_industries,
        future_technologies=future_technologies,
        startup_types=startup_types,
        business_fields=business_fields,
        cooperation_fields=cooperation_fields,
        policy_tags=policy_tags,
        has_investment=has_investment,
        min_investment=min_investment,
        max_investment=max_investment,
        min_patents=min_patents,
        max_patents=max_patents,
        gender=gender,
        min_age=min_age,
        max_age=max_age,
        search_query=search_query,
        startup_stages=startup_stages,
        min_work_years=min_work_years,
        max_work_years=max_work_years,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
        min_employees=min_employees,
        max_employees=max_employees,
        region=region,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    data = await statistics_service.get_export_data(query)
    
    # 所有 member 表字段（按实际数据库字段）
    headers = [
        # 基本信息
        "id", "business_number", "company_name", "email", "status", "approval_status",
        
        # 企业基本信息
        "industry", "revenue", "employee_count", "founding_date", "region", "address",
        "representative", "representative_birth_date", "representative_gender", "representative_phone",
        "legal_number", "phone",
        # 移除: "website", "logo_url" (URL字段 - 方案A)
        
        # 担当者信息（登录系统的经办人员）
        "contact_person_name", "contact_person_department", "contact_person_position", "contact_person_phone",
        
        # 业务信息
        "main_business", "description", "cooperation_fields",
        
        # 创业和产业分类
        "startup_type", "startup_stage", "ksic_major", "ksic_sub", "category", "business_field",
        "main_industry_ksic_major", "main_industry_ksic_codes",
        
        # 江原道产业分类
        "gangwon_industry", "future_tech",
        
        # 参与项目和投资
        "participation_programs", "investment_status",
        
        # 时间戳
        "created_at", "updated_at", "deleted_at"
        
        # 注意：password_hash, reset_token, reset_token_expires 等敏感信息已排除
        # 注意：website, logo_url 等URL字段已移除（方案A）
    ]
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    excel_content = ExportService.export_to_excel(
        data=data,
        sheet_name="Enterprise Statistics",
        headers=headers,
        title=f"Gangwon Business Portal Statistics Report ({timestamp})"
    )
    
    filename = f"gangwon_stats_{timestamp}.xlsx"
    return Response(
        content=excel_content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/export/csv")
async def export_statistics_csv(
    year: Optional[int] = Query(None),
    quarter: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    major_industry_codes: List[str] = Query([]),
    sub_industry_codes: List[str] = Query([]),
    gangwon_industry_codes: List[str] = Query([]),
    gangwon_industry_sub_codes: List[str] = Query([]),
    gangwon_future_industries: List[str] = Query([]),
    future_technologies: List[str] = Query([]),
    startup_types: List[str] = Query([]),
    business_fields: List[str] = Query([]),
    cooperation_fields: List[str] = Query([]),
    policy_tags: List[str] = Query([]),
    has_investment: Optional[bool] = Query(None),
    min_investment: Optional[float] = Query(None),
    max_investment: Optional[float] = Query(None),
    min_patents: Optional[int] = Query(None),
    max_patents: Optional[int] = Query(None),
    gender: Optional[Gender] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None),
    startup_stages: List[str] = Query([]),
    min_work_years: Optional[int] = Query(None),
    max_work_years: Optional[int] = Query(None),
    min_revenue: Optional[float] = Query(None),
    max_revenue: Optional[float] = Query(None),
    min_employees: Optional[int] = Query(None),
    max_employees: Optional[int] = Query(None),
    region: Optional[str] = Query(None),
    sort_by: SortField = Query(SortField.ENTERPRISE_NAME),
    sort_order: SortOrder = Query(SortOrder.ASC),
    current_admin: dict = Depends(get_current_admin_user)
):
    """导出企业统计 CSV"""
    query = StatisticsQuery(
        year=year,
        quarter=quarter,
        month=month,
        major_industry_codes=major_industry_codes,
        sub_industry_codes=sub_industry_codes,
        gangwon_industry_codes=gangwon_industry_codes,
        gangwon_industry_sub_codes=gangwon_industry_sub_codes,
        gangwon_future_industries=gangwon_future_industries,
        future_technologies=future_technologies,
        startup_types=startup_types,
        business_fields=business_fields,
        cooperation_fields=cooperation_fields,
        policy_tags=policy_tags,
        has_investment=has_investment,
        min_investment=min_investment,
        max_investment=max_investment,
        min_patents=min_patents,
        max_patents=max_patents,
        gender=gender,
        min_age=min_age,
        max_age=max_age,
        search_query=search_query,
        startup_stages=startup_stages,
        min_work_years=min_work_years,
        max_work_years=max_work_years,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
        min_employees=min_employees,
        max_employees=max_employees,
        region=region,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    data = await statistics_service.get_export_data(query)
    
    # 所有 member 表字段（按实际数据库字段）
    # 方案A: 统计模块导出尽可能多的字段，但移除 URL、file、attachments
    headers = [
        # 基本信息
        "id", "business_number", "company_name", "email", "status", "approval_status",
        
        # 企业基本信息
        "industry", "revenue", "employee_count", "founding_date", "region", "address",
        "representative", "representative_birth_date", "representative_gender", "representative_phone",
        "legal_number", "phone",
        # 移除: "website", "logo_url" (URL字段 - 方案A)
        
        # 担当者信息（登录系统的经办人员）
        "contact_person_name", "contact_person_department", "contact_person_position", "contact_person_phone",
        
        # 业务信息
        "main_business", "description", "cooperation_fields",
        
        # 创业和产业分类
        "startup_type", "startup_stage", "ksic_major", "ksic_sub", "category", "business_field",
        "main_industry_ksic_major", "main_industry_ksic_codes",
        
        # 江原道产业分类
        "gangwon_industry", "future_tech",
        
        # 参与项目和投资
        "participation_programs", "investment_status",
        
        # 时间戳
        "created_at", "updated_at", "deleted_at"
        
        # 注意：password_hash, reset_token, reset_token_expires 等敏感信息已排除
        # 注意：website, logo_url 等URL字段已移除（方案A）
    ]
    
    csv_content = ExportService.export_to_csv(
        data=data,
        headers=headers
    )
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"gangwon_stats_{timestamp}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


