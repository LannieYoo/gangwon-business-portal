"""
Unit tests for SupportService.

Tests support management service methods in isolation.
"""
import pytest
from unittest.mock import MagicMock
from datetime import datetime
from uuid import uuid4
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.modules.support.service import SupportService
from src.common.modules.exception import NotFoundError, ForbiddenError


@pytest.mark.unit
class TestSupportService:
    """Test suite for SupportService."""

    @pytest.fixture
    def sample_faq(self):
        """Sample FAQ."""
        from src.common.modules.db.models import FAQ
        faq = FAQ(
            id=uuid4(),
            category="general",
            question="What is this?",
            answer="This is a test FAQ",
            display_order=1,
            created_at=datetime.utcnow(),
        )
        return faq

    @pytest.fixture
    def sample_inquiry(self):
        """Sample inquiry."""
        from src.common.modules.db.models import Inquiry
        inquiry = Inquiry(
            id=uuid4(),
            member_id=uuid4(),
            subject="Test Inquiry",
            content="Test content",
            status="pending",
            created_at=datetime.utcnow(),
        )
        return inquiry

    @pytest.mark.asyncio
    async def test_get_faqs_success(self, mock_db_session, sample_faq):
        """Test successful FAQ listing."""
        service = SupportService()
        
        # Mock query
        result = MagicMock()
        result.scalars.return_value.all.return_value = [sample_faq]
        mock_db_session.execute.return_value = result
        
        faqs = await service.get_faqs(category="general", db=mock_db_session)
        
        assert len(faqs) == 1
        assert faqs[0].category == "general"

    @pytest.mark.asyncio
    async def test_create_faq_success(self, mock_db_session):
        """Test successful FAQ creation."""
        service = SupportService()
        
        from src.modules.support.schemas import FAQCreate
        data = FAQCreate(
            category="general",
            question="New Question?",
            answer="New Answer",
            display_order=1,
        )
        
        created = await service.create_faq(data, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert created is not None

    @pytest.mark.asyncio
    async def test_update_faq_success(self, mock_db_session, sample_faq):
        """Test successful FAQ update."""
        service = SupportService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_faq
        mock_db_session.execute.return_value = result
        
        from src.modules.support.schemas import FAQUpdate
        update_data = FAQUpdate(answer="Updated Answer")
        
        updated = await service.update_faq(
            sample_faq.id, update_data, mock_db_session
        )
        
        assert updated.answer == "Updated Answer"
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_faq_not_found(self, mock_db_session):
        """Test FAQ update when not found."""
        service = SupportService()
        faq_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        from src.modules.support.schemas import FAQUpdate
        update_data = FAQUpdate(answer="Updated Answer")
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.update_faq(faq_id, update_data, mock_db_session)
        
        assert "FAQ" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_delete_faq_success(self, mock_db_session, sample_faq):
        """Test successful FAQ deletion."""
        service = SupportService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_faq
        mock_db_session.execute.return_value = result
        
        await service.delete_faq(sample_faq.id, mock_db_session)
        
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_inquiry_success(self, mock_db_session):
        """Test successful inquiry creation."""
        service = SupportService()
        member_id = uuid4()
        
        from src.modules.support.schemas import InquiryCreate
        data = InquiryCreate(
            subject="New Inquiry",
            content="New inquiry content",
        )
        
        created = await service.create_inquiry(data, member_id, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert created.status == "pending"

    @pytest.mark.asyncio
    async def test_get_member_inquiries_success(
        self, mock_db_session, sample_inquiry
    ):
        """Test successful retrieval of member's inquiries."""
        service = SupportService()
        member_id = sample_inquiry.member_id
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_inquiry]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        inquiries, total = await service.get_member_inquiries(
            member_id, page=1, page_size=20, db=mock_db_session
        )
        
        assert len(inquiries) == 1
        assert total == 1
        assert inquiries[0].member_id == member_id

    @pytest.mark.asyncio
    async def test_get_inquiry_by_id_success(
        self, mock_db_session, sample_inquiry
    ):
        """Test successful inquiry retrieval."""
        service = SupportService()
        member_id = sample_inquiry.member_id
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_inquiry
        mock_db_session.execute.return_value = result
        
        inquiry = await service.get_inquiry_by_id(
            sample_inquiry.id, member_id, mock_db_session
        )
        
        assert inquiry.id == sample_inquiry.id
        assert inquiry.member_id == member_id

    @pytest.mark.asyncio
    async def test_get_inquiry_by_id_not_found(self, mock_db_session):
        """Test inquiry retrieval when not found."""
        service = SupportService()
        inquiry_id = uuid4()
        member_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.get_inquiry_by_id(inquiry_id, member_id, mock_db_session)
        
        assert "Inquiry" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_get_inquiry_by_id_forbidden(
        self, mock_db_session, sample_inquiry
    ):
        """Test inquiry retrieval when member doesn't own it."""
        service = SupportService()
        other_member_id = uuid4()  # Different member
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_inquiry
        mock_db_session.execute.return_value = result
        
        with pytest.raises(ForbiddenError) as exc_info:
            await service.get_inquiry_by_id(
                sample_inquiry.id, other_member_id, mock_db_session
            )
        
        assert "own inquiries" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_get_inquiry_by_id_admin_access(
        self, mock_db_session, sample_inquiry
    ):
        """Test inquiry retrieval with admin access (no member_id)."""
        service = SupportService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_inquiry
        mock_db_session.execute.return_value = result
        
        # Admin access (member_id=None)
        inquiry = await service.get_inquiry_by_id(
            sample_inquiry.id, None, mock_db_session
        )
        
        assert inquiry.id == sample_inquiry.id

    @pytest.mark.asyncio
    async def test_get_all_inquiries_admin_success(
        self, mock_db_session, sample_inquiry
    ):
        """Test successful admin inquiry listing."""
        service = SupportService()
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_inquiry]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        inquiries, total = await service.get_all_inquiries_admin(
            page=1, page_size=20, db=mock_db_session
        )
        
        assert len(inquiries) == 1
        assert total == 1

    @pytest.mark.asyncio
    async def test_reply_to_inquiry_success(
        self, mock_db_session, sample_inquiry
    ):
        """Test successful inquiry reply."""
        service = SupportService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_inquiry
        mock_db_session.execute.return_value = result
        
        from src.modules.support.schemas import InquiryReplyRequest
        reply_data = InquiryReplyRequest(admin_reply="This is a reply")
        
        replied = await service.reply_to_inquiry(
            sample_inquiry.id, reply_data, mock_db_session
        )
        
        assert replied.status == "replied"
        assert replied.admin_reply == "This is a reply"
        assert replied.replied_at is not None
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_reply_to_inquiry_not_found(self, mock_db_session):
        """Test inquiry reply when not found."""
        service = SupportService()
        inquiry_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        from src.modules.support.schemas import InquiryReplyRequest
        reply_data = InquiryReplyRequest(admin_reply="This is a reply")
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.reply_to_inquiry(inquiry_id, reply_data, mock_db_session)
        
        assert "Inquiry" in str(exc_info.value)

