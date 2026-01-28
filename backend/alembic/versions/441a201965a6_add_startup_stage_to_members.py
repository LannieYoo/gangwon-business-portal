"""add_startup_stage_to_members

Revision ID: 441a201965a6
Revises: 5a2e21fac597
Create Date: 2026-01-27 21:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '441a201965a6'
down_revision = '5a2e21fac597'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加 startup_stage 字段到 members 表"""
    op.add_column('members', sa.Column('startup_stage', sa.String(length=50), nullable=True))


def downgrade() -> None:
    """移除 startup_stage 字段"""
    op.drop_column('members', 'startup_stage')
