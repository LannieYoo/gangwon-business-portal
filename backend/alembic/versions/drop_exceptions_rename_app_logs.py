"""drop application_exceptions table and rename application_logs to app_logs

Revision ID: e1f2g3h4i5j6
Revises: fb6b4ef9db06
Create Date: 2025-12-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e1f2g3h4i5j6'
down_revision: Union[str, None] = 'fb6b4ef9db06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Drop application_exceptions table and rename application_logs to app_logs."""
    
    # Drop indexes for application_exceptions
    op.drop_index('idx_app_exceptions_created', table_name='application_exceptions')
    op.drop_index('idx_app_exceptions_resolved', table_name='application_exceptions')
    op.drop_index('idx_app_exceptions_user_id', table_name='application_exceptions')
    op.drop_index('idx_app_exceptions_trace_id', table_name='application_exceptions')
    op.drop_index('idx_app_exceptions_source_type', table_name='application_exceptions')
    op.drop_index(op.f('ix_application_exceptions_created_at'), table_name='application_exceptions')
    
    # Drop application_exceptions table
    op.drop_table('application_exceptions')
    
    # Rename application_logs table to app_logs
    op.rename_table('application_logs', 'app_logs')
    
    # Rename indexes for app_logs (optional but recommended for consistency)
    # The old indexes will still work but have old names


def downgrade() -> None:
    """Restore application_exceptions table and rename app_logs back to application_logs."""
    
    # Rename app_logs back to application_logs
    op.rename_table('app_logs', 'application_logs')
    
    # Recreate application_exceptions table
    op.create_table(
        'application_exceptions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('source', sa.String(length=20), nullable=False),
        sa.Column('exception_type', sa.String(length=255), nullable=False),
        sa.Column('exception_message', sa.Text(), nullable=False),
        sa.Column('error_code', sa.String(length=100), nullable=True),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('trace_id', sa.String(length=100), nullable=True),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('request_method', sa.String(length=10), nullable=True),
        sa.Column('request_path', sa.String(length=500), nullable=True),
        sa.Column('request_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('stack_trace', sa.Text(), nullable=True),
        sa.Column('exception_details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('context_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('resolved', sa.String(length=10), server_default='false', nullable=True),
        sa.Column('resolved_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.UUID(), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['members.id'], ),
        sa.ForeignKeyConstraint(['resolved_by'], ['members.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Recreate indexes for application_exceptions
    op.create_index('idx_app_exceptions_source_type', 'application_exceptions', ['source', 'exception_type', 'created_at'], unique=False)
    op.create_index('idx_app_exceptions_trace_id', 'application_exceptions', ['trace_id'], unique=False)
    op.create_index('idx_app_exceptions_user_id', 'application_exceptions', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_app_exceptions_resolved', 'application_exceptions', ['resolved', 'created_at'], unique=False)
    op.create_index('idx_app_exceptions_created', 'application_exceptions', ['created_at'], unique=False)
    op.create_index(op.f('ix_application_exceptions_created_at'), 'application_exceptions', ['created_at'], unique=False)
