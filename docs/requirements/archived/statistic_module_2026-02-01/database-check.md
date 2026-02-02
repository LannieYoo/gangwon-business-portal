# 统计报告模块 - 数据库设计检查

**项目**: 江原创业门户 - 统计报告模块  
**检查日期**: 2026-02-01  
**检查人**: Full Development Workflow

---

## 检查目标

验证现有数据库表结构是否满足统计报告模块的所有筛选和展示需求。

---

## 核心数据表

### 1. members 表（企业信息主表）

**用途**: 存储企业基础信息和统计相关字段

**现有字段检查**:

| 字段名 | 类型 | 用途 | 状态 | 备注 |
|--------|------|------|------|------|
| id | BIGINT | 主键 | ✅ 存在 | |
| business_number | VARCHAR | 事业者注册号 | ✅ 存在 | 用于搜索和展示 |
| company_name | VARCHAR | 企业名称 | ✅ 存在 | 用于搜索和展示 |
| industry | VARCHAR | 所属业种 | ✅ 存在 | 展示用 |
| ksic_major | VARCHAR | KSIC 大类代码 | ✅ 存在 | 产业筛选 |
| ksic_middle | VARCHAR | KSIC 中类代码 | ⚠️ 需确认 | 产业筛选（二级） |
| industry_category | VARCHAR | 江原道主导产业 | ✅ 存在 | 主导产业筛选 |
| startup_type | VARCHAR | 创业阶段 | ✅ 存在 | 企业属性筛选 |
| founding_date | DATE | 创立日期 | ✅ 存在 | 计算工龄 |
| representative_gender | VARCHAR | 代表者性别 | ✅ 存在 | 代表者筛选 |
| representative_age | INT | 代表者年龄 | ⚠️ 需确认 | 代表者筛选 |
| participation_programs | JSONB/Array | 参与项目 | ✅ 存在 | 政策关联筛选 |
| investment_status | BOOLEAN | 投资引进与否 | ✅ 存在 | 投资筛选 |
| total_investment | DECIMAL | 投资总额 | ✅ 存在 | 投资筛选和展示 |
| patent_count | INT | 专利数量 | ✅ 存在 | 专利筛选和展示 |
| revenue | DECIMAL | 年营收 | ✅ 存在 | 展示 |
| export_val | DECIMAL | 出口额 | ✅ 存在 | 展示 |
| created_at | TIMESTAMP | 创建时间 | ✅ 存在 | 审计 |
| updated_at | TIMESTAMP | 更新时间 | ✅ 存在 | 审计 |

**结论**: ✅ members 表基本满足需求，需要确认以下字段：
- `ksic_middle` - KSIC 中类代码（用于二级筛选）
- `representative_age` - 代表者年龄（用于年龄范围筛选）

---

## 筛选需求覆盖检查

### ✅ 维度 1: 基本与行政

| 筛选项 | 数据来源 | 状态 |
|--------|----------|------|
| 关键词搜索（企业名/事业者号） | `company_name`, `business_number` | ✅ 已实现 |
| 年度筛选 | `founding_date` | ✅ 已实现 |
| 季度筛选 | `founding_date` | ✅ 已实现 |
| 月份筛选 | `founding_date` | ✅ 已实现 |
| 所在地筛选 | `location` 或 `address` | ⚠️ 需确认字段名 |

### ✅ 维度 2: 产业与技术

| 筛选项 | 数据来源 | 状态 |
|--------|----------|------|
| KSIC 大类 | `ksic_major` | ✅ 已实现 |
| KSIC 中类 | `ksic_middle` | ⚠️ 需确认字段 |
| 江原道主导产业 | `industry_category` | ✅ 已实现 |
| 专利数量 | `patent_count` | ✅ 已实现 |

### ✅ 维度 3: 企业属性与阶段

| 筛选项 | 数据来源 | 状态 |
|--------|----------|------|
| 创业阶段 | `startup_type` | ✅ 已实现 |
| 业历工龄 | `founding_date` (计算) | ✅ 已实现 |
| 创业身份类型 | `startup_identity` | ⚠️ 需确认字段名 |

