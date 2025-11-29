"""
Unit tests for performance router.

Tests API endpoints for performance record management using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from src.modules.performance.router import router
from src.common.modules.db.models import Member, PerformanceRecord
from src.common.modules.db.session import get_db
from src.common.modules.exception import NotFoundError, ValidationError
from src.modules.user.dependencies import get_current_active_user, get_current_admin_user


@pytest.fixture
def app():
    """Create FastAPI app with router."""
    app = FastAPI()
    app.include_router(router)
    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def mock_db_session():
    """Mock database session."""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    return session


@pytest.fixture
def sample_member():
    """Sample member for testing."""
    return Member(
        id=uuid4(),
        business_number="123-45-67890",
        company_name="Test Company",
        email="test@example.com",
        status="active",
        approval_status="approved",
    )


@pytest.fixture
def sample_performance():
    """Sample performance record for testing."""
    return PerformanceRecord(
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


@pytest.mark.unit
class TestPerformanceRouter:
    """Test performance router endpoints."""

    @pytest.mark.asyncio
    @patch("src.modules.performance.router.service")
    async def test_list_my_performance_records_success(
        self, mock_service, app, client, sample_member, sample_performance, mock_db_session
    ):
        """Test successful list of performance records."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.list_performance_records = AsyncMock(return_value=([sample_performance], 1))
        
        # Make request
        response = client.get("/api/performance?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.performance.router.service")
    async def test_get_performance_record_success(
        self, mock_service, app, client, sample_member, sample_performance, mock_db_session
    ):
        """Test successful performance record retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.get_performance_by_id = AsyncMock(return_value=sample_performance)
        
        # Make request
        response = client.get(f"/api/performance/{sample_performance.id}")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_performance.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.performance.router.audit_log_service")
    @patch("src.modules.performance.router.get_client_info")
    @patch("src.modules.performance.router.service")
    async def test_create_performance_record_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_performance,
        mock_db_session,
    ):
        """Test successful performance record creation."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.create_performance = AsyncMock(return_value=sample_performance)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/performance",
            json={
                "year": 2024,
                "quarter": 1,
                "type": "sales",
                "data_json": {"revenue": 1000000},
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == str(sample_performance.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.performance.router.audit_log_service")
    @patch("src.modules.performance.router.get_client_info")
    @patch("src.modules.performance.router.service")
    async def test_update_performance_record_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_performance,
        mock_db_session,
    ):
        """Test successful performance record update."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.update_performance = AsyncMock(return_value=sample_performance)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.put(
            f"/api/performance/{sample_performance.id}",
            json={
                "data_json": {"revenue": 2000000},
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_performance.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.performance.router.audit_log_service")
    @patch("src.modules.performance.router.get_client_info")
    @patch("src.modules.performance.router.service")
    async def test_submit_performance_record_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_performance,
        mock_db_session,
    ):
        """Test successful performance record submission."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        from datetime import datetime
        submitted_performance = PerformanceRecord(
            id=sample_performance.id,
            member_id=sample_performance.member_id,
            year=sample_performance.year,
            quarter=sample_performance.quarter,
            type=sample_performance.type,
            status="submitted",
            data_json=sample_performance.data_json,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_service.submit_performance = AsyncMock(return_value=submitted_performance)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(f"/api/performance/{sample_performance.id}/submit")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "submitted"
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.performance.router.service")
    async def test_list_all_performance_records_admin_success(
        self, mock_service, app, client, sample_member, sample_performance, mock_db_session
    ):
        """Test successful list of all performance records (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.list_all_performance_records = AsyncMock(return_value=([sample_performance], 1))
        
        # Make request
        response = client.get("/api/admin/performance?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.performance.router.audit_log_service")
    @patch("src.modules.performance.router.get_client_info")
    @patch("src.modules.performance.router.service")
    async def test_approve_performance_record_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_performance,
        mock_db_session,
    ):
        """Test successful performance record approval (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        from datetime import datetime
        approved_performance = PerformanceRecord(
            id=sample_performance.id,
            member_id=sample_performance.member_id,
            year=sample_performance.year,
            quarter=sample_performance.quarter,
            type=sample_performance.type,
            status="approved",
            data_json=sample_performance.data_json,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_service.approve_performance = AsyncMock(return_value=approved_performance)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.put(
            f"/api/admin/performance/{sample_performance.id}/approve",
            json={"status": "approved", "comments": "Approved"},
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "approved"
        
        # Cleanup
        app.dependency_overrides.clear()

