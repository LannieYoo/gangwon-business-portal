"""merge_nice_dnb_with_messages_and_rep_fields

Revision ID: 775835a1b01d
Revises: 66311c7f31f0, c9a6c5f8c0c1
Create Date: 2025-12-15 21:59:30.803267

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '775835a1b01d'
down_revision: Union[str, Sequence[str], None] = ('66311c7f31f0', 'c9a6c5f8c0c1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
