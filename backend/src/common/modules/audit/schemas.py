"""
Audit log schemas.

Pydantic models for audit log API requests and responses.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    """Audit log response schema."""

    id: UUID
    user_id: Optional[UUID] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[UUID] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    trace_id: Optional[str] = None
    request_id: Optional[str] = None
    request_method: Optional[str] = None
    request_path: Optional[str] = None
    created_at: datetime
    user_email: Optional[str] = None
    user_company_name: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogListQuery(BaseModel):
    """Query parameters for listing audit logs."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    user_id: Optional[UUID] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[UUID] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AuditLogListResponse(BaseModel):
    """Response schema for audit log list."""

    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
