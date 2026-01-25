---
name: dev-security_review
description: 安全审查专家。Use when (1) implementing authentication, (2) handling user input, (3) working with secrets, (4) creating API endpoints, (5) implementing payment/sensitive features.
---

# 安全审查 Skill

确保所有代码遵循安全最佳实践并识别潜在漏洞。

## 触发场景

- 实现认证或授权
- 处理用户输入或文件上传
- 创建新的 API 端点
- 处理密钥或凭证
- 实现支付功能
- 存储或传输敏感数据
- 集成第三方 API

## 安全检查清单

### 1. 密钥管理

#### ❌ 错误做法

```python
# WRONG - 硬编码密钥
api_key = "sk-proj-xxxxx"
db_password = "password123"
```

#### ✅ 正确做法

```python
import os

api_key = os.getenv("OPENAI_API_KEY")
db_url = os.getenv("DATABASE_URL")

# 验证密钥存在
if not api_key:
    raise ValueError("OPENAI_API_KEY not configured")
```

#### 验证步骤

- [ ] 无硬编码 API 密钥、令牌或密码
- [ ] 所有密钥在环境变量中
- [ ] `.env` 文件在 .gitignore 中
- [ ] Git 历史中无密钥
- [ ] 生产密钥在托管平台（Azure, Vercel）

### 2. 输入验证

#### 始终验证用户输入

```python
from pydantic import BaseModel, Field, validator

class CreateUserRequest(BaseModel):
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    username: str = Field(..., min_length=3, max_length=50)

    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.replace('_', '').isalnum():
            raise ValueError('用户名必须是字母数字')
        return v.lower()
```

```typescript
import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
});

export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input);
    return await db.users.create(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    throw error;
  }
}
```

#### 文件上传验证

```python
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file_upload(file):
    # 大小检查
    if file.size > MAX_FILE_SIZE:
        raise ValueError("文件过大（最大 5MB）")

    # 类型检查
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("不支持的文件类型")

    return True
```

#### 验证步骤

- [ ] 所有用户输入使用 schema 验证
- [ ] 文件上传限制（大小、类型、扩展名）
- [ ] 不直接在查询中使用用户输入
- [ ] 使用白名单验证（非黑名单）
- [ ] 错误消息不泄露敏感信息

### 3. SQL 注入防护

#### ❌ 错误 - 字符串拼接

```python
# DANGEROUS - SQL 注入漏洞
query = f"SELECT * FROM users WHERE email = '{user_email}'"
await db.execute(query)
```

#### ✅ 正确 - 参数化查询

```python
# 安全 - 参数化查询
from sqlalchemy import select

stmt = select(User).where(User.email == user_email)
result = await db.execute(stmt)

# 或使用原生 SQL
await db.execute(
    "SELECT * FROM users WHERE email = $1",
    [user_email]
)
```

#### 验证步骤

- [ ] 所有数据库查询使用参数化
- [ ] SQL 中无字符串拼接
- [ ] ORM/查询构建器正确使用

### 4. 认证与授权

#### JWT 令牌处理

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials = Depends(security)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="无效令牌")
        return await user_service.get_user(user_id)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="无效令牌")
```

#### 授权检查

```python
async def delete_user(user_id: str, requester: User = Depends(get_current_user)):
    # 始终先验证授权
    if requester.role != 'admin':
        raise HTTPException(status_code=403, detail="权限不足")

    await user_service.delete_user(user_id)
```

#### 验证步骤

- [ ] 令牌存储在 httpOnly cookie（非 localStorage）
- [ ] 敏感操作前有授权检查
- [ ] 实施基于角色的访问控制
- [ ] 会话管理安全

### 5. XSS 防护

#### 净化 HTML

```python
import bleach

ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p']

def sanitize_html(content: str) -> str:
    return bleach.clean(content, tags=ALLOWED_TAGS, strip=True)
```

```typescript
import DOMPurify from 'isomorphic-dompurify'

function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### 验证步骤

- [ ] 用户提供的 HTML 已净化
- [ ] CSP 头已配置
- [ ] 无未验证的动态内容渲染

### 6. CSRF 防护

```python
from fastapi import Request, HTTPException

async def verify_csrf_token(request: Request):
    token = request.headers.get("X-CSRF-Token")
    session_token = request.session.get("csrf_token")

    if not token or token != session_token:
        raise HTTPException(status_code=403, detail="无效 CSRF 令牌")
```

#### 验证步骤

- [ ] 状态更改操作有 CSRF 令牌
- [ ] 所有 cookie 设置 SameSite=Strict

### 7. 速率限制

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/search")
@limiter.limit("10/minute")  # 每分钟 10 次请求
async def search(request: Request, query: str):
    return await search_service.search(query)
```

#### 验证步骤

- [ ] 所有 API 端点有速率限制
- [ ] 昂贵操作有更严格的限制
- [ ] 基于 IP 的速率限制
- [ ] 认证用户的用户级限制

### 8. 敏感数据暴露

#### 日志

```python
# ❌ 错误 - 记录敏感数据
logger.info(f"用户登录: email={email}, password={password}")

# ✅ 正确 - 编辑敏感数据
logger.info(f"用户登录: email={email}, user_id={user_id}")
```

#### 错误消息

```python
# ❌ 错误 - 暴露内部细节
except Exception as e:
    return {"error": str(e), "stack": traceback.format_exc()}

# ✅ 正确 - 通用错误消息
except Exception as e:
    logger.exception(f"内部错误: {e}")
    return {"error": "发生错误，请重试"}
```

#### 验证步骤

- [ ] 日志中无密码、令牌或密钥
- [ ] 用户错误消息是通用的
- [ ] 详细错误仅在服务器日志
- [ ] 不向用户暴露堆栈跟踪

### 9. 依赖安全

```bash
# Python - 检查漏洞
pip-audit

# Node.js - 检查漏洞
npm audit

# 修复可自动修复的问题
npm audit fix

# 检查过时的包
npm outdated
```

#### 验证步骤

- [ ] 依赖是最新的
- [ ] 无已知漏洞
- [ ] 锁文件已提交
- [ ] GitHub Dependabot 已启用

## 安全测试

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_requires_authentication(client: AsyncClient):
    response = await client.get("/api/protected")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_requires_admin_role(client: AsyncClient, user_token: str):
    response = await client.get(
        "/api/admin",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_rejects_invalid_input(client: AsyncClient):
    response = await client.post(
        "/api/users",
        json={"email": "not-an-email"}
    )
    assert response.status_code == 400
```

## 部署前安全检查清单

在任何生产部署前：

- [ ] **密钥**: 无硬编码密钥，全部在环境变量中
- [ ] **输入验证**: 所有用户输入已验证
- [ ] **SQL 注入**: 所有查询参数化
- [ ] **XSS**: 用户内容已净化
- [ ] **CSRF**: 防护已启用
- [ ] **认证**: 正确的令牌处理
- [ ] **授权**: 角色检查到位
- [ ] **速率限制**: 所有端点已启用
- [ ] **HTTPS**: 生产环境强制使用
- [ ] **安全头**: CSP, X-Frame-Options 已配置
- [ ] **错误处理**: 错误中无敏感数据
- [ ] **日志**: 无敏感数据记录
- [ ] **依赖**: 最新，无漏洞
- [ ] **CORS**: 正确配置
- [ ] **文件上传**: 已验证（大小、类型）

## 资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI 安全](https://fastapi.tiangolo.com/tutorial/security/)
- [Web 安全学院](https://portswigger.net/web-security)

---

**记住**：安全不是可选的。一个漏洞可能危及整个平台。有疑问时，宁可过于谨慎。
