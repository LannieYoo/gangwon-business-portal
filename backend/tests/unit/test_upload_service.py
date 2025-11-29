"""
Unit tests for UploadService.

Tests file upload service methods in isolation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, Mock
from uuid import uuid4
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.modules.upload.service import UploadService
from src.common.modules.exception import NotFoundError, UnauthorizedError, ValidationError


@pytest.mark.unit
class TestUploadService:
    """Test suite for UploadService."""

    @pytest.fixture
    def sample_member(self):
        """Sample member."""
        from src.common.modules.db.models import Member
        member = Member(
            id=uuid4(),
            business_number="123-45-67890",
            company_name="Test Company",
            email="test@example.com",
            status="active",
        )
        return member

    @pytest.fixture
    def sample_attachment(self, sample_member):
        """Sample attachment."""
        from src.common.modules.db.models import Attachment
        attachment = Attachment(
            id=uuid4(),
            resource_type="public",
            resource_id=sample_member.id,
            file_type="image",
            file_url="https://example.com/file.jpg",
            original_name="test.jpg",
            stored_name="stored-test.jpg",
            file_size=1024,
            mime_type="image/jpeg",
        )
        return attachment

    @pytest.fixture
    def mock_upload_file(self):
        """Mock UploadFile."""
        file = Mock()
        file.filename = "test.jpg"
        file.content_type = "image/jpeg"
        file.size = 1024
        file.headers = {"content-length": "1024"}
        file.read = AsyncMock(return_value=b"fake file content")
        file.seek = AsyncMock()
        return file

    def test_validate_file_success(self, mock_upload_file):
        """Test successful file validation."""
        service = UploadService()
        
        # Should not raise
        service._validate_file(mock_upload_file, file_size=1024)

    def test_validate_file_too_large(self, mock_upload_file):
        """Test file validation with file too large."""
        service = UploadService()
        
        # Mock settings
        with patch('src.modules.upload.service.settings') as mock_settings:
            mock_settings.MAX_UPLOAD_SIZE = 100  # 100 bytes max
            
            with pytest.raises(ValidationError) as exc_info:
                service._validate_file(mock_upload_file, file_size=1024)
            
            assert "exceeds maximum" in str(exc_info.value).lower()

    def test_validate_file_invalid_type(self):
        """Test file validation with invalid file type."""
        service = UploadService()
        
        file = Mock()
        file.content_type = "application/x-executable"
        file.size = 1024
        
        # Mock settings
        with patch('src.modules.upload.service.settings') as mock_settings:
            mock_settings.MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
            mock_settings.ALLOWED_FILE_TYPES = "image/jpeg,image/png,application/pdf"
            
            with pytest.raises(ValidationError) as exc_info:
                service._validate_file(file)
            
            assert "not allowed" in str(exc_info.value).lower()

    def test_determine_file_type(self):
        """Test file type determination."""
        service = UploadService()
        
        assert service._determine_file_type("image/jpeg") == "image"
        assert service._determine_file_type("application/pdf") == "document"
        assert service._determine_file_type("application/json") == "document"
        assert service._determine_file_type("text/plain") == "other"
        assert service._determine_file_type(None) == "other"

    @pytest.mark.asyncio
    async def test_upload_public_file_success(
        self, mock_db_session, sample_member, mock_upload_file
    ):
        """Test successful public file upload."""
        service = UploadService()
        
        # Mock storage service
        with patch('src.modules.upload.service.storage_service') as mock_storage:
            mock_storage.upload_file = AsyncMock(return_value={
                "url": "https://example.com/public/test.jpg",
                "original_name": "test.jpg",
                "stored_name": "stored-test.jpg",
                "mime_type": "image/jpeg",
            })
            
            attachment = await service.upload_public_file(
                mock_upload_file, sample_member, db=mock_db_session
            )
            
            assert attachment is not None
            assert attachment.resource_type == "public"
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_upload_private_file_success(
        self, mock_db_session, sample_member, mock_upload_file
    ):
        """Test successful private file upload."""
        service = UploadService()
        
        # Mock storage service
        with patch('src.modules.upload.service.storage_service') as mock_storage:
            mock_storage.upload_file = AsyncMock(return_value={
                "url": "https://example.com/private/test.jpg",
                "original_name": "test.jpg",
                "stored_name": "stored-test.jpg",
                "mime_type": "image/jpeg",
                "path": "test.jpg",
            })
            
            attachment = await service.upload_private_file(
                mock_upload_file, sample_member, db=mock_db_session
            )
            
            assert attachment is not None
            assert attachment.resource_type == "private"
            assert attachment.file_url.startswith("private-files/")
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_file_public_success(
        self, mock_db_session, sample_member, sample_attachment
    ):
        """Test successful public file retrieval."""
        service = UploadService()
        sample_attachment.resource_type = "public"
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_attachment
        mock_db_session.execute.return_value = result
        
        attachment = await service.get_file(
            sample_attachment.id, sample_member, mock_db_session
        )
        
        assert attachment.id == sample_attachment.id
        assert attachment.file_url == sample_attachment.file_url

    @pytest.mark.asyncio
    async def test_get_file_private_owner(
        self, mock_db_session, sample_member, sample_attachment
    ):
        """Test successful private file retrieval by owner."""
        service = UploadService()
        sample_attachment.resource_type = "private"
        sample_attachment.resource_id = sample_member.id
        sample_attachment.file_url = "private-files/test.jpg"
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_attachment
        mock_db_session.execute.return_value = result
        
        # Mock AuthService
        with patch('src.modules.user.service.AuthService') as mock_auth:
            auth_instance = Mock()
            auth_instance.is_admin.return_value = False
            mock_auth.return_value = auth_instance
            
            # Mock storage service
            with patch('src.modules.upload.service.storage_service') as mock_storage:
                mock_storage.create_signed_url = Mock(return_value="https://signed-url.com/file.jpg")
                
                attachment = await service.get_file(
                    sample_attachment.id, sample_member, mock_db_session
                )
                
                assert attachment.file_url == "https://signed-url.com/file.jpg"

    @pytest.mark.asyncio
    async def test_get_file_private_unauthorized(
        self, mock_db_session, sample_member, sample_attachment
    ):
        """Test private file retrieval by non-owner."""
        service = UploadService()
        sample_attachment.resource_type = "private"
        sample_attachment.resource_id = uuid4()  # Different member
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_attachment
        mock_db_session.execute.return_value = result
        
        # Mock AuthService
        with patch('src.modules.user.service.AuthService') as mock_auth:
            auth_instance = Mock()
            auth_instance.is_admin.return_value = False
            mock_auth.return_value = auth_instance
            
            with pytest.raises(UnauthorizedError) as exc_info:
                await service.get_file(
                    sample_attachment.id, sample_member, mock_db_session
                )
            
            assert "permission" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_get_file_not_found(self, mock_db_session, sample_member):
        """Test file retrieval when not found."""
        service = UploadService()
        file_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.get_file(file_id, sample_member, mock_db_session)
        
        assert "File not found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_delete_file_success(
        self, mock_db_session, sample_member, sample_attachment
    ):
        """Test successful file deletion."""
        service = UploadService()
        sample_attachment.resource_id = sample_member.id
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_attachment
        mock_db_session.execute.return_value = result
        
        # Mock AuthService
        with patch('src.modules.user.service.AuthService') as mock_auth:
            auth_instance = Mock()
            auth_instance.is_admin.return_value = False
            mock_auth.return_value = auth_instance
            
            # Mock storage service
            with patch('src.modules.upload.service.storage_service') as mock_storage:
                mock_storage.delete_file = AsyncMock()
                
                result = await service.delete_file(
                    sample_attachment.id, sample_member, mock_db_session
                )
                
                assert result is True
                mock_db_session.delete.assert_called_once()
                mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_file_unauthorized(
        self, mock_db_session, sample_member, sample_attachment
    ):
        """Test file deletion by non-owner."""
        service = UploadService()
        sample_attachment.resource_id = uuid4()  # Different member
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_attachment
        mock_db_session.execute.return_value = result
        
        # Mock AuthService
        with patch('src.modules.user.service.AuthService') as mock_auth:
            auth_instance = Mock()
            auth_instance.is_admin.return_value = False
            mock_auth.return_value = auth_instance
            
            with pytest.raises(UnauthorizedError) as exc_info:
                await service.delete_file(
                    sample_attachment.id, sample_member, mock_db_session
                )
            
            assert "permission" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_delete_file_admin_access(
        self, mock_db_session, sample_member, sample_attachment
    ):
        """Test file deletion by admin."""
        service = UploadService()
        sample_attachment.resource_id = uuid4()  # Different member
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_attachment
        mock_db_session.execute.return_value = result
        
        # Mock AuthService (admin)
        with patch('src.modules.user.service.AuthService') as mock_auth:
            auth_instance = Mock()
            auth_instance.is_admin.return_value = True
            mock_auth.return_value = auth_instance
            
            # Mock storage service
            with patch('src.modules.upload.service.storage_service') as mock_storage:
                mock_storage.delete_file = AsyncMock()
                
                result = await service.delete_file(
                    sample_attachment.id, sample_member, mock_db_session
                )
                
                assert result is True
                mock_db_session.delete.assert_called_once()

