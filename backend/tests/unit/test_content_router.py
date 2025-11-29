"""
Unit tests for content router.

Tests API endpoints for content management using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from src.modules.content.router import router
from src.common.modules.db.models import Member, Notice, PressRelease, Banner, SystemInfo
from src.common.modules.db.session import get_db
from src.common.modules.exception import NotFoundError
from src.modules.user.dependencies import get_current_admin_user


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
def sample_notice():
    """Sample notice for testing."""
    return Notice(
        id=uuid4(),
        board_type="notice",
        title="Test Notice",
        content_html="<p>Test content</p>",
        author_id=uuid4(),
        view_count=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_press():
    """Sample press release for testing."""
    return PressRelease(
        id=uuid4(),
        title="Test Press",
        image_url="https://example.com/image.jpg",
        author_id=uuid4(),
        created_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_banner():
    """Sample banner for testing."""
    return Banner(
        id=uuid4(),
        banner_type="MAIN",
        image_url="https://example.com/banner.jpg",
        link_url="https://example.com",
        is_active="true",
        display_order=1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.mark.unit
class TestContentRouter:
    """Test content router endpoints."""

    @pytest.mark.asyncio
    @patch("src.modules.content.router.service")
    async def test_list_notices_success(
        self, mock_service, app, client, sample_notice, mock_db_session
    ):
        """Test successful notice list retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_service.get_notices = AsyncMock(return_value=([sample_notice], 1))
        
        # Make request
        response = client.get("/api/notices?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.content.router.service")
    async def test_get_notice_success(
        self, mock_service, app, client, sample_notice, mock_db_session
    ):
        """Test successful notice retrieval."""
        from unittest.mock import MagicMock
        
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_service.get_notice_by_id = AsyncMock(return_value=sample_notice)
        
        # Mock db.execute for author lookup (returns None - no author)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = AsyncMock(return_value=mock_result)
        
        # Make request
        response = client.get(f"/api/notices/{sample_notice.id}")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_notice.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.content.router.audit_log_service")
    @patch("src.modules.content.router.get_client_info")
    @patch("src.modules.content.router.service")
    async def test_create_notice_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_notice,
        mock_db_session,
    ):
        """Test successful notice creation (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.create_notice = AsyncMock(return_value=sample_notice)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/admin/content/notices",
            json={
                "board_type": "notice",
                "title": "Test Notice",
                "content_html": "<p>Test content</p>",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == str(sample_notice.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.content.router.service")
    async def test_list_press_releases_success(
        self, mock_service, app, client, sample_press, mock_db_session
    ):
        """Test successful press release list retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_service.get_press_releases = AsyncMock(return_value=([sample_press], 1))
        
        # Make request
        response = client.get("/api/press?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.content.router.service")
    async def test_get_banners_success(
        self, mock_service, app, client, sample_banner, mock_db_session
    ):
        """Test successful banner list retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_service.get_banners = AsyncMock(return_value=[sample_banner])
        
        # Make request
        response = client.get("/api/banners")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.content.router.audit_log_service")
    @patch("src.modules.content.router.get_client_info")
    @patch("src.modules.content.router.service")
    async def test_create_banner_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_banner,
        mock_db_session,
    ):
        """Test successful banner creation (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.create_banner = AsyncMock(return_value=sample_banner)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/admin/content/banners",
            json={
                "banner_type": "MAIN",
                "image_url": "https://example.com/banner.jpg",
                "link_url": "https://example.com",
                "is_active": True,
                "display_order": 1,
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == str(sample_banner.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.content.router.service")
    async def test_get_system_info_success(
        self, mock_service, app, client, mock_db_session
    ):
        """Test successful system info retrieval."""
        from unittest.mock import MagicMock
        
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        system_info = SystemInfo(
            id=uuid4(),
            content_html="<p>System info</p>",
            image_url="https://example.com/image.jpg",
            updated_by=uuid4(),
            updated_at=datetime.utcnow(),
        )
        mock_service.get_system_info = AsyncMock(return_value=system_info)
        
        # Mock db.execute for updater lookup (returns None - no updater)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=None)
        mock_db_session.execute = AsyncMock(return_value=mock_result)
        
        # Make request
        response = client.get("/api/system-info")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data is not None
        
        # Cleanup
        app.dependency_overrides.clear()

