---
name: backend-utils
description: 后端实用工具脚本集合，包括数据库检查、日志管理、迁移合并等开发工具。
---

# Backend Utilities Skill

后端开发实用工具脚本集合，用于数据库管理、日志监控和开发辅助。

## 脚本位置

本 skill 包含的脚本已迁移到：
- `.claude/skills/backend-utils/scripts/check_db.py` - 数据库日志检查
- `.claude/skills/backend-utils/scripts/check_columns.py` - 数据库表结构检查
- `.claude/skills/backend-utils/scripts/check_logs.py` - 日志内容检查
- `.claude/skills/backend-utils/scripts/clear_logs.py` - 清空日志数据
- `.claude/skills/backend-utils/scripts/squash_migrations.py` - 合并迁移文件
- `.claude/skills/backend-utils/scripts/test_member_profile.py` - 会员功能测试

> **注意**: 原始 `backend/scripts/` 目录下的这些脚本可以安全删除。

## 可用工具

### 1. 数据库日志检查器

**脚本**: `check_db.py`

**功能**:
- 查询系统日志表数据
- 检查日志字段内容
- 验证日志记录格式

**使用方法**:
```bash
python .claude/skills/backend-utils/scripts/check_db.py
```

**输出示例**:
```
=== 系统日志字段检查 ===
module: auth
message长度: 45
extra_data: {"user_id": "123"}
---
module: api
message长度: 62
extra_data: {"endpoint": "/api/users"}
---
```

**适用场景**:
- 调试日志记录问题
- 验证日志格式
- 检查日志完整性

### 2. 表结构检查器

**脚本**: `check_columns.py`

**功能**:
- 查询数据库表的列结构
- 验证表结构是否正确
- 检查字段是否存在

**使用方法**:
```bash
python .claude/skills/backend-utils/scripts/check_columns.py
```

**输出示例**:
```
app_logs columns: ['id', 'created_at', 'level', 'module', 'message', 'extra_data']
```

**适用场景**:
- 迁移后验证表结构
- 检查字段是否正确添加
- 排查 SQL 查询错误

### 3. 日志内容检查器

**脚本**: `check_logs.py`

**功能**:
- 查看最近的日志记录
- 分析日志内容
- 监控系统运行状态

**使用方法**:
```bash
python .claude/skills/backend-utils/scripts/check_logs.py
```

**适用场景**:
- 监控应用运行状态
- 调试生产问题
- 审计系统行为

### 4. 日志清理工具

**脚本**: `clear_logs.py`

**功能**:
- 清空所有日志表数据
- 重置日志记录
- 释放数据库空间

**使用方法**:
```bash
python .claude/skills/backend-utils/scripts/clear_logs.py
```

**输出示例**:
```
=== 清空日志数据 ===
✓ app_logs: 删除 1250 条记录
✓ error_logs: 删除 45 条记录
✓ performance_logs: 删除 3200 条记录
✓ audit_logs: 删除 580 条记录
✓ system_logs: 删除 920 条记录

完成!
```

**⚠️ 警告**:
- 仅在开发/测试环境使用
- 清空后数据无法恢复
- 生产环境请谨慎使用

**适用场景**:
- 开发环境数据重置
- 测试前清理数据
- 释放测试环境空间

### 5. 迁移文件合并工具

**脚本**: `squash_migrations.py`

**功能**:
- 删除所有现有迁移文件
- 准备创建全新的初始迁移
- 清理迁移历史

**使用方法**:
```bash
python .claude/skills/backend-utils/scripts/squash_migrations.py
```

**交互流程**:
```
============================================================
Migration Squash Script
============================================================

Found 47 migration files

This will DELETE all migration files. Continue? (yes/no): yes

Deleting migration files...
  Deleting: 001_initial.py
  Deleting: 002_add_users.py
  ...

Clearing __pycache__...

============================================================
Migration files deleted!
============================================================

Next steps:
1. Drop and recreate your database (or use a fresh one)
2. Run: alembic revision --autogenerate -m 'Initial schema'
3. Run: alembic upgrade head
============================================================
```

**⚠️ 警告**:
- 仅在开发环境使用
- 会删除所有迁移文件
- 需要重新创建数据库
- 生产环境禁止使用

**适用场景**:
- 迁移文件过多需要整理
- 重构数据库架构
- 清理开发历史
- 准备发布初始版本

**后续步骤**:
```bash
# 1. 删除旧数据库（本地开发）
dropdb your_database_name
createdb your_database_name

# 2. 生成新的初始迁移
alembic revision --autogenerate -m 'Initial schema'

# 3. 应用迁移
alembic upgrade head

# 4. 验证
alembic current
```

### 6. 会员功能测试

**脚本**: `test_member_profile.py`

**功能**:
- 测试会员注册和登录
- 测试会员资料更新
- 验证 API 接口

**使用方法**:
```bash
python .claude/skills/backend-utils/scripts/test_member_profile.py
```

**适用场景**:
- 手动测试会员功能
- 验证 API 响应
- 调试会员模块

## 工作流场景

### 场景 1: 开发环境重置

**需求**: 清理开发环境，准备新一轮测试

```bash
# 1. 清空日志
python .claude/skills/backend-utils/scripts/clear_logs.py

# 2. 检查表结构
python .claude/skills/backend-utils/scripts/check_columns.py

# 3. 重新生成测试数据
python .claude/skills/backend-test-data/scripts/generate_test_data.py
```

### 场景 2: 调试日志问题

