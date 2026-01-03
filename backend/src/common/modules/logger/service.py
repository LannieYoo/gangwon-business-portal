"""
Logging service.

Unified logging service with consistent API for all log types.
All logs are written to both file and database.

Usage:
    await logging_service.app(AppLogCreate(...))           # -> app.log + DB
    await logging_service.error(ErrorLogCreate(...))       # -> error.log + DB
    await logging_service.audit(AuditLogCreate(...))       # -> audit.log + DB
    await logging_service.performance(PerformanceLogCreate(...))  # -> performance.log + DB
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional, TYPE_CHECKING
from uuid import UUID
import logging

from .file_writer import file_log_writer
from .db_writer import db_log_writer
from .schemas import (
    AppLogCreate,
    ErrorLogCreate,
    PerformanceLogCreate,
    AuditLogCreate,
    LogListQuery,
    LogListResponse,
    AppLogResponse,
)

logger = logging.getLogger(__name__)

# Use TYPE_CHECKING to avoid circular import
if TYPE_CHECKING:
    from ..db.models import AppLog, ErrorLog, AuditLog, PerformanceLog, Member


class LoggingService:
    """
    Unified logging service class.
    
    Provides consistent API for all log types:
    - app(): Application business logs
    - error(): Exception/error logs
    - audit(): Audit trail logs
    - performance(): Performance metrics logs
    
    All methods write to both file and database.
    """

    # =========================================================================
    # Unified Log Methods - 统一日志入口
    # =========================================================================

    async def app(self, schema: AppLogCreate) -> dict:
        """
        Create an application log entry.
        
        Args:
            schema: AppLogCreate schema instance
            
        Returns:
            dict: The log entry data
        """
        # Write to file (always, for debugging and backup)
        try:
            file_log_writer.write_app_log_from_schema(schema)
        except Exception:
            pass
        
        # Enqueue for database write (async, non-blocking)
        try:
            db_log_writer.enqueue_app_log_from_schema(schema)
        except Exception:
            pass
        
        return schema.to_db_dict()

    async def error(self, schema: ErrorLogCreate) -> dict:
        """
        Create an error log entry.
        
        Args:
            schema: ErrorLogCreate schema instance
            
        Returns:
            dict: The log entry data
        """
        # Write to file
        try:
            file_log_writer.write_error_log_from_schema(schema)
        except Exception:
            pass
        
        # Enqueue for database write
        try:
            db_log_writer.enqueue_error_log_from_schema(schema)
        except Exception:
            pass
        
        return schema.to_db_dict()

    async def audit(self, schema: AuditLogCreate) -> dict:
        """
        Create an audit log entry.
        
        Args:
            schema: AuditLogCreate schema instance
            
        Returns:
            dict: The log entry data
        """
        # Write to file
        try:
            file_log_writer.write_audit_log_from_schema(schema)
        except Exception:
            pass
        
        # Enqueue for database write
        try:
            db_log_writer.enqueue_audit_log_from_schema(schema)
        except Exception:
            pass
        
        return schema.to_db_dict()

    async def performance(self, schema: PerformanceLogCreate) -> dict:
        """
        Create a performance log entry.
        
        Args:
            schema: PerformanceLogCreate schema instance
            
        Returns:
            dict: The log entry data
        """
        # Write to file
        try:
            file_log_writer.write_performance_log_from_schema(schema)
        except Exception:
            pass
        
        # Enqueue for database write
        try:
            db_log_writer.enqueue_performance_log_from_schema(schema)
        except Exception:
            pass
        
        return schema.to_db_dict()

    # =========================================================================
    # Backward Compatibility - 向后兼容
    # =========================================================================

    async def log(self, schema: AppLogCreate) -> dict:
        """
        Alias for app() method for backward compatibility.
        
        Deprecated: Use app() instead.
        """
        return await self.app(schema)

    # =========================================================================
    # Query Methods - 查询方法
    # =========================================================================

    async def list_logs(
        self,
        db: AsyncSession,
        query: LogListQuery,
    ) -> LogListResponse:
        """
        List application logs with filtering and pagination.

        Args:
            db: Database session
            query: Query parameters

        Returns:
            Paginated list of application logs
        """
        # Lazy import to avoid circular dependency
        from ..db.models import AppLog
        
        # Build base query (no user relationship - user_id has no FK)
        base_query = select(AppLog)

        # Apply filters
        conditions = []
        if query.source:
            conditions.append(AppLog.source == query.source)
        if query.level:
            # 支持逗号分隔的多级别查询，如 "ERROR,CRITICAL"
            levels = [l.strip() for l in query.level.split(',')]
            if len(levels) == 1:
                conditions.append(AppLog.level == levels[0])
            else:
                conditions.append(AppLog.level.in_(levels))
        if query.layer:
            conditions.append(AppLog.layer == query.layer)
        if query.trace_id:
            conditions.append(AppLog.trace_id == query.trace_id)
        if query.user_id:
            conditions.append(AppLog.user_id == query.user_id)
        if query.start_date:
            conditions.append(AppLog.created_at >= query.start_date)
        if query.end_date:
            conditions.append(AppLog.created_at <= query.end_date)

        if conditions:
            base_query = base_query.where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(AppLog)
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        offset = (query.page - 1) * query.page_size
        base_query = base_query.order_by(AppLog.created_at.desc())
        base_query = base_query.offset(offset).limit(query.page_size)

        # Execute query
        result = await db.execute(base_query)
        logs = result.scalars().all()

        # Convert to response models (no user relationship)
        items = [
            AppLogResponse(
                id=log.id,
                source=log.source,
                level=log.level,
                message=log.message,
                layer=log.layer,
                module=log.module,
                function=log.function,
                line_number=log.line_number,
                file_path=log.file_path,
                trace_id=log.trace_id,
                user_id=log.user_id,
                duration_ms=log.duration_ms,
                extra_data=log.extra_data,
                created_at=log.created_at,
                user_email=None,  # No user relationship
                user_company_name=None,
            )
            for log in logs
        ]

        total_pages = (total + query.page_size - 1) // query.page_size

        return LogListResponse(
            items=items,
            total=total,
            page=query.page,
            page_size=query.page_size,
            total_pages=total_pages,
        )

    async def list_error_logs(
        self,
        db: AsyncSession,
        query: LogListQuery,
    ) -> LogListResponse:
        """
        List error logs with filtering and pagination.

        Args:
            db: Database session
            query: Query parameters

        Returns:
            Paginated list of error logs
        """
        from ..db.models import ErrorLog
        
        # Build base query
        base_query = select(ErrorLog)

        # Apply filters
        conditions = []
        if query.level:
            levels = [l.strip() for l in query.level.split(',')]
            if len(levels) == 1:
                conditions.append(ErrorLog.level == levels[0])
            else:
                conditions.append(ErrorLog.level.in_(levels))
        if query.trace_id:
            conditions.append(ErrorLog.trace_id == query.trace_id)
        if query.user_id:
            conditions.append(ErrorLog.user_id == query.user_id)
        if query.start_date:
            conditions.append(ErrorLog.created_at >= query.start_date)
        if query.end_date:
            conditions.append(ErrorLog.created_at <= query.end_date)

        if conditions:
            base_query = base_query.where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(ErrorLog)
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        offset = (query.page - 1) * query.page_size
        base_query = base_query.order_by(ErrorLog.created_at.desc())
        base_query = base_query.offset(offset).limit(query.page_size)

        # Execute query
        result = await db.execute(base_query)
        logs = result.scalars().all()

        # Convert to response models
        items = [
            AppLogResponse(
                id=log.id,
                source=log.source,
                level=log.level,
                message=log.message,
                layer=log.layer,
                module=log.module,
                function=log.function,
                line_number=log.line_number,
                file_path=log.file_path,
                trace_id=log.trace_id,
                user_id=log.user_id,
                duration_ms=None,
                extra_data=log.extra_data,
                created_at=log.created_at,
                user_email=None,
                user_company_name=None,
            )
            for log in logs
        ]

        total_pages = (total + query.page_size - 1) // query.page_size

        return LogListResponse(
            items=items,
            total=total,
            page=query.page,
            page_size=query.page_size,
            total_pages=total_pages,
        )

    async def list_performance_logs(
        self,
        db: AsyncSession,
        query: LogListQuery,
    ) -> LogListResponse:
        """
        List performance logs with filtering and pagination.

        Args:
            db: Database session
            query: Query parameters

        Returns:
            Paginated list of performance logs
        """
        from ..db.models import PerformanceLog
        
        # Build base query
        base_query = select(PerformanceLog)

        # Apply filters
        conditions = []
        if query.source:
            conditions.append(PerformanceLog.source == query.source)
        if query.trace_id:
            conditions.append(PerformanceLog.trace_id == query.trace_id)
        if query.user_id:
            conditions.append(PerformanceLog.user_id == query.user_id)
        if query.start_date:
            conditions.append(PerformanceLog.created_at >= query.start_date)
        if query.end_date:
            conditions.append(PerformanceLog.created_at <= query.end_date)

        if conditions:
            base_query = base_query.where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(PerformanceLog)
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        offset = (query.page - 1) * query.page_size
        base_query = base_query.order_by(PerformanceLog.created_at.desc())
        base_query = base_query.offset(offset).limit(query.page_size)

        # Execute query
        result = await db.execute(base_query)
        logs = result.scalars().all()

        # Convert to response models
        items = [
            AppLogResponse(
                id=log.id,
                source=log.source,
                level=log.level,
                message=log.message,
                layer=log.layer,
                module=log.module,
                function=log.function,
                line_number=log.line_number,
                file_path=log.file_path,
                trace_id=log.trace_id,
                user_id=log.user_id,
                duration_ms=log.duration_ms,
                extra_data=log.extra_data,
                created_at=log.created_at,
                user_email=None,
                user_company_name=None,
            )
            for log in logs
        ]

        total_pages = (total + query.page_size - 1) // query.page_size

        return LogListResponse(
            items=items,
            total=total,
            page=query.page,
            page_size=query.page_size,
            total_pages=total_pages,
        )

    async def list_system_logs(
        self,
        db: AsyncSession,
        query: LogListQuery,
    ) -> LogListResponse:
        """
        List system logs with filtering and pagination.

        Args:
            db: Database session
            query: Query parameters

        Returns:
            Paginated list of system logs
        """
        from ..db.models import SystemLog
        
        # Build base query
        base_query = select(SystemLog)

        # Apply filters
        conditions = []
        if query.level:
            levels = [l.strip() for l in query.level.split(',')]
            if len(levels) == 1:
                conditions.append(SystemLog.level == levels[0])
            else:
                conditions.append(SystemLog.level.in_(levels))
        if query.start_date:
            conditions.append(SystemLog.created_at >= query.start_date)
        if query.end_date:
            conditions.append(SystemLog.created_at <= query.end_date)

        if conditions:
            base_query = base_query.where(and_(*conditions))

        # Get total count
        count_query = select(func.count()).select_from(SystemLog)
        if conditions:
            count_query = count_query.where(and_(*conditions))

        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        offset = (query.page - 1) * query.page_size
        base_query = base_query.order_by(SystemLog.created_at.desc())
        base_query = base_query.offset(offset).limit(query.page_size)

        # Execute query
        result = await db.execute(base_query)
        logs = result.scalars().all()

        # Convert to response models
        items = [
            AppLogResponse(
                id=log.id,
                source="system",
                level=log.level,
                message=log.message,
                layer=log.layer,
                module=log.module,
                function=log.function,
                line_number=log.line_number,
                file_path=log.file_path,
                trace_id=None,
                user_id=None,
                duration_ms=None,
                extra_data=log.extra_data,
                created_at=log.created_at,
                user_email=None,
                user_company_name=None,
            )
            for log in logs
        ]

        total_pages = (total + query.page_size - 1) // query.page_size

        return LogListResponse(
            items=items,
            total=total,
            page=query.page,
            page_size=query.page_size,
            total_pages=total_pages,
        )

    async def get_log(
        self,
        db: AsyncSession,
        log_id: UUID,
    ) -> Optional["AppLog"]:
        """
        Get a single log by ID.

        Args:
            db: Database session
            log_id: Log ID

        Returns:
            AppLog instance or None if not found
        """
        from ..db.models import AppLog
        
        result = await db.execute(
            select(AppLog)
            .options(selectinload(AppLog.user))
            .where(AppLog.id == log_id)
        )
        return result.scalar_one_or_none()


# Create singleton instance
logging_service = LoggingService()
