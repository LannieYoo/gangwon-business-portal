"""
Unit tests for project router.

Tests API endpoints for project and application management using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from src.modules.project.router import router
from src.common.modules.db.models import Member, Project, ProjectApplication
from src.common.modules.db.session import get_db
from src.common.modules.exception import NotFoundError
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
def sample_project():
    """Sample project for testing."""
    return Project(
        id=uuid4(),
        title="Test Project",
        description="Test Description",
        status="active",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_application():
    """Sample project application for testing."""
    return ProjectApplication(
        id=uuid4(),
        member_id=uuid4(),
        project_id=uuid4(),
        status="submitted",
        application_reason="Test reason",
        submitted_at=datetime.utcnow(),
    )


@pytest.mark.unit
class TestProjectRouter:
    """Test project router endpoints."""

    @pytest.mark.asyncio
    @patch("src.modules.project.router.service")
    async def test_list_projects_success(
        self, mock_service, app, client, sample_project, mock_db_session
    ):
        """Test successful project list retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_service.list_projects = AsyncMock(return_value=([sample_project], 1))
        
        # Make request
        response = client.get("/api/projects?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.project.router.service")
    async def test_get_project_success(
        self, mock_service, app, client, sample_project, mock_db_session
    ):
        """Test successful project retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_service.get_project_by_id = AsyncMock(return_value=sample_project)
        
        # Make request
        response = client.get(f"/api/projects/{sample_project.id}")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_project.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.project.router.audit_log_service")
    @patch("src.modules.project.router.get_client_info")
    @patch("src.modules.project.router.service")
    async def test_apply_to_project_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_application,
        mock_db_session,
    ):
        """Test successful project application."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.apply_to_project = AsyncMock(return_value=sample_application)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            f"/api/projects/{sample_application.project_id}/apply",
            json={"application_reason": "Test reason"},
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == str(sample_application.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.project.router.service")
    async def test_get_my_applications_success(
        self, mock_service, app, client, sample_member, sample_application, mock_db_session
    ):
        """Test successful my applications retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.get_my_applications = AsyncMock(return_value=([sample_application], 1))
        
        # Make request
        response = client.get("/api/my-applications?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.project.router.audit_log_service")
    @patch("src.modules.project.router.get_client_info")
    @patch("src.modules.project.router.service")
    async def test_create_project_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_project,
        mock_db_session,
    ):
        """Test successful project creation (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.create_project = AsyncMock(return_value=sample_project)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/admin/projects",
            json={
                "title": "Test Project",
                "description": "Test Description",
                "status": "active",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == str(sample_project.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.project.router.audit_log_service")
    @patch("src.modules.project.router.get_client_info")
    @patch("src.modules.project.router.service")
    async def test_update_project_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_project,
        mock_db_session,
    ):
        """Test successful project update (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.update_project = AsyncMock(return_value=sample_project)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.put(
            f"/api/admin/projects/{sample_project.id}",
            json={"title": "Updated Project"},
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_project.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.project.router.audit_log_service")
    @patch("src.modules.project.router.get_client_info")
    @patch("src.modules.project.router.service")
    async def test_delete_project_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_project,
        mock_db_session,
    ):
        """Test successful project deletion (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.delete_project = AsyncMock()
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.delete(f"/api/admin/projects/{sample_project.id}")
        
        # Assertions
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Cleanup
        app.dependency_overrides.clear()

