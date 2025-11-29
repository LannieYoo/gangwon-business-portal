"""
Unit tests for AuthService.

Tests authentication service methods in isolation using mocks.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timedelta
from jose import jwt

import sys
import os
# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.modules.user.service import AuthService
from src.modules.user.schemas import MemberRegisterRequest
from src.common.modules.exception import ValidationError, UnauthorizedError
from src.common.modules.config import settings


@pytest.mark.unit
class TestAuthService:
    """Test suite for AuthService."""

    def test_verify_password_success(self, auth_service):
        """Test password verification with correct password."""
        plain_password = "TestPassword123!"
        hashed_password = auth_service.get_password_hash(plain_password)
        
        result = auth_service.verify_password(plain_password, hashed_password)
        
        assert result is True

    def test_verify_password_failure(self, auth_service):
        """Test password verification with incorrect password."""
        plain_password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        hashed_password = auth_service.get_password_hash(plain_password)
        
        result = auth_service.verify_password(wrong_password, hashed_password)
        
        assert result is False

    def test_get_password_hash(self, auth_service):
        """Test password hashing."""
        password = "TestPassword123!"
        
        hash1 = auth_service.get_password_hash(password)
        hash2 = auth_service.get_password_hash(password)
        
        # Hashes should be different (due to salt)
        assert hash1 != hash2
        # But both should verify correctly
        assert auth_service.verify_password(password, hash1) is True
        assert auth_service.verify_password(password, hash2) is True

    def test_create_access_token(self, auth_service):
        """Test JWT token creation."""
        data = {"sub": "test-user-id", "email": "test@example.com"}
        
        token = auth_service.create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        # Decode and verify
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        assert payload["sub"] == "test-user-id"
        assert payload["email"] == "test@example.com"
        assert "exp" in payload

    def test_create_access_token_with_expires_delta(self, auth_service):
        """Test JWT token creation with custom expiration."""
        data = {"sub": "test-user-id"}
        expires_delta = timedelta(minutes=60)
        
        token = auth_service.create_access_token(data, expires_delta)
        
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        # Check expiration is approximately 60 minutes from now
        from datetime import timezone
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        diff = (exp_time - now).total_seconds() / 60
        assert 59 <= diff <= 61  # Allow 1 minute tolerance

    def test_decode_token_success(self, auth_service):
        """Test successful token decoding."""
        data = {"sub": "test-user-id", "email": "test@example.com"}
        token = auth_service.create_access_token(data)
        
        payload = auth_service.decode_token(token)
        
        assert payload["sub"] == "test-user-id"
        assert payload["email"] == "test@example.com"

    def test_decode_token_invalid(self, auth_service):
        """Test token decoding with invalid token."""
        invalid_token = "invalid.token.here"
        
        with pytest.raises(UnauthorizedError) as exc_info:
            auth_service.decode_token(invalid_token)
        
        assert "Invalid or expired token" in str(exc_info.value)

    def test_decode_token_expired(self, auth_service):
        """Test token decoding with expired token."""
        data = {"sub": "test-user-id"}
        # Create token with past expiration
        expired_delta = timedelta(minutes=-10)
        token = auth_service.create_access_token(data, expired_delta)
        
        with pytest.raises(UnauthorizedError) as exc_info:
            auth_service.decode_token(token)
        
        assert "Invalid or expired token" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_member_success(self, auth_service, mock_db_session, sample_member_data):
        """Test successful member registration."""
        from uuid import uuid4
        from src.common.modules.db.models import Member
        
        # Create a member that will be returned after refresh
        new_member_id = uuid4()
        new_member = Member(
            id=new_member_id,
            business_number=sample_member_data["business_number"],
            company_name=sample_member_data["company_name"],
            email=sample_member_data["email"],
            password_hash="hashed_password",
            status="pending",
            approval_status="pending",
        )
        
        # Mock database queries - both business_number and email checks return None
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db_session.execute = AsyncMock(return_value=mock_result)
        
        # Mock db methods
        mock_db_session.flush = AsyncMock()
        mock_db_session.commit = AsyncMock()
        
        # Mock refresh to set member id
        async def mock_refresh(member):
            if hasattr(member, 'id') and member.id is None:
                member.id = new_member_id
            # Copy other attributes from new_member
            for attr in ['business_number', 'company_name', 'email', 'status', 'approval_status']:
                if hasattr(new_member, attr):
                    setattr(member, attr, getattr(new_member, attr))
        
        mock_db_session.refresh = AsyncMock(side_effect=mock_refresh)
        
        # Mock Nice D&B client (patch the import path)
        with patch('src.common.modules.integrations.nice_dnb.nice_dnb_client') as mock_nice_dnb:
            mock_nice_dnb.verify_company = AsyncMock(return_value=True)
            
            # Mock email service
            with patch('src.common.modules.email.email_service') as mock_email_service:
                mock_email_service.send_registration_confirmation_email = AsyncMock()
                
                # Create request object with required fields
                request_data = sample_member_data.copy()
                request_data['terms_agreed'] = True  # Add required field
                request = MemberRegisterRequest(**request_data)
                
                # Execute the registration
                result = await auth_service.register_member(request, mock_db_session)
                
                # Assertions
                assert result is not None
                assert result.business_number == sample_member_data["business_number"]
                assert result.email == sample_member_data["email"]
                assert result.status == "pending"
                assert result.approval_status == "pending"
                assert mock_db_session.add.call_count >= 2  # Member and Profile
                mock_db_session.commit.assert_called_once()
                mock_db_session.flush.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_member_duplicate_business_number(
        self, auth_service, mock_db_session, sample_member_data
    ):
        """Test member registration with duplicate business number."""
        # Mock database query to return existing member
        from src.common.modules.db.models import Member
        existing_member = Member(
            id="existing-id",
            business_number=sample_member_data["business_number"],
            company_name="Existing Company",
            email="existing@example.com",
            password_hash="hash",
        )
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_member
        mock_db_session.execute = AsyncMock(return_value=mock_result)
        
        # Add required field
        request_data = sample_member_data.copy()
        request_data['terms_agreed'] = True
        request = MemberRegisterRequest(**request_data)
        
        with pytest.raises(ValidationError) as exc_info:
            await auth_service.register_member(request, mock_db_session)
        
        assert "Business number already registered" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_register_member_duplicate_email(
        self, auth_service, mock_db_session, sample_member_data
    ):
        """Test member registration with duplicate email."""
        # First query (business number) returns None
        # Second query (email) returns existing member
        from src.common.modules.db.models import Member
        existing_member = Member(
            id="existing-id",
            business_number="999-99-99999",
            company_name="Existing Company",
            email=sample_member_data["email"],
            password_hash="hash",
        )
        
        # Create separate mock results for each query
        mock_result_business = MagicMock()
        mock_result_business.scalar_one_or_none.return_value = None
        
        mock_result_email = MagicMock()
        mock_result_email.scalar_one_or_none.return_value = existing_member
        
        # First call returns None (business number check), second call returns existing member (email check)
        mock_db_session.execute = AsyncMock(side_effect=[mock_result_business, mock_result_email])
        
        # Add required field
        request_data = sample_member_data.copy()
        request_data['terms_agreed'] = True
        request = MemberRegisterRequest(**request_data)
        
        with pytest.raises(ValidationError) as exc_info:
            await auth_service.register_member(request, mock_db_session)
        
        assert "Email already registered" in str(exc_info.value)

