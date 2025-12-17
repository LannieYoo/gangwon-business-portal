"""add_deleted_at_to_all_tables

Revision ID: b2c3d4e5f6a7
Revises: d1e2f3g4h5i6
Create Date: 2025-12-16 23:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'd1e2f3g4h5i6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add deleted_at column to all tables for soft delete."""
    # FAQs
    op.add_column('faqs', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_faqs_deleted_at', 'faqs', ['deleted_at'], unique=False)
    
    # Notices
    op.add_column('notices', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_notices_deleted_at', 'notices', ['deleted_at'], unique=False)
    
    # Press Releases
    op.add_column('press_releases', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_press_releases_deleted_at', 'press_releases', ['deleted_at'], unique=False)
    
    # Banners
    op.add_column('banners', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_banners_deleted_at', 'banners', ['deleted_at'], unique=False)
    

    # Projects
    op.add_column('projects', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_projects_deleted_at', 'projects', ['deleted_at'], unique=False)
    
    # Performance Records
    op.add_column('performance_records', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_performance_records_deleted_at', 'performance_records', ['deleted_at'], unique=False)
    
    # Files/Attachments
    op.add_column('attachments', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index('idx_attachments_deleted_at', 'attachments', ['deleted_at'], unique=False)


def downgrade() -> None:
    """Remove deleted_at columns from all tables."""
    # Files/Attachments
    op.drop_index('idx_attachments_deleted_at', table_name='attachments')
    op.drop_column('attachments', 'deleted_at')
    
    # Performance Records
    op.drop_index('idx_performance_records_deleted_at', table_name='performance_records')
    op.drop_column('performance_records', 'deleted_at')
    
    # Projects
    op.drop_index('idx_projects_deleted_at', table_name='projects')
    op.drop_column('projects', 'deleted_at')
    

    # Banners
    op.drop_index('idx_banners_deleted_at', table_name='banners')
    op.drop_column('banners', 'deleted_at')
    
    # Press Releases
    op.drop_index('idx_press_releases_deleted_at', table_name='press_releases')
    op.drop_column('press_releases', 'deleted_at')
    
    # Notices
    op.drop_index('idx_notices_deleted_at', table_name='notices')
    op.drop_column('notices', 'deleted_at')
    
    # FAQs
    op.drop_index('idx_faqs_deleted_at', table_name='faqs')
    op.drop_column('faqs', 'deleted_at')

