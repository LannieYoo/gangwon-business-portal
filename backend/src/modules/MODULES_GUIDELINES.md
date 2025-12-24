# 后端模块开发规范

## 模块结构

```
modules/[module_name]/
├── __init__.py       # 模块初始化
├── router.py         # API 路由
├── service.py        # 业务逻辑
└── schemas.py        # Pydantic 模型
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块目录 | snake_case | `member/`, `project/` |
| 文件名 | snake_case | `router.py`, `service.py` |
| 类名 | PascalCase | `MemberService`, `MemberProfileResponse` |
| 函数名 | snake_case | `get_member_profile`, `list_members` |
| 变量名 | snake_case | `member_id`, `page_size` |
| 常量 | UPPER_SNAKE_CASE | `API_PREFIX`, `DEFAULT_PAGE_SIZE` |

---

## Router 规范

```python
"""
Member router.

API endpoints for member management.
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from uuid import UUID

from .schemas import MemberProfileResponse, MemberListQuery
from .service import MemberService
from ..user.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter()
member_service = MemberService()


# Member 自服务端点
@router.get("/api/member/profile", response_model=MemberProfileResponse)
async def get_my_profile(
    current_user: dict = Depends(get_current_active_user),
):
    """Get current member's profile."""
    return await member_service.get_member_profile_response(current_user["id"])


# Admin 端点
@router.get("/api/admin/members/{member_id}", response_model=MemberProfileResponse)
async def get_member(
    member_id: UUID,
    current_user: dict = Depends(get_current_admin_user),
):
    """Get member details (admin only)."""
    return await member_service.get_member_profile_response(member_id)
```

### 路由命名

| 角色 | 路径前缀 | 示例 |
|------|----------|------|
| 公开 | `/api/` | `/api/auth/login` |
| 会员 | `/api/member/` | `/api/member/profile` |
| 管理员 | `/api/admin/` | `/api/admin/members` |

---

## Service 规范

```python
"""
Member service.

Business logic for member management.
"""
from typing import Optional
from uuid import UUID

from ...common.modules.exception import NotFoundError, ValidationError
from ...common.modules.supabase.service import supabase_service
from .schemas import MemberProfileUpdate, MemberProfileResponse


class MemberService:
    """Member service class."""

    async def get_member_profile(self, member_id: UUID) -> dict:
        """
        Get member profile.

        Args:
            member_id: Member UUID

        Returns:
            Member dict

        Raises:
            NotFoundError: If member not found
        """
        member = await supabase_service.get_member_by_id(str(member_id))
        if not member:
            raise NotFoundError("Member")
        return member

    async def update_member_profile(
        self, member_id: UUID, data: MemberProfileUpdate
    ) -> dict:
        """
        Update member profile.

        Args:
            member_id: Member UUID
            data: Update data

        Returns:
            Updated member dict

        Raises:
            NotFoundError: If member not found
            ValidationError: If validation fails
        """
        # 业务逻辑...
        pass
```

### Service 原则

1. 一个 Service 类对应一个模块
2. 方法使用 `async def`
3. 使用 docstring 说明参数和返回值
4. 抛出自定义异常（`NotFoundError`, `ValidationError`）
5. 不直接返回 HTTP 响应，返回数据或抛出异常

---

## Schema 规范

```python
"""
Member schemas.

Pydantic models for member requests and responses.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


class MemberProfileResponse(BaseModel):
    """Member profile response."""

    id: UUID
    business_number: str
    company_name: str
    email: str
    status: str
    approval_status: str
    industry: Optional[str] = None
    revenue: Optional[Decimal] = None
    employee_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemberProfileUpdate(BaseModel):
    """Member profile update request."""

    company_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    industry: Optional[str] = Field(None, max_length=100)
    revenue: Optional[float] = Field(None, ge=0)
    employee_count: Optional[int] = Field(None, ge=0)

    class Config:
        extra = 'forbid'  # 禁止额外字段


class MemberListQuery(BaseModel):
    """Member list query parameters."""

    search: Optional[str] = Field(None, description="Search by company name")
    status: Optional[str] = Field(None, description="Filter by status")
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)


class MemberListResponse(BaseModel):
    """Paginated member list response."""

    items: list[MemberProfileResponse]
    total: int
    page: int
    page_size: int
```

### Schema 命名

| 类型 | 后缀 | 示例 |
|------|------|------|
| 响应 | Response | `MemberProfileResponse` |
| 创建请求 | Create | `MemberCreate` |
| 更新请求 | Update | `MemberProfileUpdate` |
| 查询参数 | Query | `MemberListQuery` |

---

## 新增模块

1. 创建模块目录

```bash
mkdir -p backend/src/modules/new_module
```

2. 创建文件

```
new_module/
├── __init__.py
├── router.py
├── service.py
└── schemas.py
```

3. 注册路由（`main.py`）

```python
from src.modules.new_module.router import router as new_module_router

app.include_router(new_module_router, tags=["NewModule"])
```

---

## 错误处理

使用自定义异常：

```python
from ...common.modules.exception import NotFoundError, ValidationError, ConflictError

# 资源不存在
raise NotFoundError("Member")

# 验证失败
raise ValidationError("Email already in use")

# 冲突
raise ConflictError("Member already exists")
```

---

## 开发 Checklist

- [ ] 模块目录使用 snake_case
- [ ] 文件包含 docstring 说明
- [ ] Router 使用正确的路径前缀
- [ ] Service 方法使用 async
- [ ] Schema 使用 Pydantic 验证
- [ ] 在 main.py 注册路由
- [ ] 错误使用自定义异常
