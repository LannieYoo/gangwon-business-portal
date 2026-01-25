---
name: dev-api-design
description: RESTful API 设计专家。Use when (1) 设计 API 端点, (2) 定义 API 契约, (3) 版本管理, (4) 错误处理, (5) API 文档, (6) 前后端接口对接
---

# API Design Expert

## Objectives

- 设计清晰、一致的 RESTful API
- 定义前后端契约（OpenAPI/Swagger）
- 实现合理的错误处理和状态码
- 提供完善的 API 文档
- 支持 API 版本管理

## RESTful API Design Principles

### 1. Resource Naming

**Good Practices**:
```
GET    /api/v1/documents           # 获取文档列表
GET    /api/v1/documents/{id}      # 获取单个文档
POST   /api/v1/documents           # 创建文档
PUT    /api/v1/documents/{id}      # 更新文档（完整）
PATCH  /api/v1/documents/{id}      # 更新文档（部分）
DELETE /api/v1/documents/{id}      # 删除文档

# 嵌套资源
GET    /api/v1/documents/{id}/comments
POST   /api/v1/documents/{id}/comments

# 操作（非 CRUD）
POST   /api/v1/documents/{id}/publish
POST   /api/v1/documents/{id}/archive
```

**Bad Practices**:
```
❌ GET  /api/v1/getDocuments
❌ POST /api/v1/createDocument
❌ GET  /api/v1/document_list
❌ POST /api/v1/documents/delete/{id}
```

### 2. HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | 获取资源 | ✅ | ✅ |
| POST | 创建资源 | ❌ | ❌ |
| PUT | 完整更新 | ✅ | ❌ |
| PATCH | 部分更新 | ❌ | ❌ |
| DELETE | 删除资源 | ✅ | ❌ |

### 3. Status Codes

**Success Codes**:
- `200 OK` - 成功（GET, PUT, PATCH）
- `201 Created` - 创建成功（POST）
- `204 No Content` - 成功但无返回内容（DELETE）

**Client Error Codes**:
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 未认证
- `403 Forbidden` - 无权限
- `404 Not Found` - 资源不存在
- `409 Conflict` - 资源冲突
- `422 Unprocessable Entity` - 验证失败
- `429 Too Many Requests` - 请求过多

**Server Error Codes**:
- `500 Internal Server Error` - 服务器错误
- `502 Bad Gateway` - 网关错误
- `503 Service Unavailable` - 服务不可用

## API Contract (OpenAPI/Swagger)

### OpenAPI Specification Example

```yaml
openapi: 3.0.0
info:
  title: RAG Research Assistant API
  version: 1.0.0
  description: API for document management and RAG queries

servers:
  - url: http://localhost:8000/api/v1
    description: Development server
  - url: https://api.example.com/api/v1
    description: Production server

paths:
  /documents:
    get:
      summary: List documents
      tags:
        - Documents
      parameters:
        - name: skip
          in: query
          schema:
            type: integer
            default: 0
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentListResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

    post:
      summary: Create document
      tags:
        - Documents
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DocumentCreate'
      responses:
        '201':
          description: Document created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
        '400':
          $ref: '#/components/responses/BadRequestError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  /documents/{documentId}:
    get:
      summary: Get document by ID
      tags:
        - Documents
      parameters:
        - name: documentId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
        '404':
          $ref: '#/components/responses/NotFoundError'

components:
  schemas:
    Document:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        content:
          type: string
        user_id:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
      required:
        - id
        - title
        - content

    DocumentCreate:
      type: object
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 200
        content:
          type: string
          minLength: 1
      required:
        - title
        - content

    DocumentListResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Document'
        total:
          type: integer
        page:
          type: integer
        page_size:
          type: integer

    Error:
      type: object
      properties:
        detail:
          type: string
        code:
          type: string

  responses:
    UnauthorizedError:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    NotFoundError:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    BadRequestError:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

## Request/Response Patterns

### 1. Pagination

**Query Parameters**:
```
GET /api/v1/documents?skip=0&limit=10
```

**Response**:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 10,
  "has_next": true,
  "has_prev": false
}
```

### 2. Filtering

```
GET /api/v1/documents?status=published&author=john
GET /api/v1/documents?created_after=2024-01-01
```

### 3. Sorting

