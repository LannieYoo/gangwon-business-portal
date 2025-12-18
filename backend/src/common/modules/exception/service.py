"""
Exception service.

Business logic for application exception operations.
Writes to both file logs and error_logs table for permanent storage.
"""
from typing import Optional, Any
from uuid import UUID
import traceback
import asyncio

from ..logger.file_writer import file_log_writer
from ..supabase.client import get_supabase_client


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
        Create an application exception entry (file + error_logs table).

        Writes to:
        - File log (for real-time debugging)
        - error_logs table (for permanent storage in Supabase)

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
        
        # Write to error_logs table (for permanent storage)
        try:
            from uuid import uuid4
            
            supabase = get_supabase_client()
            
            error_data = {
                "id": str(uuid4()),
                "source": source,
                "error_type": exception_type,
                "error_message": exception_message,
                "error_code": error_code,
                "status_code": status_code,
                "stack_trace": stack_trace,
                "module": None,  # Can be extracted from stack_trace if needed
                "function": None,
                "line_number": None,
                "trace_id": trace_id,
                "user_id": str(user_id) if user_id else None,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "request_method": request_method,
                "request_path": request_path,
                "request_data": request_data,
                "error_details": exception_details,
                "context_data": context_data,
            }
            
            # Remove None values (Supabase will use defaults)
            error_data = {k: v for k, v in error_data.items() if v is not None}
            
            # Insert using Supabase API (run in thread pool to avoid blocking)
            # This is a fire-and-forget operation, so we don't wait for the result
            def _insert_error_log():
                try:
                    return supabase.table("error_logs").insert(error_data).execute()
                except Exception as e:
                    # Log error but don't raise (already in background thread)
                    import logging
                    logging.warning(f"Failed to insert error log to database: {str(e)}")
            
            # Run in background thread (fire-and-forget)
            import threading
            thread = threading.Thread(target=_insert_error_log, daemon=True)
            thread.start()
            
        except Exception as e:
            # Don't fail if database write fails (graceful degradation)
            # Log to file as fallback
            try:
                import logging
                logging.warning(f"Failed to write error log to database: {str(e)}")
            except Exception:
                pass
