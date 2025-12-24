"""Drop audit_logs user_id foreign key

Revision ID: c4d5e6f7g8h9
Revises: b3c4d5e6f7g8
Create Date: 2025-12-22

Drop the foreign key constraint on audit_logs.user_id so it can store
both member IDs and admin IDs.
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'c4d5e6f7g8h9'
down_revision = 'b3c4d5e6f7g8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the foreign key constraint
    op.drop_constraint('audit_logs_user_id_fkey', 'audit_logs', type_='foreignkey')


def downgrade() -> None:
    # Recreate the foreign key constraint
    op.create_foreign_key(
        'audit_logs_user_id_fkey',
        'audit_logs',
        'members',
        ['user_id'],
        ['id']
    )
