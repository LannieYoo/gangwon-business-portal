"""Add trace fields to audit_logs table

Revision ID: b3c4d5e6f7g8
Revises: 9a59faed8acd
Create Date: 2025-12-22

Add trace_id, request_id, request_method, request_path fields to audit_logs table
to match the format of app_logs table for consistency.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b3c4d5e6f7g8'
down_revision = '9a59faed8acd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to audit_logs table
    op.add_column('audit_logs', sa.Column('trace_id', sa.String(100), nullable=True))
    op.add_column('audit_logs', sa.Column('request_id', sa.String(100), nullable=True))
    op.add_column('audit_logs', sa.Column('request_method', sa.String(10), nullable=True))
    op.add_column('audit_logs', sa.Column('request_path', sa.String(500), nullable=True))
    
    # Add index for trace_id for better query performance
    op.create_index('idx_audit_logs_trace_id', 'audit_logs', ['trace_id'])


def downgrade() -> None:
    # Remove index
    op.drop_index('idx_audit_logs_trace_id', table_name='audit_logs')
    
    # Remove columns
    op.drop_column('audit_logs', 'request_path')
    op.drop_column('audit_logs', 'request_method')
    op.drop_column('audit_logs', 'request_id')
    op.drop_column('audit_logs', 'trace_id')
