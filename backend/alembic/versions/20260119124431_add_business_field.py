"""add business_field

Revision ID: 20260119124431
Revises: 897911e63f9f
Create Date: 2026-01-19 12:44:31

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260119124431'
down_revision = '897911e63f9f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加business_field字段到members表"""
    op.add_column('members', sa.Column('business_field', sa.String(10), nullable=True))


def downgrade() -> None:
    """从members表移除business_field字段"""
    op.drop_column('members', 'business_field')
