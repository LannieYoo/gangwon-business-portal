"""
Unit tests for AuditLogService.

Tests audit log service methods in isolation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4, UUID
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.common.modules.audit.service import AuditLogService
from src.common.modules.audit.schemas import AuditLogListQuery


@pytest.mark.unit
class TestAuditLogService:
    """Test suite for AuditLogService."""

    @pytest.fixture
    def audit_service(self):
        """AuditLogService instance."""
        return AuditLogService()

    @pytest.fixture
    def sample_audit_log(self):
        """Sample audit log object."""
        from src.common.modules.db.models import AuditLog
        return AuditLog(
            id=uuid4(),
            user_id=uuid4(),
            action="login",
            resource_type="member",
            resource_id=uuid4(),
            ip_address="127.0.0.1",
            user_agent="Test Agent",
            created_at=datetime.utcnow(),
        )

    @pytest.mark.asyncio
    async def test_create_audit_log_success(self, audit_service, mock_db_session, sample_audit_log):
        """Test successful audit log creation."""
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        result = await audit_service.create_audit_log(
            db=mock_db_session,
            action="login",
            user_id=sample_audit_log.user_id,
            resource_type="member",
            resource_id=sample_audit_log.resource_id,
            ip_address="127.0.0.1",
            user_agent="Test Agent"
        )
        
        assert result is not None
        assert result.action == "login"
        assert result.user_id == sample_audit_log.user_id
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_audit_log_minimal(self, audit_service, mock_db_session):
        """Test creating audit log with minimal fields."""
        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()
        
        result = await audit_service.create_audit_log(
            db=mock_db_session,
            action="login"
        )
        
        assert result is not None
        assert result.action == "login"
        assert result.user_id is None

    @pytest.mark.asyncio
    async def test_list_audit_logs_success(self, audit_service, mock_db_session, sample_audit_log):
        """Test successful audit log listing."""
        # Mock query result
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample_audit_log]
        mock_result.scalar.return_value = 1
        
        # Mock count result
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 1
        
        mock_db_session.execute = AsyncMock(side_effect=[mock_count_result, mock_result])
        
        query = AuditLogListQuery(page=1, page_size=20)
        
        result = await audit_service.list_audit_logs(
            db=mock_db_session,
            query=query
        )
        
        assert result is not None
        assert result.total == 1
        assert result.page == 1
        assert result.page_size == 20
        assert len(result.items) == 1

    @pytest.mark.asyncio
    async def test_list_audit_logs_with_filters(self, audit_service, mock_db_session, sample_audit_log):
        """Test listing audit logs with filters."""
        user_id = uuid4()
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample_audit_log]
        mock_result.scalar.return_value = 1
        
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 1
        
        mock_db_session.execute = AsyncMock(side_effect=[mock_count_result, mock_result])
        
        query = AuditLogListQuery(
            page=1,
            page_size=20,
            user_id=user_id,
            action="login",
            resource_type="member"
        )
        
        result = await audit_service.list_audit_logs(
            db=mock_db_session,
            query=query
        )
        
        assert result is not None
        assert result.total == 1

    @pytest.mark.asyncio
    async def test_list_audit_logs_with_date_filters(self, audit_service, mock_db_session, sample_audit_log):
        """Test listing audit logs with date filters."""
        start_date = datetime.utcnow() - timedelta(days=7)
        end_date = datetime.utcnow()
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample_audit_log]
        mock_result.scalar.return_value = 1
        
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 1
        
        mock_db_session.execute = AsyncMock(side_effect=[mock_count_result, mock_result])
        
        query = AuditLogListQuery(
            page=1,
            page_size=20,
            start_date=start_date,
            end_date=end_date
        )
        
        result = await audit_service.list_audit_logs(
            db=mock_db_session,
            query=query
        )
        
        assert result is not None
        assert result.total == 1

    @pytest.mark.asyncio
    async def test_list_audit_logs_pagination(self, audit_service, mock_db_session):
        """Test audit log listing with pagination."""
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_result.scalar.return_value = 50
        
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 50
        
        mock_db_session.execute = AsyncMock(side_effect=[mock_count_result, mock_result])
        
        query = AuditLogListQuery(page=2, page_size=20)
        
        result = await audit_service.list_audit_logs(
            db=mock_db_session,
            query=query
        )
        
        assert result is not None
        assert result.total == 50
        assert result.page == 2
        assert result.page_size == 20
        assert result.total_pages == 3  # 50 items / 20 per page = 3 pages

    @pytest.mark.asyncio
    async def test_list_audit_logs_empty(self, audit_service, mock_db_session):
        """Test listing audit logs when empty."""
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_result.scalar.return_value = 0
        
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 0
        
        mock_db_session.execute = AsyncMock(side_effect=[mock_count_result, mock_result])
        
        query = AuditLogListQuery(page=1, page_size=20)
        
        result = await audit_service.list_audit_logs(
            db=mock_db_session,
            query=query
        )
        
        assert result is not None
        assert result.total == 0
        assert len(result.items) == 0

    @pytest.mark.asyncio
    async def test_get_audit_log_success(self, audit_service, mock_db_session, sample_audit_log):
        """Test getting audit log by ID."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_audit_log
        
        mock_db_session.execute = AsyncMock(return_value=mock_result)
        
        result = await audit_service.get_audit_log(
            db=mock_db_session,
            log_id=sample_audit_log.id
        )
        
        assert result is not None
        assert result.id == sample_audit_log.id
        assert result.action == "login"

    @pytest.mark.asyncio
    async def test_get_audit_log_not_found(self, audit_service, mock_db_session):
        """Test getting non-existent audit log."""
        log_id = uuid4()
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        
        mock_db_session.execute = AsyncMock(return_value=mock_result)
        
        result = await audit_service.get_audit_log(
            db=mock_db_session,
            log_id=log_id
        )
        
        assert result is None

    @pytest.mark.asyncio
    async def test_list_audit_logs_with_user_relation(self, audit_service, mock_db_session):
        """Test listing audit logs with user relation loaded."""
        from src.common.modules.db.models import Member
        
        user = Member(
            id=uuid4(),
            email="test@example.com",
            company_name="Test Company"
        )
        
        sample_audit_log = MagicMock()
        sample_audit_log.id = uuid4()
        sample_audit_log.user_id = user.id
        sample_audit_log.action = "login"
        sample_audit_log.resource_type = None
        sample_audit_log.resource_id = None
        sample_audit_log.ip_address = "127.0.0.1"
        sample_audit_log.user_agent = "Test Agent"
        sample_audit_log.created_at = datetime.utcnow()
        sample_audit_log.user = user
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample_audit_log]
        mock_result.scalar.return_value = 1
        
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 1
        
        mock_db_session.execute = AsyncMock(side_effect=[mock_count_result, mock_result])
        
        query = AuditLogListQuery(page=1, page_size=20)
        
        result = await audit_service.list_audit_logs(
            db=mock_db_session,
            query=query
        )
        
        assert result is not None
        assert len(result.items) == 1
        assert result.items[0].user_email == "test@example.com"
        assert result.items[0].user_company_name == "Test Company"

