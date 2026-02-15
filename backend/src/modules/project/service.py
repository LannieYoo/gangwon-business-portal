"""
Project service.

Business logic for project and application management operations.
"""
from uuid import UUID, uuid4
from typing import Optional
from datetime import datetime
import json

from ...common.modules.db.models import Project, ProjectApplication  # 保留用于类型提示和文档
from ...common.modules.supabase.service import supabase_service
from ...common.modules.exception import NotFoundError, ValidationError, ErrorCode, CMessageTemplate
from .schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectListQuery,
    ProjectApplicationCreate,
    ApplicationListQuery,
    ApplicationStatus,
)


class ProjectService:
    """Project service class - using supabase_service helper methods and direct client."""

    # Public/Member operations

    async def list_projects(
        self, query: ProjectListQuery
    ) -> tuple[list[dict], int]:
        """
        List all projects with pagination and filtering (public access).

        Args:
            query: Query parameters

        Returns:
            Tuple of (projects list, total count)
        """
        projects, total = await supabase_service.list_projects_with_filters(
            sort_by="created_at",
            sort_order="desc",
        )
        return projects, total
    
    async def list_projects_paginated(
        self, page: int = 1, page_size: int = 20, status: Optional[str] = None
    ) -> tuple[list[dict], int]:
        """
        List projects with pagination (public access).

        Args:
            page: Page number (1-indexed)
            page_size: Items per page
            status: Optional status filter

        Returns:
            Tuple of (projects list, total count)
        """
        return await supabase_service.list_with_pagination(
            table='projects',
            page=page,
            page_size=page_size,
            order_by='created_at',
            order_desc=True,
            exclude_deleted=True,
            filters={'status': status} if status else None
        )
    
    async def get_latest_project(self) -> Optional[dict]:
        """
        Get latest project for homepage.

        Returns:
            Latest project dict or None
        """
        result = supabase_service.client.table('projects')\
            .select('*')\
            .is_('deleted_at', 'null')\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        return result.data[0] if result.data else None
    
    async def list_projects_admin(
        self, query: ProjectListQuery
    ) -> tuple[list[dict], int]:
        """
        List all projects with pagination and filtering (admin access).
        Admin can see all projects including drafts and inactive ones.

        Args:
            query: Query parameters

        Returns:
            Tuple of (projects list, total count)
        """
        projects, total = await supabase_service.list_projects_with_filters(
            sort_by="created_at",
            sort_order="desc",
        )
        return projects, total

    async def get_project_by_id(
        self, project_id: UUID, increment_view: bool = False
    ) -> dict:
        """
        Get project by ID (public access).

        Args:
            project_id: Project UUID
            increment_view: Whether to increment view count

        Returns:
            Project dict

        Raises:
            NotFoundError: If project not found
        """
        # Use helper method
        project = await supabase_service.get_by_id('projects', str(project_id))

        if not project:
            raise NotFoundError(resource_type="Project")

        # Increment view count if requested
        if increment_view:
            current_count = project.get('view_count', 0)
            await supabase_service.update_record(
                'projects',
                str(project_id),
                {'view_count': current_count + 1}
            )
            project['view_count'] = current_count + 1
        
        return project

    async def apply_to_project(
        self,
        member_id: UUID,
        project_id: UUID,
        data: ProjectApplicationCreate,
    ) -> dict:
        """
        Apply to a project (member only).

        Args:
            member_id: Member UUID
            project_id: Project UUID
            data: Application data

        Returns:
            Created application dict

        Raises:
            NotFoundError: If project not found
            ValidationError: If project inactive or duplicate application
        """
        # Check if project exists and is active
        project = await self.get_project_by_id(project_id)

        if project["status"] != "active":
            raise ValidationError(
                CMessageTemplate.PROJECT_INACTIVE.format(status=project['status'])
            )

        # Check for duplicate application - only block if there's an active application
        # Allow reapplication if previous application was cancelled or rejected
        existing_app = supabase_service.client.table('project_applications')\
            .select('id, status')\
            .eq('member_id', str(member_id))\
            .eq('project_id', str(project_id))\
            .is_('deleted_at', 'null')\
            .not_.in_('status', ['cancelled', 'rejected'])\
            .limit(1)\
            .execute()
        
        if existing_app.data:
            raise ValidationError(
                CMessageTemplate.PROJECT_ALREADY_APPLIED,
                context={"error_code": ErrorCode.PROJECT_ALREADY_APPLIED}
            )

        application_data = {
            "id": str(uuid4()),
            "member_id": str(member_id),
            "project_id": str(project_id),
            "applicant_name": data.applicant_name,
            "applicant_phone": data.applicant_phone,
            "application_reason": data.application_reason,
            "attachments": data.attachments,
            "status": "submitted",
        }
        application = await supabase_service.create_record('project_applications', application_data)
        
        # Send notification to all admins about new project application
        try:
            from ...modules.messages.service import service as message_service
            from ...modules.messages.schemas import MessageCreate
            import json
            
            # Get member info
            member = await supabase_service.get_by_id('members', str(member_id))
            company_name = member.get('company_name', '알 수 없음') if member else '알 수 없음'
            
            # Get all active admins
            admins_result = supabase_service.client.table('admins').select('id').eq('is_active', 'true').execute()
            admin_ids = [admin['id'] for admin in (admins_result.data or [])]
            
            # Send notification to each admin
            for admin_id in admin_ids:
                try:
                    notification_data = {
                        "type": "project_application",
                        "company_name": company_name,
                        "applicant_name": data.applicant_name,
                        "project_title": project.get('title', '알 수 없음'),
                    }
                    await message_service.create_direct_message(
                        sender_id=member_id,
                        recipient_id=UUID(admin_id),
                        data=MessageCreate(
                            subject=json.dumps(notification_data, ensure_ascii=False),
                            content=json.dumps(notification_data, ensure_ascii=False),
                            recipient_id=UUID(admin_id),
                        ),
                    )
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).warning(f"Failed to send admin notification: {e}")
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to notify admins about project application: {e}")
        
        return application

    async def get_my_applications(
        self, member_id: UUID, query: ApplicationListQuery
    ) -> tuple[list[dict], int]:
        """
        Get member's own applications with search support.

        Args:
            member_id: Member UUID
            query: Query parameters

        Returns:
            Tuple of (applications list, total count)
        """
        applications, total = await supabase_service.list_member_applications_with_filters(
            member_id=str(member_id),
            search=query.search if hasattr(query, 'search') else None,
            sort_by="submitted_at",
            sort_order="desc",
        )
        
        # Flatten nested data for schema compatibility
        flattened = []
        for app in applications:
            flat_app = {**app}
            # Extract project_title from nested projects object
            if 'projects' in flat_app and flat_app['projects']:
                flat_app['project_title'] = flat_app['projects'].get('title', '')
                del flat_app['projects']
            else:
                flat_app['project_title'] = ''
            # Extract company_name from nested members object
            if 'members' in flat_app and flat_app['members']:
                flat_app['company_name'] = flat_app['members'].get('company_name', '')
                flat_app['business_number'] = flat_app['members'].get('business_number', '')
                del flat_app['members']
            else:
                flat_app['company_name'] = ''
                flat_app['business_number'] = ''
            # Ensure application_reason has a default value
            if not flat_app.get('application_reason'):
                flat_app['application_reason'] = ''
            flattened.append(flat_app)
        
        return flattened, total

    async def get_application_by_id(
        self, application_id: UUID, member_id: UUID
    ) -> dict:
        """
        Get application by ID (member only, must be owner).

        Args:
            application_id: Application UUID
            member_id: Member UUID (for ownership verification)

        Returns:
            Application dict

        Raises:
            NotFoundError: If application not found or not owned by member
        """
        application = await supabase_service.get_by_id('project_applications', str(application_id))

        if not application:
            raise NotFoundError(resource_type="Project application")

        if application.get('member_id') != str(member_id):
            raise NotFoundError(resource_type="Project application")

        # Get project info
        project = await supabase_service.get_by_id('projects', str(application['project_id']))
        if project:
            application['project_title'] = project.get('title', '')
            application['project'] = project

        return application

    async def cancel_application(
        self, application_id: UUID, member_id: UUID
    ) -> dict:
        """
        Cancel a project application (member only).

        Args:
            application_id: Application UUID
            member_id: Member UUID (for ownership verification)

        Returns:
            Updated application dict

        Raises:
            NotFoundError: If application not found or not owned by member
            ValidationError: If application cannot be cancelled
        """
        application = await self.get_application_by_id(application_id, member_id)

        # Check if application can be cancelled
        cancellable_statuses = ['pending', 'submitted', 'under_review', 'reviewing']
        if application.get('status') not in cancellable_statuses:
            raise ValidationError(
                f"Cannot cancel application with status: {application.get('status')}. Only applications in pending, submitted, under_review, or reviewing status can be cancelled."
            )

        # Update status to cancelled
        update_data = {
            "status": "cancelled",
            "reviewed_at": datetime.utcnow().isoformat()
        }

        return await supabase_service.update_record('project_applications', str(application_id), update_data)

    # Admin operations

    async def create_project(
        self, data: ProjectCreate
    ) -> dict:
        """
        Create new project (admin only).

        Args:
            data: Project data

        Returns:
            Created project dict
        """
        project_data = {
            "id": str(uuid4()),
            "title": data.title,
            "description": data.description,
            "target_company_name": data.target_company_name,
            "target_business_number": data.target_business_number,
            "start_date": data.start_date.isoformat() if data.start_date else None,
            "end_date": data.end_date.isoformat() if data.end_date else None,
            "image_url": data.image_url,
            "status": data.status.value if data.status else "active",
            "attachments": data.attachments,
        }
        # Use helper method
        return await supabase_service.create_record('projects', project_data)

    async def update_project(
        self, project_id: UUID, data: ProjectUpdate
    ) -> dict:
        """
        Update project (admin only).

        Args:
            project_id: Project UUID
            data: Update data

        Returns:
            Updated project dict

        Raises:
            NotFoundError: If project not found
        """
        await self.get_project_by_id(project_id)  # Verify exists

        # Build update data
        update_data = {}
        if data.title is not None:
            update_data["title"] = data.title
        if data.description is not None:
            update_data["description"] = data.description
        if data.target_company_name is not None:
            update_data["target_company_name"] = data.target_company_name
        if data.target_business_number is not None:
            update_data["target_business_number"] = data.target_business_number
        if data.start_date is not None:
            update_data["start_date"] = data.start_date.isoformat()
        if data.end_date is not None:
            update_data["end_date"] = data.end_date.isoformat()
        if data.image_url is not None:
            update_data["image_url"] = data.image_url
        if data.status is not None:
            update_data["status"] = data.status.value
        if data.attachments is not None:
            update_data["attachments"] = data.attachments

        # Use helper method
        return await supabase_service.update_record('projects', str(project_id), update_data)

    async def delete_project(
        self, project_id: UUID
    ) -> None:
        """
        Delete project (admin only).

        Args:
            project_id: Project UUID

        Raises:
            NotFoundError: If project not found
        """
        await self.get_project_by_id(project_id)  # Verify exists
        # Use helper method for soft delete
        await supabase_service.delete_record('projects', str(project_id))

    async def list_project_applications(
        self, project_id: UUID, query: ApplicationListQuery
    ) -> tuple[list[dict], int]:
        """
        List all applications for a project (admin only).

        Args:
            project_id: Project UUID
            query: Query parameters

        Returns:
            Tuple of (applications list, total count)

        Raises:
            NotFoundError: If project not found
        """
        # Verify project exists
        project = await self.get_project_by_id(project_id)

        applications, total = await supabase_service.list_project_applications_with_filters(
            project_id=str(project_id),
            sort_by="submitted_at",
            sort_order="desc",
        )
        
        # Flatten nested data for schema compatibility
        flattened = []
        for app in applications:
            flat_app = {**app}
            # Extract project_title from nested projects object
            if 'projects' in flat_app and flat_app['projects']:
                flat_app['project_title'] = flat_app['projects'].get('title', '')
                del flat_app['projects']
            else:
                flat_app['project_title'] = project.get('title', '') if project else ''
            # Extract company_name from nested members object
            if 'members' in flat_app and flat_app['members']:
                flat_app['company_name'] = flat_app['members'].get('company_name', '')
                flat_app['business_number'] = flat_app['members'].get('business_number', '')
                del flat_app['members']
            else:
                flat_app['company_name'] = ''
                flat_app['business_number'] = ''
            # Ensure application_reason has a default value
            if not flat_app.get('application_reason'):
                flat_app['application_reason'] = ''
            flattened.append(flat_app)
        
        return flattened, total

    async def list_all_applications(
        self, query: ApplicationListQuery, project_id: Optional[UUID] = None
    ) -> tuple[list[dict], int]:
        """
        List all applications across all projects (admin only).

        Args:
            query: Query parameters for filtering and pagination
            project_id: Optional project ID to filter by

        Returns:
            Tuple of (applications list, total count)
        """
        applications, total = await supabase_service.list_project_applications_with_filters(
            sort_by="submitted_at",
            sort_order="desc",
        )
        return applications, total

    async def update_application_status(
        self,
        application_id: UUID,
        status: ApplicationStatus,
        review_notes: Optional[str] = None,
    ) -> dict:
        """
        Update application status (admin only).

        Args:
            application_id: Application UUID
            status: New status
            review_notes: Optional review notes (rejection reason / supplement request)

        Returns:
            Updated application dict

        Raises:
            NotFoundError: If application not found
            ValidationError: If status transition is invalid
        """
        # Use helper method to get application
        application = await supabase_service.get_by_id('project_applications', str(application_id))

        if not application:
            raise NotFoundError(resource_type="Project application")

        current_status = application.get('status')

        # Validate status transitions
        valid_transitions = {
            'submitted': ['under_review', 'approved', 'rejected', 'needs_supplement'],
            'under_review': ['approved', 'rejected', 'needs_supplement'],
            'needs_supplement': ['under_review'],  # Only after member submits supplement
            'supplement_submitted': ['under_review', 'approved', 'rejected'],
        }
        allowed = valid_transitions.get(current_status, [])
        if status.value not in allowed:
            raise ValidationError(
                f"Cannot transition from '{current_status}' to '{status.value}'. "
                f"Allowed transitions: {allowed}"
            )

        # Build update data
        update_data = {"status": status.value}
        if status in [ApplicationStatus.approved, ApplicationStatus.rejected]:
            update_data["reviewed_at"] = datetime.utcnow().isoformat()

        # Save review notes (rejection reason or supplement request message)
        if review_notes is not None:
            update_data["review_note"] = review_notes

        # Save supplement request message in material_request field
        if status == ApplicationStatus.needs_supplement and review_notes:
            update_data["material_request"] = review_notes

        # Use helper method
        updated = await supabase_service.update_record('project_applications', str(application_id), update_data)
        
        # Send notification to member about application result
        if status in [ApplicationStatus.approved, ApplicationStatus.rejected, ApplicationStatus.needs_supplement]:
            try:
                from ...modules.messages.service import service as message_service
                from ...modules.messages.schemas import MessageCreate
                import json
                
                member_id = application.get('member_id')
                project_id = application.get('project_id')
                
                # Get project info
                project = await supabase_service.get_by_id('projects', str(project_id))
                project_title = project.get('title', '알 수 없음') if project else '알 수 없음'
                
                # Prepare notification data
                notification_type = "project_application_result"
                if status == ApplicationStatus.needs_supplement:
                    notification_type = "project_supplement_request"
                
                notification_data = {
                    "type": notification_type,
                    "project_title": project_title,
                    "status": status.value,
                }
                if review_notes:
                    notification_data["review_notes"] = review_notes
                
                await message_service.create_direct_message(
                    sender_id=None,
                    recipient_id=UUID(member_id),
                    data=MessageCreate(
                        subject=json.dumps(notification_data, ensure_ascii=False),
                        content=json.dumps(notification_data, ensure_ascii=False),
                        recipient_id=UUID(member_id),
                    ),
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Failed to send application result notification: {e}")
        
        return updated

    async def submit_supplement(
        self,
        application_id: UUID,
        member_id: UUID,
        attachments: list,
    ) -> dict:
        """
        Submit supplementary materials for an application (member only).

        Args:
            application_id: Application UUID
            member_id: Member UUID (for ownership verification)
            attachments: List of attachment dicts

        Returns:
            Updated application dict

        Raises:
            NotFoundError: If application not found or not owned by member
            ValidationError: If application status is not needs_supplement
        """
        application = await self.get_application_by_id(application_id, member_id)

        if application.get('status') != 'needs_supplement':
            raise ValidationError(
                f"Cannot submit supplement for application with status: {application.get('status')}. "
                f"Only applications in 'needs_supplement' status can receive supplements."
            )

        # Update application with supplement materials
        update_data = {
            "status": "supplement_submitted",
            "material_response": json.dumps(attachments, ensure_ascii=False) if not isinstance(attachments, str) else attachments,
        }

        updated = await supabase_service.update_record(
            'project_applications', str(application_id), update_data
        )

        # Notify admins about supplement submission
        try:
            from ...modules.messages.service import service as message_service
            from ...modules.messages.schemas import MessageCreate

            member = await supabase_service.get_by_id('members', str(member_id))
            company_name = member.get('company_name', '알 수 없음') if member else '알 수 없음'
            project = await supabase_service.get_by_id('projects', str(application.get('project_id')))
            project_title = project.get('title', '알 수 없음') if project else '알 수 없음'

            admins_result = supabase_service.client.table('admins').select('id').eq('is_active', 'true').execute()
            admin_ids = [admin['id'] for admin in (admins_result.data or [])]

            notification_data = {
                "type": "project_supplement_submitted",
                "company_name": company_name,
                "project_title": project_title,
            }

            for admin_id in admin_ids:
                try:
                    await message_service.create_direct_message(
                        sender_id=member_id,
                        recipient_id=UUID(admin_id),
                        data=MessageCreate(
                            subject=json.dumps(notification_data, ensure_ascii=False),
                            content=json.dumps(notification_data, ensure_ascii=False),
                            recipient_id=UUID(admin_id),
                        ),
                    )
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).warning(f"Failed to send admin notification: {e}")
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to notify admins about supplement submission: {e}")

        return updated

    async def export_projects_data(
        self, query: ProjectListQuery
    ) -> list[dict]:
        """
        Export projects data for download (admin only).
        
        方案A（适度放宽）:
        - Projects 表所有字段
        - 移除: image_url, attachments, applications_count (URL、附件、统计字段)

        Args:
            query: Filter parameters

        Returns:
            List of project records as dictionaries
        """
        projects = await supabase_service.export_projects(
            status=query.status.value if query.status else None,
            search=query.search,
        )

        export_data = []
        for project in projects:
            export_data.append({
                # Projects 表字段
                "id": str(project["id"]),
                "title": project["title"],
                "description": project["description"],
                "target_company_name": project["target_company_name"],
                "target_business_number": project["target_business_number"],
                "start_date": project.get("start_date"),
                "end_date": project.get("end_date"),
                "status": project["status"],
                "created_at": project.get("created_at"),
                "updated_at": project.get("updated_at"),
                
                # 移除: image_url, attachments, applications_count
            })

        return export_data

    async def export_applications_data(
        self, project_id: Optional[UUID], query: ApplicationListQuery
    ) -> list[dict]:
        """
        Export project applications data for download (admin only).
        
        方案A（适度放宽）:
        - Project_applications 表所有字段
        - 关联标识字段: project_title, member_company_name, member_business_number
        - 移除: attachments (附件字段)

        Args:
            project_id: Optional project ID to filter by
            query: Filter parameters

        Returns:
            List of application records as dictionaries
        """
        applications = await supabase_service.export_project_applications(
            project_id=str(project_id) if project_id else None,
            status=query.status.value if query.status else None,
        )

        # Convert to dict format for export
        export_data = []
        for application in applications:
            # Get project and member info - use helper methods
            project = await supabase_service.get_by_id('projects', str(application["project_id"]))
            member = await supabase_service.get_by_id('members', str(application["member_id"]))

            export_data.append({
                # Project_applications 表字段
                "id": str(application["id"]),
                "project_id": str(application["project_id"]),
                "member_id": str(application["member_id"]),
                "status": application["status"],
                "applicant_name": application.get("applicant_name"),
                "applicant_phone": application.get("applicant_phone"),
                "application_reason": application.get("application_reason"),
                "submitted_at": application.get("submitted_at"),
                "reviewed_at": application.get("reviewed_at"),
                "review_note": application.get("review_note"),
                "reviewed_by": str(application["reviewed_by"]) if application.get("reviewed_by") else None,
                "material_request": application.get("material_request"),
                "material_response": application.get("material_response"),
                "created_at": application.get("created_at"),
                
                # 关联标识字段（让ID有意义）
                "project_title": project["title"] if project else None,
                "member_company_name": member["company_name"] if member else None,
                "member_business_number": member["business_number"] if member else None,
                
                # 移除: attachments (附件字段)
            })

        return export_data

# Service instance
service = ProjectService()