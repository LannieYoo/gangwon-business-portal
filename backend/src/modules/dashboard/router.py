"""
Dashboard router.

API endpoints for dashboard statistics.
"""
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ...common.modules.db.session import get_db
from ...common.modules.db.models import Member
from ...common.modules.logger import logging_service
from ...common.modules.exception.responses import get_trace_id
from ..user.dependencies import get_current_admin_user
from .service import DashboardService
from .schemas import DashboardResponse

router = APIRouter()
service = DashboardService()


@router.get(
    "/api/admin/dashboard/stats",
    response_model=DashboardResponse,
    tags=["dashboard"],
    summary="Get admin dashboard statistics",
)
async def get_dashboard_stats(
    year: Optional[str] = Query(
        None, description="Year filter ('all' or specific year)"
    ),
    quarter: Optional[str] = Query(
        None, description="Quarter filter ('all', 'Q1', 'Q2', 'Q3', 'Q4')"
    ),
    request: Request = None,
    current_user: Member = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dashboard statistics for admin.

    Aggregates data from members and performance records:
    - Total approved members count
    - Total sales revenue (from approved 'sales' type performance records)
    - Total employment (from approved 'support' type performance records)
    - Total intellectual property count (from approved 'ip' type performance records)

    Also returns chart data for:
    - Member growth over time
    - Sales and employment trends

    Query Parameters:
    - **year**: Filter by year ('all' for all years, or specific year like '2024')
    - **quarter**: Filter by quarter ('all', 'Q1', 'Q2', 'Q3', 'Q4')

    Returns:
        Dashboard statistics and chart data
    """
    trace_id = get_trace_id(request)
    try:
        result = await service.get_dashboard_stats(
            year=year or "all", quarter=quarter or "all", db=db
        )

        logging_service.create_log(
            source="backend",
            level="INFO",
            message="Dashboard stats retrieved successfully",
            module=__name__,
            function="get_dashboard_stats",
            trace_id=trace_id,
            user_id=current_user.id,
            request_path=request.url.path,
            request_method=request.method,
            response_status=200,
            extra_data={
                "year": year,
                "quarter": quarter,
            },
        )

        return DashboardResponse(**result)
    except Exception as e:
        logging_service.create_log(
            source="backend",
            level="ERROR",
            message=f"Failed to get dashboard stats: {str(e)}",
            module=__name__,
            function="get_dashboard_stats",
            trace_id=trace_id,
            user_id=current_user.id,
            request_path=request.url.path,
            request_method=request.method,
            response_status=500,
            extra_data={
                "error": str(e),
                "error_type": type(e).__name__,
                "year": year,
                "quarter": quarter,
            },
        )
        raise

