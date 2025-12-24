"""remove_messages_fk_constraints

Revision ID: remove_messages_fk_constraints
Revises: seed_legal_content_defaults, merge_message_tables
Create Date: 2025-12-23 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'remove_messages_fk_constraints'
down_revision = ('seed_legal_content_defaults', 'merge_message_tables')
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Remove all foreign key constraints from messages table."""
    
    # 使用原生 SQL 的 IF EXISTS 来安全删除约束
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_thread_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_parent_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey')
    # 删除 unified 版本的约束
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_thread_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_parent_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_sender_id_fkey')
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_unified_recipient_id_fkey')


def downgrade() -> None:
    """Restore foreign key constraints."""
    
    op.create_foreign_key('messages_thread_id_fkey', 'messages', 'messages', 
                         ['thread_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('messages_parent_id_fkey', 'messages', 'messages', 
                         ['parent_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('messages_sender_id_fkey', 'messages', 'members', 
                         ['sender_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('messages_recipient_id_fkey', 'messages', 'members', 
                         ['recipient_id'], ['id'], ondelete='CASCADE')