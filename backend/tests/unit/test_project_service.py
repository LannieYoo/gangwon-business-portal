"""
Unit tests for ProjectService.

Tests project management service methods in isolation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, date
from uuid import uuid4
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.modules.project.service import ProjectService
from src.common.modules.exception import NotFoundError, ValidationError


@pytest.mark.unit
class TestProjectService:
    """Test suite for ProjectService."""

    @pytest.fixture
    def sample_project(self):
        """Sample project."""
        from src.common.modules.db.models import Project
        project = Project(
            id=uuid4(),
            title="Test Project",
            description="Test Description",
            target_audience="SMEs",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 31),
            status="active",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        return project

    @pytest.fixture
    def sample_application(self, sample_project):
        """Sample project application."""
        from src.common.modules.db.models import ProjectApplication
        application = ProjectApplication(
            id=uuid4(),
            member_id=uuid4(),
            project_id=sample_project.id,
            application_reason="I want to participate",
            status="submitted",
            submitted_at=datetime.utcnow(),
        )
        return application

    @pytest.mark.asyncio
    async def test_list_projects_success(self, mock_db_session, sample_project):
        """Test successful project listing."""
        service = ProjectService()
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_project]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        from src.modules.project.schemas import ProjectListQuery
        query = ProjectListQuery(page=1, page_size=20)
        
        projects, total = await service.list_projects(query, mock_db_session)
        
        assert len(projects) == 1
        assert total == 1
        assert projects[0].id == sample_project.id

    @pytest.mark.asyncio
    async def test_get_project_by_id_success(self, mock_db_session, sample_project):
        """Test successful project retrieval."""
        service = ProjectService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_project
        mock_db_session.execute.return_value = result
        
        project = await service.get_project_by_id(sample_project.id, mock_db_session)
        
        assert project.id == sample_project.id
        assert project.title == sample_project.title

    @pytest.mark.asyncio
    async def test_get_project_by_id_not_found(self, mock_db_session):
        """Test project retrieval when not found."""
        service = ProjectService()
        project_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.get_project_by_id(project_id, mock_db_session)
        
        assert "Project" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_apply_to_project_success(
        self, mock_db_session, sample_project
    ):
        """Test successful project application."""
        service = ProjectService()
        member_id = uuid4()
        sample_project.status = "active"
        
        # Mock get_project_by_id
        project_result = MagicMock()
        project_result.scalar_one_or_none.return_value = sample_project
        
        # Mock duplicate check (returns None - no duplicate)
        duplicate_result = MagicMock()
        duplicate_result.scalar_one_or_none.return_value = None
        
        mock_db_session.execute.side_effect = [project_result, duplicate_result]
        
        from src.modules.project.schemas import ProjectApplicationCreate
        application_data = ProjectApplicationCreate(
            application_reason="I want to participate"
        )
        
        application = await service.apply_to_project(
            member_id, sample_project.id, application_data, mock_db_session
        )
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert application is not None

    @pytest.mark.asyncio
    async def test_apply_to_project_inactive(
        self, mock_db_session, sample_project
    ):
        """Test project application when project is inactive."""
        service = ProjectService()
        member_id = uuid4()
        sample_project.status = "inactive"
        
        # Mock get_project_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_project
        mock_db_session.execute.return_value = result
        
        from src.modules.project.schemas import ProjectApplicationCreate
        application_data = ProjectApplicationCreate(
            application_reason="I want to participate"
        )
        
        with pytest.raises(ValidationError) as exc_info:
            await service.apply_to_project(
                member_id, sample_project.id, application_data, mock_db_session
            )
        
        assert "Only active projects" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_apply_to_project_duplicate(
        self, mock_db_session, sample_project, sample_application
    ):
        """Test project application when duplicate application exists."""
        service = ProjectService()
        member_id = sample_application.member_id
        sample_project.status = "active"
        
        # Mock get_project_by_id
        project_result = MagicMock()
        project_result.scalar_one_or_none.return_value = sample_project
        
        # Mock duplicate check (returns existing application)
        duplicate_result = MagicMock()
        duplicate_result.scalar_one_or_none.return_value = sample_application
        
        mock_db_session.execute.side_effect = [project_result, duplicate_result]
        
        from src.modules.project.schemas import ProjectApplicationCreate
        application_data = ProjectApplicationCreate(
            application_reason="I want to participate again"
        )
        
        with pytest.raises(ValidationError) as exc_info:
            await service.apply_to_project(
                member_id, sample_project.id, application_data, mock_db_session
            )
        
        assert "already applied" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_get_my_applications_success(
        self, mock_db_session, sample_application
    ):
        """Test successful retrieval of member's applications."""
        service = ProjectService()
        member_id = sample_application.member_id
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_application]
        
        mock_db_session.execute.side_effect = [count_result, list_result]
        
        from src.modules.project.schemas import ApplicationListQuery
        query = ApplicationListQuery(page=1, page_size=20)
        
        applications, total = await service.get_my_applications(
            member_id, query, mock_db_session
        )
        
        assert len(applications) == 1
        assert total == 1
        assert applications[0].id == sample_application.id

    @pytest.mark.asyncio
    async def test_create_project_success(self, mock_db_session):
        """Test successful project creation."""
        service = ProjectService()
        
        from src.modules.project.schemas import ProjectCreate
        data = ProjectCreate(
            title="New Project",
            description="New Description",
            target_audience="SMEs",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 31),
        )
        
        created = await service.create_project(data, mock_db_session)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert created is not None

    @pytest.mark.asyncio
    async def test_update_project_success(
        self, mock_db_session, sample_project
    ):
        """Test successful project update."""
        service = ProjectService()
        
        # Mock get_project_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_project
        mock_db_session.execute.return_value = result
        
        from src.modules.project.schemas import ProjectUpdate
        update_data = ProjectUpdate(title="Updated Title")
        
        updated = await service.update_project(
            sample_project.id, update_data, mock_db_session
        )
        
        assert updated.title == "Updated Title"
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_project_success(
        self, mock_db_session, sample_project
    ):
        """Test successful project deletion."""
        service = ProjectService()
        
        # Mock get_project_by_id
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_project
        mock_db_session.execute.return_value = result
        
        await service.delete_project(sample_project.id, mock_db_session)
        
        mock_db_session.delete.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_project_applications_success(
        self, mock_db_session, sample_project, sample_application
    ):
        """Test successful listing of project applications."""
        service = ProjectService()
        
        # Mock get_project_by_id
        project_result = MagicMock()
        project_result.scalar_one_or_none.return_value = sample_project
        
        # Mock count query
        count_result = MagicMock()
        count_result.scalar.return_value = 1
        
        # Mock list query
        list_result = MagicMock()
        list_result.scalars.return_value.all.return_value = [sample_application]
        
        mock_db_session.execute.side_effect = [
            project_result,  # get_project_by_id
            count_result,  # count query
            list_result,  # list query
        ]
        
        from src.modules.project.schemas import ApplicationListQuery
        query = ApplicationListQuery(page=1, page_size=20)
        
        applications, total = await service.list_project_applications(
            sample_project.id, query, mock_db_session
        )
        
        assert len(applications) == 1
        assert total == 1

    @pytest.mark.asyncio
    async def test_update_application_status_success(
        self, mock_db_session, sample_application
    ):
        """Test successful application status update."""
        service = ProjectService()
        
        # Mock query
        result = MagicMock()
        result.scalar_one_or_none.return_value = sample_application
        mock_db_session.execute.return_value = result
        
        from src.modules.project.schemas import ApplicationStatus
        new_status = ApplicationStatus.approved
        
        updated = await service.update_application_status(
            sample_application.id, new_status, mock_db_session
        )
        
        assert updated.status == "approved"
        assert updated.reviewed_at is not None
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_application_status_not_found(self, mock_db_session):
        """Test application status update when application not found."""
        service = ProjectService()
        application_id = uuid4()
        
        # Mock query (returns None)
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = result
        
        from src.modules.project.schemas import ApplicationStatus
        new_status = ApplicationStatus.approved
        
        with pytest.raises(NotFoundError) as exc_info:
            await service.update_application_status(
                application_id, new_status, mock_db_session
            )
        
        assert "Project application" in str(exc_info.value)

