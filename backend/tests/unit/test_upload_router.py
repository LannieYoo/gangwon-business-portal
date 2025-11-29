"""
Unit tests for upload router.

Tests API endpoints for file upload and management using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime
from io import BytesIO

from src.modules.upload.router import router
from src.common.modules.db.models import Member, Attachment
from src.common.modules.db.session import get_db
from src.common.modules.exception import NotFoundError, UnauthorizedError
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
    return Member(
        id=uuid4(),
        business_number="123-45-67890",
        company_name="Test Company",
        email="test@example.com",
        status="active",
        approval_status="approved",
    )


@pytest.fixture
def sample_attachment():
    """Sample attachment for testing."""
    return Attachment(
        id=uuid4(),
        resource_type="upload",
        resource_id=uuid4(),
        original_name="test.pdf",
        stored_name="test-stored.pdf",
        file_url="https://example.com/files/test.pdf",
        file_size=1024,
        mime_type="application/pdf",
        uploaded_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_file():
    """Sample file for testing."""
    return ("test.pdf", BytesIO(b"test file content"), "application/pdf")


@pytest.mark.unit
class TestUploadRouter:
    """Test upload router endpoints."""

    @pytest.mark.asyncio
    @patch("src.modules.upload.router.audit_log_service")
    @patch("src.modules.upload.router.get_client_info")
    async def test_upload_public_file_success(
        self,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_attachment,
        mock_db_session,
    ):
        """Test successful public file upload."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks - directly replace the service in the module
        import src.modules.upload.router as router_module
        from unittest.mock import MagicMock
        mock_service = MagicMock()
        mock_service.upload_public_file = AsyncMock(return_value=sample_attachment)
        original_service = router_module.service
        router_module.service = mock_service
        
        try:
            mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
            mock_audit_service.create_audit_log = AsyncMock()
            
            # Create mock file
            file_content = BytesIO(b"test file content")
            
            # Make request
            response = client.post(
                "/api/upload/public",
                files={"file": ("test.pdf", file_content, "application/pdf")},
            )
            
            # Assertions
            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["id"] == str(sample_attachment.id)
        finally:
            # Cleanup
            router_module.service = original_service
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.upload.router.audit_log_service")
    @patch("src.modules.upload.router.get_client_info")
    async def test_upload_private_file_success(
        self,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_attachment,
        mock_db_session,
    ):
        """Test successful private file upload."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks - directly replace the service in the module
        import src.modules.upload.router as router_module
        from unittest.mock import MagicMock
        mock_service = MagicMock()
        private_attachment = Attachment(
            id=sample_attachment.id,
            resource_type="member",
            resource_id=sample_member.id,
            original_name=sample_attachment.original_name,
            stored_name=sample_attachment.stored_name,
            file_url=sample_attachment.file_url,
            file_size=sample_attachment.file_size,
            mime_type=sample_attachment.mime_type,
            uploaded_at=datetime.utcnow(),
        )
        mock_service.upload_private_file = AsyncMock(return_value=private_attachment)
        original_service = router_module.service
        router_module.service = mock_service
        
        try:
            mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
            mock_audit_service.create_audit_log = AsyncMock()
            
            # Create mock file
            file_content = BytesIO(b"test file content")
            
            # Make request
            response = client.post(
                "/api/upload/private",
                files={"file": ("test.pdf", file_content, "application/pdf")},
            )
            
            # Assertions
            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["id"] == str(private_attachment.id)
        finally:
            # Cleanup
            router_module.service = original_service
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.upload.router.audit_log_service")
    @patch("src.modules.upload.router.get_client_info")
    async def test_download_file_success(
        self,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_attachment,
        mock_db_session,
    ):
        """Test successful file download."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks - directly replace the service in the module
        import src.modules.upload.router as router_module
        from unittest.mock import MagicMock
        mock_service = MagicMock()
        mock_service.get_file = AsyncMock(return_value=sample_attachment)
        original_service = router_module.service
        router_module.service = mock_service
        
        try:
            mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
            mock_audit_service.create_audit_log = AsyncMock()
            
            # Make request
            response = client.get(f"/api/upload/{sample_attachment.id}")
            
            # Assertions
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "file_url" in data
            assert data["original_name"] == sample_attachment.original_name
        finally:
            # Cleanup
            router_module.service = original_service
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_download_file_not_found(
        self, app, client, sample_member, mock_db_session
    ):
        """Test file download with invalid ID."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks - directly replace the service in the module
        import src.modules.upload.router as router_module
        from unittest.mock import MagicMock
        mock_service = MagicMock()
        mock_service.get_file = AsyncMock(side_effect=NotFoundError("File"))
        original_service = router_module.service
        router_module.service = mock_service
        
        try:
            # Make request
            response = client.get(f"/api/upload/{uuid4()}")
            
            # Assertions
            assert response.status_code == status.HTTP_404_NOT_FOUND
        finally:
            # Cleanup
            router_module.service = original_service
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.upload.router.audit_log_service")
    @patch("src.modules.upload.router.get_client_info")
    async def test_delete_file_success(
        self,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_attachment,
        mock_db_session,
    ):
        """Test successful file deletion."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks - directly replace the service in the module
        import src.modules.upload.router as router_module
        from unittest.mock import MagicMock
        mock_service = MagicMock()
        mock_service.delete_file = AsyncMock()
        original_service = router_module.service
        router_module.service = mock_service
        
        try:
            mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
            mock_audit_service.create_audit_log = AsyncMock()
            
            # Make request
            response = client.delete(f"/api/upload/{sample_attachment.id}")
            
            # Assertions
            assert response.status_code == status.HTTP_204_NO_CONTENT
        finally:
            # Cleanup
            router_module.service = original_service
            app.dependency_overrides.clear()

