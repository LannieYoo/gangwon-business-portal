"""
Unit tests for member router.

Tests API endpoints for member management using FastAPI TestClient
with dependency overrides for mocking.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from datetime import datetime

from src.modules.member.router import router
from src.common.modules.db.models import Member, MemberProfile
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


@pytest.fixture
def sample_profile():
    """Sample member profile for testing."""
    profile = MemberProfile(
        id=uuid4(),
        member_id=uuid4(),
        industry="IT",
        revenue=1000000,
        employee_count=50,
        region="강원도",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    return profile


@pytest.mark.unit
class TestMemberRouter:
    """Test member router endpoints."""

    @pytest.mark.asyncio
    @patch("src.modules.member.router.member_service")
    async def test_get_my_profile_success(
        self, mock_service, app, client, sample_member, sample_profile, mock_db_session
    ):
        """Test successful profile retrieval."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.get_member_profile = AsyncMock(return_value=(sample_member, sample_profile))
        
        # Make request
        response = client.get("/api/member/profile")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["business_number"] == sample_member.business_number
        assert data["email"] == sample_member.email
        assert data["industry"] == sample_profile.industry
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.audit_log_service")
    @patch("src.modules.member.router.get_client_info")
    @patch("src.modules.member.router.member_service")
    async def test_update_my_profile_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        sample_profile,
        mock_db_session,
    ):
        """Test successful profile update."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_current_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user
        
        # Setup mocks
        mock_service.update_member_profile = AsyncMock(return_value=(sample_member, sample_profile))
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.put(
            "/api/member/profile",
            json={
                "industry": "Manufacturing",
                "revenue": 2000000,
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["business_number"] == sample_member.business_number
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.member_service")
    async def test_update_my_profile_validation_error(
        self,
        mock_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test profile update validation failure returns HTTP 400."""
        async def override_get_db():
            yield mock_db_session

        async def override_get_current_user():
            return sample_member

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_active_user] = override_get_current_user

        mock_service.update_member_profile = AsyncMock(
            side_effect=ValidationError("Invalid data")
        )

        response = client.put(
            "/api/member/profile",
            json={"industry": "Manufacturing"},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["detail"] == "Invalid data"

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.member_service")
    async def test_list_members_success(
        self, mock_service, app, client, sample_member, mock_db_session
    ):
        """Test successful member list retrieval (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.list_members = AsyncMock(return_value=([sample_member], 1))
        
        # Make request
        response = client.get("/api/admin/members?page=1&page_size=20")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) == 1
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.member_service")
    async def test_get_member_success(
        self, mock_service, app, client, sample_member, sample_profile, mock_db_session
    ):
        """Test successful member retrieval by ID (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.get_member_profile = AsyncMock(return_value=(sample_member, sample_profile))
        
        # Make request
        response = client.get(f"/api/admin/members/{sample_member.id}")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(sample_member.id)
        assert data["business_number"] == sample_member.business_number
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.member_service")
    async def test_get_member_not_found(
        self, mock_service, app, client, sample_member, mock_db_session
    ):
        """Test member retrieval with invalid ID."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        mock_service.get_member_profile = AsyncMock(side_effect=NotFoundError("Member"))
        
        # Make request
        response = client.get(f"/api/admin/members/{uuid4()}")
        
        # Assertions
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.audit_log_service")
    @patch("src.modules.member.router.get_client_info")
    @patch("src.modules.member.router.member_service")
    async def test_approve_member_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test successful member approval (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        approved_member = Member(
            id=sample_member.id,
            business_number=sample_member.business_number,
            company_name=sample_member.company_name,
            email=sample_member.email,
            approval_status="approved",
            status="active",
        )
        mock_service.approve_member = AsyncMock(return_value=approved_member)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.put(f"/api/admin/members/{sample_member.id}/approve")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "member_id" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.audit_log_service")
    @patch("src.modules.member.router.get_client_info")
    @patch("src.modules.member.router.member_service")
    async def test_reject_member_success(
        self,
        mock_service,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test successful member rejection (admin)."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        async def override_get_admin_user():
            return sample_member
        
        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user
        
        # Setup mocks
        rejected_member = Member(
            id=sample_member.id,
            business_number=sample_member.business_number,
            company_name=sample_member.company_name,
            email=sample_member.email,
            approval_status="rejected",
            status="inactive",
        )
        mock_service.reject_member = AsyncMock(return_value=rejected_member)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.put(f"/api/admin/members/{sample_member.id}/reject?reason=Invalid")
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "member_id" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.audit_log_service")
    @patch("src.modules.member.router.get_client_info")
    @patch("src.modules.member.router.nice_dnb_client")
    async def test_verify_company_success(
        self,
        mock_nice_dnb,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        mock_db_session,
    ):
        """Test successful company verification."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_response = MagicMock()
        mock_response.success = True
        mock_response.data = MagicMock()
        mock_response.data.company_name = "Test Company"
        mock_response.data.representative = "홍길동"
        mock_response.data.address = "강원도 춘천시"
        mock_response.data.industry = "IT"
        mock_response.data.established_date = datetime(2020, 1, 1)
        mock_response.data.credit_grade = "A+"
        mock_response.data.risk_level = "low"
        
        mock_nice_dnb.verify_company = AsyncMock(return_value=True)
        mock_nice_dnb.search_company = AsyncMock(return_value=mock_response)
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()
        
        # Make request
        response = client.post(
            "/api/members/verify-company",
            json={
                "business_number": "123-45-67890",
                "company_name": "Test Company",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["verified"] is True
        assert "data" in data
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.nice_dnb_client")
    async def test_verify_company_failure(
        self, mock_nice_dnb, app, client, mock_db_session
    ):
        """Test company verification failure."""
        # Override dependencies
        async def override_get_db():
            yield mock_db_session
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Setup mocks
        mock_nice_dnb.verify_company = AsyncMock(return_value=False)
        mock_nice_dnb.search_company = AsyncMock(return_value=None)
        
        # Make request
        response = client.post(
            "/api/members/verify-company",
            json={
                "business_number": "123-45-67890",
                "company_name": "Invalid Company",
            },
        )
        
        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["verified"] is False
        
        # Cleanup
        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.audit_log_service")
    @patch("src.modules.member.router.get_client_info")
    @patch("src.modules.member.router.nice_dnb_client")
    async def test_verify_company_without_name_success(
        self,
        mock_nice_dnb,
        mock_get_client_info,
        mock_audit_service,
        app,
        client,
        mock_db_session,
    ):
        """Test company verification when only business number is provided."""
        async def override_get_db():
            yield mock_db_session

        app.dependency_overrides[get_db] = override_get_db

        mock_response = MagicMock()
        mock_response.success = True
        mock_response.data = MagicMock()
        mock_response.data.company_name = "Number Only Corp"
        mock_response.data.representative = "홍길동"
        mock_response.data.address = "강원도 원주시"
        mock_response.data.industry = "제조업"
        mock_response.data.established_date = datetime(2019, 5, 20)
        mock_response.data.credit_grade = "A"
        mock_response.data.risk_level = "low"
        mock_response.data.business_number = "1234567890"
        mock_response.data.summary = "Summary"

        mock_nice_dnb.search_company = AsyncMock(side_effect=[mock_response, mock_response])
        mock_get_client_info.return_value = ("127.0.0.1", "Mozilla/5.0")
        mock_audit_service.create_audit_log = AsyncMock()

        response = client.post(
            "/api/members/verify-company",
            json={"business_number": "123-45-67890"},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["verified"] is True
        assert data["company_name"] == "Number Only Corp"

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.nice_dnb_client")
    async def test_verify_company_service_exception(
        self,
        mock_nice_dnb,
        app,
        client,
        mock_db_session,
    ):
        """Test verification returns graceful fallback when API fails."""
        async def override_get_db():
            yield mock_db_session

        app.dependency_overrides[get_db] = override_get_db

        mock_nice_dnb.verify_company = AsyncMock(side_effect=Exception("Service down"))

        response = client.post(
            "/api/members/verify-company",
            json={
                "business_number": "123-45-67890",
                "company_name": "Test Company",
            },
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["verified"] is False
        assert "temporarily unavailable" in data["message"]

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.member_service")
    @patch("src.common.modules.export.ExportService")
    @patch("src.modules.member.router.audit_log_service")
    async def test_export_members_excel(
        self,
        mock_audit_service,
        mock_export_service,
        mock_member_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test Excel export response."""
        async def override_get_db():
            yield mock_db_session

        async def override_get_admin_user():
            return sample_member

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user

        mock_member_service.export_members_data = AsyncMock(return_value=[{"id": 1}])
        mock_export_service.export_to_excel.return_value = b"excel-bytes"
        mock_audit_service.create_audit_log = AsyncMock()

        response = client.get("/api/admin/members/export?format=excel")

        assert response.status_code == status.HTTP_200_OK
        assert response.headers["Content-Type"] == (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        assert response.headers["Content-Disposition"].endswith(".xlsx\"")

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.member_service")
    @patch("src.common.modules.export.ExportService")
    @patch("src.modules.member.router.audit_log_service")
    async def test_export_members_csv(
        self,
        mock_audit_service,
        mock_export_service,
        mock_member_service,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test CSV export response."""
        async def override_get_db():
            yield mock_db_session

        async def override_get_admin_user():
            return sample_member

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user

        mock_member_service.export_members_data = AsyncMock(return_value=[{"id": 1}])
        mock_export_service.export_to_csv.return_value = "csv,data"
        mock_audit_service.create_audit_log = AsyncMock()

        response = client.get("/api/admin/members/export?format=csv")

        assert response.status_code == status.HTTP_200_OK
        assert response.headers["Content-Type"].startswith("text/csv")
        assert response.headers["Content-Disposition"].endswith(".csv\"")

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.nice_dnb_client")
    async def test_search_nice_dnb_success(
        self,
        mock_nice_dnb,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test admin Nice D&B search success path."""
        async def override_get_db():
            yield mock_db_session

        async def override_get_admin_user():
            return sample_member

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user

        mock_response = MagicMock()
        mock_response.success = True
        mock_response.data = MagicMock()
        mock_response.data.business_number = "1234567890"
        mock_response.data.company_name = "Test Company"
        mock_response.data.representative = "홍길동"
        mock_response.data.address = "강원도"
        mock_response.data.industry = "제조"
        mock_response.data.established_date = datetime(2021, 6, 1)
        mock_response.data.credit_grade = "A"
        mock_response.data.risk_level = "low"
        mock_response.data.summary = "Summary"
        mock_response.financials = [
            MagicMock(year=2024, revenue=1000, profit=100, employees=10)
        ]
        mock_response.insights = [MagicMock(label="label", value="value", trend="up")]

        mock_nice_dnb.search_company = AsyncMock(return_value=mock_response)

        response = client.get(
            "/api/admin/members/nice-dnb?business_number=1234567890"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["data"]["companyName"] == "Test Company"
        assert len(data["financials"]) == 1

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.nice_dnb_client")
    async def test_search_nice_dnb_service_unavailable(
        self,
        mock_nice_dnb,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test Nice D&B search returns 503 when service unavailable."""
        async def override_get_db():
            yield mock_db_session

        async def override_get_admin_user():
            return sample_member

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user

        mock_nice_dnb.search_company = AsyncMock(return_value=None)

        response = client.get(
            "/api/admin/members/nice-dnb?business_number=1234567890"
        )

        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    @patch("src.modules.member.router.nice_dnb_client")
    async def test_search_nice_dnb_unexpected_error(
        self,
        mock_nice_dnb,
        app,
        client,
        sample_member,
        mock_db_session,
    ):
        """Test Nice D&B search handles unexpected exceptions."""
        async def override_get_db():
            yield mock_db_session

        async def override_get_admin_user():
            return sample_member

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_admin_user] = override_get_admin_user

        mock_nice_dnb.search_company = AsyncMock(side_effect=Exception("Boom"))

        response = client.get(
            "/api/admin/members/nice-dnb?business_number=1234567890"
        )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

        app.dependency_overrides.clear()

