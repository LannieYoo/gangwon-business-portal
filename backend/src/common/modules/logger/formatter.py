"""Log formatter for structured logging."""
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional


# 统一时间格式
UNIFIED_TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S.%f"


def format_timestamp(dt: Optional[datetime] = None) -> str:
    """
    统一时间戳格式：YYYY-MM-DD HH:MM:SS.mmm
    
    Args:
        dt: datetime对象，如果为None则使用当前时间
        
    Returns:
        格式化的时间字符串
    """
    if dt is None:
        dt = datetime.now()
    return dt.strftime(UNIFIED_TIMESTAMP_FORMAT)[:-3]


def normalize_timestamp(timestamp_str: str) -> str:
    """
    将各种时间格式统一转换为标准格式
    
    支持的输入格式：
    - ISO格式: 2025-12-22T15:21:32.862Z
    - 标准格式: 2025-12-22 10:22:45.872
    
    Returns:
        统一格式的时间字符串: YYYY-MM-DD HH:MM:SS.mmm
    """
    if not timestamp_str:
        return format_timestamp()
    
    try:
        # 尝试解析ISO格式 (带Z或+00:00)
        if 'T' in timestamp_str:
            # 移除Z后缀
            clean_ts = timestamp_str.replace('Z', '+00:00')
            if '+' in clean_ts:
                clean_ts = clean_ts.split('+')[0]
            # 解析ISO格式
            dt = datetime.fromisoformat(clean_ts)
            return format_timestamp(dt)
        else:
            # 已经是标准格式，直接返回
            return timestamp_str
    except (ValueError, TypeError):
        # 解析失败，返回当前时间
        return format_timestamp()


def normalize_extra_data_timestamps(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    递归统一extra_data中的所有时间戳格式
    
    Args:
        data: 包含时间戳的字典
        
    Returns:
        时间戳已统一的字典
    """
    if not isinstance(data, dict):
        return data
    
    result = {}
    for key, value in data.items():
        if key == 'timestamp' and isinstance(value, str):
            result[key] = normalize_timestamp(value)
        elif isinstance(value, dict):
            result[key] = normalize_extra_data_timestamps(value)
        elif isinstance(value, list):
            result[key] = [
                normalize_extra_data_timestamps(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            result[key] = value
    
    return result


class JSONFormatter(logging.Formatter):
    """Unified JSON formatter for structured logging across all log types."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON with unified structure."""
        # 使用韩国时区 (UTC+9)
        from datetime import timezone, timedelta
        kst = timezone(timedelta(hours=9))
        timestamp = datetime.now(kst).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

        # Start with unified base structure
        log_data = {
            "timestamp": timestamp,
            "source": getattr(record, "source", "system"),  # backend/frontend/system
            "level": record.levelname,
            "message": record.getMessage(),
        }

        # Add context fields with unified naming
        if hasattr(record, "layer") or record.module:
            log_data["layer"] = getattr(record, "layer", record.module)
        
        if record.funcName and record.funcName != "<module>":
            log_data["function"] = record.funcName
        
        if record.lineno:
            log_data["line_number"] = record.lineno

        # Add request context fields
        request_fields = [
            "trace_id",
            "request_id", 
            "user_id",
            "ip_address",
            "user_agent",
            "request_method",
            "request_path",
            "request_data",
            "response_status",
            "duration_ms",
        ]
        for field in request_fields:
            if hasattr(record, field):
                value = getattr(record, field)
                if value is not None:
                    log_data[field] = value

        # Add exception info if present
        if record.exc_info:
            log_data["stack_trace"] = self.formatException(record.exc_info)
            # Extract exception type and message
            exc_type, exc_value, exc_tb = record.exc_info
            if exc_type:
                log_data["exception_type"] = exc_type.__name__
            if exc_value:
                log_data["exception_message"] = str(exc_value)

        # Add stack trace for errors without exception info
        elif record.levelno >= logging.ERROR:
            import traceback
            log_data["stack_trace"] = "\n".join(traceback.format_stack())

        # Add system-specific fields (matching system_logs table)
        system_fields = [
            "logger_name",
            "process_id", 
            "thread_name",
            "environment",
            "service",
        ]
        for field in system_fields:
            if hasattr(record, field):
                value = getattr(record, field)
                if value is not None:
                    log_data[field] = value

        # Add logger name for system logs
        if log_data["source"] == "system" and record.name:
            log_data["logger_name"] = record.name
        
        # Add process_id and thread_name from record for system logs
        if log_data["source"] == "system":
            if hasattr(record, "process") and record.process:
                log_data["process_id"] = record.process
            if hasattr(record, "threadName") and record.threadName:
                log_data["thread_name"] = record.threadName

        # Add performance-specific fields
        performance_fields = [
            "metric_name",
            "metric_value", 
            "metric_unit",
            "component_name",
            "threshold",
            "performance_issue",
            "web_vitals",
        ]
        for field in performance_fields:
            if hasattr(record, field):
                value = getattr(record, field)
                if value is not None:
                    log_data[field] = value

        # Add audit-specific fields
        audit_fields = [
            "action",
            "resource_type",
            "resource_id",
        ]
        for field in audit_fields:
            if hasattr(record, field):
                value = getattr(record, field)
                if value is not None:
                    log_data[field] = value

        # Add any remaining custom extra fields
        if hasattr(record, "__dict__"):
            excluded_fields = [
                "name", "msg", "args", "created", "filename", "funcName", 
                "levelname", "levelno", "lineno", "module", "msecs", "message",
                "pathname", "process", "processName", "relativeCreated", 
                "thread", "threadName", "exc_info", "exc_text", "stack_info"
            ] + request_fields + system_fields + performance_fields + audit_fields + ["source", "layer"]
            
            for key, value in record.__dict__.items():
                if key not in excluded_fields and not key.startswith("_") and value is not None:
                    # Add to extra_data to avoid field conflicts
                    if "extra_data" not in log_data:
                        log_data["extra_data"] = {}
                    log_data["extra_data"][key] = value

        return json.dumps(log_data, ensure_ascii=False, default=str)


def create_unified_log_entry(
    level: str,
    message: str,
    source: str = "backend",
    layer: str = None,
    function: str = None,
    line_number: int = None,
    trace_id: str = None,
    request_id: str = None,
    user_id: str = None,
    ip_address: str = None,
    user_agent: str = None,
    request_method: str = None,
    request_path: str = None,
    request_data: dict = None,
    response_status: int = None,
    duration_ms: float = None,
    exception_type: str = None,
    exception_message: str = None,
    stack_trace: str = None,
    extra_data: dict = None,
) -> str:
    """
    Create a unified log entry as JSON string.
    
    This function provides a consistent way to format log entries
    across all log types (app, system, error, audit, performance).
    
    All fields from app_logs database table are included (even if null)
    to ensure consistent format between file logs and database logs.
    """
    # 使用韩国时区 (UTC+9)
    from datetime import timezone, timedelta
    kst = timezone(timedelta(hours=9))
    timestamp = datetime.now(kst).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    
    # Include ALL fields from app_logs table (matching database schema exactly)
    log_data = {
        "timestamp": timestamp,
        "source": source,
        "level": level.upper(),
        "message": message,
        "layer": layer,
        "function": function,
        "line_number": line_number,
        "trace_id": trace_id,
        "request_id": request_id,
        "user_id": user_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "request_method": request_method,
        "request_path": request_path,
        "request_data": request_data,
        "response_status": response_status,
        "duration_ms": duration_ms,
        "extra_data": extra_data,
    }
    
    return json.dumps(log_data, ensure_ascii=False, default=str)

