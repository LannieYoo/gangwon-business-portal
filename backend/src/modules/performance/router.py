"""业绩管理路由"""
from fastapi import APIRouter, Depends, status, Query, Response
from uuid import UUID
from typing import Annotated, Optional
from math import ceil
from datetime import datetime

from fastapi import Request

from ...common.modules.db.models import Member, Admin
from ...common.modules.audit import audit_log
from ..user.dependencies import get_current_active_user_compat as get_current_active_user, get_current_admin_user
from .service import PerformanceService
from .schemas import (
    PerformanceRecordCreate,
    PerformanceRecordUpdate,
    PerformanceRecordResponse,
    PerformanceListItem,
    PerformanceListQuery,
    PerformanceListResponsePaginated,
    PerformanceApprovalRequest,
    InvestmentSummaryResponse,
)


router = APIRouter()
service = PerformanceService()


# Member endpoints


@router.get(
    "/api/performance",
    response_model=PerformanceListResponsePaginated,
    tags=["performance"],
    summary="List my performance records",
)
async def list_my_performance_records(
    query: Annotated[PerformanceListQuery, Depends()],
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)],
):
    """获取会员业绩记录列表"""
    records, total = await service.list_performance_records(
        current_user.id, query
    )
    
    page = query.page or 1
    page_size = query.page_size or 10
    total_pages = ceil(total / page_size) if total > 0 else 1

    return PerformanceListResponsePaginated(
        items=[PerformanceListItem.from_db_dict(r, include_admin_fields=False) for r in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/api/performance/{performance_id}",
    response_model=PerformanceRecordResponse,
    tags=["performance"],
    summary="Get performance record details",
)
async def get_performance_record(
    performance_id: UUID,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)],
):
    """获取业绩记录详情"""
    record = await service.get_performance_by_id(performance_id, current_user.id)
    
    return PerformanceRecordResponse.model_validate(record)


@router.post(
    "/api/performance",
    response_model=PerformanceRecordResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["performance"],
    summary="Create new performance record",
)
@audit_log(action="create", resource_type="performance")
async def create_performance_record(
    data: PerformanceRecordCreate,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)],
):
    """创建业绩记录"""
    record = await service.create_performance(current_user.id, data)
    return PerformanceRecordResponse.model_validate(record)


@router.put(
    "/api/performance/{performance_id}",
    response_model=PerformanceRecordResponse,
    tags=["performance"],
    summary="Update performance record",
)
@audit_log(action="update", resource_type="performance")
async def update_performance_record(
    performance_id: UUID,
    data: PerformanceRecordUpdate,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)],
):
    """更新业绩记录"""
    record = await service.update_performance(
        performance_id, current_user.id, data
    )
    return PerformanceRecordResponse.model_validate(record)


@router.delete(
    "/api/performance/{performance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["performance"],
    summary="Delete performance record",
)
@audit_log(action="delete", resource_type="performance")
async def delete_performance_record(
    performance_id: UUID,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)],
):
    """删除业绩记录"""
    await service.delete_performance(performance_id, current_user.id)


@router.post(
    "/api/performance/{performance_id}/submit",
    response_model=PerformanceRecordResponse,
    tags=["performance"],
    summary="Submit performance record for review",
)
@audit_log(action="submit", resource_type="performance")
async def submit_performance_record(
    performance_id: UUID,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)],
):
    """提交业绩记录供审核"""
    record = await service.submit_performance(performance_id, current_user.id)
    return PerformanceRecordResponse.model_validate(record)


# Admin endpoints


@router.get(
    "/api/admin/performance",
    response_model=PerformanceListResponsePaginated,
    tags=["admin-performance"],
    summary="List all performance records (Admin)",
)
async def list_all_performance_records(
    query: Annotated[PerformanceListQuery, Depends()],
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
):
    """获取所有业绩记录列表"""
    records, total = await service.list_all_performance_records(query)

    return PerformanceListResponsePaginated(
        items=[PerformanceListItem.from_db_dict(r, include_admin_fields=True) for r in records],
        total=total,
        page=1,
        page_size=total if total > 0 else 1,
        total_pages=1,
    )


