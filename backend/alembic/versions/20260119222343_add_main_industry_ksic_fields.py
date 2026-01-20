"""add main_industry_ksic fields

Revision ID: 20260119222343
Revises: 20260119124431
Create Date: 2026-01-19 22:23:43

"""
from alembic import op
import sqlalchemy as sa


revision = '20260119222343'
down_revision = '20260119124431'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加主力产业KSIC代码字段到members表"""
    op.add_column('members', sa.Column('main_industry_ksic_major', sa.String(50), nullable=True))
    op.add_column('members', sa.Column('main_industry_ksic_codes', sa.Text(), nullable=True))


def downgrade() -> None:
    """从members表移除主力产业KSIC代码字段"""
    op.drop_column('members', 'main_industry_ksic_codes')
    op.drop_column('members', 'main_industry_ksic_major')
