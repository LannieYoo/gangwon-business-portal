"""
Support module schemas.

Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# FAQ Schemas

class FAQCreate(BaseModel):
    """FAQ creation schema."""
    
    category: Optional[str] = Field(None, max_length=100, description="FAQ category")
    question: str = Field(..., min_length=1, description="Question text")
    answer: str = Field(..., min_length=1, description="Answer text")
    display_order: int = Field(default=0, description="Display order for sorting")


class FAQUpdate(BaseModel):
    """FAQ update schema."""
    
    category: Optional[str] = Field(None, max_length=100, description="FAQ category")
    question: Optional[str] = Field(None, min_length=1, description="Question text")
    answer: Optional[str] = Field(None, min_length=1, description="Answer text")
    display_order: Optional[int] = Field(None, description="Display order for sorting")


class FAQResponse(BaseModel):
    """FAQ response schema."""
    
    id: UUID
    category: Optional[str]
    question: str
    answer: str
    display_order: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class FAQListResponse(BaseModel):
    """FAQ list response schema."""
    
    items: List[FAQResponse]

