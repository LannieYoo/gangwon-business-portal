"""add banner style fields

Revision ID: 20260306195500
Revises: 20260201002335
Create Date: 2026-03-06 19:55:00

"""
from alembic import op
import sqlalchemy as sa


revision = '20260306195500'
down_revision = '20260201002335'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add banner style fields and migrate existing temporary style values."""
    op.add_column('banners', sa.Column('text_theme', sa.String(length=20), nullable=True))
    op.add_column('banners', sa.Column('overlay_strength', sa.String(length=20), nullable=True))

    op.execute("""
        UPDATE banners
        SET text_theme = CASE
            WHEN title_zh IN ('light', 'dark') THEN title_zh
            ELSE COALESCE(text_theme, 'light')
        END
        WHERE text_theme IS NULL
    """)

    op.execute("""
        UPDATE banners
        SET overlay_strength = CASE
            WHEN subtitle_zh IN ('soft', 'medium', 'strong') THEN subtitle_zh
            ELSE COALESCE(overlay_strength, 'medium')
        END
        WHERE overlay_strength IS NULL
    """)


def downgrade() -> None:
    """Remove banner style fields."""
    op.drop_column('banners', 'overlay_strength')
    op.drop_column('banners', 'text_theme')