**需求**: 应用日志未正确记录，需要排查

```bash
# 1. 检查日志表数据
python .claude/skills/backend-utils/scripts/check_db.py

# 2. 查看日志内容
python .claude/skills/backend-utils/scripts/check_logs.py

# 3. 检查表结构是否正确
python .claude/skills/backend-utils/scripts/check_columns.py
```

### 场景 3: 迁移文件整理

**需求**: 47个迁移文件太乱，需要合并为单个初始迁移

```bash
# 1. 备份当前数据库结构
pg_dump -s your_database > schema_backup.sql

# 2. 运行合并脚本
python .claude/skills/backend-utils/scripts/squash_migrations.py
# 输入: yes

# 3. 删除并重建数据库
dropdb your_database_name
createdb your_database_name

# 4. 生成新的初始迁移
alembic revision --autogenerate -m 'Initial schema'

# 5. 应用迁移
alembic upgrade head

# 6. 验证
alembic current
```

### 场景 4: 生产问题排查

**需求**: 生产环境出现问题，需要查看日志

```bash
# 1. 查看最近的错误日志
python .claude/skills/backend-utils/scripts/check_logs.py

# 2. 检查系统日志
python .claude/skills/backend-utils/scripts/check_db.py

# 注意: 不要在生产环境运行 clear_logs.py!
```

## 环境配置

### 前置条件

1. **环境变量**

   在 `backend/.env.local` 中设置：
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

2. **Python 依赖**
   ```bash
   pip install supabase python-dotenv sqlalchemy alembic
   ```

### 数据库连接

所有脚本都使用 Supabase 客户端：
```python
from supabase import create_client
import os

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY')
client = create_client(url, key)
```

## 最佳实践

### 1. 日志管理

**定期清理**:
```bash
# 每周清理一次开发环境日志
python .claude/skills/backend-utils/scripts/clear_logs.py
```

**生产环境**:
- 不要手动清理日志
- 使用 Supabase 的自动清理策略
- 设置日志保留期限

### 2. 迁移管理

**开发阶段**:
- 频繁创建小迁移
- 测试充分后再合并
- 保持迁移文件简洁

**准备发布**:
- 合并所有迁移为初始迁移
- 清理开发历史
- 创建干净的起点

**生产环境**:
- 永不合并迁移
- 保持迁移历史完整
- 只能向前迁移

### 3. 测试流程

**功能测试**:
```bash
# 1. 清理环境
python .claude/skills/backend-utils/scripts/clear_logs.py

# 2. 生成测试数据
python .claude/skills/backend-test-data/scripts/generate_test_data.py

# 3. 运行功能测试
python .claude/skills/backend-utils/scripts/test_member_profile.py

# 4. 检查日志
python .claude/skills/backend-utils/scripts/check_logs.py
```

### 4. 故障排查

**系统性排查**:
1. 检查表结构 (`check_columns.py`)
2. 检查日志记录 (`check_db.py`)
3. 查看日志内容 (`check_logs.py`)
4. 复现问题
5. 修复后验证

## 安全注意事项

### ⚠️ 重要

1. **环境隔离**
   - 开发环境：可自由使用所有工具
   - 测试环境：谨慎使用清理工具
   - 生产环境：禁止使用清理和合并工具

2. **数据备份**
   - 清理前先备份
   - 迁移前先备份
   - 生产操作前必须备份

3. **权限控制**
   - 使用 SERVICE_KEY 需谨慎
   - 不要在代码中硬编码密钥
   - 使用 `.env.local`（已在 .gitignore）

## 故障排除

### Q: "错误: 找不到 SUPABASE_URL"

**A**: 检查环境变量
```bash
# 确认文件存在
ls backend/.env.local

# 检查内容
cat backend/.env.local

# 确保包含
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
```

### Q: 清理日志失败

**A**: 检查权限和表存在性
```bash
# 检查表是否存在
python .claude/skills/backend-utils/scripts/check_columns.py

# 确认使用 SERVICE_KEY 而非 ANON_KEY
```

### Q: 迁移合并后出错

**A**: 按步骤重新操作
1. 确保备份了数据库结构
2. 重新创建数据库
3. 重新生成初始迁移
4. 逐步应用和测试

### Q: 脚本导入错误

**A**: 从正确的目录运行
```bash
# ✅ GOOD: 从项目根目录
python .claude/skills/backend-utils/scripts/check_db.py

# ❌ BAD: 从脚本目录
cd .claude/skills/backend-utils/scripts
python check_db.py  # 可能失败
```

## 集成 Claude Code

### 自动化建议

当用户提到相关任务时，Claude Code 应该：

1. **清理日志**: 识别关键词 "清理日志"、"清空日志"
2. **检查数据库**: 识别关键词 "检查数据库"、"查看日志"
3. **合并迁移**: 识别关键词 "合并迁移"、"整理迁移"

```
User: 清理开发环境的日志

Claude: 正在清理日志...
python .claude/skills/backend-utils/scripts/clear_logs.py

=== 清空日志数据 ===
✓ app_logs: 删除 1250 条记录
✓ error_logs: 删除 45 条记录
...

完成！
```

## 相关 Skills

- [backend-test-data](../backend-test-data/SKILL.md) - 测试数据生成
- [backend-code-quality](../backend-code-quality/SKILL.md) - 代码质量检查

---

**记住**: 这些是开发辅助工具，要根据环境谨慎使用。生产环境操作前务必三思！
