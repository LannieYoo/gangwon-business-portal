"""Add contact person fields to members table

Revision ID: add_contact_person_fields
Revises: remove_log_fk_001
Create Date: 2024-12-23

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_contact_person_fields'
down_revision = 'remove_log_fk_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add contact person fields to members table."""
    # 添加担当者相关字段
    op.add_column('members', sa.Column('contact_person_name', sa.String(100), nullable=True))
    op.add_column('members', sa.Column('contact_person_department', sa.String(100), nullable=True))
    op.add_column('members', sa.Column('contact_person_position', sa.String(100), nullable=True))
    
    # 添加主要事业及产品、企业介绍、产业合作希望领域字段（如果不存在）
    op.add_column('members', sa.Column('main_business', sa.Text(), nullable=True))
    op.add_column('members', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('members', sa.Column('cooperation_fields', sa.Text(), nullable=True))  # JSON array stored as text


def downgrade() -> None:
    """Remove contact person fields from members table."""
    op.drop_column('members', 'contact_person_name')
    op.drop_column('members', 'contact_person_department')
    op.drop_column('members', 'contact_person_position')
    op.drop_column('members', 'main_business')
    op.drop_column('members', 'description')
    op.drop_column('members', 'cooperation_fields')
