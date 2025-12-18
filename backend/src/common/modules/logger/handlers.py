"""Custom log handlers."""
import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any

from ..config import settings


def create_console_handler(
    formatter: logging.Formatter,
    level: int = logging.INFO,
) -> logging.StreamHandler:
    """Create a console log handler.

    Args:
        formatter: Log formatter to use
        level: Log level for the handler

    Returns:
        Configured console handler
    """
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(formatter)
    return handler


def create_file_handler(
    log_file: str,
    formatter: logging.Formatter,
    level: int = logging.INFO,
    max_bytes: int = 10485760,  # 10MB
    backup_count: int = 5,
) -> RotatingFileHandler:
    """Create a rotating file log handler.

    Args:
        log_file: Path to log file
        formatter: Log formatter to use
        level: Log level for the handler
        max_bytes: Maximum size of log file before rotation
        backup_count: Number of backup files to keep

    Returns:
        Configured file handler
    """
    # Ensure log directory exists
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    handler = RotatingFileHandler(
        log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    handler.setLevel(level)
    handler.setFormatter(formatter)
    return handler


class DatabaseSystemLogHandler(logging.Handler):
    """Custom logging handler that writes system logs to database.
    
    This handler writes logs from Python's standard logging module
    (system.log) to the system_logs table in Supabase.
    """
    
    def __init__(self, level=logging.NOTSET):
        """Initialize database system log handler."""
        super().__init__(level)
        self._enabled = getattr(settings, "LOG_DB_ENABLED", True)
        # System logs should not include DEBUG and INFO levels (too verbose)
        # Use WARNING as minimum level for system logs
        self._min_level = getattr(settings, "LOG_DB_SYSTEM_MIN_LEVEL", "WARNING")
        
        # Log level priority (higher = more important)
        self.log_levels = {
            "DEBUG": 0,
            "INFO": 1,
            "WARNING": 2,
            "ERROR": 3,
            "CRITICAL": 4,
        }
        
    def emit(self, record: logging.LogRecord) -> None:
        """Emit a log record to database.
        
        Args:
            record: Log record to emit
        """
        if not self._enabled:
            return
        
        # Check if log level should be written to database
        log_priority = self.log_levels.get(record.levelname, 0)
        min_priority = self.log_levels.get(self._min_level.upper(), 0)
        if log_priority < min_priority:
            return
        
        try:
            from ..logger.db_writer import db_log_writer
            
            # Extract information from log record
            # Add extra data if available
            extra_data = {}
            if hasattr(record, "pathname"):
                extra_data["pathname"] = record.pathname
            if record.exc_info:
                import traceback
                extra_data["exc_info"] = traceback.format_exception(*record.exc_info)
            if hasattr(record, "exc_text") and record.exc_text:
                extra_data["exc_text"] = record.exc_text
            
            # Write to system_logs table using unified db_log_writer
            db_log_writer.write_system_log(
                level=record.levelname,
                message=self.format(record),
                logger_name=record.name,
                module=record.module if hasattr(record, "module") else None,
                function=record.funcName if hasattr(record, "funcName") else None,
                line_number=record.lineno if hasattr(record, "lineno") else None,
                process_id=record.process if hasattr(record, "process") else None,
                thread_name=record.threadName if hasattr(record, "threadName") else None,
                extra_data=extra_data if extra_data else None,
            )
            
        except Exception:
            # Don't fail if database write fails (graceful degradation)
            # Don't log here to avoid infinite recursion
            pass





























