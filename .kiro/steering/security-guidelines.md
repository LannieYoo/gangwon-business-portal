---
inclusion: fileMatch
fileMatchPattern: "**/*.{py,ts,tsx,js,jsx,vue,env,config}"
---

# Security Guidelines (安全指南)

## Mandatory Security Checks (强制安全检查)

在**任何提交之前**必须检查：

- [ ] **无硬编码密钥** - 没有 API keys、passwords、tokens
- [ ] **输入验证** - 所有用户输入都经过验证
- [ ] **SQL 注入防护** - 使用参数化查询
- [ ] **XSS 防护** - HTML 输出经过转义
- [ ] **CSRF 保护** - 启用 CSRF 令牌
- [ ] **认证授权** - 验证用户权限
- [ ] **速率限制** - 所有端点都有限流
- [ ] **错误信息** - 不泄露敏感数据

## Secret Management (密钥管理)

### ❌ 永远不要：硬编码密钥

```python
# WRONG - 硬编码
OPENAI_API_KEY = "sk-proj-xxxxx"
DATABASE_URL = "postgresql://user:password@localhost/db"
```

```typescript
// WRONG - 硬编码
const apiKey = "sk-proj-xxxxx"
const secret = "my-secret-key"
```

### ✅ 始终使用：环境变量

```python
# CORRECT - 环境变量
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not configured")

DATABASE_URL = os.getenv("DATABASE_URL")
```

```typescript
// CORRECT - 环境变量
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

### 环境变量配置

```bash
# .env (不要提交到 Git!)
OPENAI_API_KEY=sk-proj-xxxxx
AZURE_OPENAI_KEY=xxxxx
DATABASE_URL=postgresql://localhost/db
SECRET_KEY=xxxxx

# .env.example (可以提交)
OPENAI_API_KEY=your_key_here
AZURE_OPENAI_KEY=your_key_here
DATABASE_URL=postgresql://localhost/db
SECRET_KEY=generate_random_key
```

## Input Validation (输入验证)

### Python (Pydantic)

```python
from pydantic import BaseModel, Field, validator

class UserInput(BaseModel):
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    username: str = Field(..., min_length=3, max_length=50)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v

# 使用
try:
    user = UserInput(**request_data)
except ValidationError as e:
    return {"error": "Invalid input", "details": e.errors()}
```

### TypeScript (Zod)

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9]+$/)
})

// 使用
try {
  const user = userSchema.parse(requestData)
} catch (error) {
  return { error: 'Invalid input', details: error.errors }
}
```

## SQL Injection Prevention (SQL 注入防护)

### ❌ 危险：字符串拼接

```python
# WRONG - SQL 注入风险
query = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(query)
```

### ✅ 安全：参数化查询

```python
# CORRECT - 参数化查询
query = "SELECT * FROM users WHERE username = %s"
cursor.execute(query, (username,))

# SQLAlchemy
from sqlalchemy import select
stmt = select(User).where(User.username == username)
```

## XSS Prevention (XSS 防护)

### Python (FastAPI)

```python
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from markupsafe import escape

@app.get("/profile")
async def get_profile(name: str):
    # 转义用户输入
    safe_name = escape(name)
    return HTMLResponse(f"<h1>Welcome {safe_name}</h1>")
```

### TypeScript (React)

```typescript
// React 自动转义
function Profile({ name }: { name: string }) {
  // 安全 - React 自动转义
  return <h1>Welcome {name}</h1>
}

// 危险 - 使用 dangerouslySetInnerHTML
function UnsafeProfile({ html }: { html: string }) {
  // 只在信任的内容上使用
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

## Authentication & Authorization (认证授权)

### 检查清单

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """验证用户身份"""
    user = verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

async def require_admin(user = Depends(get_current_user)):
    """要求管理员权限"""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

# 使用
@app.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin = Depends(require_admin)
):
    # 只有管理员可以删除用户
    pass
```

## Rate Limiting (速率限制)

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/search")
@limiter.limit("10/minute")  # 每分钟 10 次
async def search(query: str):
    return perform_search(query)
```

## Error Handling (错误处理)

### ❌ 危险：泄露敏感信息

```python
# WRONG - 泄露内部信息
try:
    result = database.query(sql)
except Exception as e:
    return {"error": str(e)}  # 可能泄露数据库结构
```

### ✅ 安全：通用错误消息

```python
# CORRECT - 通用错误消息
import logging

try:
    result = database.query(sql)
except Exception as e:
    logging.error(f"Database error: {e}")  # 记录详细错误
    return {"error": "An error occurred"}  # 返回通用消息
```

## Security Response Protocol (安全响应协议)

如果发现安全问题：

1. **立即停止** - 不要继续开发
2. **评估影响** - 确定问题严重程度
3. **修复问题** - 优先修复 CRITICAL 问题
4. **轮换密钥** - 如果密钥泄露，立即轮换
5. **全面审查** - 检查整个代码库是否有类似问题
6. **记录事件** - 文档化问题和解决方案

## Security Checklist (安全检查清单)

### 代码审查时检查

**CRITICAL (关键):**
- [ ] 无硬编码凭证（API keys、密码、tokens）
- [ ] SQL 注入风险（查询中的字符串拼接）
- [ ] XSS 漏洞（未转义的用户输入）
- [ ] 缺少输入验证
- [ ] 不安全的依赖（过时、有漏洞）
- [ ] 路径遍历风险（用户控制的文件路径）
- [ ] CSRF 漏洞
- [ ] 认证绕过

**HIGH (高):**
- [ ] 缺少速率限制
- [ ] 错误消息泄露信息
- [ ] 不安全的会话管理
- [ ] 缺少 HTTPS/TLS
- [ ] 弱密码策略
- [ ] 不安全的文件上传

**MEDIUM (中):**
- [ ] 缺少安全头（CSP、X-Frame-Options）
- [ ] 不安全的 CORS 配置
- [ ] 日志记录敏感数据
- [ ] 缺少审计日志

## Common Vulnerabilities (常见漏洞)

### 1. 硬编码密钥
```python
# ❌ 危险
API_KEY = "sk-proj-xxxxx"

# ✅ 安全
API_KEY = os.getenv("API_KEY")
```

### 2. SQL 注入
```python
# ❌ 危险
query = f"SELECT * FROM users WHERE id = {user_id}"

# ✅ 安全
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
```

### 3. XSS 攻击
```typescript
// ❌ 危险
element.innerHTML = userInput

// ✅ 安全
element.textContent = userInput
```

### 4. 路径遍历
```python
# ❌ 危险
file_path = f"/uploads/{user_filename}"

# ✅ 安全
from pathlib import Path
safe_path = Path("/uploads") / Path(user_filename).name
```

### 5. 不安全的反序列化
```python
# ❌ 危险
import pickle
data = pickle.loads(user_input)

# ✅ 安全
import json
data = json.loads(user_input)
```

## Security Tools (安全工具)

### Python
```bash
# 依赖扫描
uv run pip-audit

# 代码安全检查
uv run bandit -r app/

# Secret 扫描
uv run detect-secrets scan
```

### TypeScript
```bash
# 依赖扫描
npm audit

# 修复漏洞
npm audit fix
```

## Resources (资源)

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**记住：安全不是可选的。每一行代码都要考虑安全性。**
