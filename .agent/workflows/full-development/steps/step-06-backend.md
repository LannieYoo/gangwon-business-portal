# Step 6: 后端开发

## 阶段信息
- **阶段**: 6/10 - 后端开发
- **Skill**: `dev-senior_backend`
- **输入**: `docs/stories.md`, `docs/database.md`
- **产出物**: `src/backend/`

---

## 执行步骤

### 1. 加载上下文

读取并分析：
- `docs/architecture.md` - 技术选型、目录结构
- `docs/database.md` - 数据库设计
- `docs/stories.md` - 开发任务列表

### 2. 加载 Skill

加载 `dev-senior_backend` skill，获取后端开发专业知识。

### 3. 任务排序

从 `docs/stories.md` 获取后端相关 Story，按依赖关系排序：

```
1. [BE-001] 数据库 Model 层
2. [BE-002] 基础 CRUD Service
3. [BE-003] API Router
4. [BE-004] 认证授权
5. [BE-005] 业务逻辑
...
```

### 4. 开发循环

对于每个 Story：

```
┌─────────────────────────────────────────────┐
│  Story: {story_id} - {story_title}          │
├─────────────────────────────────────────────┤
│  1. 阅读 Story 描述和验收标准               │
│  2. 创建/修改相关文件                       │
│  3. 编写代码                                │
│  4. 运行检查脚本                            │
│  5. 标记完成 / 修复问题                     │
└─────────────────────────────────────────────┘
```

### 5. 代码规范

#### 5.1 Model 层
```python
# models/user.py
from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    # ...
```

#### 5.2 Schema 层
```python
# schemas/user.py
from pydantic import BaseModel

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True
```

#### 5.3 Service 层
```python
# services/user_service.py
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: UserCreate) -> User:
        # 业务逻辑
        pass

    def get_by_id(self, user_id: int) -> User:
        # 业务逻辑
        pass
```

#### 5.4 Router 层
```python
# routers/user_router.py
from fastapi import APIRouter, Depends
from services.user_service import UserService
from schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, service: UserService = Depends()):
    return service.create(user)
```

### 6. 检查脚本

每完成一个模块，运行检查：

```bash
# 检查 Model
python scripts/check-model.py --file models/user.py

# 检查 Router
python scripts/check-router.py --file routers/user_router.py

# 检查 Service
python scripts/check-service.py --file services/user_service.py

# 检查枚举
python scripts/check-enum.py --dir enums/
```

检查项：
- [ ] 命名规范
- [ ] 类型注解
- [ ] 文档字符串
- [ ] 错误处理
- [ ] 安全检查

### 7. Story 完成确认

每个 Story 完成后：

```
[✓] Story BE-001 完成
    - 创建文件: models/user.py
    - 检查结果: 通过
    - 用时: 15 分钟

继续下一个 Story? [Y/n]
```

---

## 完成检查

- [ ] 所有后端 Story 已完成
- [ ] 所有检查脚本通过
- [ ] API 可正常调用
- [ ] 单元测试通过

## 状态更新

```yaml
phases:
  backend:
    status: completed
    completed_at: {current_time}
    stories_completed:
      - BE-001
      - BE-002
      - ...
```

## 下一步

→ 进入 `step-07-frontend.md`（或并行执行）
