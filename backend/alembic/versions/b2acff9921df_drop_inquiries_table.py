"""drop_inquiries_table

Drop the inquiries table as its functionality has been migrated to the messages table.
The inquiries data was already migrated to messages table in the merge_message_tables migration.

Revision ID: b2acff9921df
Revises: d5e6f7g8h9i0
Create Date: 2025-12-23 17:56:56.826196

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2acff9921df'
down_revision: Union[str, Sequence[str], None] = 'd5e6f7g8h9i0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Drop inquiries table and related indexes."""
    # Drop indexes first
    try:
        op.drop_index('idx_inquiries_deleted_at', table_name='inquiries')
    except Exception:
        pass  # Index might not exist
    
    # Drop the inquiries table
    op.drop_table('inquiries')


def downgrade() -> None:
    """Recreate inquiries table (for rollback purposes only - data will be lost)."""
    # Recreate the inquiries table structure
    op.create_table(
        'inquiries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('member_id', sa.UUID(), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='pending'),
        sa.Column('admin_reply', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True, server_default='general'),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('replied_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
    )
    
    # Recreate indexes
    op.create_index('idx_inquiries_deleted_at', 'inquiries', ['deleted_at'], unique=False)
