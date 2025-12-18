"""Fix is_read and is_important columns to boolean type

Revision ID: fix_is_read_boolean
Revises: f2g3h4i5j6k7
Create Date: 2024-12-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fix_is_read_boolean'
down_revision: Union[str, None] = 'f2g3h4i5j6k7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Convert messages table - drop default first, then change type, then set new default
    op.execute("ALTER TABLE messages ALTER COLUMN is_read DROP DEFAULT")
    op.execute("ALTER TABLE messages ALTER COLUMN is_important DROP DEFAULT")
    op.execute("""
        ALTER TABLE messages 
        ALTER COLUMN is_read TYPE boolean 
        USING CASE WHEN is_read = 'true' THEN true ELSE false END
    """)
    op.execute("""
        ALTER TABLE messages 
        ALTER COLUMN is_important TYPE boolean 
        USING CASE WHEN is_important = 'true' THEN true ELSE false END
    """)
    op.execute("ALTER TABLE messages ALTER COLUMN is_read SET DEFAULT false")
    op.execute("ALTER TABLE messages ALTER COLUMN is_important SET DEFAULT false")
    
    # Convert thread_messages table
    op.execute("ALTER TABLE thread_messages ALTER COLUMN is_read DROP DEFAULT")
    op.execute("ALTER TABLE thread_messages ALTER COLUMN is_important DROP DEFAULT")
    op.execute("""
        ALTER TABLE thread_messages 
        ALTER COLUMN is_read TYPE boolean 
        USING CASE WHEN is_read = 'true' THEN true ELSE false END
    """)
    op.execute("""
        ALTER TABLE thread_messages 
        ALTER COLUMN is_important TYPE boolean 
        USING CASE WHEN is_important = 'true' THEN true ELSE false END
    """)
    op.execute("ALTER TABLE thread_messages ALTER COLUMN is_read SET DEFAULT false")
    op.execute("ALTER TABLE thread_messages ALTER COLUMN is_important SET DEFAULT false")
    
    # Convert broadcast_recipients table
    op.execute("ALTER TABLE broadcast_recipients ALTER COLUMN is_read DROP DEFAULT")
    op.execute("""
        ALTER TABLE broadcast_recipients 
        ALTER COLUMN is_read TYPE boolean 
        USING CASE WHEN is_read = 'true' THEN true ELSE false END
    """)
    op.execute("ALTER TABLE broadcast_recipients ALTER COLUMN is_read SET DEFAULT false")


def downgrade() -> None:
    # Convert back to varchar
    op.execute("ALTER TABLE messages ALTER COLUMN is_read TYPE varchar(10) USING CASE WHEN is_read THEN 'true' ELSE 'false' END")
    op.execute("ALTER TABLE messages ALTER COLUMN is_important TYPE varchar(10) USING CASE WHEN is_important THEN 'true' ELSE 'false' END")
    
    op.execute("ALTER TABLE thread_messages ALTER COLUMN is_read TYPE varchar(10) USING CASE WHEN is_read THEN 'true' ELSE 'false' END")
    op.execute("ALTER TABLE thread_messages ALTER COLUMN is_important TYPE varchar(10) USING CASE WHEN is_important THEN 'true' ELSE 'false' END")
    
    op.execute("ALTER TABLE broadcast_recipients ALTER COLUMN is_read TYPE varchar(10) USING CASE WHEN is_read THEN 'true' ELSE 'false' END")
