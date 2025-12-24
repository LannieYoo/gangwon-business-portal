"""
Messages schemas.

Pydantic models for message-related requests and responses.
All datetime fields are formatted to KST for display.
"""
from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from ...common.utils.formatters import format_kst_display


class MessageCreate(BaseModel):
    """Message creation schema."""
    
    recipient_id: UUID = Field(..., description="Recipient member ID")
    subject: str = Field(..., min_length=1, max_length=255, description="Message subject")
    content: str = Field(..., min_length=1, description="Message content")
    is_important: bool = Field(default=False, description="Whether message is important")


class MessageUpdate(BaseModel):
    """Message update schema."""
    
    is_read: Optional[bool] = Field(None, description="Mark message as read/unread")
    is_important: Optional[bool] = Field(None, description="Mark message as important")


class MessageResponse(BaseModel):
    """Message response schema."""
    
    id: UUID
    sender_id: Optional[UUID]
    sender_name: Optional[str] = Field(None, description="Sender name (admin or member)")
    recipient_id: UUID
    recipient_name: Optional[str] = Field(None, description="Recipient company name")
    subject: str
    content: str
    is_read: bool
    is_important: bool
    read_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # 格式化后的显示字段
    read_at_display: Optional[str] = None
    created_at_display: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    def model_post_init(self, __context) -> None:
        """Format datetime fields after initialization."""
        self.read_at_display = format_kst_display(self.read_at)
        self.created_at_display = format_kst_display(self.created_at)


class MessageListResponse(BaseModel):
    """Message list response schema."""
    
    items: List[MessageResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    unread_count: int = Field(default=0, description="Total unread messages count")


class UnreadCountResponse(BaseModel):
    """Unread messages count response."""
    
    unread_count: int


# Thread-related schemas

class ThreadCreate(BaseModel):
    """Thread creation schema."""
    
    subject: str = Field(..., min_length=1, max_length=255, description="Thread subject")
    category: str = Field(default="general", description="Thread category")
    content: str = Field(..., min_length=1, description="Initial message content")
    attachments: List[dict] = Field(default=[], description="File attachments")


class ThreadMessageCreate(BaseModel):
    """Thread message creation schema."""
    
    content: str = Field(..., min_length=1, description="Message content")
    is_important: bool = Field(default=False, description="Whether message is important")
    attachments: List[dict] = Field(default=[], description="File attachments")


class ThreadUpdate(BaseModel):
    """Thread update schema."""
    
    status: Optional[str] = Field(None, description="Thread status")
    assigned_to: Optional[UUID] = Field(None, description="Assigned admin ID")


class ThreadMessageResponse(BaseModel):
    """Thread message response schema."""
    
    id: UUID
    thread_id: Optional[UUID] = None
    sender_id: Optional[UUID] = None
    sender_type: Optional[str] = None
    sender_name: Optional[str] = None
    content: str
    is_read: bool = False
    is_important: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime
    attachments: List[dict] = []
    
    # 格式化后的显示字段
    read_at_display: Optional[str] = None
    created_at_display: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    def model_post_init(self, __context) -> None:
        self.read_at_display = format_kst_display(self.read_at)
        self.created_at_display = format_kst_display(self.created_at)


class ThreadResponse(BaseModel):
    """Thread response schema."""
    
    id: UUID
    subject: str
    category: Optional[str] = "general"
    status: Optional[str] = "open"
    member_id: Optional[UUID] = None
    member_name: Optional[str] = None
    created_by: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    last_message_at: Optional[datetime] = None
    message_count: int = 0
    unread_count: int = 0
    admin_unread_count: Optional[int] = None
    created_at: datetime
    
    # 格式化后的显示字段
    last_message_at_display: Optional[str] = None
    created_at_display: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    def model_post_init(self, __context) -> None:
        self.last_message_at_display = format_kst_display(self.last_message_at)
        self.created_at_display = format_kst_display(self.created_at)


class ThreadWithMessagesResponse(BaseModel):
    """Thread with messages response schema."""
    
    thread: ThreadResponse
    messages: List[ThreadMessageResponse]


class ThreadListResponse(BaseModel):
    """Thread list response schema."""
    
    items: List[ThreadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Broadcast-related schemas

class BroadcastCreate(BaseModel):
    """Broadcast message creation schema."""
    
    subject: str = Field(..., min_length=1, max_length=255, description="Broadcast subject")
    content: str = Field(..., min_length=1, description="Broadcast content")
    category: str = Field(default="general", description="Broadcast category")
    is_important: bool = Field(default=False, description="Whether broadcast is important")
    send_to_all: bool = Field(default=True, description="Send to all members")
    recipient_ids: List[UUID] = Field(default=[], description="Specific recipient IDs")
    attachments: List[dict] = Field(default=[], description="File attachments")


class BroadcastResponse(BaseModel):
    """Broadcast response schema."""
    
    id: Optional[UUID] = None
    broadcast_id: Optional[str] = None
    sender_id: Optional[UUID] = None
    sender_name: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_important: bool = False
    send_to_all: bool = True
    recipient_count: int = 0
    sent_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    messages: Optional[List[dict]] = None
    
    # 格式化后的显示字段
    sent_at_display: Optional[str] = None
    created_at_display: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    def model_post_init(self, __context) -> None:
        self.sent_at_display = format_kst_display(self.sent_at)
        self.created_at_display = format_kst_display(self.created_at)


# Analytics schemas

class MessageAnalyticsResponse(BaseModel):
    """Message analytics response schema."""
    
    total_messages: int = 0
    unread_messages: int = 0
    response_time: float = 0.0  # Average response time in minutes
    messages_by_day: List[dict] = []
    messages_by_category: List[dict] = []
    response_time_by_day: List[dict] = []

