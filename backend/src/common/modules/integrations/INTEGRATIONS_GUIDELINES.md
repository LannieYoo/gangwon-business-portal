# Integrations 模块规范

## 目录结构

```
integrations/
├── __init__.py           # 模块入口
└── nice_dnb/             # Nice D&B API 集成
    ├── __init__.py
    ├── service.py        # API 客户端
    ├── schemas.py        # 数据模型
    └── README.md         # API 文档
```

## Nice D&B API 集成

### 使用方式

```python
from src.common.modules.integrations.nice_dnb import nice_dnb_client

# 查询企业信息
response = await nice_dnb_client.search_company(
    business_number="1234567890"
)

if response and response.success:
    company = response.data
    print(f"企业名称: {company.company_name}")
    print(f"代表人: {company.representative}")
    print(f"地址: {company.address}")
    print(f"行业: {company.industry}")
    print(f"信用等级: {company.credit_grade}")
    
    # 财务数据
    for financial in response.financials:
        print(f"{financial.year}年: 营收 {financial.revenue}, 利润 {financial.profit}")

# 验证企业
is_valid = await nice_dnb_client.verify_company(
    business_number="1234567890",
    company_name="企业名称"  # 可选，用于名称匹配验证
)
```

### 配置项

在 `.env` 中配置：

```env
NICE_DNB_API_KEY=your_api_key
NICE_DNB_API_SECRET_KEY=your_secret_key
NICE_DNB_API_URL=https://gate.nicednb.com
NICE_DNB_OAUTH_TOKEN_ENDPOINT=https://gate.nicednb.com/nice/oauth/v1.0/accesstoken
NICE_DNB_COMPANY_INFO_ENDPOINT=https://gate.nicednb.com/api/endpoint
```

### 数据模型

```python
from src.common.modules.integrations.nice_dnb import (
    NiceDnBResponse,
    NiceDnBCompanyData,
    NiceDnBFinancialData
)

# 企业基本信息
class NiceDnBCompanyData:
    business_number: str      # 事业者登录番号
    company_name: str         # 企业名称
    representative: str       # 代表人
    address: str              # 地址
    industry: str             # 行业
    established_date: date    # 成立日期
    credit_grade: str         # 信用等级
    legal_number: str         # 法人番号
    company_name_en: str      # 英文名称
    phone: str                # 电话
    email: str                # 邮箱
    company_scale: str        # 企业规模
    company_type: str         # 企业类型
    employee_count: int       # 员工数
    sales_amount: int         # 销售额（千韩元）
    operating_profit: int     # 营业利润（千韩元）

# 财务数据
class NiceDnBFinancialData:
    year: int                 # 年度
    revenue: int              # 营收（韩元）
    profit: int               # 利润（韩元）
    employees: int            # 员工数
```

### OAuth 认证

客户端自动处理 OAuth 2.0 认证：
- 使用 Client Credentials Grant 流程
- 自动缓存 access token
- token 过期前 5 分钟自动刷新

### 错误处理

```python
response = await nice_dnb_client.search_company(business_number)

if response is None:
    # API 未配置或请求失败
    pass
elif not response.success:
    # API 返回错误
    pass
else:
    # 成功获取数据
    company = response.data
```

## 添加新集成

1. 在 `integrations/` 下创建新目录
2. 实现 `service.py`（客户端）和 `schemas.py`（数据模型）
3. 在 `__init__.py` 中导出
4. 创建 `README.md` 或 `*_GUIDELINES.md` 文档

```
integrations/
├── nice_dnb/
└── new_service/
    ├── __init__.py
    ├── service.py
    ├── schemas.py
    └── README.md
```

## 注意事项

1. API 密钥未配置时返回 `None`，不抛出异常
2. 网络错误记录日志但不中断业务流程
3. 事业者登录番号自动去除连字符
4. 财务金额单位：API 返回千韩元，转换后为韩元
