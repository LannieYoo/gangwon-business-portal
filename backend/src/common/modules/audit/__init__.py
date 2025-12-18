"""
Audit log module.

This module provides audit logging functionality for compliance and security tracking.
It records all critical operations (login, CRUD, approvals, file operations, admin actions)
for government compliance requirements (7-year retention period).

Usage:
    from ...common.modules.audit import audit_log
    
    # Use decorator (recommended)
    @audit_log(action="login", resource_type="member")
    async def login(...):
        ...
    
    # Or manually create audit log via API
    from ...common.modules.audit import audit_log_service
    
    await audit_log_service.create_audit_log_via_api(
        action="login",
        user_id=user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
    )
"""

from .service import AuditLogService
from .decorator import audit_log, get_client_info

# Create service instance
audit_log_service = AuditLogService()

__all__ = [
    "AuditLogService",
    "audit_log_service",
    "audit_log",
    "get_client_info",
]





























