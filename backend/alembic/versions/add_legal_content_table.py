"""Add legal content table for terms of service and privacy policy

Revision ID: add_legal_content_table
Revises: add_contact_person_fields
Create Date: 2024-12-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = 'add_legal_content_table'
down_revision = 'add_contact_person_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create legal_content table for terms of service and privacy policy."""
    op.create_table(
        'legal_content',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('content_type', sa.String(50), nullable=False, unique=True),  # 'terms_of_service' or 'privacy_policy'
        sa.Column('content_html', sa.Text(), nullable=False),
        sa.Column('updated_by', UUID(as_uuid=True), nullable=True),
        sa.Column('updated_at', TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()),
        sa.Column('created_at', TIMESTAMP(timezone=True), server_default=func.now()),
    )
    
    # Create index on content_type for faster lookups
    op.create_index('idx_legal_content_type', 'legal_content', ['content_type'])


def downgrade() -> None:
    """Drop legal_content table."""
    op.drop_index('idx_legal_content_type', table_name='legal_content')
    op.drop_table('legal_content')
