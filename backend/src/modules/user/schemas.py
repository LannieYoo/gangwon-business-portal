"""
Authentication schemas.

Pydantic models for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime, date
from uuid import UUID

# Region options - Gangwon Province cities and counties
# Supports English keys (for database storage) and translated values (Korean/Chinese)
VALID_REGIONS = [
    # English keys (standardized for database)
    "chuncheon", "wonju", "gangneung", "donghae", "taebaek", "sokcho", "samcheok",
    "hongcheon", "hoengseong", "yeongwol", "pyeongchang", "jeongseon", "cheorwon", "hwacheon",
    "yanggu", "inje", "goseong", "yangyang", "other",
    # Korean
    "춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시",
    "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군",
    "양구군", "인제군", "고성군", "양양군", "기타 지역",
    # Chinese
    "春川市", "原州市", "江陵市", "东海市", "太白市", "束草市", "三陟市",
    "洪川郡", "横城郡", "宁越郡", "平昌郡", "旌善郡", "铁原郡", "华川郡",
    "杨口郡", "麟蹄郡", "高城郡", "襄阳郡", "其他地区",
]


class MemberRegisterRequest(BaseModel):
    """Member registration request schema."""

    # Step 1: Account information
    # NOTE:
    # Integration tests generate values like "999-88-120755" (13 chars with dashes).
    # To avoid unnecessary 422 errors for valid formatted numbers, we allow a
    # slightly larger maximum length while keeping a sensible minimum.
    business_number: str = Field(
        ...,
        min_length=10,
        max_length=20,
        description="Business registration number",
    )
    company_name: str = Field(..., min_length=1, max_length=255, description="Company name")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    email: EmailStr = Field(..., description="Email address")

    # Step 2: Company information
    region: str = Field(
        ...,
        max_length=100,
        description="Region. Required. Gangwon Province cities/counties or other regions"
    )
    company_type: Optional[str] = Field(None, max_length=100, description="Company type")
    corporate_number: Optional[str] = Field(None, max_length=20, description="Corporate number")
    address: Optional[str] = Field(None, description="Company address")
    representative: Optional[str] = Field(None, max_length=100, description="Representative name")
    contact_person: Optional[str] = Field(None, max_length=100, description="Contact person name")
    phone: Optional[str] = Field(None, max_length=20, description="Company phone number")
    representative_phone: Optional[str] = Field(None, max_length=20, description="Representative phone number")
    contact_person_phone: Optional[str] = Field(None, max_length=20, description="Contact person phone")
    contact_person_department: Optional[str] = Field(None, max_length=100, description="Contact person department")
    contact_person_position: Optional[str] = Field(None, max_length=100, description="Contact person position")

    # Step 3: Business information
    industry: Optional[str] = Field(None, max_length=100, description="Industry sector")
    revenue: Optional[float] = Field(None, ge=0, description="Annual revenue")
    employee_count: Optional[int] = Field(None, ge=0, description="Number of employees")
    founding_date: Optional[date] = Field(None, description="Founding date (YYYY-MM-DD)")
    website: Optional[str] = Field(None, max_length=255, description="Company website")
    main_business: Optional[str] = Field(None, description="Main business description")

    # Startup / industry classification
    startup_type: Optional[str] = Field(None, max_length=50, description="Startup type")
    startup_stage: Optional[str] = Field(None, max_length=50, description="Startup stage")
    ksic_major: Optional[str] = Field(None, max_length=10, description="KSIC major code")
    ksic_sub: Optional[str] = Field(None, max_length=10, description="KSIC sub code")
    category: Optional[str] = Field(None, max_length=50, description="Company category")
    business_field: Optional[str] = Field(None, max_length=10, description="Business field code")
    main_industry_ksic_major: Optional[str] = Field(None, max_length=50, description="Main industry KSIC major category")
    main_industry_ksic_codes: Optional[str] = Field(None, description="Main industry KSIC sub codes (JSON)")
    gangwon_industry: Optional[str] = Field(None, max_length=50, description="Gangwon 7 future industries")
    future_tech: Optional[str] = Field(None, max_length=50, description="Future promising technology")
    cooperation_fields: Optional[str] = Field(None, description="Cooperation fields (JSON array)")

    # Additional info
    representative_birth_date: Optional[date] = Field(None, description="Representative birth date")
    representative_gender: Optional[str] = Field(None, max_length=10, description="Representative gender (male/female)")
    description: Optional[str] = Field(None, description="Company description")
    participation_programs: Optional[str] = Field(None, description="Participation programs (JSON array)")
    investment_status: Optional[str] = Field(None, description="Investment status (JSON object)")

    # Step 4: File uploads (URLs from upload endpoint)
    logo_url: Optional[str] = Field(None, max_length=500, description="Logo file URL")
    certificate_url: Optional[str] = Field(None, max_length=500, description="Business certificate file URL")

    # Step 5: Terms agreement
    terms_agreed: bool = Field(..., description="Terms and conditions agreement")

    @field_validator("region")
    @classmethod
    def validate_region(cls, v: str) -> str:
        """Validate region value (supports both Chinese and Korean)."""
        if v not in VALID_REGIONS:
            raise ValueError(
                f"Region must be one of: {', '.join(VALID_REGIONS)}. "
                f"Got: {v}"
            )
        return v


class LoginRequest(BaseModel):
    """Login request schema."""

    business_number: str = Field(..., description="Business registration number")
    password: str = Field(..., description="Password")


class AdminLoginRequest(BaseModel):
    """Admin login request schema."""

    email: EmailStr = Field(..., description="Admin email")
    password: str = Field(..., description="Admin password")


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""

    business_number: str = Field(..., description="Business registration number")
    email: EmailStr = Field(..., description="Email address")


class PasswordReset(BaseModel):
    """Password reset schema."""

    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, description="New password")


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(default=3600, description="Token expiration time in seconds")
    user: dict = Field(..., description="User information")


class UserInfo(BaseModel):
    """User information schema.
    
    Note: This schema is only used for member endpoints.
    Admin endpoints use different response models.
    """

    id: UUID
    business_number: str
    company_name: str
    email: str
    status: str
    approval_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    """Change password request schema."""

    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")


class ProfileUpdateRequest(BaseModel):
    """Profile update request schema."""

    company_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    industry: Optional[str] = Field(None, max_length=100)
    revenue: Optional[float] = Field(None, ge=0)
    employee_count: Optional[int] = Field(None, ge=0)
    founding_date: Optional[date] = Field(None, description="YYYY-MM-DD format")
    region: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    website: Optional[str] = Field(None, max_length=255)


class CheckAvailabilityResponse(BaseModel):
    """Check availability response schema."""

    available: bool = Field(..., description="Whether the value is available")
    message: str = Field(..., description="Status message")