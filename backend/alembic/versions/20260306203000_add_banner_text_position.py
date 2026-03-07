"""add banner text position field

Revision ID: 20260306203000
Revises: 20260306195500
Create Date: 2026-03-06 20:30:00

"""
from alembic import op
import sqlalchemy as sa


revision = '20260306203000'
down_revision = '20260306195500'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add banner text position field."""
    op.add_column('banners', sa.Column('text_position', sa.String(length=20), nullable=True))
    op.execute("UPDATE banners SET text_position = 'left' WHERE text_position IS NULL")


def downgrade() -> None:
    """Remove banner text position field."""
    op.drop_column('banners', 'text_position')
