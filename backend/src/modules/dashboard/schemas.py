"""
Dashboard schemas.

Pydantic models for dashboard-related requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal


class DashboardStatsResponse(BaseModel):
    """Dashboard statistics response schema."""

    totalMembers: int = Field(..., description="Total number of approved members")
    totalSales: Decimal = Field(..., description="Total sales revenue (in 10,000 KRW)")
    totalEmployment: int = Field(..., description="Total employment count")
    totalIntellectualProperty: int = Field(..., description="Total intellectual property count")


class ChartDataPoint(BaseModel):
    """Chart data point schema."""

    period: str = Field(..., description="Time period (e.g., '2024 Q1')")
    value: float = Field(..., description="Value for the period")


class SalesEmploymentDataPoint(BaseModel):
    """Sales and employment chart data point schema."""

    period: str = Field(..., description="Time period (e.g., '2024 Q1')")
    sales: Decimal = Field(..., description="Sales revenue for the period")
    employment: int = Field(..., description="Employment count for the period")


class DashboardChartData(BaseModel):
    """Dashboard chart data schema."""

    members: List[ChartDataPoint] = Field(default_factory=list, description="Member growth chart data")
    salesEmployment: List[SalesEmploymentDataPoint] = Field(
        default_factory=list, description="Sales and employment trend chart data"
    )


class DashboardStatsQuery(BaseModel):
    """Dashboard stats query parameters."""

    year: Optional[str] = Field(None, description="Year filter ('all' or specific year)")
    quarter: Optional[str] = Field(None, description="Quarter filter ('all', 'Q1', 'Q2', 'Q3', 'Q4')")


class DashboardResponse(BaseModel):
    """Dashboard response schema."""

    stats: DashboardStatsResponse
    chartData: DashboardChartData

