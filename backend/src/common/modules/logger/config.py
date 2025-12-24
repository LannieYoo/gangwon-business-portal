"""Logging configuration and setup."""
import json
import logging
from datetime import datetime
from pathlib import Path

from ..config import settings
from .filters import SensitiveDataFilter, ContextFilter
from .formatter import JSONFormatter
from .handlers import create_file_handler, DatabaseSystemLogHandler
# from .handlers import create_console_handler  # Uncomment if console logging is needed


def get_log_level(level_name: str) -> int:
    """Convert log level name to logging constant.

    Args:
        level_name: Log level name (DEBUG, INFO, WARNING, ERROR, CRITICAL)

    Returns:
        Logging level constant
    """
    level_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL,
    }
    return level_map.get(level_name.upper(), logging.INFO)


class SystemLogFormatter(logging.Formatter):
    """Formatter for system.log that follows LOGS_GUIDELINES.md specification."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON following the specification."""
        # 使用韩国时区 (UTC+9)
        from datetime import timezone, timedelta
        kst = timezone(timedelta(hours=9))
        timestamp = datetime.now(kst).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        
        # Build module path - convert pathname to relative path or use logger name
        module_path = self._get_module_path(record)
        
        # Extract function name (filter out meaningless values)
        func_name = None
        if record.funcName and record.funcName != "<module>":
            func_name = record.funcName
        
        # Extract line number (filter out 0 or invalid values)
        line_num = None
        if record.lineno and record.lineno > 0:
            line_num = record.lineno
        
        # Build log entry following LOGS_GUIDELINES.md
        log_data = {
            "timestamp": timestamp,
            "source": "backend",
            "level": record.levelname,
            "message": self._build_message(record),
            "layer": "System",
        }
        
        # Add optional fields only if they have meaningful values
        if module_path:
            log_data["module"] = module_path
        if func_name:
            log_data["function"] = func_name
        if line_num:
            log_data["line_number"] = line_num
        
        # Add extra_data for System layer
        extra_data = {
            "server": "uvicorn",
            "logger_name": record.name,  # 保留原始 logger 名称
        }
        
        # Parse uvicorn startup messages for extra_data
        msg = record.getMessage()
        if "running on" in msg.lower() or "started" in msg.lower():
            # Try to extract host:port from message
            if "http://" in msg:
                try:
                    url_part = msg.split("http://")[1].split()[0].rstrip("()")
                    if ":" in url_part:
                        host, port = url_part.rsplit(":", 1)
                        extra_data["host"] = host
                        extra_data["port"] = int(port)
                except (IndexError, ValueError):
                    pass
            extra_data["workers"] = 1
        
        log_data["extra_data"] = extra_data
        
        return json.dumps(log_data, ensure_ascii=False, default=str)
    
    def _get_module_path(self, record: logging.LogRecord) -> str:
        """Get module path from record, converting to relative path format."""
        # Try to use pathname and convert to relative path
        if record.pathname:
            pathname = record.pathname
            # Try to make it relative to site-packages or project root
            if "site-packages" in pathname:
                # For third-party packages like uvicorn
                parts = pathname.split("site-packages")
                if len(parts) > 1:
                    # Return package path like "uvicorn/server.py"
                    return parts[1].lstrip("/\\").replace("\\", "/")
            elif "backend" in pathname:
                # For project files
                parts = pathname.split("backend")
                if len(parts) > 1:
                    return "backend" + parts[-1].replace("\\", "/")
        
        # Fallback: use logger name as module identifier
        return record.name
    
    def _build_message(self, record: logging.LogRecord) -> str:
        """Build message following System layer format: Server {event}: {detail}"""
        msg = record.getMessage()
        
        # Map common uvicorn messages to specification format
        if "Application startup complete" in msg:
            return "Server started: application ready"
        elif "Uvicorn running on" in msg or "running on" in msg.lower():
            # Extract URL from message
            if "http://" in msg:
                try:
                    url = "http://" + msg.split("http://")[1].split()[0].rstrip("()")
                    return f"Server started: {url}"
                except IndexError:
                    pass
            return f"Server started: {msg}"
        elif "Shutting down" in msg or "shutdown" in msg.lower():
            return f"Server shutdown: {msg}"
        elif "Started" in msg:
            return f"Server event: {msg}"
        elif "Waiting for application" in msg:
            return f"Server waiting: {msg}"
        
        # Default: prefix with Server event
        return f"Server event: {msg}"


def setup_logging() -> None:
    """Setup application logging configuration.

    Configures logging based on settings:
    - Log level from LOG_LEVEL or DEBUG setting
    - File logging only (no console output)
    - Sensitive data filtering
    - Structured JSON formatting (following LOGS_GUIDELINES.md)
    
    日志级别规则：
    - App/Audit/Error: 生产 INFO, 开发 DEBUG
    - System/Performance: 生产 WARNING, 开发 INFO
    """
    # System/Performance 日志级别
    if settings.DEBUG:
        system_level = logging.INFO  # 开发环境 INFO
    else:
        system_level = logging.WARNING  # 生产环境 WARNING

    # Always use SystemLogFormatter for system.log (follows LOGS_GUIDELINES.md)
    formatter = SystemLogFormatter()

    # Setup root logger (for system.log)
    root_logger = logging.getLogger()
    root_logger.setLevel(system_level)

    # Remove existing handlers to avoid duplicates
    root_logger.handlers = []

    # Add filters
    sensitive_filter = SensitiveDataFilter(
        getattr(settings, "LOG_SENSITIVE_FIELDS", [])
    )
    context_filter = ContextFilter()

    # 不输出到控制台，只写入文件和数据库

    # File handler for system logs (Python standard logging)
    # Note: 
    # - system.log: Standard Python logging (logging.error, logging.info, etc.) - system/framework logs
    # - app.log: Application business logs via logging_service.log(AppLogCreate(...)) - business logic logs
    # - error.log: Application exceptions via exception service
    # - audit.log: Audit logs for compliance
    enable_file = getattr(settings, "LOG_ENABLE_FILE", True)  # Default to True (write to system.log)
    if enable_file:
        log_file = getattr(settings, "LOG_FILE", None)
        if not log_file:
            # Determine backend directory path (go up from src/common/modules/logger)
            # backend/src/common/modules/logger/config.py -> backend/
            backend_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
            log_file = backend_dir / "logs" / "system.log"  # Changed from app.log to system.log

        file_handler = create_file_handler(
            str(log_file),
            formatter,
            system_level,
            max_bytes=getattr(settings, "LOG_FILE_MAX_BYTES", 10485760),
            backup_count=getattr(settings, "LOG_FILE_BACKUP_COUNT", 5),
        )
        file_handler.addFilter(sensitive_filter)
        file_handler.addFilter(context_filter)
        root_logger.addHandler(file_handler)
    
    # Database handler for system logs (if enabled)
    if getattr(settings, "LOG_DB_ENABLED", True):
        db_handler = DatabaseSystemLogHandler(level=system_level)
        db_handler.addFilter(sensitive_filter)
        db_handler.addFilter(context_filter)
        root_logger.addHandler(db_handler)

    # Suppress noisy third-party loggers (but keep uvicorn.error for startup logs)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    # uvicorn.error 包含启动日志，保持 INFO 级别
    uvicorn_error_logger = logging.getLogger("uvicorn.error")
    uvicorn_error_logger.setLevel(logging.INFO)
    uvicorn_error_logger.propagate = True  # 确保日志传播到 root logger
    
    # uvicorn 主 logger 也需要传播
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.setLevel(logging.INFO)
    uvicorn_logger.propagate = True
    
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)

