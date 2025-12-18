"""
Exception service.

Business logic for application exception operations.
Now only writes to file logs (database table removed).
"""
from typing import Optional, Any
from uuid import UUID
import traceback

from ..logger.file_writer import file_log_writer


class ExceptionService:
    """Exception service class."""

    def create_exception(
        self,
        source: str,  # backend, frontend
        exception_type: str,
        exception_message: str,
        error_code: Optional[str] = None,
        status_code: Optional[int] = None,
        trace_id: Optional[str] = None,
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_method: Optional[str] = None,
        request_path: Optional[str] = None,
        request_data: Optional[dict[str, Any]] = None,
        stack_trace: Optional[str] = None,
        exception_details: Optional[dict[str, Any]] = None,
        context_data: Optional[dict[str, Any]] = None,
        exc: Optional[Exception] = None,
    ) -> None:
        """
        Create an application exception entry (file only).

        Args:
            source: Source of the exception (backend/frontend)
            exception_type: Exception class name
            exception_message: Exception message
            error_code: Application error code
            status_code: HTTP status code
            trace_id: Request trace ID
            user_id: User ID
            ip_address: IP address
            user_agent: User agent string
            request_method: HTTP method
            request_path: Request path
            request_data: Request payload (sanitized)
            stack_trace: Full stack trace
            exception_details: Additional exception details
            context_data: Additional context data
            exc: Exception object (for extracting stack trace if not provided)
        """
        # Extract stack trace from exception if not provided
        if not stack_trace and exc:
            stack_trace = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))

        # Write to file log
        try:
            file_log_writer.write_exception(
                source=source,
                exception_type=exception_type,
                exception_message=exception_message,
                error_code=error_code,
                status_code=status_code,
                trace_id=trace_id,
                user_id=str(user_id) if user_id else None,
                ip_address=ip_address,
                user_agent=user_agent,
                request_method=request_method,
                request_path=request_path,
                request_data=request_data,
                stack_trace=stack_trace,
                exception_details=exception_details,
                context_data=context_data,
            )
        except Exception:
            # Don't fail if file write fails
            pass