```
GET /api/v1/documents?sort=created_at&order=desc
GET /api/v1/documents?sort=-created_at  # - for descending
```

### 4. Field Selection

```
GET /api/v1/documents?fields=id,title,created_at
```

### 5. Search

```
GET /api/v1/documents/search?q=machine+learning
```

## Error Response Format

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      },
      {
        "field": "content",
        "message": "Content must be at least 10 characters"
      }
    ]
  }
}
```

### Error Codes

```typescript
enum ErrorCode {
  // Client Errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}
```

## API Versioning

### URL Versioning (Recommended)

```
/api/v1/documents
/api/v2/documents
```

**Pros**: Clear, easy to route, cacheable
**Cons**: Multiple versions in codebase

### Header Versioning

```
GET /api/documents
Accept: application/vnd.api+json; version=1
```

**Pros**: Clean URLs
**Cons**: Harder to test, less visible

## Authentication & Authorization

### JWT Bearer Token

**Request**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Login Endpoint**:
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## Rate Limiting

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Response when exceeded**:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

## File Upload

### Multipart Form Data

```
POST /api/v1/documents/upload
Content-Type: multipart/form-data

file: [binary data]
title: "Document Title"
metadata: {"key": "value"}
```

### Response

```json
{
  "id": "123",
  "filename": "document.pdf",
  "size": 1024000,
  "content_type": "application/pdf",
  "url": "https://storage.example.com/documents/123.pdf"
}
```

## Webhooks

### Webhook Payload

```json
{
  "event": "document.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "123",
    "title": "New Document",
    "user_id": "456"
  }
}
```

### Webhook Signature

```
X-Webhook-Signature: sha256=abc123...
```

## API Documentation

### FastAPI Auto-Generated Docs

```python
from fastapi import FastAPI

app = FastAPI(
    title="RAG Research Assistant API",
    description="API for document management and RAG queries",
    version="1.0.0",
    docs_url="/docs",        # Swagger UI
    redoc_url="/redoc",      # ReDoc
    openapi_url="/openapi.json"
)

@app.post(
    "/documents",
    response_model=DocumentResponse,
    status_code=201,
    summary="Create a new document",
    description="Create a new document with title and content",
    responses={
        201: {"description": "Document created successfully"},
        400: {"description": "Invalid input"},
        401: {"description": "Unauthorized"},
    },
    tags=["Documents"]
)
async def create_document(document: DocumentCreate):
    pass
```

## TypeScript Type Generation

### Generate types from OpenAPI

```bash
# Install openapi-typescript
npm install -D openapi-typescript

# Generate types
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts
```

### Usage

```typescript
import type { paths } from './types/api';

type DocumentListResponse = paths['/api/v1/documents']['get']['responses']['200']['content']['application/json'];
type DocumentCreate = paths['/api/v1/documents']['post']['requestBody']['content']['application/json'];
```

## Best Practices

### 1. Consistency

- Use consistent naming (camelCase or snake_case, not both)
- Use consistent response formats
- Use consistent error handling

### 2. Idempotency

- GET, PUT, DELETE should be idempotent
- Use idempotency keys for POST requests

```
POST /api/v1/documents
Idempotency-Key: unique-key-123
```

### 3. HATEOAS (Optional)

```json
{
  "id": "123",
  "title": "Document",
  "_links": {
    "self": "/api/v1/documents/123",
    "comments": "/api/v1/documents/123/comments",
    "author": "/api/v1/users/456"
  }
}
```

### 4. Deprecation

```
Deprecation: true
Sunset: Sat, 31 Dec 2024 23:59:59 GMT
Link: <https://api.example.com/docs/migration>; rel="deprecation"
```

## Testing

### API Test Example (pytest)

```python
def test_create_document(client, auth_headers):
    response = client.post(
        "/api/v1/documents",
        json={"title": "Test", "content": "Content"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test"
    assert "id" in data
```

## Quick Reference

### HTTP Methods
- GET: Read
- POST: Create
- PUT: Update (full)
- PATCH: Update (partial)
- DELETE: Delete

### Status Codes
- 2xx: Success
- 4xx: Client error
- 5xx: Server error

### Headers
- Authorization: Bearer token
- Content-Type: application/json
- Accept: application/json

## Resources

- [REST API Tutorial](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [API Design Guide](https://cloud.google.com/apis/design)