@router.get(
    "/api/admin/performance/export",
    tags=["admin-performance"],
    summary="Export performance data (Admin)",
)
@audit_log(action="export", resource_type="performance")
async def export_performance_data(
    query: Annotated[PerformanceListQuery, Depends()],
    request: Request,
    current_admin: Annotated[Admin, Depends(get_current_admin_user)],
    export_format: str = Query("excel", alias="format", regex="^(excel|csv)$", description="Export format: excel or csv"),
):
    """导出业绩数据"""
    from ...common.modules.export import ExportService
    
    export_data = await service.export_performance_data(query)
    
    if export_format == "excel":
        excel_bytes = ExportService.export_to_excel(
            data=export_data,
            sheet_name="Performance",
            title=f"Performance Data Export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        )
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="performance_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
            },
        )
    else:
        csv_content = ExportService.export_to_csv(
            data=export_data,
        )
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="performance_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
            },
        )


@router.get(
    "/api/admin/performance/investment-summary",
    response_model=InvestmentSummaryResponse,
    tags=["admin-performance"],
    summary="Get investment summary by institution (Admin, Issue 11)",
)
async def get_investment_summary(
    request: Request,
    current_admin: Annotated[Admin, Depends(get_current_admin_user)],
    year: Optional[int] = Query(None, description="Filter by year"),
):
    """기관별 투자금액 합계 조회 (관리원)"""
    summary = await service.get_investment_summary_by_institution(year)
    total_investment = sum(item['total_amount'] for item in summary)
    return InvestmentSummaryResponse(
        items=summary,
        total_investment=total_investment,
        total_institutions=len(summary),
        year=year,
    )


@router.get(
    "/api/admin/performance/{performance_id}",
    response_model=PerformanceRecordResponse,
    tags=["admin-performance"],
    summary="Get performance record details (Admin)",
)
async def get_performance_record_admin(
    performance_id: UUID,
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
):
    """获取业绩记录详情"""
    record = await service.get_performance_by_id_admin(performance_id)
    return PerformanceRecordResponse.model_validate(record)


@router.post(
    "/api/admin/performance/{performance_id}/approve",
    response_model=PerformanceRecordResponse,
    tags=["admin-performance"],
    summary="Approve performance record (Admin)",
)
@audit_log(action="approve", resource_type="performance")
async def approve_performance_record(
    performance_id: UUID,
    data: PerformanceApprovalRequest,
    request: Request,
    current_admin: Annotated[Admin, Depends(get_current_admin_user)],
):
    """批准业绩记录"""
    admin_id = current_admin.get("id") if isinstance(current_admin, dict) else current_admin.id
    record = await service.approve_performance(
        performance_id, admin_id, data.comments
    )
    return PerformanceRecordResponse.model_validate(record)


@router.post(
    "/api/admin/performance/{performance_id}/request-fix",
    response_model=PerformanceRecordResponse,
    tags=["admin-performance"],
    summary="Request revision of performance record (Admin)",
)
@audit_log(action="request_fix", resource_type="performance")
async def request_fix_performance_record(
    performance_id: UUID,
    data: PerformanceApprovalRequest,
    request: Request,
    current_admin: Annotated[Admin, Depends(get_current_admin_user)],
):
    """请求修改业绩记录"""
    admin_id = current_admin.get("id") if isinstance(current_admin, dict) else current_admin.id
    record = await service.request_fix_performance(
        performance_id, admin_id, data.comments
    )
    return PerformanceRecordResponse.model_validate(record)


@router.post(
    "/api/admin/performance/{performance_id}/reject",
    response_model=PerformanceRecordResponse,
    tags=["admin-performance"],
    summary="Reject performance record (Admin)",
)
@audit_log(action="reject", resource_type="performance")
async def reject_performance_record(
    performance_id: UUID,
    data: PerformanceApprovalRequest,
    request: Request,
    current_admin: Annotated[Admin, Depends(get_current_admin_user)],
):
    """驳回业绩记录"""
    admin_id = current_admin.get("id") if isinstance(current_admin, dict) else current_admin.id
    record = await service.reject_performance(
        performance_id, admin_id, data.comments
    )
    return PerformanceRecordResponse.model_validate(record)


@router.post(
    "/api/admin/performance/{performance_id}/cancel-review",
    response_model=PerformanceRecordResponse,
    tags=["admin-performance"],
    summary="Cancel review and reset to submitted (Admin)",
)
@audit_log(action="cancel_review", resource_type="performance")
async def cancel_review_performance_record(
    performance_id: UUID,
    request: Request,
    current_admin: Annotated[Admin, Depends(get_current_admin_user)],
):
    """取消审核，重置为已提交状态"""
    record = await service.cancel_review_performance(performance_id)
    return PerformanceRecordResponse.model_validate(record)
