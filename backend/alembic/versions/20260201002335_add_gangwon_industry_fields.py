"""add gangwon_industry and future_tech fields

Revision ID: 20260201002335
Revises: 20260119222343, 441a201965a6
Create Date: 2026-02-01 00:23:35

"""
from alembic import op
import sqlalchemy as sa


revision = '20260201002335'
down_revision = ('20260119222343', '441a201965a6')
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加江原道产业分类字段到members表"""
    op.add_column('members', sa.Column('gangwon_industry', sa.String(50), nullable=True, comment='강원도 7대 미래산업'))
    op.add_column('members', sa.Column('future_tech', sa.String(50), nullable=True, comment='미래유망 신기술'))


def downgrade() -> None:
    """从members表移除江原道产业分类字段"""
    op.drop_column('members', 'future_tech')
    op.drop_column('members', 'gangwon_industry')
