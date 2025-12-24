"""Drop reviewer_id foreign key from performance_records

The reviewer_id field references admins, not members.
Remove the incorrect foreign key constraint to members table.

Revision ID: drop_reviewer_id_fkey
Revises: drop_unified_fk
Create Date: 2025-12-24

"""
from alembic import op

revision = 'drop_reviewer_id_fkey'
down_revision = 'drop_unified_fk'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Drop the incorrect foreign key constraint on reviewer_id."""
    op.execute('ALTER TABLE performance_records DROP CONSTRAINT IF EXISTS fk_performance_records_reviewer_id')


def downgrade() -> None:
    """Recreate the foreign key constraint (not recommended)."""
    op.create_foreign_key(
        'fk_performance_records_reviewer_id',
        'performance_records',
        'members',
        ['reviewer_id'],
        ['id'],
        ondelete='SET NULL'
    )
