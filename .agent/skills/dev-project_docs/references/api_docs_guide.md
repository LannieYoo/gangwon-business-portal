# API 文档编写指南

本指南提供 API 文档的详细编写规范和示例。

## OpenAPI 规范示例

```yaml
openapi: 3.0.3
info:
  title: 项目 API
  description: 项目的 RESTful API 文档
  version: 1.0.0
  contact:
    name: API 支持
    email: api-support@example.com
servers:
  - url: https://api.example.com/v1
    description: 生产环境
  - url: https://staging-api.example.com/v1
    description: 测试环境
paths:
  /users:
    get:
      summary: 获取用户列表
      description: 分页获取用户列表
      parameters:
        - name: page
          in: query
          description: 页码
          required: false
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          description: 每页数量
          required: false
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        "200":
          description: 成功返回用户列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          description: 用户ID
        name:
          type: string
          description: 用户名
        email:
          type: string
          format: email
          description: 邮箱地址
    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        pages:
          type: integer
```

## FastAPI 自动文档

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI()

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="项目 API",
        version="1.0.0",
        description="项目的 RESTful API",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

## 端点文档模板

每个 API 端点应包含：

1. **端点路径和方法**
2. **功能描述**
3. **请求参数**（路径参数、查询参数、请求体）
4. **响应格式**（成功和错误响应）
5. **使用示例**
6. **错误代码说明**

### 示例

```markdown
## POST /api/v1/users

创建新用户。

### 请求体

| 参数     | 类型   | 必填 | 说明             |
| -------- | ------ | ---- | ---------------- |
| name     | string | 是   | 用户名，2-50字符 |
| email    | string | 是   | 邮箱地址         |
| password | string | 是   | 密码，至少8位    |

### 响应

**成功 (201)**
\`\`\`json
{
"id": 123,
"name": "张三",
"email": "zhangsan@example.com",
"created_at": "2024-01-20T10:30:00Z"
}
\`\`\`

**错误 (400)**
\`\`\`json
{
"error": "VALIDATION_ERROR",
"message": "邮箱格式无效"
}
\`\`\`

### 示例请求

\`\`\`bash
curl -X POST https://api.example.com/v1/users \
 -H "Content-Type: application/json" \
 -d '{"name": "张三", "email": "zhangsan@example.com", "password": "secure123"}'
\`\`\`
```

## 认证文档

API 认证机制应清晰说明：

```markdown
## 认证

本 API 使用 Bearer Token 认证。

### 获取 Token

使用用户凭据向 `/api/v1/auth/login` 发送 POST 请求。

### 使用 Token

在请求头中添加：
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

### Token 刷新

Token 有效期为 24 小时。使用 `/api/v1/auth/refresh` 刷新过期 Token。
```

## 工具推荐

| 工具       | 用途                |
| ---------- | ------------------- |
| Swagger UI | 交互式 API 文档     |
| Redoc      | 美观的 API 文档展示 |
| Postman    | API 测试和文档      |
| Stoplight  | API 设计和协作      |
