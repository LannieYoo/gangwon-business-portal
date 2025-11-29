"""
Pytest configuration and shared fixtures.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from typing import AsyncGenerator
from datetime import datetime, timedelta

# Import models and services
from src.common.modules.db.models import Member, MemberProfile
from src.modules.user.service import AuthService


@pytest.fixture
def mock_db_session():
    """Mock database session."""
    from unittest.mock import MagicMock
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    session.add = MagicMock()  # add is synchronous
    return session


@pytest.fixture
def sample_member_data():
    """Sample member registration data."""
    return {
        "business_number": "123-45-67890",
        "company_name": "Test Company",
        "email": "test@example.com",
        "password": "TestPassword123!",
        "representative_name": "Test Representative",
        "phone": "010-1234-5678",
        "address": "Test Address",
        "industry": "IT",
        "employee_count": 10,
    }


@pytest.fixture
def sample_member():
    """Sample member object."""
    member = Member(
        id="test-member-id",
        business_number="123-45-67890",
        company_name="Test Company",
        email="test@example.com",
        password_hash="$2b$12$test_hash",
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    return member


@pytest.fixture
def sample_member_profile(sample_member):
    """Sample member profile object."""
    profile = MemberProfile(
        id="test-profile-id",
        member_id=sample_member.id,
        address="Test Address",
        industry="IT",
        employee_count=10,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    return profile


@pytest.fixture
def auth_service():
    """AuthService instance."""
    return AuthService()


@pytest.fixture
def mock_settings(monkeypatch):
    """Mock application settings."""
    settings = {
        "SECRET_KEY": "test-secret-key-for-testing-only",
        "ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": 30,
    }
    for key, value in settings.items():
        monkeypatch.setenv(key, str(value))
    return settings


@pytest.fixture
def sample_token_payload():
    """Sample JWT token payload."""
    return {
        "sub": "test-member-id",
        "email": "test@example.com",
        "role": "member",
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }


@pytest.fixture
def business_number():
    """Placeholder fixture for real Nice D&B integration tests."""
    pytest.skip(
        "Real Nice D&B API test requires verified business number and credentials; "
        "skipping until integration environment is ready."
    )


