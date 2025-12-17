"""add_message_threads_and_broadcast_system

Revision ID: f06175b09853
Revises: 775835a1b01d
Create Date: 2025-12-16 11:32:40.826014

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f06175b09853'
down_revision: Union[str, Sequence[str], None] = '775835a1b01d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create message_threads table
    op.create_table(
        'message_threads',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('category', sa.String(50), nullable=False, server_default='general'),
        sa.Column('status', sa.String(20), nullable=False, server_default='open'),
        sa.Column('member_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('members.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assigned_to', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('last_message_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('message_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('unread_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for message_threads
    op.create_index('idx_message_threads_member', 'message_threads', ['member_id', 'status'])
    op.create_index('idx_message_threads_status', 'message_threads', ['status'])
    op.create_index('idx_message_threads_created_at', 'message_threads', ['created_at'])
    
    # Create thread_messages table
    op.create_table(
        'thread_messages',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('thread_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('message_threads.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sender_type', sa.String(20), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('is_read', sa.String(10), nullable=False, server_default='false'),
        sa.Column('is_important', sa.String(10), nullable=False, server_default='false'),
        sa.Column('read_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for thread_messages
    op.create_index('idx_thread_messages_thread', 'thread_messages', ['thread_id', 'created_at'])
    op.create_index('idx_thread_messages_sender', 'thread_messages', ['sender_id'])
    
    # Create message_attachments table
    op.create_table(
        'message_attachments',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('message_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('thread_messages.id', ondelete='CASCADE'), nullable=False),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_size', sa.Integer, nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for message_attachments
    op.create_index('idx_message_attachments_message', 'message_attachments', ['message_id'])
    
    # Create broadcast_messages table
    op.create_table(
        'broadcast_messages',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('sender_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('category', sa.String(50), nullable=False, server_default='general'),
        sa.Column('is_important', sa.String(10), nullable=False, server_default='false'),
        sa.Column('send_to_all', sa.String(10), nullable=False, server_default='false'),
        sa.Column('recipient_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for broadcast_messages
    op.create_index('idx_broadcast_messages_sender', 'broadcast_messages', ['sender_id'])
    op.create_index('idx_broadcast_messages_created_at', 'broadcast_messages', ['created_at'])
    
    # Create broadcast_recipients table
    op.create_table(
        'broadcast_recipients',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('broadcast_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('broadcast_messages.id', ondelete='CASCADE'), nullable=False),
        sa.Column('member_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('members.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_read', sa.String(10), nullable=False, server_default='false'),
        sa.Column('read_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes and constraints for broadcast_recipients
    op.create_index('idx_broadcast_recipients_broadcast', 'broadcast_recipients', ['broadcast_id'])
    op.create_index('idx_broadcast_recipients_member', 'broadcast_recipients', ['member_id', 'is_read'])
    op.create_unique_constraint('uq_broadcast_recipient', 'broadcast_recipients', ['broadcast_id', 'member_id'])
    
    # Create broadcast_attachments table
    op.create_table(
        'broadcast_attachments',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('broadcast_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('broadcast_messages.id', ondelete='CASCADE'), nullable=False),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_size', sa.Integer, nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for broadcast_attachments
    op.create_index('idx_broadcast_attachments_broadcast', 'broadcast_attachments', ['broadcast_id'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_table('broadcast_attachments')
    op.drop_table('broadcast_recipients')
    op.drop_table('broadcast_messages')
    op.drop_table('message_attachments')
    op.drop_table('thread_messages')
    op.drop_table('message_threads')
