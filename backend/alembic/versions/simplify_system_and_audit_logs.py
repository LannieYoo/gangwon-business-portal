"""Simplify system_logs table

Remove unused columns to reduce database storage:
- system_logs: remove process_id, thread_name, extra_data

Revision ID: d5e6f7g8h9i0
Revises: c4d5e6f7g8h9
Create Date: 2024-12-22
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5e6f7g8h9i0'
down_revision: Union[str, None] = 'c4d5e6f7g8h9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Remove unused columns from system_logs
    op.drop_column('system_logs', 'process_id')
    op.drop_column('system_logs', 'thread_name')
    op.drop_column('system_logs', 'extra_data')


def downgrade() -> None:
    # Restore columns to system_logs
    op.add_column('system_logs', sa.Column('extra_data', sa.dialects.postgresql.JSONB(), nullable=True))
    op.add_column('system_logs', sa.Column('thread_name', sa.String(100), nullable=True))
    op.add_column('system_logs', sa.Column('process_id', sa.Integer(), nullable=True))
