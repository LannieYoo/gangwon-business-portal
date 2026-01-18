"""add_view_count_to_projects

Revision ID: 24b6df71a64d
Revises: 20260117204708
Create Date: 2026-01-18 10:35:03.720850

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '24b6df71a64d'
down_revision: Union[str, Sequence[str], None] = '20260117204708'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('projects', sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('projects', 'view_count')
