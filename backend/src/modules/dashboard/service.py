"""
Dashboard service.

Business logic for dashboard statistics aggregation.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from decimal import Decimal

from ...common.modules.db.models import Member, PerformanceRecord


class DashboardService:
    """Dashboard service class."""

    async def get_dashboard_stats(
        self,
        year: Optional[str] = None,
        quarter: Optional[str] = None,
        db: AsyncSession = None,
    ) -> dict:
        """
        Get dashboard statistics aggregated from members and performance records.

        Args:
            year: Year filter ('all' or specific year as string)
            quarter: Quarter filter ('all', 'Q1', 'Q2', 'Q3', 'Q4')
            db: Database session

        Returns:
            Dictionary with stats and chartData
        """
        # Parse year and quarter
        year_int = None
        if year and year != "all":
            try:
                year_int = int(year)
            except ValueError:
                year_int = None

        quarter_int = None
        if quarter and quarter != "all":
            if quarter.startswith("Q"):
                try:
                    quarter_int = int(quarter[1:])
                except ValueError:
                    quarter_int = None

        # 1. Get total approved members count
        members_stmt = select(func.count(Member.id)).where(
            Member.approval_status == "approved"
        )
        members_result = await db.execute(members_stmt)
        total_members = members_result.scalar() or 0

        # 2. Get performance records with filters
        # Only count approved records
        perf_stmt = select(PerformanceRecord).where(
            PerformanceRecord.status == "approved"
        )

        if year_int:
            perf_stmt = perf_stmt.where(PerformanceRecord.year == year_int)

        if quarter_int:
            perf_stmt = perf_stmt.where(PerformanceRecord.quarter == quarter_int)

        perf_result = await db.execute(perf_stmt)
        performance_records = perf_result.scalars().all()

        # 3. Aggregate statistics from performance records
        total_sales = Decimal("0")
        total_employment = 0
        total_ip = 0

        for record in performance_records:
            data_json = record.data_json or {}

            # Aggregate sales from 'sales' type records
            if record.type == "sales":
                # Try different possible field names for sales revenue
                sales_value = (
                    data_json.get("salesRevenue")
                    or data_json.get("revenue")
                    or data_json.get("totalSales")
                    or data_json.get("sales")
                    or 0
                )
                if isinstance(sales_value, (int, float)):
                    total_sales += Decimal(str(sales_value))

            # Aggregate employment from 'support' type records
            if record.type == "support":
                # Try different possible field names for employment
                employment_value = (
                    data_json.get("newHires")
                    or data_json.get("employment")
                    or data_json.get("employeeCount")
                    or data_json.get("newEmployees")
                    or 0
                )
                if isinstance(employment_value, (int, float)):
                    total_employment += int(employment_value)

            # Aggregate IP from 'ip' type records
            if record.type == "ip":
                ip_data = data_json.get("intellectualProperty") or data_json.get("ip") or []
                if isinstance(ip_data, list):
                    total_ip += len(ip_data)
                elif isinstance(ip_data, (int, float)):
                    total_ip += int(ip_data)

        # 4. Generate chart data
        chart_data = await self._generate_chart_data(
            year_int, quarter_int, db
        )

        return {
            "stats": {
                "totalMembers": total_members,
                "totalSales": total_sales,
                "totalEmployment": total_employment,
                "totalIntellectualProperty": total_ip,
            },
            "chartData": chart_data,
        }

    async def _generate_chart_data(
        self,
        year_filter: Optional[int],
        quarter_filter: Optional[int],
        db: AsyncSession,
    ) -> dict:
        """
        Generate chart data for dashboard.

        Args:
            year_filter: Year to filter by (None for all)
            quarter_filter: Quarter to filter by (None for all)
            db: Database session

        Returns:
            Dictionary with members and salesEmployment chart data
        """
        # Get all approved performance records for chart data
        # We need to show trends, so we get records even if they don't match the filter
        # but we'll group them by period
        perf_stmt = select(PerformanceRecord).where(
            PerformanceRecord.status == "approved"
        )

        # If year is specified, only show data for that year
        if year_filter:
            perf_stmt = perf_stmt.where(PerformanceRecord.year == year_filter)

        perf_result = await db.execute(perf_stmt)
        performance_records = perf_result.scalars().all()

        # Group by period (year-quarter)
        period_data = {}

        for record in performance_records:
            # Skip if quarter filter is specified and doesn't match
            if quarter_filter and record.quarter != quarter_filter:
                continue

            period_key = f"{record.year}-{record.quarter or 'A'}"
            if period_key not in period_data:
                period_data[period_key] = {
                    "year": record.year,
                    "quarter": record.quarter,
                    "sales": Decimal("0"),
                    "employment": 0,
                    "members": set(),
                }

            period_data[period_key]["members"].add(record.member_id)

            data_json = record.data_json or {}

            # Aggregate sales
            if record.type == "sales":
                sales_value = (
                    data_json.get("salesRevenue")
                    or data_json.get("revenue")
                    or data_json.get("totalSales")
                    or data_json.get("sales")
                    or 0
                )
                if isinstance(sales_value, (int, float)):
                    period_data[period_key]["sales"] += Decimal(str(sales_value))

            # Aggregate employment
            if record.type == "support":
                employment_value = (
                    data_json.get("newHires")
                    or data_json.get("employment")
                    or data_json.get("employeeCount")
                    or data_json.get("newEmployees")
                    or 0
                )
                if isinstance(employment_value, (int, float)):
                    period_data[period_key]["employment"] += int(employment_value)

        # Convert to sorted list
        chart_items = []
        for key, data in period_data.items():
            period_label = (
                f"{data['year']} Q{data['quarter']}"
                if data["quarter"]
                else f"{data['year']} Annual"
            )
            chart_items.append(
                {
                    "period": period_label,
                    "year": data["year"],
                    "quarter": data["quarter"],
                    "members": len(data["members"]),
                    "sales": data["sales"],
                    "employment": data["employment"],
                }
            )

        # Sort by year and quarter
        chart_items.sort(key=lambda x: (x["year"], x["quarter"] or 999))

        # Format for response
        members_chart = [
            {"period": item["period"], "value": float(item["members"])}
            for item in chart_items
        ]

        sales_employment_chart = [
            {
                "period": item["period"],
                "sales": item["sales"],
                "employment": item["employment"],
            }
            for item in chart_items
        ]

        return {
            "members": members_chart,
            "salesEmployment": sales_employment_chart,
        }

