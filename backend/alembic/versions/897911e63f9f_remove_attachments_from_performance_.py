"""remove_attachments_from_performance_records

Revision ID: 897911e63f9f
Revises: 24b6df71a64d
Create Date: 2026-01-18 14:23:27.233379

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '897911e63f9f'
down_revision: Union[str, Sequence[str], None] = '24b6df71a64d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('performance_records', 'attachments')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('performance_records', sa.Column('attachments', sa.dialects.postgresql.JSONB(), nullable=True))
