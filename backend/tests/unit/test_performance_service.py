"""
Unit tests for PerformanceService.

Tests performance management service methods in isolation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from uuid import uuid4
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.modules.performance.service import PerformanceService
from src.common.modules.exception import NotFoundError, ValidationError, ForbiddenError


@pytest.mark.unit
class TestPerformanceService:
    """Test suite for PerformanceService."""

    @pytest.fixture
    def sample_performance_record(self):
        """Sample performance record."""
        from src.common.modules.db.models import PerformanceRecord
        record = PerformanceRecord(
            id=uuid4(),
            member_id=uuid4(),
            year=2024,
            quarter=1,
            type="sales",
            status="draft",
            data_json={"revenue": 1000000},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        return record

    @pytest.mark.asyncio
    async def test_list_performance_records_success(
        self, mock_db_session, sample_performance_record
    ):
        """Test successful listing of performance records."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_performance_record]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        from src.modules.performance.schemas import PerformanceListQuery
        query = PerformanceListQuery(page=1, page_size=20)
        
        records, total = await service.list_performance_records(member_id, query, mock_db_session)
        
        assert len(records) == 1
        assert total == 1
        assert records[0].id == sample_performance_record.id

    @pytest.mark.asyncio
    async def test_get_performance_by_id_success(
        self, mock_db_session, sample_performance_record
    ):
        """Test successful retrieval of performance record."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        record = await service.get_performance_by_id(
            sample_performance_record.id, member_id, mock_db_session
        )
        
        assert record.id == sample_performance_record.id
        assert record.member_id == member_id

    @pytest.mark.asyncio
    async def test_get_performance_by_id_not_found(self, mock_db_session):
        """Test performance record retrieval when not found."""
        service = PerformanceService()
        member_id = uuid4()
        performance_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.get_performance_by_id(performance_id, member_id, mock_db_session)
        
        assert "Performance record" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_get_performance_by_id_forbidden(
        self, mock_db_session, sample_performance_record
    ):
        """Test performance record retrieval when member doesn't own it."""
        service = PerformanceService()
        other_member_id = uuid4()  # Different member
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        with pytest.raises(ForbiddenError) as exc_info:
            await service.get_performance_by_id(
                sample_performance_record.id, other_member_id, mock_db_session
            )
        
        assert "permission" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_create_performance_success(self, mock_db_session):
        """Test successful performance record creation."""
        service = PerformanceService()
        member_id = uuid4()
        
        from src.modules.performance.schemas import PerformanceRecordCreate
        data = PerformanceRecordCreate(
            year=2024,
            quarter=1,
            type="sales",
            data_json={"revenue": 1000000},
        )
        
        # Mock the created record
        created_record = MagicMock()
        created_record.id = uuid4()
        created_record.member_id = member_id
        created_record.year = data.year
        created_record.quarter = data.quarter
        created_record.type = data.type
        created_record.status = "draft"
        
        # Mock refresh to return the created record
        async def mock_refresh(obj):
            pass
        
        mock_db_session.refresh = AsyncMock(side_effect=mock_refresh)
        
        result = await service.create_performance(member_id, data, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert result is not None

    @pytest.mark.asyncio
    async def test_update_performance_success(
        self, mock_db_session, sample_performance_record
    ):
        """Test successful performance record update."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        sample_performance_record.status = "draft"  # Ensure it's draft
        
        # Mock get_performance_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        from src.modules.performance.schemas import PerformanceRecordUpdate
        update_data = PerformanceRecordUpdate(
            year=2024,
            quarter=2,
            data_json={"revenue": 2000000},
        )
        
        updated = await service.update_performance(
            sample_performance_record.id, member_id, update_data, mock_db_session
        )
        
        mock_db_session.commit.assert_called_once()
        assert updated is not None

    @pytest.mark.asyncio
    async def test_update_performance_invalid_status(
        self, mock_db_session, sample_performance_record
    ):
        """Test performance record update when status doesn't allow editing."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        sample_performance_record.status = "approved"  # Cannot edit approved records
        
        # Mock get_performance_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        from src.modules.performance.schemas import PerformanceRecordUpdate
        update_data = PerformanceRecordUpdate(year=2024, quarter=2)
        
        with pytest.raises(ValidationError) as exc_info:
            await service.update_performance(
                sample_performance_record.id, member_id, update_data, mock_db_session
            )
        
        assert "Cannot edit" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_submit_performance_success(
        self, mock_db_session, sample_performance_record
    ):
        """Test successful performance record submission."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        sample_performance_record.status = "draft"
        
        # Mock get_performance_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        submitted = await service.submit_performance(
            sample_performance_record.id, member_id, mock_db_session
        )
        
        assert submitted.status == "submitted"
        assert submitted.submitted_at is not None
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_submit_performance_invalid_status(
        self, mock_db_session, sample_performance_record
    ):
        """Test performance record submission when status doesn't allow it."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        sample_performance_record.status = "approved"  # Cannot submit approved records
        
        # Mock get_performance_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        with pytest.raises(ValidationError) as exc_info:
            await service.submit_performance(
                sample_performance_record.id, member_id, mock_db_session
            )
        
        assert "Cannot submit" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_delete_performance_success(
        self, mock_db_session, sample_performance_record
    ):
        """Test successful performance record deletion."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        sample_performance_record.status = "draft"  # Only draft can be deleted
        
        # Mock get_performance_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        await service.delete_performance(
            sample_performance_record.id, member_id, mock_db_session
        )
        
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_performance_invalid_status(
        self, mock_db_session, sample_performance_record
    ):
        """Test performance record deletion when status doesn't allow it."""
        service = PerformanceService()
        member_id = sample_performance_record.member_id
        sample_performance_record.status = "submitted"  # Cannot delete submitted records
        
        # Mock get_performance_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        with pytest.raises(ValidationError) as exc_info:
            await service.delete_performance(
                sample_performance_record.id, member_id, mock_db_session
            )
        
        assert "Cannot delete" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_approve_performance_success(
        self, mock_db_session, sample_performance_record
    ):
        """Test successful performance record approval."""
        service = PerformanceService()
        reviewer_id = uuid4()
        sample_performance_record.status = "submitted"
        
        # Mock get_performance_by_id_admin
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        # Mock email service
        with patch('src.common.modules.email.email_service') as mock_email:
            mock_email.send_approval_notification_email = AsyncMock()
            
            # Mock member query for email
            member_result = MagicMock()
            member = MagicMock()
            member.email = "test@example.com"
            member.company_name = "Test Company"
            member_result.scalar_one_or_none.return_value = member
            mock_db_session.execute.side_effect = [result, member_result]
            
            approved = await service.approve_performance(
                sample_performance_record.id, reviewer_id, "Good work!", mock_db_session
            )
            
            assert approved.status == "approved"
            mock_db_session.add.assert_called_once()  # Review record
            mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_approve_performance_invalid_status(
        self, mock_db_session, sample_performance_record
    ):
        """Test performance record approval when status doesn't allow it."""
        service = PerformanceService()
        reviewer_id = uuid4()
        sample_performance_record.status = "draft"  # Cannot approve draft
        
        # Mock get_performance_by_id_admin
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_performance_record
        mock_db_session.execute.return_value = result
        
        with pytest.raises(ValidationError) as exc_info:
            await service.approve_performance(
                sample_performance_record.id, reviewer_id, None, mock_db_session
            )
        
        assert "Cannot approve" in str(exc_info.value)

