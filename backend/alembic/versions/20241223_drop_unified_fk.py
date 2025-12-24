"""Drop unified foreign key constraints from messages table

Revision ID: drop_unified_fk
Revises: remove_messages_fk_constraints
Create Date: 2024-12-23

"""
from alembic import op

revision = 'drop_unified_fk'
down_revision = 'remove_messages_fk_constraints'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_thread_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_parent_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_sender_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_recipient_id_fkey')


def downgrade() -> None:
    pass
