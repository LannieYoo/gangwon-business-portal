"""
Project router.

API endpoints for project and application management.
"""
from fastapi import APIRouter, Depends, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Annotated, Optional
from math import ceil
from datetime import datetime

from fastapi import Request

from ...common.modules.db.session import get_db
from ...common.modules.db.models import Member
from ...common.modules.audit import audit_log_service, get_client_info
from ..user.dependencies import get_current_active_user, get_current_admin_user
from .service import ProjectService
from .schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListItem,
    ProjectListQuery,
    ProjectListResponsePaginated,
    ProjectApplicationCreate,
    ProjectApplicationResponse,
    ProjectApplicationListItem,
    ApplicationListQuery,
    ApplicationListResponsePaginated,
    ApplicationStatusUpdate,
)


router = APIRouter()
service = ProjectService()


# Public/Member endpoints


@router.get(
    "/api/projects",
    response_model=ProjectListResponsePaginated,
    tags=["projects"],
    summary="List all projects",
)
async def list_projects(
    query: Annotated[ProjectListQuery, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    List all projects with pagination and filtering (public access).

    - **status**: Filter by status (active, inactive, archived)
    - **search**: Search in title and description
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    """
    projects, total = await service.list_projects(query, db)

    return ProjectListResponsePaginated(
        items=[ProjectListItem.model_validate(p) for p in projects],
        total=total,
        page=query.page,
        page_size=query.page_size,
        total_pages=ceil(total / query.page_size) if total > 0 else 0,
    )


@router.get(
    "/api/projects/{project_id}",
    response_model=ProjectResponse,
    tags=["projects"],
    summary="Get project details",
)
async def get_project(
    project_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get detailed information about a specific project (public access).
    """
    project = await service.get_project_by_id(project_id, db)
    return ProjectResponse.model_validate(project)


@router.post(
    "/api/projects/{project_id}/apply",
    response_model=ProjectApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["projects"],
    summary="Apply to project",
)
async def apply_to_project(
    project_id: UUID,
    data: ProjectApplicationCreate,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Apply to a project (member only).

    Requires authentication. Member must not have already applied to this project.
    """
    application = await service.apply_to_project(
        current_user.id, project_id, data, db
    )
    
    # Record audit log
    try:
        ip_address, user_agent = get_client_info(request)
        await audit_log_service.create_audit_log(
            db=db,
            action="apply",
            user_id=current_user.id,
            resource_type="project_application",
            resource_id=application.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as e:
        from ...common.modules.logger import logger
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)
    # NOTE:
    # Avoid letting Pydantic introspect SQLAlchemy relationships on async
    # models (which can trigger lazy-loading errors). We construct the
    # response explicitly from scalar fields without loading nested
    # project details, which is sufficient for current API consumers
    # and keeps the endpoint stable.
    return ProjectApplicationResponse(
        id=application.id,
        member_id=application.member_id,
        project_id=application.project_id,
        project=None,
        status=application.status,
        application_reason=application.application_reason,
        submitted_at=application.submitted_at,
        reviewed_at=application.reviewed_at,
    )


@router.get(
    "/api/my-applications",
    response_model=ApplicationListResponsePaginated,
    tags=["projects"],
    summary="Get my project applications",
)
async def get_my_applications(
    query: Annotated[ApplicationListQuery, Depends()],
    current_user: Annotated[Member, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get member's own project applications with pagination (member only).

    - **status**: Filter by status (submitted, under_review, approved, rejected)
    - **page**: Page number
    - **page_size**: Items per page
    """
    applications, total = await service.get_my_applications(
        current_user.id, query, db
    )

    return ApplicationListResponsePaginated(
        items=[ProjectApplicationListItem.model_validate(a) for a in applications],
        total=total,
        page=query.page,
        page_size=query.page_size,
        total_pages=ceil(total / query.page_size) if total > 0 else 0,
    )


# Admin endpoints


@router.post(
    "/api/admin/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["admin-projects"],
    summary="Create project (Admin)",
)
async def create_project(
    data: ProjectCreate,
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new project (admin only).
    """
    project = await service.create_project(data, db)
    
    # Record audit log
    try:
        ip_address, user_agent = get_client_info(request)
        await audit_log_service.create_audit_log(
            db=db,
            action="create",
            user_id=current_admin.id,
            resource_type="project",
            resource_id=project.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as e:
        from ...common.modules.logger import logger
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)
    
    return ProjectResponse.model_validate(project)


@router.put(
    "/api/admin/projects/{project_id}",
    response_model=ProjectResponse,
    tags=["admin-projects"],
    summary="Update project (Admin)",
)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update project details (admin only).
    """
    project = await service.update_project(project_id, data, db)
    
    # Record audit log
    try:
        ip_address, user_agent = get_client_info(request)
        await audit_log_service.create_audit_log(
            db=db,
            action="update",
            user_id=current_admin.id,
            resource_type="project",
            resource_id=project.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as e:
        from ...common.modules.logger import logger
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)
    
    return ProjectResponse.model_validate(project)


@router.delete(
    "/api/admin/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["admin-projects"],
    summary="Delete project (Admin)",
)
async def delete_project(
    project_id: UUID,
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Delete a project (admin only).

    WARNING: This will cascade delete all applications related to this project.
    """
    await service.delete_project(project_id, db)
    
    # Record audit log
    try:
        ip_address, user_agent = get_client_info(request)
        await audit_log_service.create_audit_log(
            db=db,
            action="delete",
            user_id=current_admin.id,
            resource_type="project",
            resource_id=project_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as e:
        from ...common.modules.logger import logger
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)


@router.get(
    "/api/admin/projects/{project_id}/applications",
    response_model=ApplicationListResponsePaginated,
    tags=["admin-projects"],
    summary="List project applications (Admin)",
)
async def list_project_applications(
    project_id: UUID,
    query: Annotated[ApplicationListQuery, Depends()],
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    List all applications for a specific project (admin only).

    - **status**: Filter by application status
    - **page**: Page number
    - **page_size**: Items per page
    """
    applications, total = await service.list_project_applications(
        project_id, query, db
    )

    return ApplicationListResponsePaginated(
        items=[ProjectApplicationListItem.model_validate(a) for a in applications],
        total=total,
        page=query.page,
        page_size=query.page_size,
        total_pages=ceil(total / query.page_size) if total > 0 else 0,
    )


@router.put(
    "/api/admin/applications/{application_id}/status",
    response_model=ProjectApplicationResponse,
    tags=["admin-projects"],
    summary="Update application status (Admin)",
)
async def update_application_status(
    application_id: UUID,
    data: ApplicationStatusUpdate,
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update application status (admin only).

    Change application status to: submitted, under_review, approved, or rejected.
    """
    application = await service.update_application_status(
        application_id, data.status, db
    )
    
    # Record audit log
    try:
        ip_address, user_agent = get_client_info(request)
        await audit_log_service.create_audit_log(
            db=db,
            action=f"update_status_{data.status}",
            user_id=current_admin.id,
            resource_type="project_application",
            resource_id=application.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as e:
        from ...common.modules.logger import logger
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)
    # See note in apply_to_project: build response explicitly to avoid
    # async lazy-loading of relationships during serialization.
    return ProjectApplicationResponse(
        id=application.id,
        member_id=application.member_id,
        project_id=application.project_id,
        project=None,
        status=application.status,
        application_reason=application.application_reason,
        submitted_at=application.submitted_at,
        reviewed_at=application.reviewed_at,
    )


@router.get(
    "/api/admin/projects/export",
    tags=["admin-projects"],
    summary="Export projects data (Admin)",
)
async def export_projects(
    query: Annotated[ProjectListQuery, Depends()],
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    format: str = Query("excel", regex="^(excel|csv)$", description="Export format: excel or csv"),
):
    """
    Export projects data to Excel or CSV (admin only).

    Supports the same filtering options as the list endpoint.
    """
    from ...common.modules.export import ExportService
    from ...common.modules.audit import audit_log_service, get_client_info
    
    # Get export data
    export_data = await service.export_projects_data(query, db)
    
    # Record audit log
    try:
        ip_address, user_agent = get_client_info(request)
        await audit_log_service.create_audit_log(
            db=db,
            action="export",
            user_id=current_admin.id,
            resource_type="project",
            resource_id=None,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as e:
        from ...common.modules.logger import logger
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)
    
    # Generate export file
    if format == "excel":
        excel_bytes = ExportService.export_to_excel(
            data=export_data,
            sheet_name="Projects",
            title=f"Projects Export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        )
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="projects_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
            },
        )
    else:  # CSV
        csv_content = ExportService.export_to_csv(
            data=export_data,
        )
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="projects_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
            },
        )


@router.get(
    "/api/admin/applications/export",
    tags=["admin-projects"],
    summary="Export project applications data (Admin)",
)
async def export_applications(
    query: Annotated[ApplicationListQuery, Depends()],
    request: Request,
    current_admin: Annotated[Member, Depends(get_current_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    format: str = Query("excel", regex="^(excel|csv)$", description="Export format: excel or csv"),
    project_id: Optional[UUID] = Query(None, description="Filter by project ID"),
):
    """
    Export project applications data to Excel or CSV (admin only).

    Supports filtering by project ID and application status.
    """
    from ...common.modules.export import ExportService
    from ...common.modules.audit import audit_log_service, get_client_info
    
    # Get export data
    export_data = await service.export_applications_data(project_id, query, db)
    
    # Record audit log
    try:
        ip_address, user_agent = get_client_info(request)
        await audit_log_service.create_audit_log(
            db=db,
            action="export",
            user_id=current_admin.id,
            resource_type="project_application",
            resource_id=None,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as e:
        from ...common.modules.logger import logger
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)
    
    # Generate export file
    if format == "excel":
        excel_bytes = ExportService.export_to_excel(
            data=export_data,
            sheet_name="Applications",
            title=f"Project Applications Export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        )
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="applications_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
            },
        )
    else:  # CSV
        csv_content = ExportService.export_to_csv(
            data=export_data,
        )
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="applications_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
            },
        )
