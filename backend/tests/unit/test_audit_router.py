"""
Unit tests for audit router.

Tests API endpoints for audit log viewing using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from src.common.modules.audit import router as audit_router_module
from src.common.modules.audit.router import router
from src.common.modules.db.models import Member, AuditLog
from src.common.modules.db.session import get_db
from src.common.modules.exception import NotFoundError
from src.modules.user.dependencies import get_current_admin_user


@pytest.fixture
def app():
    """Create FastAPI app with router."""
    from src.common.modules.exception import (
        AppException,
        app_exception_handler,
    )
    from fastapi.exceptions import RequestValidationError
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    app.include_router(router)
    
    # Add exception handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, lambda req, exc: JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    ))
    
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
def sample_audit_log():
    """Sample audit log for testing."""
    return AuditLog(
        id=uuid4(),
        user_id=uuid4(),
        action="create",
        resource_type="member",
        resource_id=uuid4(),
        ip_address="127.0.0.1",
        user_agent="Mozilla/5.0",
        created_at=datetime.utcnow(),
    )


@pytest.mark.unit
class TestAuditRouter:
    """Test audit router endpoints."""

    @pytest.mark.asyncio
    @patch("src.common.modules.audit.router.audit_log_service")
    async def test_list_audit_logs_success(
        self, mock_service, app, client, sample_member, sample_audit_log, mock_db_session
    ):
        """Test successful audit log list retrieval (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        # Override get_admin_user_dependency to return our override function
        def mock_get_admin_user_dependency():
            return override_get_admin_user
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[audit_router_module.get_admin_user_dependency] = mock_get_admin_user_dependency
        
        # Setup mocks
        mock_response = MagicMock()
        mock_response.items = [sample_audit_log]
        mock_response.total = 1
        mock_response.page = 1
        mock_response.page_size = 20
        mock_response.total_pages = 1
        mock_service.list_audit_logs = AsyncMock(return_value=mock_response)
        
        # Make request
        response = client.get("/api/admin/audit-logs?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data or "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.common.modules.audit.router.audit_log_service")
    async def test_get_audit_log_success(
        self, mock_service, app, client, sample_member, sample_audit_log, mock_db_session
    ):
        """Test successful audit log retrieval by ID (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        # Override get_admin_user_dependency to return our override function
        def mock_get_admin_user_dependency():
            return override_get_admin_user
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[audit_router_module.get_admin_user_dependency] = mock_get_admin_user_dependency
        
        # Setup mocks - add user relationship
        sample_audit_log.user = sample_member
        mock_service.get_audit_log = AsyncMock(return_value=sample_audit_log)
        
        # Make request
        response = client.get(f"/api/admin/audit-logs/{sample_audit_log.id}")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_audit_log.id)
        assert data["action"] == sample_audit_log.action
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.common.modules.audit.router.audit_log_service")
    async def test_get_audit_log_not_found(
        self, mock_service, app, client, sample_member, mock_db_session
    ):
        """Test audit log retrieval with invalid ID."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        # Override get_admin_user_dependency to return our override function
        def mock_get_admin_user_dependency():
            return override_get_admin_user
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[audit_router_module.get_admin_user_dependency] = mock_get_admin_user_dependency
        
        # Setup mocks
        mock_service.get_audit_log = AsyncMock(return_value=None)
        
        # Make request
        response = client.get(f"/api/admin/audit-logs/{uuid4()}")
        
        # Assertions
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.common.modules.audit.router.audit_log_service")
    async def test_list_audit_logs_with_filters_success(
        self, mock_service, app, client, sample_member, sample_audit_log, mock_db_session
    ):
        """Test successful audit log list with filters (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        # Override get_admin_user_dependency to return our override function
        def mock_get_admin_user_dependency():
            return override_get_admin_user
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[audit_router_module.get_admin_user_dependency] = mock_get_admin_user_dependency
        
        # Setup mocks
        mock_response = MagicMock()
        mock_response.items = [sample_audit_log]
        mock_response.total = 1
        mock_response.page = 1
        mock_response.page_size = 20
        mock_response.total_pages = 1
        mock_service.list_audit_logs = AsyncMock(return_value=mock_response)
        
        # Make request with filters
        response = client.get(
            "/api/admin/audit-logs?page=1&page_size=20&action=create&resource_type=member"
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        
        # Cleanup
        app.dependency_overrides.clear()

