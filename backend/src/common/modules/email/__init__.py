"""
Email module bootstrap.

Exposes a reusable email service instance for application modules.
"""

from .service import EmailService, email_service

__all__ = ["EmailService", "email_service"]


