"""drop_messages_sender_id_fkey

Revision ID: 9a59faed8acd
Revises: add_soft_delete_fields
Create Date: 2025-12-22 11:15:20.833510

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a59faed8acd'
down_revision: Union[str, Sequence[str], None] = 'add_soft_delete_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop the foreign key constraint that only allows sender_id from members table
    # This is needed because sender_id can be either a member ID or an admin ID
    op.drop_constraint('messages_unified_sender_id_fkey', 'messages', type_='foreignkey')


def downgrade() -> None:
    """Downgrade schema."""
    # Recreate the foreign key constraint (only if you want to rollback)
    op.create_foreign_key(
        'messages_unified_sender_id_fkey',
        'messages',
        'members',
        ['sender_id'],
        ['id']
    )
