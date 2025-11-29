"""
Unit tests for support router.

Tests API endpoints for support management using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from src.modules.support.router import router
from src.common.modules.db.models import Member, FAQ, Inquiry
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
def sample_faq():
    """Sample FAQ for testing."""
    return FAQ(
        id=uuid4(),
        category="general",
        question="Test Question",
        answer="Test Answer",
        display_order=0,
        created_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_inquiry():
    """Sample inquiry for testing."""
    return Inquiry(
        id=uuid4(),
        member_id=uuid4(),
        subject="Test Inquiry",
        content="Test Content",
        status="pending",
        created_at=datetime.utcnow(),
    )


@pytest.mark.unit
class TestSupportRouter:
    """Test support router endpoints."""

    @pytest.mark.asyncio
    @patch("src.modules.support.router.service")
    async def test_list_faqs_success(
        self, mock_service, app, client, sample_faq, mock_db_session
    ):
        """Test successful FAQ list retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_service.get_faqs = AsyncMock(return_value=[sample_faq])
        
        # Make request
        response = client.get("/api/faqs")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.support.router.audit_log_service")
    @patch("src.modules.support.router.get_client_info")
    @patch("src.modules.support.router.service")
    async def test_create_faq_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_faq,
        mock_db_session,
    ):
        """Test successful FAQ creation (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.create_faq = AsyncMock(return_value=sample_faq)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/admin/faqs",
            json={
                "category": "general",
                "question": "Test Question",
                "answer": "Test Answer",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == str(sample_faq.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.support.router.audit_log_service")
    @patch("src.modules.support.router.get_client_info")
    @patch("src.modules.support.router.service")
    async def test_create_inquiry_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_inquiry,
        mock_db_session,
    ):
        """Test successful inquiry creation."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.create_inquiry = AsyncMock(return_value=sample_inquiry)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/inquiries",
            json={
                "subject": "Test Inquiry",
                "content": "Test Content",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == str(sample_inquiry.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.support.router.service")
    async def test_list_my_inquiries_success(
        self, mock_service, app, client, sample_member, sample_inquiry, mock_db_session
    ):
        """Test successful my inquiries list retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.get_member_inquiries = AsyncMock(return_value=([sample_inquiry], 1))
        
        # Make request
        response = client.get("/api/inquiries?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.support.router.service")
    async def test_get_inquiry_success(
        self, mock_service, app, client, sample_member, sample_inquiry, mock_db_session
    ):
        """Test successful inquiry retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.get_inquiry_by_id = AsyncMock(return_value=sample_inquiry)
        
        # Make request
        response = client.get(f"/api/inquiries/{sample_inquiry.id}")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_inquiry.id)
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.support.router.service")
    async def test_list_all_inquiries_admin_success(
        self, mock_service, app, client, sample_member, sample_inquiry, mock_db_session
    ):
        """Test successful all inquiries list retrieval (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.get_all_inquiries_admin = AsyncMock(return_value=([sample_inquiry], 1))
        
        # Mock member query for getting member name
        from sqlalchemy import select
        from src.common.modules.db.models import Member
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = sample_member
        mock_db_session.execute = AsyncMock(return_value=member_result)
        
        # Make request
        response = client.get("/api/admin/inquiries?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.support.router.audit_log_service")
    @patch("src.modules.support.router.get_client_info")
    @patch("src.modules.support.router.service")
    async def test_reply_to_inquiry_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_inquiry,
        mock_db_session,
    ):
        """Test successful inquiry reply (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        replied_inquiry = Inquiry(
            id=sample_inquiry.id,
            member_id=sample_inquiry.member_id,
            subject=sample_inquiry.subject,
            content=sample_inquiry.content,
            status="replied",
            admin_reply="Test Reply",
            created_at=sample_inquiry.created_at,
            replied_at=datetime.utcnow(),
        )
        mock_service.reply_to_inquiry = AsyncMock(return_value=replied_inquiry)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Mock member query for getting member name
        from sqlalchemy import select
        from src.common.modules.db.models import Member
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = sample_member
        mock_db_session.execute = AsyncMock(return_value=member_result)
        
        # Make request
        response = client.put(
            f"/api/admin/inquiries/{sample_inquiry.id}/reply",
            json={"admin_reply": "Test Reply"},
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "replied"
        
        # Cleanup
        app.dependency_overrides.clear()

