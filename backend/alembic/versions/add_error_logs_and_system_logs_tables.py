"""add error_logs and system_logs tables

Revision ID: f2g3h4i5j6k7
Revises: d6888861afb9
Create Date: 2025-12-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f2g3h4i5j6k7'
down_revision: Union[str, None] = 'd6888861afb9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create error_logs and system_logs tables."""
    
    # Create error_logs table
    op.create_table(
        'error_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('source', sa.String(length=20), nullable=False),
        sa.Column('error_type', sa.String(length=255), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=False),
        sa.Column('error_code', sa.String(length=100), nullable=True),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('stack_trace', sa.Text(), nullable=True),
        sa.Column('module', sa.String(length=255), nullable=True),
        sa.Column('function', sa.String(length=255), nullable=True),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.Column('trace_id', sa.String(length=100), nullable=True),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('request_method', sa.String(length=10), nullable=True),
        sa.Column('request_path', sa.String(length=500), nullable=True),
        sa.Column('request_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('error_details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('context_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['members.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for error_logs
    op.create_index('idx_error_logs_source_type', 'error_logs', ['source', 'error_type', 'created_at'], unique=False)
    op.create_index('idx_error_logs_trace_id', 'error_logs', ['trace_id'], unique=False)
    op.create_index('idx_error_logs_user_id', 'error_logs', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_error_logs_created', 'error_logs', ['created_at'], unique=False)
    
    # Create system_logs table
    op.create_table(
        'system_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('level', sa.String(length=20), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('logger_name', sa.String(length=255), nullable=True),
        sa.Column('module', sa.String(length=255), nullable=True),
        sa.Column('function', sa.String(length=255), nullable=True),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.Column('process_id', sa.Integer(), nullable=True),
        sa.Column('thread_name', sa.String(length=100), nullable=True),
        sa.Column('extra_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for system_logs
    op.create_index('idx_system_logs_level', 'system_logs', ['level', 'created_at'], unique=False)
    op.create_index('idx_system_logs_logger', 'system_logs', ['logger_name', 'created_at'], unique=False)
    op.create_index('idx_system_logs_created', 'system_logs', ['created_at'], unique=False)


def downgrade() -> None:
    """Drop error_logs and system_logs tables."""
    
    # Drop indexes for system_logs
    op.drop_index('idx_system_logs_created', table_name='system_logs')
    op.drop_index('idx_system_logs_logger', table_name='system_logs')
    op.drop_index('idx_system_logs_level', table_name='system_logs')
    
    # Drop indexes for error_logs
    op.drop_index('idx_error_logs_created', table_name='error_logs')
    op.drop_index('idx_error_logs_user_id', table_name='error_logs')
    op.drop_index('idx_error_logs_trace_id', table_name='error_logs')
    op.drop_index('idx_error_logs_source_type', table_name='error_logs')
    
    # Drop tables
    op.drop_table('system_logs')
    op.drop_table('error_logs')
