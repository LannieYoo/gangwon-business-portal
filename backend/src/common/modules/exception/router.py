"""
Application exception router.

API endpoint for frontend to report exceptions.
Database-related endpoints removed (table dropped).
"""
from fastapi import APIRouter, Request

from .service import ExceptionService
from .schemas import FrontendExceptionCreate

router = APIRouter()
exception_service = ExceptionService()


@router.post("/api/v1/exceptions/frontend")
async def create_frontend_exception(
    request: Request,
    exception_data: FrontendExceptionCreate,
):
    """
    Create a frontend application exception entry.
    
    This endpoint is specifically for frontend to record exceptions.
    Backend exceptions should be recorded directly via exception_service (not through this API).
    No authentication required for this endpoint (but should be rate-limited in production).
    """
    from uuid import UUID
    
    # Convert user_id from string to UUID if provided
    user_id = None
    if exception_data.user_id:
        try:
            user_id = UUID(exception_data.user_id)
        except (ValueError, TypeError):
            # Invalid UUID format, ignore user_id
            pass
    
    # Frontend should provide these fields, but we auto-extract as fallback if missing
    # This ensures we always have request context even if frontend doesn't send it
    # Priority: frontend provided value > auto-extracted value
    ip_address = exception_data.ip_address
    if ip_address is None:
        # Frontend cannot get real IP, so we extract it from request
        ip_address = request.client.host if request.client else None
    
    user_agent = exception_data.user_agent
    if not user_agent:
        # Fallback to request header if frontend didn't provide
        user_agent = request.headers.get("user-agent")
    
    request_method = exception_data.request_method
    if not request_method:
        # Fallback to request method if frontend didn't provide
        request_method = request.method
    
    request_path = exception_data.request_path
    if not request_path:
        # Fallback to request path if frontend didn't provide
        request_path = request.url.path
    
    # Get trace_id from request header if frontend didn't provide
    trace_id = exception_data.trace_id
    if not trace_id:
        trace_id = request.headers.get("X-Trace-ID")
    
    # Force source to be frontend
    exception_service.create_exception(
        source="frontend",  # Always frontend for this endpoint
        exception_type=exception_data.exception_type,
        exception_message=exception_data.exception_message,
        error_code=exception_data.error_code,
        status_code=exception_data.status_code,
        trace_id=trace_id,
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent,
        request_method=request_method,
        request_path=request_path,
        request_data=exception_data.request_data,
        stack_trace=exception_data.stack_trace,
        exception_details=exception_data.exception_details,
        context_data=exception_data.context_data,
    )
    
    return {"status": "ok"}
