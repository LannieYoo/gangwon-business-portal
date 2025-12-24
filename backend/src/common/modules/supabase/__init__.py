"""
Supabase Integration Module

This module provides the unified supabase_service with helper methods
for common database operations, reducing code duplication.

Usage:
    # Recommended approach - use unified service with helper methods
    from .service import supabase_service
    
    # For complex messaging operations - import directly
    from .message_service import message_db_service
"""
from .client import get_supabase_client, supabase_client

# Import the unified service with helper methods
from .service import SupabaseService, supabase_service

# Import message service directly
from .message_service import MessageService, message_db_service

__all__ = [
    # Client
    'get_supabase_client', 
    'supabase_client',
    
    # Unified service with helper methods
    'supabase_service',
    'SupabaseService',
    
    # Message service (complex operations)
    'MessageService',
    'message_db_service',
]