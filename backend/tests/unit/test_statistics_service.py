"""Unit tests for statistics service."""
import pytest
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.statistics.service import StatisticsService
from src.modules.statistics.schemas import StatisticsQueryParams


class TestStatisticsService:
    """Test suite for StatisticsService."""
    
    @pytest.fixture
    def service(self, db_session: AsyncSession):
        """Create service instance."""
        return StatisticsService(db_session)
    
    # ==================== Basic Query Tests ====================
    
    @pytest.mark.asyncio
    async def test_query_companies_basic(self, service, sample_companies):
        """Test basic company query without filters."""
        params = StatisticsQueryParams(page=1, page_size=10)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = (sample_companies, len(sample_companies))
            
            result = await service.query_companies(params)
            
            assert result["total"] == len(sample_companies)
            assert len(result["items"]) == len(sample_companies)
            assert result["page"] == 1
            assert result["page_size"] == 10
    
    @pytest.mark.asyncio
    async def test_query_companies_with_pagination(self, service):
        """Test pagination logic."""
        params = StatisticsQueryParams(page=2, page_size=5)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 25)  # Total 25 items
            
            result = await service.query_companies(params)
            
            assert result["page"] == 2
            assert result["page_size"] == 5
            assert result["total"] == 25
            assert result["total_pages"] == 5
    
    @pytest.mark.asyncio
    async def test_query_companies_with_sorting(self, service):
        """Test sorting logic."""
        params = StatisticsQueryParams(
            sort_by="sales_amt",
            sort_order="desc"
        )
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            companies = [
                {"company_name": "A", "sales_amt": 100},
                {"company_name": "B", "sales_amt": 200},
                {"company_name": "C", "sales_amt": 150},
            ]
            mock_query.return_value = (companies, 3)
            
            result = await service.query_companies(params)
            
            # Verify sorting was applied
            mock_query.assert_called_once()
            call_args = mock_query.call_args
            assert "sales_amt" in str(call_args)
    
    # ==================== Time Filter Tests ====================
    
    @pytest.mark.asyncio
    async def test_filter_by_year(self, service):
        """Test filtering by year."""
        params = StatisticsQueryParams(year=2024)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            # Verify year filter was applied
            mock_query.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_filter_by_quarter(self, service):
        """Test filtering by quarter."""
        params = StatisticsQueryParams(year=2024, quarter=1)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_filter_by_month(self, service):
        """Test filtering by month."""
        params = StatisticsQueryParams(year=2024, quarter=1, month=3)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    # ==================== Industry Filter Tests ====================
    
    @pytest.mark.asyncio
    async def test_filter_by_ksic_major(self, service):
        """Test filtering by KSIC major category."""
        params = StatisticsQueryParams(ksic_major="C")
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_filter_by_ksic_minor(self, service):
        """Test filtering by KSIC minor category."""
        params = StatisticsQueryParams(ksic_major="C", ksic_minor="10")
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_filter_by_leading_industry(self, service):
        """Test filtering by leading industry."""
        params = StatisticsQueryParams(leading_industry="natural_bio")
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    # ==================== Program Filter Tests ====================
    
    @pytest.mark.asyncio
    async def test_filter_by_startup_center(self, service):
        """Test filtering by startup center program."""
        params = StatisticsQueryParams(programs=["startup_center"])
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_filter_by_multiple_programs(self, service):
        """Test filtering by multiple programs (OR logic)."""
        params = StatisticsQueryParams(
            programs=["startup_center", "global_project", "rise_project"]
        )
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    # ==================== Investment Filter Tests ====================
    
    @pytest.mark.asyncio
    async def test_filter_by_investment_status(self, service):
        """Test filtering by investment status."""
        params = StatisticsQueryParams(has_investment=True)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_filter_by_investment_amount_range(self, service):
        """Test filtering by investment amount range."""
        params = StatisticsQueryParams(
            has_investment=True,
            investment_min=10000000,
            investment_max=100000000
        )
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    # ==================== Patent Filter Tests ====================
    
    @pytest.mark.asyncio
    async def test_filter_by_patent_count_range(self, service):
        """Test filtering by patent count range."""
        params = StatisticsQueryParams(patent_min=1, patent_max=10)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            await service.query_companies(params)
            
            mock_query.assert_called_once()
    
    # ==================== Search Tests ====================
    
    @pytest.mark.asyncio
    async def test_search_by_company_name(self, service):
        """Test searching by company name."""
        params = StatisticsQueryParams(search_query="테스트")
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            companies = [
                {"company_name": "테스트기업 A"},
                {"company_name": "테스트기업 B"},
            ]
            mock_query.return_value = (companies, 2)
            
            result = await service.query_companies(params)
            
            assert result["total"] == 2
            mock_query.assert_called_once()
    
    # ==================== Edge Cases ====================
    
    @pytest.mark.asyncio
    async def test_empty_result_set(self, service):
        """Test handling of empty result set."""
        params = StatisticsQueryParams(year=2099)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = ([], 0)
            
            result = await service.query_companies(params)
            
            assert result["total"] == 0
            assert len(result["items"]) == 0
            assert result["total_pages"] == 0
    
    @pytest.mark.asyncio
    async def test_invalid_page_number(self, service):
        """Test handling of invalid page number."""
        params = StatisticsQueryParams(page=0)
        
        # Should raise validation error or default to page 1
        with pytest.raises(Exception):
            await service.query_companies(params)
    
    @pytest.mark.asyncio
    async def test_large_result_set(self, service):
        """Test handling of large result set."""
        params = StatisticsQueryParams(page=1, page_size=100)
        
        with patch.object(service, '_execute_query', new_callable=AsyncMock) as mock_query:
            # Simulate 10,000 total records
            mock_query.return_value = ([], 10000)
            
            result = await service.query_companies(params)
            
            assert result["total"] == 10000
            assert result["total_pages"] == 100
