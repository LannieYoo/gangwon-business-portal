"""merge_target_company_and_deleted_at_branches

Revision ID: 372585e89aea
Revises: 865e7f1afd29, b2c3d4e5f6a7
Create Date: 2025-12-16 23:17:20.971468

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '372585e89aea'
down_revision: Union[str, Sequence[str], None] = ('865e7f1afd29', 'b2c3d4e5f6a7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
