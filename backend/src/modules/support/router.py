"""
Support router.

API endpoints for support management (FAQs).
"""
from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from uuid import UUID

from fastapi import Request

from ...common.modules.db.models import Member
from ...common.modules.audit import audit_log
from ..user.dependencies import get_current_admin_user
from .service import SupportService
from .schemas import (
    FAQCreate,
    FAQUpdate,
    FAQResponse,
    FAQListResponse,
)

router = APIRouter()
service = SupportService()


# Public FAQ Endpoints

@router.get(
    "/api/faqs",
    response_model=FAQListResponse,
    tags=["support"],
    summary="List FAQs",
)
async def list_faqs(
    category: Optional[str] = Query(default=None, description="Filter by category"),
):
    """List FAQs, optionally filtered by category."""
    faqs = await service.get_faqs(category)
    return FAQListResponse(items=[FAQResponse(**f) for f in faqs])


# Admin FAQ Endpoints

@router.post(
    "/api/admin/faqs",
    response_model=FAQResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["support", "admin"],
    summary="Create FAQ",
)
@audit_log(action="create", resource_type="faq")
async def create_faq(
    data: FAQCreate,
    request: Request,
    current_user: Member = Depends(get_current_admin_user),
):
    """Create a new FAQ (admin only)."""
    faq = await service.create_faq(data)
    return FAQResponse(**faq)


@router.put(
    "/api/admin/faqs/{faq_id}",
    response_model=FAQResponse,
    tags=["support", "admin"],
    summary="Update FAQ",
)
@audit_log(action="update", resource_type="faq")
async def update_faq(
    faq_id: UUID,
    data: FAQUpdate,
    request: Request,
    current_user: Member = Depends(get_current_admin_user),
):
    """Update an FAQ (admin only)."""
    faq = await service.update_faq(faq_id, data)
    return FAQResponse(**faq)


@router.delete(
    "/api/admin/faqs/{faq_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["support", "admin"],
    summary="Delete FAQ",
)
@audit_log(action="delete", resource_type="faq")
async def delete_faq(
    faq_id: UUID,
    request: Request,
    current_user: Member = Depends(get_current_admin_user),
):
    """Delete an FAQ (admin only)."""
    await service.delete_faq(faq_id)
