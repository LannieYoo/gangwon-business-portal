"""merge_drop_exceptions_rename_app_logs

Revision ID: d6888861afb9
Revises: e7f8g9h0i1j2, e1f2g3h4i5j6
Create Date: 2025-12-18 00:22:38.747762

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6888861afb9'
down_revision: Union[str, Sequence[str], None] = ('e7f8g9h0i1j2', 'e1f2g3h4i5j6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