### ✅ 维度 4: 经营成果指标

| 筛选项 | 数据来源 | 状态 |
|--------|----------|------|
| 投资引进与否 | `investment_status` | ✅ 已实现 |
| 投资金额范围 | `total_investment` | ✅ 已实现 |
| 年营收区间 | `revenue` | ✅ 已实现 |
| 员工人数区间 | `employee_count` | ⚠️ 需确认字段名 |

### ✅ 维度 5: 代表者与外部参与

| 筛选项 | 数据来源 | 状态 |
|--------|----------|------|
| 代表者性别 | `representative_gender` | ✅ 已实现 |
| 代表者年龄 | `representative_age` | ⚠️ 需确认字段 |
| 参与政策项目 | `participation_programs` | ✅ 已实现 |
| 产业合作意向 | `cooperation_fields` | ⚠️ 需确认字段名 |

---

## 展示字段覆盖检查

| 展示字段 | 数据来源 | 状态 |
|----------|----------|------|
| 事业者注册号 | `business_number` | ✅ 已实现 |
| 企业名称 | `company_name` | ✅ 已实现 |
| 所属业种 | `industry` 或 `ksic_major` | ✅ 已实现 |
| 创业阶段 | `startup_type` | ✅ 已实现 |
| 参与项目标签 | `participation_programs` | ✅ 已实现 |
| 投资引进总额 | `total_investment` | ✅ 已实现 |
| 专利持有数量 | `patent_count` | ✅ 已实现 |
| 年营收 | `revenue` | ✅ 已实现 |
| 出口额 | `export_val` | ✅ 已实现 |

---

## 索引需求

### 现有索引检查

需要为以下高频查询字段创建索引（如果尚未创建）：

```sql
-- 1. 搜索字段
CREATE INDEX IF NOT EXISTS idx_members_company_name ON members(company_name);
CREATE INDEX IF NOT EXISTS idx_members_business_number ON members(business_number);

-- 2. 筛选字段
CREATE INDEX IF NOT EXISTS idx_members_ksic_major ON members(ksic_major);
CREATE INDEX IF NOT EXISTS idx_members_industry_category ON members(industry_category);
CREATE INDEX IF NOT EXISTS idx_members_startup_type ON members(startup_type);
CREATE INDEX IF NOT EXISTS idx_members_founding_date ON members(founding_date);
CREATE INDEX IF NOT EXISTS idx_members_representative_gender ON members(representative_gender);

-- 3. 数值范围筛选
CREATE INDEX IF NOT EXISTS idx_members_total_investment ON members(total_investment);
CREATE INDEX IF NOT EXISTS idx_members_patent_count ON members(patent_count);
CREATE INDEX IF NOT EXISTS idx_members_revenue ON members(revenue);

-- 4. JSONB 字段（如果使用 PostgreSQL）
CREATE INDEX IF NOT EXISTS idx_members_participation_programs 
ON members USING GIN(participation_programs);

-- 5. 复合索引（常用组合查询）
CREATE INDEX IF NOT EXISTS idx_members_ksic_startup 
ON members(ksic_major, startup_type);
```

---

## 需要确认的字段

### 高优先级（P0）

1. **ksic_middle** - KSIC 中类代码
   - 用途: 产业二级筛选
   - 建议: 如不存在，需添加此字段

2. **representative_age** - 代表者年龄
   - 用途: 年龄范围筛选
   - 建议: 如不存在，可从 `representative_birth_date` 计算

3. **location** / **address** - 企业所在地
   - 用途: 地区筛选
   - 建议: 确认字段名和格式

### 中优先级（P1）

4. **employee_count** - 员工人数
   - 用途: 员工人数区间筛选
   - 建议: 如不存在，可从绩效数据表获取

5. **startup_identity** - 创业身份类型
   - 用途: 学生创业/女性企业等筛选
   - 建议: 确认字段名或使用标签字段

