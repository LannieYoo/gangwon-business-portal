"""add_deleted_at_to_messages

Revision ID: d1e2f3g4h5i6
Revises: f06175b09853
Create Date: 2025-12-16 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1e2f3g4h5i6'
down_revision: Union[str, Sequence[str], None] = 'f06175b09853'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add deleted_at column to messages table for soft delete."""
    op.add_column('messages', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_messages_deleted_at', 'messages', ['deleted_at'], unique=False)


def downgrade() -> None:
    """Remove deleted_at column from messages table."""
    op.drop_index('idx_messages_deleted_at', table_name='messages')
    op.drop_column('messages', 'deleted_at')

