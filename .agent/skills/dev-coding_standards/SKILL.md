---
name: dev-coding_standards
description: 编码标准专家。Use when (1) writing new code, (2) reviewing code quality, (3) establishing project conventions, (4) refactoring existing code.
---

# 编码标准与最佳实践

通用编码标准，适用于所有项目。

**支持**: TypeScript/JavaScript, Python, React, Node.js, FastAPI

## 核心原则

### 1. 不可变性 (CRITICAL)

**永远创建新对象，永远不要修改现有对象**

```python
# ✅ 正确 - 创建新对象
def update_user(user: dict, name: str) -> dict:
    return {**user, 'name': name}

def add_item(items: list, item: str) -> list:
    return [*items, item]

# ❌ 错误 - 直接修改
user['name'] = name  # BAD
items.append(item)   # BAD
```

```typescript
// ✅ 正确 - 创建新对象
const updatedUser = { ...user, name: "New Name" };
const updatedArray = [...items, newItem];

// ❌ 错误 - 直接修改
user.name = "New Name"; // BAD
items.push(newItem); // BAD
```

### 2. 文件组织

**多个小文件 > 少数大文件**

- **理想大小**: 200-400 行
- **最大限制**: 800 行
- **超过 800 行**: 必须拆分

#### 按功能/领域组织 (推荐)

```
✅ 推荐
app/
├── users/
│   ├── models.py
│   ├── service.py
│   ├── routes.py
│   └── schemas.py
├── markets/
│   ├── models.py
│   ├── service.py
│   └── routes.py

❌ 不推荐
app/
├── models/
├── services/
├── routes/
```

### 3. 函数大小

- **理想大小**: 10-20 行
- **最大限制**: 50 行
- **超过 50 行**: 必须拆分

```python
# ✅ 正确 - 小函数
def process_order(order_data: dict) -> dict:
    validated = validate_order(order_data)
    payment = process_payment(validated)
    update_inventory(validated)
    return create_response(validated, payment)
```

### 4. 嵌套深度

**最大嵌套深度: 4 层**

```python
# ✅ 正确 - Early Return
def process_data(data):
    if not data:
        return
    for item in data:
        process_item(item)

# ❌ 错误 - 深度嵌套
if data:
    for item in data:
        if item.valid:
            for sub in item.children:
                if sub.active:  # 5 层！
                    ...
```

### 5. 错误处理

**始终处理错误，永远不要忽略异常**

```python
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    raise HTTPException(status_code=400, detail="Invalid input")
except Exception as e:
    logger.exception(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal error")
```

### 6. 命名规范

#### Python

- **API 描述**: `Field(description="...")` 必须使用 **英文** (以便非中文用户使用 Swagger UI)
- **内部注释**: 代码逻辑注释和 Docstring 保持 **中文**
- **常量**: `UPPER_SNAKE_CASE` (业务状态、类型等必须使用 `Enum` 类封装在 `enums.py` 中)
- **私有**: `_leading_underscore`

#### TypeScript

- **变量/函数**: `camelCase`
- **类/接口**: `PascalCase`
- **常量**: `UPPER_SNAKE_CASE`
- **类型**: `PascalCase`

### 7. 输入验证

**永远验证用户输入**

```python
from pydantic import BaseModel, Field

class CreateUserRequest(BaseModel):
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    username: str = Field(..., min_length=3, max_length=50)
```

### 8. 无魔法数字

```python
# ✅ 正确
SECONDS_PER_DAY = 86400
if time_diff > SECONDS_PER_DAY:
    send_reminder()

# ❌ 错误
if time_diff > 86400:  # 什么是 86400?
    send_reminder()
```

### 9. 使用日志库

```python
# ✅ 正确
import logging
logger = logging.getLogger(__name__)
logger.info("Processing data")

# ❌ 错误
print("Processing data")  # BAD
```

## 代码质量检查清单

- [ ] 使用不可变模式
- [ ] 函数 < 50 行
- [ ] 文件 < 800 行
- [ ] 嵌套 < 4 层
- [ ] 无魔法数字
- [ ] 适当的错误处理
- [ ] 无 console.log/print
- [ ] 无未使用的导入
- [ ] 类型注解完整

---

**记住**：代码是写给人看的，顺便让机器执行。