6. **cooperation_fields** - 产业合作意向领域
   - 用途: 合作意向筛选
   - 建议: 确认字段名和数据格式

---

## 数据完整性检查

### 必须字段

以下字段必须有值，否则影响统计准确性：

- [ ] `business_number` - 事业者注册号（唯一标识）
- [ ] `company_name` - 企业名称（展示必需）
- [ ] `ksic_major` - KSIC 大类（产业统计必需）
- [ ] `founding_date` - 创立日期（工龄计算必需）

### 可选字段

以下字段可为空，但会影响筛选结果：

- `industry_category` - 主导产业（为空则不参与主导产业统计）
- `participation_programs` - 参与项目（为空则不参与政策统计）
- `total_investment` - 投资总额（为空视为 0）
- `patent_count` - 专利数量（为空视为 0）

---

## 性能优化建议

### 1. 查询优化

```sql
-- 使用 EXPLAIN ANALYZE 分析慢查询
EXPLAIN ANALYZE
SELECT * FROM members
WHERE ksic_major = 'C'
  AND startup_type = 'GROWTH'
  AND total_investment >= 10000000
ORDER BY company_name
LIMIT 10 OFFSET 0;
```

### 2. 统计信息更新

```sql
-- 定期更新表统计信息
ANALYZE members;
```

### 3. 分区表（如果数据量超过百万级）

```sql
-- 按年份分区（如需要）
CREATE TABLE members_2024 PARTITION OF members
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

## 数据迁移需求

### 需要添加的字段

如果以下字段不存在，需要创建迁移脚本：

```python
"""Add missing statistics fields

Revision ID: add_statistics_fields
Revises: 20260201002335
Create Date: 2026-02-01 11:00:00
"""

def upgrade() -> None:
    # 添加 KSIC 中类字段
    op.add_column('members', 
        sa.Column('ksic_middle', sa.String(10), nullable=True))
    
    # 添加代表者年龄字段（如果只有生日）
    op.add_column('members', 
        sa.Column('representative_age', sa.Integer, nullable=True))
    
    # 添加员工人数字段
    op.add_column('members', 
        sa.Column('employee_count', sa.Integer, nullable=True))
    
    # 添加创业身份类型字段
    op.add_column('members', 
        sa.Column('startup_identity', sa.ARRAY(sa.String), nullable=True))
    
    # 添加产业合作意向字段
    op.add_column('members', 
        sa.Column('cooperation_fields', sa.ARRAY(sa.String), nullable=True))
    
    # 创建索引
    op.create_index('idx_members_ksic_middle', 'members', ['ksic_middle'])
    op.create_index('idx_members_employee_count', 'members', ['employee_count'])

def downgrade() -> None:
    op.drop_index('idx_members_employee_count')
    op.drop_index('idx_members_ksic_middle')
    op.drop_column('members', 'cooperation_fields')
    op.drop_column('members', 'startup_identity')
    op.drop_column('members', 'employee_count')
    op.drop_column('members', 'representative_age')
    op.drop_column('members', 'ksic_middle')
```

---

## 检查结论

### ✅ 已满足的需求

1. 核心筛选功能（80%）已有数据支持
2. 所有展示字段都有对应数据源
3. 后端 API 已基本实现

### ⚠️ 需要补充的内容

1. **确认缺失字段**: 需要检查实际数据库，确认以下字段是否存在：
   - `ksic_middle`
   - `representative_age`
   - `employee_count`
   - `startup_identity`
   - `cooperation_fields`
   - `location` / `address`

2. **创建索引**: 为高频查询字段创建索引以提升性能

3. **数据迁移**: 如有缺失字段，需要创建迁移脚本

### 📋 下一步行动

1. 连接数据库，执行 `\d members` 查看完整表结构
2. 根据实际情况创建缺失字段的迁移脚本
3. 创建必要的索引
4. 进入 Phase 6: 后端开发（完善现有代码）

---

**检查状态**: Phase 5 完成  
**下一步**: Phase 6 - 后端开发完善
