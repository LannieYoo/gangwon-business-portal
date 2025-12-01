"""
Upload router.

API endpoints for file upload and management.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Query, status, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Annotated
from uuid import UUID

from fastapi import Request

from ...common.modules.db.session import get_db
from ...common.modules.db.models import Member
from ...common.modules.audit import audit_log_service, get_client_info
from ...common.modules.logger import logging_service
from ...common.modules.exception import AppException
from ...common.modules.exception.responses import get_trace_id
from ..user.dependencies import get_current_active_user
from .service import UploadService
from .schemas import FileUploadResponse, FileDownloadResponse

router = APIRouter()
service = UploadService()


def _handle_app_exception(exc: AppException) -> None:
    """Convert internal AppException into FastAPI HTTPException."""
    raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post(
    "/api/upload/public",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["upload"],
    summary="Upload public file",
)
async def upload_public_file(
    file: Annotated[UploadFile, File(description="File to upload")],
    request: Request,
    resource_type: Annotated[Optional[str], Query(description="Resource type (e.g., 'banner', 'notice')")] = None,
    resource_id: Annotated[Optional[UUID], Query(description="Associated resource ID")] = None,
    current_user: Annotated[Member, Depends(get_current_active_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    """
    Upload a public file (e.g., banner images, notice images).

    - **file**: File to upload (max 10MB)
    - **resource_type**: Optional resource type
    - **resource_id**: Optional associated resource ID
    - Requires authentication
    """
    trace_id = get_trace_id(request)
    try:
        attachment = await service.upload_public_file(
            file=file,
            user=current_user,
            resource_type=resource_type,
            resource_id=resource_id,
            db=db,
        )
    except AppException as exc:  # pragma: no cover - exercised via tests
        _handle_app_exception(exc)
    
    # Record audit log
    if current_user:
        try:
            ip_address, user_agent = get_client_info(request)
            await audit_log_service.create_audit_log(
                db=db,
                action="upload",
                user_id=current_user.id,
                resource_type="file",
                resource_id=attachment.id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        except Exception as e:
            logging_service.create_log(
                source="backend",
                level="ERROR",
                message=f"Failed to create audit log: {str(e)}",
                module=__name__,
                function="upload_public_file",
                trace_id=trace_id,
                user_id=current_user.id,
                request_path=request.url.path,
                request_method=request.method,
                response_status=201,
                extra_data={
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
            )
    
    return FileUploadResponse.model_validate(attachment)


@router.post(
    "/api/upload/private",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["upload"],
    summary="Upload private file",
)
async def upload_private_file(
    file: Annotated[UploadFile, File(description="File to upload")],
    request: Request,
    resource_type: Annotated[Optional[str], Query(description="Resource type (e.g., 'performance', 'project')")] = None,
    resource_id: Annotated[Optional[UUID], Query(description="Associated resource ID")] = None,
    current_user: Annotated[Member, Depends(get_current_active_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    """
    Upload a private file (e.g., performance attachments, member certificates).

    - **file**: File to upload (max 10MB)
    - **resource_type**: Optional resource type
    - **resource_id**: Optional associated resource ID
    - Requires authentication
    - File will be stored privately and require authentication to access
    """
    trace_id = get_trace_id(request)
    try:
        attachment = await service.upload_private_file(
            file=file,
            user=current_user,
            resource_type=resource_type,
            resource_id=resource_id,
            db=db,
        )
    except AppException as exc:  # pragma: no cover - exercised via tests
        _handle_app_exception(exc)
    
    # Record audit log
    if current_user:
        try:
            ip_address, user_agent = get_client_info(request)
            await audit_log_service.create_audit_log(
                db=db,
                action="upload",
                user_id=current_user.id,
                resource_type="file",
                resource_id=attachment.id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        except Exception as e:
            logging_service.create_log(
                source="backend",
                level="ERROR",
                message=f"Failed to create audit log: {str(e)}",
                module=__name__,
                function="upload_private_file",
                trace_id=trace_id,
                user_id=current_user.id,
                request_path=request.url.path,
                request_method=request.method,
                response_status=201,
                extra_data={
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
            )
    
    return FileUploadResponse.model_validate(attachment)


@router.get(
    "/api/upload/{file_id}",
    response_model=FileDownloadResponse,
    tags=["upload"],
    summary="Download file",
)
async def download_file(
    file_id: UUID,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    """
    Get file download URL.

    - **file_id**: Attachment ID
    - For public files: returns public URL
    - For private files: returns signed URL (valid for 1 hour)
    - Requires authentication
    - Checks permissions (user must own the file or be admin)
    """
    trace_id = get_trace_id(request)
    try:
        attachment = await service.get_file(
            file_id=file_id,
            user=current_user,
            db=db,
        )
    except AppException as exc:
        _handle_app_exception(exc)
    
    # Record audit log
    if current_user:
        try:
            ip_address, user_agent = get_client_info(request)
            await audit_log_service.create_audit_log(
                db=db,
                action="download",
                user_id=current_user.id,
                resource_type="file",
                resource_id=attachment.id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        except Exception as e:
            logging_service.create_log(
                source="backend",
                level="ERROR",
                message=f"Failed to create audit log: {str(e)}",
                module=__name__,
                function="download_file",
                trace_id=trace_id,
                user_id=current_user.id,
                request_path=request.url.path,
                request_method=request.method,
                response_status=200,
                extra_data={
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
            )
    
    return FileDownloadResponse(
        file_url=attachment.file_url,
        original_name=attachment.original_name,
        mime_type=attachment.mime_type,
        file_size=attachment.file_size,
    )


@router.get(
    "/api/upload/{file_id}/redirect",
    tags=["upload"],
    summary="Redirect to file download",
)
async def redirect_to_file(
    file_id: UUID,
    current_user: Annotated[Member, Depends(get_current_active_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    """
    Redirect to file download URL.

    - **file_id**: Attachment ID
    - Returns HTTP redirect to file URL
    - Requires authentication
    - Checks permissions
    """
    try:
        attachment = await service.get_file(
            file_id=file_id,
            user=current_user,
            db=db,
        )
    except AppException as exc:
        _handle_app_exception(exc)
    
    return RedirectResponse(url=attachment.file_url, status_code=status.HTTP_302_FOUND)


@router.delete(
    "/api/upload/{file_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["upload"],
    summary="Delete file",
)
async def delete_file(
    file_id: UUID,
    request: Request,
    current_user: Annotated[Member, Depends(get_current_active_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    """
    Delete a file.

    - **file_id**: Attachment ID
    - Requires authentication
    - Checks permissions (user must own the file or be admin)
    - Deletes file from storage and database
    """
    trace_id = get_trace_id(request)
    try:
        await service.delete_file(
            file_id=file_id,
            user=current_user,
            db=db,
        )
    except AppException as exc:  # pragma: no cover - tested indirectly
        _handle_app_exception(exc)
    
    # Record audit log
    if current_user:
        try:
            ip_address, user_agent = get_client_info(request)
            await audit_log_service.create_audit_log(
                db=db,
                action="delete",
                user_id=current_user.id,
                resource_type="file",
                resource_id=file_id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        except Exception as e:
            logging_service.create_log(
                source="backend",
                level="ERROR",
                message=f"Failed to create audit log: {str(e)}",
                module=__name__,
                function="delete_file",
                trace_id=trace_id,
                user_id=current_user.id,
                request_path=request.url.path,
                request_method=request.method,
                response_status=204,
                extra_data={
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
            )
    
    return None

