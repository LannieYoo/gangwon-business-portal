"""
Unit tests for MemberService.

Tests member management service methods in isolation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.modules.member.service import MemberService
from src.common.modules.exception import NotFoundError, ValidationError


@pytest.mark.unit
class TestMemberService:
    """Test suite for MemberService."""

    @pytest.mark.asyncio
    async def test_get_member_profile_success(
        self, mock_db_session, sample_member, sample_member_profile
    ):
        """Test successful retrieval of member profile."""
        service = MemberService()
        
        # Mock database query
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_member
        mock_db_session.execute.return_value = mock_result
        
        # Mock profile query
        profile_result = MagicMock()
        profile_result.scalar_one_or_none.return_value = sample_member_profile
        mock_db_session.execute.side_effect = [
            mock_result,  # First call for member
            profile_result  # Second call for profile
        ]
        
        member, profile = await service.get_member_profile(sample_member.id, mock_db_session)
        
        assert member is not None
        assert member.id == sample_member.id
        assert profile is not None
        assert profile.member_id == sample_member.id

    @pytest.mark.asyncio
    async def test_get_member_profile_not_found(self, mock_db_session):
        """Test member profile retrieval when member doesn't exist."""
        service = MemberService()
        
        # Mock database query to return None
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = mock_result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.get_member_profile("non-existent-id", mock_db_session)
        
        assert "Member not found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_update_member_profile_success(
        self, mock_db_session, sample_member, sample_member_profile
    ):
        """Test successful member profile update."""
        service = MemberService()
        
        # Mock member query
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = sample_member
        
        # Mock profile query
        profile_result = MagicMock()
        profile_result.scalar_one_or_none.return_value = sample_member_profile
        
        # Mock email uniqueness check (returns None - no duplicate)
        email_check_result = MagicMock()
        email_check_result.scalar_one_or_none.return_value = None
        
        mock_db_session.execute.side_effect = [
            member_result,  # get_member_profile - member query
            profile_result,  # get_member_profile - profile query
            email_check_result,  # email uniqueness check
        ]
        
        from src.modules.member.schemas import MemberProfileUpdate
        update_data = MemberProfileUpdate(
            company_name="Updated Company",
            industry="Manufacturing",
        )
        
        member, profile = await service.update_member_profile(
            sample_member.id, update_data, mock_db_session
        )
        
        assert member is not None
        assert profile is not None
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_member_profile_email_duplicate(
        self, mock_db_session, sample_member, sample_member_profile
    ):
        """Test member profile update with duplicate email."""
        service = MemberService()
        
        # Mock member query
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = sample_member
        
        # Mock profile query
        profile_result = MagicMock()
        profile_result.scalar_one_or_none.return_value = sample_member_profile
        
        # Mock email uniqueness check (returns existing member - duplicate)
        duplicate_member = MagicMock()
        duplicate_member.id = "other-member-id"
        email_check_result = MagicMock()
        email_check_result.scalar_one_or_none.return_value = duplicate_member
        
        mock_db_session.execute.side_effect = [
            member_result,  # get_member_profile - member query
            profile_result,  # get_member_profile - profile query
            email_check_result,  # email uniqueness check
        ]
        
        from src.modules.member.schemas import MemberProfileUpdate
        update_data = MemberProfileUpdate(email="duplicate@example.com")
        
        with pytest.raises(ValidationError) as exc_info:
            await service.update_member_profile(
                sample_member.id, update_data, mock_db_session
            )
        
        assert "Email already in use" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_update_member_profile_create_new_profile(
        self, mock_db_session, sample_member
    ):
        """Test member profile update when profile doesn't exist."""
        service = MemberService()
        
        # Mock member query
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = sample_member
        
        # Mock profile query (returns None - no profile exists)
        profile_result = MagicMock()
        profile_result.scalar_one_or_none.return_value = None
        
        mock_db_session.execute.side_effect = [member_result, profile_result]
        
        from src.modules.member.schemas import MemberProfileUpdate
        update_data = MemberProfileUpdate(industry="IT")
        
        member, profile = await service.update_member_profile(
            sample_member.id, update_data, mock_db_session
        )
        
        assert member is not None
        # Profile should be created
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_members_success(self, mock_db_session):
        """Test successful member listing."""
        service = MemberService()
        
        # Mock members
        member1 = MagicMock()
        member1.id = "member-1"
        member2 = MagicMock()
        member2.id = "member-2"
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 2
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [member1, member2]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        from src.modules.member.schemas import MemberListQuery
        query = MemberListQuery(page=1, page_size=20)
        
        members, total = await service.list_members(query, mock_db_session)
        
        assert len(members) == 2
        assert total == 2

    @pytest.mark.asyncio
    async def test_approve_member_success(self, mock_db_session, sample_member):
        """Test successful member approval."""
        service = MemberService()
        
        # Mock member query
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = sample_member
        
        mock_db_session.execute.return_value = member_result
        
        # Mock email service
        with patch('src.common.modules.email.service.email_service') as mock_email:
            mock_email.send_approval_notification_email = AsyncMock()
            
            result = await service.approve_member(sample_member.id, mock_db_session)
            
            assert result.approval_status == "approved"
            assert result.status == "active"
            mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_approve_member_not_found(self, mock_db_session):
        """Test member approval when member doesn't exist."""
        service = MemberService()
        
        # Mock member query (returns None)
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = None
        
        mock_db_session.execute.return_value = member_result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.approve_member("non-existent-id", mock_db_session)
        
        assert "Member" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_reject_member_success(self, mock_db_session, sample_member):
        """Test successful member rejection."""
        service = MemberService()
        
        # Mock member query
        member_result = MagicMock()
        member_result.scalar_one_or_none.return_value = sample_member
        
        mock_db_session.execute.return_value = member_result
        
        # Mock email service
        with patch('src.common.modules.email.service.email_service') as mock_email:
            mock_email.send_approval_notification_email = AsyncMock()
            
            result = await service.reject_member(
                sample_member.id, "Invalid business number", mock_db_session
            )
            
            assert result.approval_status == "rejected"
            assert result.status == "suspended"
            mock_db_session.commit.assert_called_once()

