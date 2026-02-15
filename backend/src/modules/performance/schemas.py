"""业绩管理数据模型"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID

# Import common utilities
from ...common.utils.formatters import (
    parse_datetime,
    format_datetime_display,
    format_performance_status_display,
    format_performance_type_display,
    format_period_display,
)


class PerformanceRecordCreate(BaseModel):
    """创建业绩记录"""

    year: int = Field(..., ge=2000, le=2100, description="Performance year")
    quarter: Optional[int] = Field(None, ge=1, le=4, description="Quarter (1-4), null for annual")
    type: str = Field(..., pattern="^(sales|support|ip)$", description="Record type: sales, support, or ip")
    data_json: dict[str, Any] = Field(..., description="Performance data in JSON format")
    hsk_code: Optional[str] = Field(None, max_length=10, pattern="^[0-9]{10}$", description="HSK code (10-digit number)")
    export_country1: Optional[str] = Field(None, max_length=100, description="Export country 1")
    export_country2: Optional[str] = Field(None, max_length=100, description="Export country 2")


class PerformanceRecordUpdate(BaseModel):
    """更新业绩记录"""

    year: Optional[int] = Field(None, ge=2000, le=2100, description="Performance year")
    quarter: Optional[int] = Field(None, ge=1, le=4, description="Quarter (1-4)")
    type: Optional[str] = Field(None, pattern="^(sales|support|ip)$", description="Record type")
    data_json: Optional[dict[str, Any]] = Field(None, description="Performance data in JSON format")
    hsk_code: Optional[str] = Field(None, max_length=10, pattern="^[0-9]{10}$", description="HSK code (10-digit number)")
    export_country1: Optional[str] = Field(None, max_length=100, description="Export country 1")
    export_country2: Optional[str] = Field(None, max_length=100, description="Export country 2")


class PerformanceRecordResponse(BaseModel):
    """业绩记录响应"""

    id: UUID
    member_id: UUID
    year: int
    quarter: Optional[int]
    type: str
    status: str
    data_json: dict[str, Any]
    submitted_at: Optional[datetime]
    
    # Review fields (merged from performance_reviews)
    reviewer_id: Optional[UUID]
    review_status: Optional[str]
    review_comments: Optional[str]
    reviewed_at: Optional[datetime]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # Member information fields (for admin view)
    member_phone: Optional[str] = None
    member_company_name: Optional[str] = None
    member_business_number: Optional[str] = None
    
    reviews: list = Field(default_factory=list, description="已废弃")

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_without_reviews(cls, obj):
        """从ORM对象创建响应"""
        return cls(
            id=obj.id,
            member_id=obj.member_id,
            year=obj.year,
            quarter=obj.quarter,
            type=obj.type,
            status=obj.status,
            data_json=obj.data_json,
            submitted_at=obj.submitted_at,
            reviewer_id=obj.reviewer_id,
            review_status=obj.review_status,
            review_comments=obj.review_comments,
            reviewed_at=obj.reviewed_at,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
            reviews=[],
            attachments=[],
        )


class AttachmentListItem(BaseModel):
    """附件列表项"""
    file_id: str
    file_name: str
    file_size: int
    file_url: str


class PerformanceListItem(BaseModel):
    """业绩记录列表项"""

    id: UUID
    member_id: UUID
    year: int
    quarter: Optional[int]
    type: str
    status: str
    submitted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    data_json: dict[str, Any]
    
    # Review fields (merged from performance_reviews)
    reviewer_id: Optional[UUID]
    review_status: Optional[str]
    review_comments: Optional[str]
    reviewed_at: Optional[datetime]
    
    reviews: list = Field(default_factory=list, description="已废弃")
    attachments: list[AttachmentListItem]
    member_company_name: str
    member_business_number: str
    
    status_display: str
    type_display: str
    period_display: str
    submitted_at_display: str
    created_at_display: str
    updated_at_display: str
    review_status_display: Optional[str] = None

    class Config:
        from_attributes = True
        
    @classmethod
    def from_db_dict(cls, data: dict, include_admin_fields: bool = False):
        """从数据库字典创建列表项"""
        item_data = {
            "id": data["id"],
            "member_id": data["member_id"],
            "year": data["year"],
            "quarter": data.get("quarter"),
            "type": data["type"],
            "status": data["status"],
            "submitted_at": cls._parse_datetime(data["submitted_at"]) if data.get("submitted_at") else None,
            "created_at": cls._parse_datetime(data["created_at"]),
            "updated_at": cls._parse_datetime(data["updated_at"]),
            "data_json": data["data_json"],
            
            "reviewer_id": data.get("reviewer_id"),
            "review_status": data.get("review_status"),
            "review_comments": data.get("review_comments"),
            "reviewed_at": cls._parse_datetime(data["reviewed_at"]) if data.get("reviewed_at") else None,
            
            "reviews": [],
            "attachments": data.get("attachments", []),
            "member_company_name": data["member_company_name"],
            "member_business_number": data["member_business_number"],
            
            "status_display": cls._format_status_display(data["status"]),
            "type_display": cls._format_type_display(data["type"]),
            "period_display": cls._format_period_display(data["year"], data.get("quarter")),
            "submitted_at_display": cls._format_datetime_display(data["submitted_at"]) if data.get("submitted_at") else "",
            "created_at_display": cls._format_datetime_display(data["created_at"]),
            "review_status_display": cls._format_review_status_display(data.get("review_status")) if data.get("review_status") else None,
        }
        
        if include_admin_fields:
            item_data.update({
                "updated_at_display": cls._format_datetime_display(data["updated_at"]),
            })
        else:
            item_data.update({
                "updated_at_display": cls._format_datetime_display(data.get("updated_at", data["created_at"])),
            })
        
        return cls(**item_data)
    
    @staticmethod
    def _parse_datetime(dt_str) -> datetime:
        """解析日期时间字符串"""
        return parse_datetime(dt_str)
    
    @staticmethod
    def _format_status_display(status: str) -> str:
        """格式化状态显示"""
        return format_performance_status_display(status)
    
    @staticmethod
    def _format_type_display(type_str: str) -> str:
        """格式化类型显示"""
        return format_performance_type_display(type_str)
    
    @staticmethod
    def _format_period_display(year: int, quarter: Optional[int]) -> str:
        """格式化期间显示"""
        return format_period_display(year, quarter)
    
    @staticmethod
    def _format_datetime_display(dt) -> str:
        """格式化日期时间显示"""
        return format_datetime_display(dt)
    
    @staticmethod
    def _format_review_status_display(review_status: str) -> str:
        """格式化审核状态显示"""
        review_status_map = {
            "approved": "已批准",
            "rejected": "已驳回", 
            "revision_requested": "请求修改",
        }
        return review_status_map.get(review_status, review_status)


class PerformanceListQuery(BaseModel):
    """业绩记录查询参数"""

    year: Optional[int] = Field(None, description="Filter by year")
    quarter: Optional[int] = Field(None, ge=1, le=4, description="Filter by quarter")
    status: Optional[str] = Field(None, description="Filter by status")
    type: Optional[str] = Field(None, description="Filter by type (sales/support/ip)")
    member_id: Optional[UUID] = Field(None, description="Filter by member (admin only)")
    search_keyword: Optional[str] = Field(None, description="Search keyword for company name, business number, or year")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(10, ge=1, le=1000, alias="pageSize", description="Items per page")
    
    class Config:
        populate_by_name = True  # Allow both page_size and pageSize


class PerformanceListResponsePaginated(BaseModel):
    """分页业绩记录列表响应"""

    items: list[PerformanceListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class PerformanceApprovalRequest(BaseModel):
    """审批请求"""

    comments: Optional[str] = Field(None, max_length=1000, description="Review comments")


class InvestmentCompanyDetail(BaseModel):
    """투자 기업 상세 정보"""
    member_id: str
    company_name: str
    amount: float
    year: Optional[int] = None


class InvestmentInstitutionSummary(BaseModel):
    """기관별 투자금액 합계"""
    institution: str = Field(..., description="투자 기관명")
    investment_type: str = Field(..., description="투자 유형 (domestic/overseas)")
    total_amount: float = Field(..., description="투자 합계 금액 (백만원)")
    company_count: int = Field(..., description="투자 기업 수")
    companies: list[InvestmentCompanyDetail] = Field(default_factory=list, description="투자 기업 목록")


class InvestmentSummaryResponse(BaseModel):
    """기관별 투자금액 합계 응답"""
    items: list[InvestmentInstitutionSummary]
    total_investment: float = Field(..., description="전체 투자 합계")
    total_institutions: int = Field(..., description="전체 기관 수")
    year: Optional[int] = Field(None, description="조회 연도")
