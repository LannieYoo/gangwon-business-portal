"""
Nice D&B API data schemas.

Defines data models for Nice D&B API requests and responses.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class NiceDnBFinancialData(BaseModel):
    """Financial data for a specific year."""

    year: int = Field(..., description="Year of the financial data")
    revenue: int = Field(..., description="Annual revenue in KRW")
    profit: int = Field(..., description="Annual profit in KRW")
    employees: int = Field(..., description="Number of employees")


class NiceDnBCompanyData(BaseModel):
    """Company basic information from Nice D&B."""

    business_number: str = Field(..., description="Business registration number")
    company_name: str = Field(..., description="Company name")
    representative: Optional[str] = Field(None, description="Representative name")
    address: Optional[str] = Field(None, description="Company address")
    industry: Optional[str] = Field(None, description="Industry sector")
    established_date: Optional[date] = Field(None, description="Date of establishment")
    credit_grade: Optional[str] = Field(None, description="Credit grade (e.g., 'A+', 'A', 'B+', 'B3', 'C2')")
    
    # Additional fields from API
    legal_number: Optional[str] = Field(None, description="Legal entity number (corpNo)")
    company_name_en: Optional[str] = Field(None, description="Company name in English")
    phone: Optional[str] = Field(None, description="Phone number")
    fax: Optional[str] = Field(None, description="Fax number")
    email: Optional[str] = Field(None, description="Email address")
    zip_code: Optional[str] = Field(None, description="Zip code")
    company_scale: Optional[str] = Field(None, description="Company scale (e.g., 중소기업)")
    company_type: Optional[str] = Field(None, description="Company type (e.g., 일반)")
    main_business: Optional[str] = Field(None, description="Main business activities")
    industry_code: Optional[str] = Field(None, description="Industry code")
    employee_count: Optional[int] = Field(None, description="Number of employees")
    employee_count_date: Optional[str] = Field(None, description="Employee count reference date (YYYYMM)")
    credit_date: Optional[str] = Field(None, description="Credit evaluation date (YYYYMMDD)")
    
    # Financial fields (in thousands of KRW)
    sales_amount: Optional[int] = Field(None, description="Sales amount (in thousands of KRW)")
    operating_profit: Optional[int] = Field(None, description="Operating profit (in thousands of KRW)")
    shareholder_equity: Optional[int] = Field(None, description="Shareholder equity (in thousands of KRW)")
    debt_amount: Optional[int] = Field(None, description="Debt amount (in thousands of KRW)")
    asset_amount: Optional[int] = Field(None, description="Asset amount (in thousands of KRW)")


class NiceDnBResponse(BaseModel):
    """Complete Nice D&B API response."""

    success: bool = Field(True, description="Whether the request was successful")
    data: NiceDnBCompanyData = Field(..., description="Company basic information")
    financials: List[NiceDnBFinancialData] = Field(
        default_factory=list, description="Financial data by year (constructed from single record)"
    )
























