"""
Unit tests for user authentication router.

Tests API endpoints for authentication and authorization using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from src.modules.user.router import router
from src.common.modules.db.models import Member
from src.common.modules.db.session import get_db
from src.common.modules.exception import UnauthorizedError
from src.modules.user.dependencies import get_current_active_user


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
    member = Member(
        id=uuid4(),
        business_number="123-45-67890",
        company_name="Test Company",
        email="test@example.com",
        password_hash="$2b$12$test_hash",
        status="active",
        approval_status="approved",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    return member


@pytest.mark.unit
class TestUserRouter:
    """Test user authentication router endpoints."""

    @pytest.mark.asyncio
    @patch("src.modules.user.router.auth_service")
    async def test_register_success(self, mock_auth_service, app, client, sample_member, mock_db_session):
        """Test successful member registration."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.register_member = AsyncMock(return_value=sample_member)
        
        # Make request with all required fields
        response = client.post(
            "/api/auth/register",
            json={
                "business_number": "123-45-67890",
                "company_name": "Test Company",
                "email": "test@example.com",
                "password": "Test123!@#",
                "terms_agreed": True,
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "message" in data
        assert "member_id" in data
        mock_auth_service.register_member.assert_called_once()
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.auth_service")
    async def test_register_failure(self, mock_auth_service, app, client, mock_db_session):
        """Test member registration failure."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.register_member = AsyncMock(side_effect=Exception("Registration failed"))
        
        # Make request with all required fields
        response = client.post(
            "/api/auth/register",
            json={
                "business_number": "123-45-67890",
                "company_name": "Test Company",
                "email": "test@example.com",
                "password": "Test123!@#",
                "terms_agreed": True,
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.audit_log_service")
    @patch("src.modules.user.router.get_client_info")
    @patch("src.modules.user.router.auth_service")
    async def test_login_success(
        self,
        mock_auth_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test successful member login."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.authenticate = AsyncMock(return_value=sample_member)
        mock_auth_service.create_access_token.return_value = "test_token"
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/auth/login",
            json={
                "business_number": "123-45-67890",
                "password": "Test123!@#",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        mock_auth_service.authenticate.assert_called_once()
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.auth_service")
    async def test_login_unauthorized(self, mock_auth_service, app, client, mock_db_session):
        """Test login with invalid credentials."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.authenticate = AsyncMock(side_effect=UnauthorizedError("Invalid credentials"))
        
        # Make request
        response = client.post(
            "/api/auth/login",
            json={
                "business_number": "123-45-67890",
                "password": "WrongPassword",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.audit_log_service")
    @patch("src.modules.user.router.get_client_info")
    @patch("src.modules.user.router.auth_service")
    async def test_admin_login_success(
        self,
        mock_auth_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test successful admin login."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.authenticate_admin = AsyncMock(return_value=sample_member)
        mock_auth_service.create_access_token.return_value = "admin_token"
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/auth/admin-login",
            json={
                "username": "admin",
                "password": "Admin123!@#",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        mock_auth_service.authenticate_admin.assert_called_once()
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.common.modules.email.service.email_service")
    @patch("src.modules.user.router.auth_service")
    async def test_password_reset_request_success(
        self, mock_auth_service, mock_email_service, app, client, mock_db_session
    ):
        """Test successful password reset request."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.create_password_reset_request = AsyncMock(return_value="reset_token")
        mock_email_service.send_password_reset_email = AsyncMock(return_value=True)
        
        # Make request
        response = client.post(
            "/api/auth/password-reset-request",
            json={
                "business_number": "123-45-67890",
                "email": "test@example.com",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.json()
        mock_auth_service.create_password_reset_request.assert_called_once()
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.auth_service")
    async def test_password_reset_success(self, mock_auth_service, app, client, mock_db_session):
        """Test successful password reset."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.reset_password_with_token = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/auth/password-reset",
            json={
                "token": "reset_token",
                "new_password": "NewPassword123!@#",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.json()
        mock_auth_service.reset_password_with_token.assert_called_once()
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.auth_service")
    async def test_password_reset_invalid_token(self, mock_auth_service, app, client, mock_db_session):
        """Test password reset with invalid token."""
        # Override database dependency
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_auth_service.reset_password_with_token = AsyncMock(side_effect=UnauthorizedError("Invalid token"))
        
        # Make request
        response = client.post(
            "/api/auth/password-reset",
            json={
                "token": "invalid_token",
                "new_password": "NewPassword123!@#",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_current_user_info(self, app, client, sample_member):
        """Test getting current user information."""
        # Override get_current_active_user dependency
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Make request
        response = client.get("/api/auth/me")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["business_number"] == sample_member.business_number
        assert data["email"] == sample_member.email
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.audit_log_service")
    @patch("src.modules.user.router.get_client_info")
    async def test_logout_success(
        self,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test successful logout."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post("/api/auth/logout")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.json()
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.user.router.auth_service")
    async def test_refresh_token_success(self, mock_auth_service, app, client, sample_member):
        """Test successful token refresh."""
        # Override get_current_active_user dependency
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_auth_service.create_access_token.return_value = "new_token"
        
        # Make request
        response = client.post("/api/auth/refresh")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
        # Cleanup
        app.dependency_overrides.clear()

