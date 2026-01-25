---
name: dev-backend_patterns
description: 后端架构模式专家。Use when (1) designing API architecture, (2) implementing Repository/Service patterns, (3) database optimization, (4) caching strategies, (5) authentication, (6) error handling.
---

# 后端开发模式

后端架构模式和最佳实践，用于构建可扩展的服务端应用。

**支持**: Python/FastAPI, TypeScript/Node.js

## 前置依赖

> **⚠️ 开始开发前，必须先检查以下 skill：**
>
> 1. **`dev-terminology`** - 确保命名符合项目术语字典
> 2. **`dev-libs_compatibility`** - 添加新依赖时检查兼容性

## 项目结构（按功能/领域组织）

### Python/FastAPI

```
app/
├── users/                     # 用户功能模块
│   ├── models.py             # SQLAlchemy 模型
│   ├── schemas.py            # Pydantic schemas
│   ├── service.py            # 业务逻辑
│   ├── repository.py         # 数据访问
│   └── routes.py             # API 路由
├── markets/                   # 市场功能模块
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── routes.py
├── core/                      # 系统核心 (含原 shared 功能)
│   ├── config.py             # 应用配置
│   ├── security.py           # 认证/授权
│   ├── database.py           # 数据库连接/初始化
│   ├── enums.py              # 全局枚举 (替代常量)
│   ├── exceptions.py         # 自定义异常
│   ├── schemas.py            # 通用 API 响应/分页
│   ├── models.py             # 通用模型 (如 UniversalDocument)
│   ├── utils.py              # 通用工具函数 (如 generate_uuid)
│   └── document_store.py     # 统一存储服务
└── main.py                    # 应用入口
```

### TypeScript/Node.js

```
src/
├── features/                  # 功能模块
│   ├── users/
│   │   ├── user.model.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   └── user.types.ts
│   └── markets/
├── shared/                    # 共享代码
│   ├── middleware/
│   ├── utils/
│   └── exceptions/
└── app.ts                     # 应用入口
```

## API 设计模式

### RESTful 结构

```python
# app/users/routes.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/")
async def list_users():
    pass

@router.get("/{user_id}")
async def get_user(user_id: str):
    pass

@router.post("/")
async def create_user():
    pass

@router.put("/{user_id}")
async def update_user(user_id: str):
    pass

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    pass
```

## Repository 模式

```python
# app/users/repository.py
from abc import ABC, abstractmethod
from typing import List, Optional

class UserRepository(ABC):
    @abstractmethod
    async def find_all(self, **filters) -> List[User]:
        pass

    @abstractmethod
    async def find_by_id(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    async def create(self, data: CreateUserSchema) -> User:
        pass


class SQLUserRepository(UserRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_all(self, status: Optional[str] = None) -> List[User]:
        query = select(User)
        if status:
            query = query.where(User.status == status)
        result = await self.db.execute(query)
        return result.scalars().all()
```

## Service 层模式

```python
# app/users/service.py
class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user_with_validation(self, user_id: str) -> User:
        user = await self.user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return user

    async def create_user(self, data: CreateUserSchema) -> User:
        # 业务逻辑验证
        await self._validate_email_unique(data.email)
        return await self.user_repo.create(data)
```

## 依赖注入

```python
# app/core/dependencies.py
from fastapi import Depends

def get_db() -> Generator[AsyncSession, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return SQLUserRepository(db)

def get_user_service(
    user_repo: UserRepository = Depends(get_user_repo)
) -> UserService:
    return UserService(user_repo)

# 在路由中使用
@router.get("/{user_id}")
async def get_user(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    return await service.get_user_with_validation(user_id)
```

## 错误处理

```python
# app/core/exceptions.py
class AppException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code

class NotFoundError(AppException):
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", 404)

class ValidationError(AppException):
    def __init__(self, message: str):
        super().__init__(message, 400)

# app/main.py
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message}
    )
```

## 响应格式

```python
# 统一响应格式
from pydantic import BaseModel
from typing import TypeVar, Generic, Optional

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

# 使用
@router.get("/{user_id}", response_model=ApiResponse[User])
async def get_user(user_id: str):
    """
    获取用户信息 (内部文档使用中文)
    """
    user = await service.get_user(user_id)
    return ApiResponse(success=True, data=user)

# Schema 定义规范
class UserSchema(BaseModel):
    name: str = Field(..., description="The full name of the user") # API 描述使用英文
```

## 缓存模式

```python
# app/shared/cache.py
class CachedRepository:
    def __init__(self, base_repo: UserRepository, redis: Redis):
        self.base_repo = base_repo
        self.redis = redis

    async def find_by_id(self, user_id: str) -> Optional[User]:
        # 先检查缓存
        cached = await self.redis.get(f"user:{user_id}")
        if cached:
            return User.parse_raw(cached)

        # 缓存未命中，从数据库获取
        user = await self.base_repo.find_by_id(user_id)
        if user:
            await self.redis.setex(
                f"user:{user_id}",
                300,  # 5 分钟
                user.json()
            )
        return user
```

## 认证中间件

```python
# app/core/security.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return await user_service.get_user(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## 通用文档存储模式 (Universal Document Store)

**适用场景**：AI 应用中多变的数据载体（如 PDF 分块、总结、图表配置、对话历史）。

### 统一实体模型 (SQL)

```python
# app/core/models.py
from app.core.enums import DocumentStatus, DocumentType
from app.core.utils import generate_uuid

class UniversalDocument(Base):
    """一个表承载所有非结构化业务数据"""
    __tablename__ = "universal_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    type = Column(Enum(DocumentType), index=True)      # 使用枚举类
    data = Column(JSON, nullable=False)               # 业务载体 (JSON)
    owner_id = Column(String(36), index=True)        # 归属用户
    status = Column(Enum(DocumentStatus), index=True) # 使用枚举类
    tags = Column(JSON, default=list)                 # 分类标签
    created_at = Column(DateTime, default=datetime.utcnow)
```

### DocumentStore 服务抽象

```python
# app/core/document_store.py
class DocumentStore:
    """提供统一的 CRUD 网关"""
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save(self, doc_type: str, data: dict, owner_id: str = None) -> dict:
        """保存任何业务内容，无需频繁做数据库迁移"""
        # ... 实现代码 ...
        pass
```

## 最佳实践总结

### 架构

- ✅ 使用分层架构（Repository → Service → Controller）
- ✅ 实现依赖注入
- ✅ 每个模块单一职责
- ✅ 只选需要的列
- ✅ 多步操作使用事务
- ✅ **严禁使用裸露的常量 (Plain Constants)，所有业务标识、配置描述、枚举状态必须封装在 `enums.py` 的 Enum 类中**
- ✅ **使用强类型的 `str, Enum` 或 `int, Enum` 来确保类型安全**

### 数据库

- ✅ 防止 N+1 查询
- ✅ 大数据集使用分页
- ✅ 只选择需要的列
- ✅ 多步操作使用事务

### 性能

- ✅ 实现缓存（Redis）
- ✅ 使用连接池
- ✅ 为常用查询添加索引

### 安全

- ✅ 验证所有输入
- ✅ 使用参数化查询
- ✅ 实现速率限制
- ✅ 只使用 HTTPS

---

**主要规则参见**：`.kiro/steering/code-quality.md`
