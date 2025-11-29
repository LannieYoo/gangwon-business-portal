# Nice D&B API Integration Module

Nice D&B API 集成模块，用于企业信息验证和查询。

## 功能特性

- ✅ 企业信息查询（通过营业执照号）
- ✅ 企业信息验证
- ✅ 财务数据获取
- ✅ 企业洞察和指标
- ✅ OAuth 2.0 Client Credentials 认证（自动 token 获取和缓存）
- ✅ 错误处理和日志记录
- ✅ 异步 API 调用

## 配置

在 `.env` 文件中配置以下环境变量：

```env
# Nice D&B API Configuration
# API documentation: https://openapi.nicednb.com/#/
NICE_DNB_API_KEY=your-nice-dnb-api-key
NICE_DNB_API_SECRET_KEY=your-nice-dnb-secret-key
NICE_DNB_API_URL=https://openapi.nicednb.com  # Official OpenAPI base URL
```

### 获取 API Key 和 Secret Key

1. 访问 [Nice D&B OpenAPI 文档](https://openapi.nicednb.com/#/)
2. 注册开发者账号并登录
3. 在开发者中心创建应用程序并获取 API Key (Client ID) 和 Secret Key (Client Secret)
4. 查看 [OAuth 认证文档](https://openapi.nicednb.com/#/guide/common/oauth) 了解认证流程
5. 注意：API Key 和 Secret Key 都需要配置，否则 API 调用将被跳过

### OAuth 2.0 认证

本模块实现了 OAuth 2.0 Client Credentials Grant 流程：

1. **自动 Token 获取**：首次调用 API 时自动获取 OAuth access token
2. **Token 缓存**：Token 会被缓存，避免频繁请求
3. **自动刷新**：Token 过期前 5 分钟自动刷新
4. **Bearer Token**：使用获取的 access token 作为 Bearer Token 进行 API 调用

认证流程：
- 使用 `client_id` (API Key) 和 `client_secret` (Secret Key) 向 OAuth token 端点发送请求
- 获取 `access_token` 和 `expires_in`（过期时间）
- 在后续 API 请求中使用 `Authorization: Bearer {access_token}` 头

**Token 端点**（可能需要根据实际文档调整）：
- `/oauth/token`
- `/oauth2/token`
- `/api/oauth/token`

## 使用方法

### 基本用法

```python
from ...common.modules.integrations.nice_dnb import nice_dnb_client

# 查询企业信息
response = await nice_dnb_client.search_company("123-45-67890")

if response:
    print(f"Company: {response.data.company_name}")
    print(f"Credit Grade: {response.data.credit_grade}")
    print(f"Financials: {len(response.financials)} years")
    print(f"Insights: {len(response.insights)} items")
else:
    print("API not configured or request failed")

# 验证企业信息
is_valid = await nice_dnb_client.verify_company(
    business_number="123-45-67890",
    company_name="Example Corp"
)
```

### 在 API 端点中使用

```python
from fastapi import APIRouter, Query, Depends
from ...common.modules.integrations.nice_dnb import nice_dnb_client

@router.get("/api/admin/members/nice-dnb")
async def search_nice_dnb(
    business_number: str = Query(...),
    current_user: Member = Depends(get_current_admin_user),
):
    response = await nice_dnb_client.search_company(business_number)
    
    if not response:
        raise HTTPException(
            status_code=503,
            detail="Nice D&B API is not available"
        )
    
    return {
        "success": response.success,
        "data": {
            "businessNumber": response.data.business_number,
            "companyName": response.data.company_name,
            # ... other fields
        },
        "financials": [...],
        "insights": [...]
    }
```

## 数据结构

### NiceDnBCompanyData

企业基本信息：

```python
{
    "business_number": "1234567890",
    "company_name": "Example Corp",
    "representative": "홍길동",
    "address": "강원특별자치도 춘천시 중앙로 1",
    "industry": "제조업",
    "established_date": "2018-05-10",
    "credit_grade": "A+",
    "risk_level": "low",
    "summary": "최근 3년 연속 매출 성장을 기록한 안정적인 기업으로 평가되었습니다."
}
```

### NiceDnBFinancialData

财务数据（按年度）：

```python
{
    "year": 2024,
    "revenue": 4500000000,  # KRW
    "profit": 540000000,    # KRW
    "employees": 220
}
```

### NiceDnBInsight

企业洞察和指标：

```python
{
    "label": "수출 비중",
    "value": "45%",
    "trend": "up"  # "up", "down", or "steady"
}
```

## API 端点

### GET /api/admin/members/nice-dnb

查询 Nice D&B 企业信息（仅管理员）。

**查询参数：**
- `business_number` (required): 营业执照号

**响应格式：**

```json
{
    "success": true,
    "data": {
        "businessNumber": "1234567890",
        "companyName": "Example Corp",
        "representative": "홍길동",
        "address": "강원특별자치도 춘천시 중앙로 1",
        "industry": "제조업",
        "establishedDate": "2018-05-10",
        "creditGrade": "A+",
        "riskLevel": "low",
        "summary": "..."
    },
    "financials": [
        {
            "year": 2024,
            "revenue": 4500000000,
            "profit": 540000000,
            "employees": 220
        }
    ],
    "insights": [
        {
            "label": "수출 비중",
            "value": "45%",
            "trend": "up"
        }
    ]
}
```

## 待完成事项

以下内容需要根据实际的 Nice D&B API 文档进行更新：

1. **API URL**: ✅ 已更新为官方 OpenAPI 基础 URL `https://openapi.nicednb.com`（参考：https://openapi.nicednb.com/#/）
2. **OAuth Token 端点**: ✅ 已实现 OAuth 2.0 Client Credentials 流程，但需要确认实际的 token 端点路径：
   - 当前使用 `/oauth/token`，可能需要调整为 `/oauth2/token` 或其他路径
   - 参考文档：https://openapi.nicednb.com/#/guide/common/oauth
3. **API 端点路径**: 当前使用 `/v1/companies/{business_number}`，需要确认实际路径：
   - 可能为 `/api/v1/companies/{business_number}`
   - 或 `/companies/{business_number}`
   - 或 `/api/company/search?business_number={business_number}`
4. **响应映射**: `_parse_response` 方法中的字段映射需要根据实际 API 响应结构调整
5. **错误处理**: 根据实际 API 错误响应格式优化错误处理

## 错误处理

- 如果 API Key 或 Secret Key 未配置，方法会返回 `None` 并记录警告日志
- 如果 API 请求失败，会记录错误日志并返回 `None`
- 在 API 端点中，如果返回 `None`，会返回 503 Service Unavailable 错误

## 注意事项

- API Key (Client ID) 和 Secret Key (Client Secret) 都是必需的，如果未配置，所有方法都会返回 `None`
- 所有 API 调用都是异步的，需要使用 `await`
- 请求超时时间设置为 30 秒
- OAuth token 会自动缓存，避免频繁请求 token 端点
- Token 会在过期前 5 分钟自动刷新
- 建议在生产环境中实现数据缓存机制（24 小时缓存，如文档中提到的）
- 建议实现重试机制以提高可靠性
- OAuth 认证使用标准的 Client Credentials Grant 流程，符合 OAuth 2.0 规范

## 集成位置

Nice D&B API 已集成到以下模块：

1. **会员模块** (`member/router.py`)
   - `GET /api/admin/members/nice-dnb` - 管理员查询企业信息

## 依赖

- `httpx` - 异步 HTTP 客户端（通过 supabase 依赖自动安装）
- `pydantic` - 数据验证和序列化

## 测试

在开发环境中，如果 API Key 未配置，API 调用会返回 `None`，不会影响其他功能。建议：

1. 配置测试 API Key
2. 使用 Mock 数据进行前端开发（已实现）
3. 在生产环境部署前验证 API 配置和响应格式

