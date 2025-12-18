"""
Exception schemas.

Pydantic models for application exception API requests.
Database-related response schemas removed (table dropped).
"""
from typing import Optional, Any, Union
from pydantic import BaseModel, Field, field_validator


class FrontendExceptionCreate(BaseModel):
    """Schema for creating a frontend application exception entry."""

    exception_type: str = Field(..., description="Exception type/class name")
    exception_message: str = Field(..., description="Exception message")
    error_code: Optional[str] = None
    status_code: Optional[int] = None
    trace_id: Optional[str] = None
    user_id: Optional[Union[str, int]] = None  # Accept string or number, will be converted to UUID
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_method: Optional[str] = None
    request_path: Optional[str] = None
    request_data: Optional[dict[str, Any]] = None
    stack_trace: Optional[str] = None
    exception_details: Optional[dict[str, Any]] = None
    context_data: Optional[dict[str, Any]] = None
    
    @field_validator("user_id", mode="before")
    @classmethod
    def convert_user_id_to_string(cls, v):
        """Convert user_id from number to string if needed."""
        if v is None:
            return None
        # Convert number to string, or keep string as is
        return str(v) if isinstance(v, (int, float)) else v
