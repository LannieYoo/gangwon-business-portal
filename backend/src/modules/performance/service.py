"""
Performance service.
"""
from typing import Optional
from uuid import UUID
import uuid
from datetime import datetime
import json

from ...common.modules.supabase.service import supabase_service
from ...common.modules.exception import NotFoundError, ValidationError, AuthorizationError, CMessageTemplate
from .schemas import PerformanceRecordCreate, PerformanceRecordUpdate, PerformanceListQuery


class PerformanceService:
    """Performance service class."""

    async def list_performance_records(
        self, member_id: UUID, query: PerformanceListQuery
    ) -> tuple[list[dict], int]:
        """列出会员的业绩记录"""
        member = await supabase_service.get_by_id('members', str(member_id))
        member_company_name = member.get('company_name', '') if member else ''
        member_business_number = member.get('business_number', '') if member else ''
        
        db_query = supabase_service.client.table('performance_records')\
            .select('*', count='exact')\
            .eq('member_id', str(member_id))\
            .is_('deleted_at', 'null')\
            .order('created_at', desc=True)
        
        if query.year:
            db_query = db_query.eq('year', query.year)
        if query.quarter:
            db_query = db_query.eq('quarter', query.quarter)
        if query.status:
            db_query = db_query.eq('status', query.status)
        
        result = db_query.execute()
        records = result.data or []
        total = result.count or 0
        
        for record in records:
            record['member_company_name'] = member_company_name
            record['member_business_number'] = member_business_number
        
        return records, total

    async def get_performance_by_id(
        self, performance_id: UUID, member_id: UUID
    ) -> dict:
        """获取业绩记录"""
        record = await supabase_service.get_by_id('performance_records', str(performance_id))

        if not record:
            raise NotFoundError(resource_type="Performance record")

        if str(record["member_id"]) != str(member_id):
            raise AuthorizationError(
                CMessageTemplate.AUTHZ_NO_PERMISSION.format(action="access this record")
            )

        return record

    async def create_performance(
        self, member_id: UUID, data: PerformanceRecordCreate
    ) -> dict:
        """创建业绩记录"""
        record_data = {
            "id": str(uuid.uuid4()),
            "member_id": str(member_id),
            "year": data.year,
            "quarter": data.quarter,
            "type": data.type,
            "status": "draft",
            "data_json": data.data_json,
            "hsk_code": data.hsk_code,
            "export_country1": data.export_country1,
            "export_country2": data.export_country2,
        }
        created = await supabase_service.create_record('performance_records', record_data)
        return created

    async def update_performance(
        self,
        performance_id: UUID,
        member_id: UUID,
        data: PerformanceRecordUpdate,
    ) -> dict:
        """更新业绩记录"""
        record = await self.get_performance_by_id(performance_id, member_id)

        if record["status"] not in ["draft", "revision_requested"]:
            raise ValidationError(
                CMessageTemplate.PERFORMANCE_EDIT_NOT_ALLOWED.format(status=record['status'])
            )

        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"=== Update Performance Debug ===")
        logger.warning(f"Performance ID: {performance_id}")
        logger.warning(f"Incoming data.hsk_code: {data.hsk_code}")
        logger.warning(f"Incoming data.export_country1: {data.export_country1}")
        logger.warning(f"Incoming data.export_country2: {data.export_country2}")

        update_data = {}
        if data.year is not None:
            update_data["year"] = data.year
        if data.quarter is not None:
            update_data["quarter"] = data.quarter
        if data.type is not None:
            update_data["type"] = data.type
        if data.data_json is not None:
            update_data["data_json"] = data.data_json
        if data.hsk_code is not None:
            update_data["hsk_code"] = data.hsk_code
        if data.export_country1 is not None:
            update_data["export_country1"] = data.export_country1
        if data.export_country2 is not None:
            update_data["export_country2"] = data.export_country2

        logger.warning(f"Update data to be sent: {update_data}")

        updated = await supabase_service.update_record('performance_records', str(performance_id), update_data)
        
        logger.warning(f"Updated record: {updated}")
        
        return updated

    async def delete_performance(
        self, performance_id: UUID, member_id: UUID
    ) -> None:
        """删除业绩记录（仅草稿）"""
        record = await self.get_performance_by_id(performance_id, member_id)

        if record["status"] != "draft":
            raise ValidationError(
                CMessageTemplate.PERFORMANCE_DELETE_NOT_ALLOWED.format(status=record['status'])
            )

        await supabase_service.delete_record('performance_records', str(performance_id))

    async def submit_performance(
        self, performance_id: UUID, member_id: UUID
    ) -> dict:
        """提交业绩记录审核"""
        record = await self.get_performance_by_id(performance_id, member_id)

        if record["status"] not in ["draft", "revision_requested"]:
            raise ValidationError(
                CMessageTemplate.PERFORMANCE_SUBMIT_NOT_ALLOWED.format(status=record['status'])
            )

        update_data = {
            "status": "submitted",
            "submitted_at": datetime.utcnow().isoformat(),
        }
        updated = await supabase_service.update_record('performance_records', str(performance_id), update_data)
        return updated

    async def list_all_performance_records(
        self, query: PerformanceListQuery
    ) -> tuple[list[dict], int]:
        """列出所有业绩记录（管理员）"""
        records, total = await supabase_service.list_performance_records_with_filters(
            sort_by="updated_at",
            sort_order="desc",
        )
        
        return records, total

    async def get_performance_by_id_admin(
        self, performance_id: UUID
    ) -> dict:
        """获取业绩记录（管理员，无权限检查）"""
        record = await supabase_service.get_by_id('performance_records', str(performance_id))

        if not record:
            raise NotFoundError(resource_type="Performance record")

        if record.get('member_id'):
            member = await supabase_service.get_by_id('members', str(record['member_id']))
            if member:
                record['member_phone'] = member.get('phone')
                record['member_company_name'] = member.get('company_name')
                record['member_business_number'] = member.get('business_number')

        reviews = []
        if record.get('review_status'):
            reviews.append({
                'id': f"{performance_id}_review",
                'performance_id': str(performance_id),
                'reviewer_id': record.get('reviewer_id'),
                'status': record.get('review_status'),
                'comments': record.get('review_comments'),
                'reviewed_at': record.get('reviewed_at'),
            })
        record['reviews'] = reviews

        return record

    async def _send_performance_notification(
        self,
        member_id: str,
        status: str,
        year: Optional[int],
        quarter: Optional[int],
        comments: Optional[str],
    ) -> None:
        """发送业绩审核结果通知"""
        from ..messages.service import service as message_service
        from ..messages.schemas import MessageCreate
        
        period = f"{year}년"
        if quarter:
            quarter_names = {1: "1분기", 2: "2분기", 3: "3분기", 4: "4분기"}
            period += f" {quarter_names.get(quarter, f'{quarter}분기')}"
        
        status_labels = {
            "approved": "승인",
            "revision_requested": "보완 요청",
            "rejected": "거부",
        }
        status_label = status_labels.get(status, status)
        
        subject = f"[실적 관리] {period} 실적이 {status_label}되었습니다"
        content = f"{period} 실적 데이터가 {status_label}되었습니다."
        if comments:
            content += f"\n\n관리자 의견: {comments}"
        
        try:
            await message_service.create_direct_message(
                sender_id=None,
                recipient_id=UUID(member_id),
                data=MessageCreate(
                    subject=subject,
                    content=content,
                    recipient_id=UUID(member_id),
                ),
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to send performance notification: {e}")

    async def approve_performance(
        self,
        performance_id: UUID,
        reviewer_id: Optional[UUID],
        comments: Optional[str],
    ) -> dict:
        """批准业绩记录（管理员）"""
        record = await self.get_performance_by_id_admin(performance_id)

        if record["status"] != "submitted":
            raise ValidationError(
                CMessageTemplate.PERFORMANCE_APPROVE_NOT_ALLOWED.format(status=record['status'])
            )

        update_data = {
            "status": "approved",
            "reviewer_id": None,
            "review_status": "approved",
            "review_comments": comments,
            "reviewed_at": datetime.utcnow().isoformat(),
        }
        await supabase_service.update_record('performance_records', str(performance_id), update_data)

        updated_record = await supabase_service.get_by_id('performance_records', str(performance_id))

        from ...common.modules.email import email_service
        from ...common.modules.email.background import send_email_background
        member = await supabase_service.get_by_id('members', str(record["member_id"]))
        if member:
            send_email_background(
                email_service.send_approval_notification_email(
                    to_email=member["email"],
                    company_name=member["company_name"],
                    approval_type="성과 데이터",
                    status="approved",
                    comments=comments,
                )
            )
            await self._send_performance_notification(
                member_id=record["member_id"],
                status="approved",
                year=record.get("year"),
                quarter=record.get("quarter"),
                comments=comments,
            )

        return updated_record

    async def request_fix_performance(
        self,
        performance_id: UUID,
        reviewer_id: Optional[UUID],
        comments: Optional[str],
    ) -> dict:
        """要求修改业绩记录（管理员）"""
        record = await self.get_performance_by_id_admin(performance_id)

        if record["status"] != "submitted":
            raise ValidationError(
                CMessageTemplate.PERFORMANCE_REVISION_NOT_ALLOWED.format(status=record['status'])
            )

        update_data = {
            "status": "revision_requested",
            "reviewer_id": None,
            "review_status": "revision_requested",
            "review_comments": comments,
            "reviewed_at": datetime.utcnow().isoformat(),
        }
        await supabase_service.update_record('performance_records', str(performance_id), update_data)

        updated_record = await supabase_service.get_by_id('performance_records', str(performance_id))

        from ...common.modules.email import email_service
        from ...common.modules.email.background import send_email_background
        member = await supabase_service.get_by_id('members', str(record["member_id"]))
        if member and comments:
            from ...common.modules.config.settings import settings
            revision_url = f"{settings.FRONTEND_URL}/member/performance/{performance_id}"
            send_email_background(
                email_service.send_revision_request_email(
                    to_email=member["email"],
                    company_name=member["company_name"],
                    request_type="성과 데이터",
                    comments=comments,
                    revision_url=revision_url,
                )
            )
            await self._send_performance_notification(
                member_id=record["member_id"],
                status="revision_requested",
                year=record.get("year"),
                quarter=record.get("quarter"),
                comments=comments,
            )

        return updated_record

    async def reject_performance(
        self,
        performance_id: UUID,
        reviewer_id: Optional[UUID],
        comments: Optional[str],
    ) -> dict:
        """驳回业绩记录（管理员）"""
        record = await self.get_performance_by_id_admin(performance_id)

        if record["status"] != "submitted":
            raise ValidationError(
                CMessageTemplate.PERFORMANCE_REJECT_NOT_ALLOWED.format(status=record['status'])
            )

        update_data = {
            "status": "rejected",
            "reviewer_id": None,
            "review_status": "rejected",
            "review_comments": comments,
            "reviewed_at": datetime.utcnow().isoformat(),
        }
        await supabase_service.update_record('performance_records', str(performance_id), update_data)

        updated_record = await supabase_service.get_by_id('performance_records', str(performance_id))

        await self._send_performance_notification(
            member_id=record["member_id"],
            status="rejected",
            year=record.get("year"),
            quarter=record.get("quarter"),
            comments=comments,
        )

        return updated_record

    async def export_performance_data(
        self, query: PerformanceListQuery
    ) -> list[dict]:
        """导出业绩数据（管理员）"""
        records = await supabase_service.export_performance_records(
            member_id=str(query.member_id) if query.member_id else None,
            year=query.year,
            quarter=query.quarter,
            status=query.status,
            type=query.type,
        )

        export_data = []
        for record in records:
            export_data.append({
                "id": str(record["id"]),
                "member_id": str(record["member_id"]),
                "year": record["year"],
                "quarter": record["quarter"],
                "type": record["type"],
                "status": record["status"],
                "data_json": json.dumps(record["data_json"], ensure_ascii=False) if record.get("data_json") else "",
                "submitted_at": record.get("submitted_at"),
                "created_at": record.get("created_at"),
                "updated_at": record.get("updated_at"),
            })

        return export_data
