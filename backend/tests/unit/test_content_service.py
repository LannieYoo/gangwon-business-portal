"""
Unit tests for ContentService.

Tests content management service methods in isolation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from uuid import uuid4
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.modules.content.service import ContentService
from src.common.modules.exception import NotFoundError, ValidationError


@pytest.mark.unit
class TestContentService:
    """Test suite for ContentService."""

    @pytest.fixture
    def sample_notice(self):
        """Sample notice."""
        from src.common.modules.db.models import Notice
        notice = Notice(
            id=uuid4(),
            title="Test Notice",
            content_html="<p>Test Content</p>",
            board_type="notice",
            author_id=uuid4(),
            view_count=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        return notice

    @pytest.fixture
    def sample_press_release(self):
        """Sample press release."""
        from src.common.modules.db.models import PressRelease
        press = PressRelease(
            id=uuid4(),
            title="Test Press Release",
            image_url="https://example.com/image.jpg",
            author_id=uuid4(),
            created_at=datetime.utcnow(),
        )
        return press

    @pytest.fixture
    def sample_banner(self):
        """Sample banner."""
        from src.common.modules.db.models import Banner
        banner = Banner(
            id=uuid4(),
            banner_type="MAIN",
            image_url="https://example.com/banner.jpg",
            link_url="https://example.com",
            is_active="true",
            display_order=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        return banner

    @pytest.mark.asyncio
    async def test_get_notices_success(self, mock_db_session, sample_notice):
        """Test successful notice listing."""
        service = ContentService()
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_notice]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        notices, total = await service.get_notices(
            page=1, page_size=20, db=mock_db_session
        )
        
        assert len(notices) == 1
        assert total == 1
        assert notices[0].id == sample_notice.id

    @pytest.mark.asyncio
    async def test_get_notice_latest5(self, mock_db_session, sample_notice):
        """Test getting latest 5 notices."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalars.return_value.all.return_value = [sample_notice] * 5
        mock_db_session.execute.return_value = result
        
        notices = await service.get_notice_latest5(mock_db_session)
        
        assert len(notices) == 5

    @pytest.mark.asyncio
    async def test_get_notice_by_id_success(self, mock_db_session, sample_notice):
        """Test successful notice retrieval."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_notice
        mock_db_session.execute.return_value = result
        
        notice = await service.get_notice_by_id(sample_notice.id, mock_db_session)
        
        assert notice.id == sample_notice.id
        assert notice.view_count == 1  # Should be incremented
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_notice_by_id_not_found(self, mock_db_session):
        """Test notice retrieval when not found."""
        service = ContentService()
        notice_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.get_notice_by_id(notice_id, mock_db_session)
        
        assert "Notice" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_create_notice_success(self, mock_db_session):
        """Test successful notice creation."""
        service = ContentService()
        author_id = uuid4()
        
        from src.modules.content.schemas import NoticeCreate
        data = NoticeCreate(
            title="New Notice",
            content_html="<p>New Content</p>",
            board_type="notice",
        )
        
        created = await service.create_notice(data, author_id, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert created is not None

    @pytest.mark.asyncio
    async def test_update_notice_success(self, mock_db_session, sample_notice):
        """Test successful notice update."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_notice
        mock_db_session.execute.return_value = result
        
        from src.modules.content.schemas import NoticeUpdate
        update_data = NoticeUpdate(title="Updated Title")
        
        updated = await service.update_notice(
            sample_notice.id, update_data, mock_db_session
        )
        
        assert updated.title == "Updated Title"
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_notice_success(self, mock_db_session, sample_notice):
        """Test successful notice deletion."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_notice
        mock_db_session.execute.return_value = result
        
        await service.delete_notice(sample_notice.id, mock_db_session)
        
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_press_releases_success(
        self, mock_db_session, sample_press_release
    ):
        """Test successful press release listing."""
        service = ContentService()
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_press_release]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        press_releases, total = await service.get_press_releases(
            page=1, page_size=20, db=mock_db_session
        )
        
        assert len(press_releases) == 1
        assert total == 1

    @pytest.mark.asyncio
    async def test_get_press_latest1(self, mock_db_session, sample_press_release):
        """Test getting latest press release."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_press_release
        mock_db_session.execute.return_value = result
        
        press = await service.get_press_latest1(mock_db_session)
        
        assert press.id == sample_press_release.id

    @pytest.mark.asyncio
    async def test_get_press_by_id_not_found(self, mock_db_session):
        """Test press release retrieval when not found."""
        service = ContentService()
        press_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.get_press_by_id(press_id, mock_db_session)
        
        assert "Press release" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_create_press_release_success(self, mock_db_session):
        """Test successful press release creation."""
        service = ContentService()
        author_id = uuid4()
        
        from src.modules.content.schemas import PressReleaseCreate
        data = PressReleaseCreate(
            title="New Press Release",
            image_url="https://example.com/new-image.jpg",
        )
        
        created = await service.create_press_release(data, author_id, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert created is not None

    @pytest.mark.asyncio
    async def test_get_banners_success(self, mock_db_session, sample_banner):
        """Test successful banner listing."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalars.return_value.all.return_value = [sample_banner]
        mock_db_session.execute.return_value = result
        
        banners = await service.get_banners(banner_type="MAIN", db=mock_db_session)
        
        assert len(banners) == 1
        assert banners[0].banner_type == "MAIN"

    @pytest.mark.asyncio
    async def test_create_banner_success(self, mock_db_session):
        """Test successful banner creation."""
        service = ContentService()
        
        from src.modules.content.schemas import BannerCreate
        data = BannerCreate(
            banner_type="MAIN",
            image_url="https://example.com/banner.jpg",
            link_url="https://example.com",
            is_active=True,
            display_order=1,
        )
        
        created = await service.create_banner(data, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert created is not None

    @pytest.mark.asyncio
    async def test_create_banner_invalid_type(self, mock_db_session):
        """Test banner creation with invalid type."""
        service = ContentService()
        
        from src.modules.content.schemas import BannerCreate
        data = BannerCreate(
            banner_type="INVALID",
            image_url="https://example.com/banner.jpg",
            is_active=True,
        )
        
        with pytest.raises(ValidationError) as exc_info:
            await service.create_banner(data, mock_db_session)
        
        assert "Invalid banner_type" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_update_banner_success(self, mock_db_session, sample_banner):
        """Test successful banner update."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_banner
        mock_db_session.execute.return_value = result
        
        from src.modules.content.schemas import BannerUpdate
        update_data = BannerUpdate(is_active=False)
        
        updated = await service.update_banner(
            sample_banner.id, update_data, mock_db_session
        )
        
        assert updated.is_active == "false"
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_banner_success(self, mock_db_session, sample_banner):
        """Test successful banner deletion."""
        service = ContentService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_banner
        mock_db_session.execute.return_value = result
        
        await service.delete_banner(sample_banner.id, mock_db_session)
        
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_system_info(self, mock_db_session):
        """Test getting system info."""
        service = ContentService()
        
        from src.common.modules.db.models import SystemInfo
        system_info = SystemInfo(
            id=uuid4(),
            content_html="<p>System Info</p>",
            updated_by=uuid4(),
            updated_at=datetime.utcnow(),
        )
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = system_info
        mock_db_session.execute.return_value = result
        
        info = await service.get_system_info(mock_db_session)
        
        assert info is not None
        assert info.content_html == "<p>System Info</p>"

    @pytest.mark.asyncio
    async def test_update_system_info_existing(self, mock_db_session):
        """Test updating existing system info."""
        service = ContentService()
        updated_by = uuid4()
        
        from src.common.modules.db.models import SystemInfo
        existing_info = SystemInfo(
            id=uuid4(),
            content_html="<p>Old Info</p>",
            updated_by=uuid4(),
            updated_at=datetime.utcnow(),
        )
        
        # Mock get_system_info
        result = MagicMock()
        result.scalar_one_or_none.return_value = existing_info
        mock_db_session.execute.return_value = result
        
        from src.modules.content.schemas import SystemInfoUpdate
        update_data = SystemInfoUpdate(content_html="<p>New Info</p>")
        
        updated = await service.update_system_info(
            update_data, updated_by, mock_db_session
        )
        
        assert updated.content_html == "<p>New Info</p>"
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_system_info_create_new(self, mock_db_session):
        """Test creating new system info when none exists."""
        service = ContentService()
        updated_by = uuid4()
        
        # Mock get_system_info (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        from src.modules.content.schemas import SystemInfoUpdate
        update_data = SystemInfoUpdate(content_html="<p>New Info</p>")
        
        created = await service.update_system_info(
            update_data, updated_by, mock_db_session
        )
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert created is not None

