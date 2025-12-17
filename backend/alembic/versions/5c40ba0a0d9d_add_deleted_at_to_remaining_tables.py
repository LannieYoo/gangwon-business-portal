"""add_deleted_at_to_remaining_tables

Revision ID: 5c40ba0a0d9d
Revises: 372585e89aea
Create Date: 2025-12-16 23:17:40.513148

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5c40ba0a0d9d'
down_revision: Union[str, Sequence[str], None] = '372585e89aea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add deleted_at column to remaining tables for soft delete."""
    
    # Members table
    op.add_column('members', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_members_deleted_at', 'members', ['deleted_at'], unique=False)
    
    # Member profiles table
    op.add_column('member_profiles', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_member_profiles_deleted_at', 'member_profiles', ['deleted_at'], unique=False)
    
    # Project applications table
    op.add_column('project_applications', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_project_applications_deleted_at', 'project_applications', ['deleted_at'], unique=False)
    
    # Inquiries table
    op.add_column('inquiries', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_inquiries_deleted_at', 'inquiries', ['deleted_at'], unique=False)
    
    # Message threads table
    op.add_column('message_threads', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_message_threads_deleted_at', 'message_threads', ['deleted_at'], unique=False)
    
    # Thread messages table
    op.add_column('thread_messages', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_thread_messages_deleted_at', 'thread_messages', ['deleted_at'], unique=False)
    
    # Message attachments table
    op.add_column('message_attachments', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_message_attachments_deleted_at', 'message_attachments', ['deleted_at'], unique=False)
    
    # Broadcast messages table
    op.add_column('broadcast_messages', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_broadcast_messages_deleted_at', 'broadcast_messages', ['deleted_at'], unique=False)
    
    # Broadcast recipients table
    op.add_column('broadcast_recipients', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_broadcast_recipients_deleted_at', 'broadcast_recipients', ['deleted_at'], unique=False)
    
    # Broadcast attachments table
    op.add_column('broadcast_attachments', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_broadcast_attachments_deleted_at', 'broadcast_attachments', ['deleted_at'], unique=False)


def downgrade() -> None:
    """Remove deleted_at columns from remaining tables."""
    
    # Broadcast attachments table
    op.drop_index('idx_broadcast_attachments_deleted_at', table_name='broadcast_attachments')
    op.drop_column('broadcast_attachments', 'deleted_at')
    
    # Broadcast recipients table
    op.drop_index('idx_broadcast_recipients_deleted_at', table_name='broadcast_recipients')
    op.drop_column('broadcast_recipients', 'deleted_at')
    
    # Broadcast messages table
    op.drop_index('idx_broadcast_messages_deleted_at', table_name='broadcast_messages')
    op.drop_column('broadcast_messages', 'deleted_at')
    
    # Message attachments table
    op.drop_index('idx_message_attachments_deleted_at', table_name='message_attachments')
    op.drop_column('message_attachments', 'deleted_at')
    
    # Thread messages table
    op.drop_index('idx_thread_messages_deleted_at', table_name='thread_messages')
    op.drop_column('thread_messages', 'deleted_at')
    
    # Message threads table
    op.drop_index('idx_message_threads_deleted_at', table_name='message_threads')
    op.drop_column('message_threads', 'deleted_at')
    
    # Inquiries table
    op.drop_index('idx_inquiries_deleted_at', table_name='inquiries')
    op.drop_column('inquiries', 'deleted_at')
    
    # Project applications table
    op.drop_index('idx_project_applications_deleted_at', table_name='project_applications')
    op.drop_column('project_applications', 'deleted_at')
    
    # Member profiles table
    op.drop_index('idx_member_profiles_deleted_at', table_name='member_profiles')
    op.drop_column('member_profiles', 'deleted_at')
    
    # Members table
    op.drop_index('idx_members_deleted_at', table_name='members')
    op.drop_column('members', 'deleted_at')
