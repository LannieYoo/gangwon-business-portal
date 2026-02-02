# Page 10 需求实施 - 江原道产业分类字段

## 概述
根据 Page 10 需求，在企业信息中添加两个新的产业分类字段：
1. **강원도 7대 미래산업** (江原道7大未来产业)
2. **미래유망 신기술** (未来有望新技术)

## 实施日期
2026-02-01

## 数据库变更

### 迁移文件
- **文件**: `backend/alembic/versions/20260201002335_add_gangwon_industry_fields.py`
- **Revision ID**: 20260201002335
- **依赖**: 20260119222343, 441a201965a6 (合并点)

### 新增字段

#### members 表
| 字段名 | 类型 | 可空 | 说明 |
|--------|------|------|------|
| `gangwon_industry` | VARCHAR(50) | YES | 강원도 7대 미래산업 |
| `future_tech` | VARCHAR(50) | YES | 미래유망 신기술 |

### 字段值枚举

#### gangwon_industry (강원도 7대 미래산업)
- `semiconductor` - 반도체 (半导体)
- `bio_health` - 바이오헬스 (生物健康)
- `future_energy` - 미래에너지 (未来能源)
- `future_mobility` - 미래모빌리티 (未来移动)
- `food_tech` - 푸드테크 (食品科技)
- `advanced_defense` - 첨단방위 (尖端防卫)
- `climate_tech` - 기후테크 (气候科技)

#### future_tech (미래유망 신기술)
- `it` - 정보기술(IT) (信息技术)
- `bt` - 생명공학(BT) (生命工程)
- `nt` - 나노기술(NT) (纳米技术)
- `st` - 우주항공(ST) (宇宙航空)
- `et` - 환경공학(ET) (环境工程)
- `ct` - 문화기술(CT) (文化技术)
- `knu_tenant` - KNU 입주기업 (KNU入驻企业)

## 后端变更

### 1. 模型更新
**文件**: `backend/src/common/modules/db/models.py`

```python
# Page 10 requirements - 강원도 산업 분류
gangwon_industry = Column(String(50))  # 강원도 7대 미래산업
future_tech = Column(String(50))  # 미래유망 신기술
```

### 2. Schema 更新
**文件**: `backend/src/modules/member/schemas.py`

在 `MemberProfileUpdate` 中添加：
```python
# Page 10 requirements - 강원도 산업 분류
gangwon_industry: Optional[str] = Field(None, max_length=50)
future_tech: Optional[str] = Field(None, max_length=50)
```

### 3. Service 更新
**文件**: `backend/src/modules/member/service.py`

在 `update_member_profile` 方法中添加字段处理：
```python
# Page 10 requirements - 강원도 산업 분류
if data.gangwon_industry is not None:
    profile_update['gangwon_industry'] = data.gangwon_industry
if data.future_tech is not None:
    profile_update['future_tech'] = data.future_tech
```

## 前端变更

### 1. 共享数据定义
**文件**: `frontend/src/shared/data/industryClassification.js`

添加枚举：
```javascript
export const GANGWON_FUTURE_INDUSTRIES = [
  { value: 'semiconductor', labelKey: 'industryClassification.gangwonIndustry.semiconductor' },
  // ... 其他6个选项
];

export const FUTURE_TECHNOLOGIES = [
  { value: 'it', labelKey: 'industryClassification.futureTech.it' },
  // ... 其他6个选项
];
```

### 2. 会员端 - 企业资料管理
**文件**: `frontend/src/member/modules/performance/components/CompanyInfo/CompanyBusinessInfo.jsx`

- 添加两个 Select 组件
- 位置：在"주력산업 KSIC 세부 코드"后面

**Hook**: `frontend/src/member/modules/performance/hooks/useCompanyInfo.js`
- 添加 `gangwonIndustry` 和 `futureTech` 到 state
- 更新 `loadProfile` 和 `handleSave` 逻辑

### 3. 注册页面
**文件**: `frontend/src/member/modules/auth/components/RegisterStep4Business.jsx`

- 在第4步业务信息中添加两个选择框
- 位置：在"주력산업 KSIC 세부 코드"后面

### 4. 管理员端 - 会员详情
**文件**: `frontend/src/admin/modules/members/MemberDetail.jsx`

- 在业务信息卡片中显示这两个字段
- 位置：在"주력산업 KSIC 세부 코드"和"창업구분"之间

### 5. 翻译文件

#### Performance 模块
- `frontend/src/member/modules/performance/locales/ko.json`
- `frontend/src/member/modules/performance/locales/zh.json`

#### Auth 模块
- `frontend/src/member/modules/auth/locales/ko.json`
- `frontend/src/member/modules/auth/locales/zh.json`

#### Shared 翻译
- `frontend/src/shared/i18n/locales/ko.json`
- `frontend/src/shared/i18n/locales/zh.json`

## UI 布局

所有三个位置的字段布局一致：

```
第一行：
- 창업유형
- 사업 분야
- KSIC 대분류
- KSIC 중분류

第二行（主力产业区域）：
- 주력산업 KSIC 코드
- 주력산업 KSIC 세부 코드
- 강원도 7대 미래산업 ⭐ 新增
- 미래유망 신기술 ⭐ 新增

第三行：
- 창업구분
```

## 测试要点

### 1. 注册流程
- [ ] 在注册第4步可以选择这两个字段
- [ ] 选择后可以成功提交注册
- [ ] 数据正确保存到数据库

### 2. 企业资料管理
- [ ] 可以查看现有值
- [ ] 可以编辑和更新这两个字段
- [ ] 保存后数据正确更新

### 3. 管理员端
- [ ] 在会员详情页面可以查看这两个字段
- [ ] 显示正确的翻译文本

### 4. 数据验证
- [ ] 字段值符合枚举定义
- [ ] 可以为空（非必填）
- [ ] 翻译在韩语和中文下都正确显示

## 回滚方案

如需回滚，执行：
```bash
cd backend
uv run alembic downgrade -1
```

这将移除 `gangwon_industry` 和 `future_tech` 字段。

## 相关文档
- 需求文档: `docs/requirements/active/창업톡_수정사항_260130_截图版.md` (Page 10)
- 产业分类数据源: `frontend/src/shared/data/industryClassification.js`
- 迁移历史: `backend/alembic/MIGRATION_HISTORY.md`
