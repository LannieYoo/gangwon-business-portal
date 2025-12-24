# DB 数据库模块

## 概述

提供数据库会话管理和 ORM 模型定义。

> ⚠️ 注意：项目正在迁移到 Supabase，新代码应使用 `supabase_service`。

## 文件结构

```
db/
├── __init__.py       # 模块导出
├── session.py        # 会话管理
└── models.py         # ORM 模型
```

## 使用方式

### 获取数据库会话

```python
from ...common.modules.db import get_db

async def my_endpoint(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM members"))
    return result.fetchall()
```

### ORM 模型

```python
from ...common.modules.db import Member, Project

# 模型已在 models.py 中定义
```

## 可用模型

| 模型 | 表名 | 说明 |
|------|------|------|
| `Member` | members | 会员 |
| `PerformanceRecord` | performance_records | 绩效记录 |
| `Project` | projects | 项目 |
| `ProjectApplication` | project_applications | 项目申请 |
| `Attachment` | attachments | 附件 |
| `Notice` | notices | 公告 |
| `PressRelease` | press_releases | 新闻 |
| `FAQ` | faqs | 常见问题 |
| `AuditLog` | audit_logs | 审计日志 |

## 推荐做法

新代码应使用 Supabase 服务：

```python
from ...common.modules.supabase.service import supabase_service

# 查询
members = await supabase_service.list_members()

# 更新
await supabase_service.update_member(member_id, data)
```

## 数据库迁移

使用 Alembic 管理迁移：

```bash
# 生成迁移
alembic revision --autogenerate -m "Description"

# 应用迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```
