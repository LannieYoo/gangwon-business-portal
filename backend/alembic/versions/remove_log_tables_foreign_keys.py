"""Remove foreign key constraints from log tables

Log tables should not have foreign key constraints because:
1. Users may be deleted but logs should be preserved
2. Logs may reference users that don't exist (e.g., from token)
3. Foreign keys cause insert failures when user_id is invalid

Revision ID: remove_log_fk_001
Revises: rebuild_log_tables_001
Create Date: 2025-12-23
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'remove_log_fk_001'
down_revision = 'rebuild_log_tables_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Remove foreign key constraints from log tables."""
    
    # Remove foreign key from app_logs
    op.drop_constraint('app_logs_user_id_fkey', 'app_logs', type_='foreignkey')
    
    # Remove foreign key from error_logs
    op.drop_constraint('error_logs_user_id_fkey', 'error_logs', type_='foreignkey')
    
    # Remove foreign key from performance_logs
    op.drop_constraint('performance_logs_user_id_fkey', 'performance_logs', type_='foreignkey')


def downgrade() -> None:
    """Re-add foreign key constraints to log tables."""
    
    # Re-add foreign key to app_logs
    op.create_foreign_key(
        'app_logs_user_id_fkey',
        'app_logs',
        'members',
        ['user_id'],
        ['id']
    )
    
    # Re-add foreign key to error_logs
    op.create_foreign_key(
        'error_logs_user_id_fkey',
        'error_logs',
        'members',
        ['user_id'],
        ['id']
    )
    
    # Re-add foreign key to performance_logs
    op.create_foreign_key(
        'performance_logs_user_id_fkey',
        'performance_logs',
        'members',
        ['user_id'],
        ['id']
    )
