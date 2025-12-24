# Alembic 数据库迁移规范

## 目录结构

```
alembic/
├── env.py              # 迁移环境配置
├── script.py.mako      # 迁移脚本模板
├── versions/           # 迁移版本文件
└── ALEMBIC_GUIDELINES.md
```

## 常用命令

```bash
# 在 backend 目录下执行

# 查看当前版本
alembic current

# 查看迁移历史
alembic history

# 创建新迁移（自动生成）
alembic revision --autogenerate -m "add_users_table"

# 创建空迁移（手动编写）
alembic revision -m "custom_migration"

# 升级到最新版本
alembic upgrade head

# 升级到指定版本
alembic upgrade <revision_id>

# 回滚一个版本
alembic downgrade -1

# 回滚到指定版本
alembic downgrade <revision_id>

# 查看待执行的 SQL（不实际执行）
alembic upgrade head --sql
```

## 迁移文件命名

```
# 自动生成格式
<revision_id>_<message>.py

# 示例
50749983e8a1_add_admins_table.py
15e8f88ef4d4_initial_schema.py

# 手动命名格式（日期前缀）
20241218_fix_is_read_boolean.py
```

## 迁移文件结构

```python
"""add_users_table

Revision ID: abc123def456
Revises: previous_revision_id
Create Date: 2024-12-18 10:30:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'abc123def456'
down_revision: Union[str, Sequence[str], None] = 'previous_revision_id'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), 
                  server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
```

## 常用操作示例

### 创建表

```python
op.create_table(
    'table_name',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(255), nullable=False),
    sa.Column('status', sa.String(20), server_default='active'),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), 
              server_default=sa.text('now()')),
    sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
)
```

### 添加列

```python
op.add_column('table_name', 
    sa.Column('new_column', sa.String(100), nullable=True))
```

### 删除列

```python
op.drop_column('table_name', 'column_name')
```

### 修改列

```python
op.alter_column('table_name', 'column_name',
    existing_type=sa.String(100),
    type_=sa.String(255),
    existing_nullable=True)
```

### 添加索引

```python
op.create_index('ix_table_column', 'table_name', ['column_name'], unique=False)
```

### 添加外键

```python
op.create_foreign_key(
    'fk_orders_user_id',
    'orders', 'users',
    ['user_id'], ['id'],
    ondelete='CASCADE'
)
```

### 删除外键

```python
op.drop_constraint('fk_orders_user_id', 'orders', type_='foreignkey')
```

## 合并分支

当出现多个 head 时：

```bash
# 查看所有 head
alembic heads

# 合并分支
alembic merge -m "merge_heads" <revision1> <revision2>
```

## 数据库连接

迁移使用 `DIRECT_URL` 或 `DATABASE_URL` 环境变量：

```env
# .env.local
DIRECT_URL=postgresql://user:pass@host:5432/dbname
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
```

`env.py` 自动将 `asyncpg` URL 转换为同步 URL。

## 注意事项

1. **先测试再执行** - 使用 `--sql` 预览 SQL
2. **保持 downgrade 可用** - 确保回滚逻辑正确
3. **避免数据丢失** - 删除列前考虑数据迁移
4. **生产环境谨慎** - 大表操作可能锁表
5. **提交迁移文件** - 迁移文件需要纳入版本控制
6. **不要修改已执行的迁移** - 创建新迁移来修复问题

## 与 Models 同步

模型定义在 `src/common/modules/db/models.py`，修改模型后：

```bash
# 自动生成迁移
alembic revision --autogenerate -m "描述变更"

# 检查生成的迁移文件
# 确认 upgrade() 和 downgrade() 逻辑正确

# 执行迁移
alembic upgrade head
```
