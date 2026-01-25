---
inclusion: fileMatch
fileMatchPattern: "**/*.{py,ts,tsx,js,jsx,vue}"
---

# Code Quality Standards (代码质量标准)

## Core Principles (核心原则)

### 1. Immutability (不可变性) - CRITICAL

**永远创建新对象，永远不要修改现有对象**

#### ❌ 错误：Mutation (修改)

```python
# WRONG - 修改原对象
def update_user(user: dict, name: str) -> dict:
    user['name'] = name  # 修改了原对象！
    return user

# WRONG - 修改列表
def add_item(items: list, item: str) -> list:
    items.append(item)  # 修改了原列表！
    return items
```

```typescript
// WRONG - 修改对象
function updateUser(user: User, name: string): User {
  user.name = name  // 修改了原对象！
  return user
}

// WRONG - 修改数组
function addItem(items: string[], item: string): string[] {
  items.push(item)  // 修改了原数组！
  return items
}
```

#### ✅ 正确：Immutability (不可变)

```python
# CORRECT - 创建新对象
def update_user(user: dict, name: str) -> dict:
    return {**user, 'name': name}

# CORRECT - 创建新列表
def add_item(items: list, item: str) -> list:
    return [*items, item]

# CORRECT - 使用 dataclass
from dataclasses import dataclass, replace

@dataclass(frozen=True)  # frozen=True 强制不可变
class User:
    name: str
    age: int

def update_user(user: User, name: str) -> User:
    return replace(user, name=name)
```

```typescript
// CORRECT - 创建新对象
function updateUser(user: User, name: string): User {
  return { ...user, name }
}

// CORRECT - 创建新数组
function addItem(items: string[], item: string): string[] {
  return [...items, item]
}

// CORRECT - 使用 Immer
import { produce } from 'immer'

const newState = produce(state, draft => {
  draft.user.name = 'New Name'  // Immer 处理不可变性
})
```

### 2. File Organization (文件组织)

**多个小文件 > 少数大文件**

#### 文件大小指南

- **理想大小**: 200-400 行
- **最大限制**: 800 行
- **超过 800 行**: 必须拆分

#### 组织原则

```
✅ 按功能/领域组织 (推荐)
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

❌ 按类型组织 (不推荐)
app/
├── models/
│   ├── user.py
│   ├── market.py
├── services/
│   ├── user_service.py
│   ├── market_service.py
```

#### 拆分大文件

```python
# ❌ 一个 1000 行的文件
# services.py (1000 lines)

# ✅ 拆分为多个小文件
services/
├── __init__.py
├── user_service.py      (200 lines)
├── market_service.py    (250 lines)
├── search_service.py    (180 lines)
└── cache_service.py     (150 lines)
```

### 3. Function Size (函数大小)

**小函数 > 大函数**

#### 函数大小指南

- **理想大小**: 10-20 行
- **最大限制**: 50 行
- **超过 50 行**: 必须拆分

#### ❌ 错误：大函数

```python
def process_order(order_data: dict) -> dict:
    # 100+ lines of code
    # Validation
    # Payment processing
    # Inventory update
    # Email notification
    # Logging
    # ...
    pass
```

#### ✅ 正确：小函数

```python
def process_order(order_data: dict) -> dict:
    """处理订单 - 协调函数"""
    validated_order = validate_order(order_data)
    payment_result = process_payment(validated_order)
    update_inventory(validated_order)
    send_confirmation_email(validated_order)
    log_order_processed(validated_order)
    return create_order_response(validated_order, payment_result)

def validate_order(order_data: dict) -> dict:
    """验证订单数据"""
    # 10-15 lines
    pass

def process_payment(order: dict) -> dict:
    """处理支付"""
    # 15-20 lines
    pass
```

### 4. Nesting Depth (嵌套深度)

**最大嵌套深度: 4 层**

#### ❌ 错误：深度嵌套

```python
def process_data(data):
    if data:
        for item in data:
            if item.is_valid():
                for sub_item in item.children:
                    if sub_item.active:
                        for detail in sub_item.details:  # 5 层嵌套！
                            if detail.status == 'pending':
                                process_detail(detail)
```

#### ✅ 正确：Early Return + 提取函数

```python
def process_data(data):
    """处理数据 - 主函数"""
    if not data:
        return
    
    for item in data:
        process_item(item)

def process_item(item):
    """处理单个项目"""
    if not item.is_valid():
        return
    
    for sub_item in item.children:
        process_sub_item(sub_item)

def process_sub_item(sub_item):
    """处理子项目"""
    if not sub_item.active:
        return
    
    pending_details = [d for d in sub_item.details if d.status == 'pending']
    for detail in pending_details:
        process_detail(detail)
```

### 5. Error Handling (错误处理)

**始终处理错误，永远不要忽略异常**

#### ❌ 错误：忽略异常

```python
# WRONG - 空 except
try:
    result = risky_operation()
except:
    pass  # 吞掉所有错误！

# WRONG - 捕获但不处理
try:
    result = risky_operation()
except Exception as e:
    print(e)  # 只打印，不处理
```

#### ✅ 正确：适当的错误处理

```python
# CORRECT - 具体的异常处理
import logging

logger = logging.getLogger(__name__)

try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    raise HTTPException(status_code=400, detail="Invalid input")
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")
    raise HTTPException(status_code=503, detail="Service unavailable")
except Exception as e:
    logger.exception(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

```typescript
// CORRECT - TypeScript 错误处理
async function fetchData(): Promise<Data> {
  try {
    const response = await api.get('/data')
    return response.data
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.error('Validation failed:', error)
      throw new BadRequestError('Invalid data')
    }
    if (error instanceof NetworkError) {
      logger.error('Network error:', error)
      throw new ServiceUnavailableError('Service unavailable')
    }
    logger.error('Unexpected error:', error)
    throw new InternalServerError('Internal error')
  }
}
```

### 6. Naming Conventions (命名规范)

#### Python

```python
# 变量和函数: snake_case
user_name = "John"
def calculate_total_price():
    pass

# 类: PascalCase
class UserService:
    pass

# 常量: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
API_BASE_URL = "https://api.example.com"

# 私有成员: 前缀 _
class User:
    def __init__(self):
        self._internal_state = {}
    
    def _private_method(self):
        pass
```

#### TypeScript

```typescript
// 变量和函数: camelCase
const userName = 'John'
function calculateTotalPrice() {}

// 类和接口: PascalCase
class UserService {}
interface UserData {}

// 常量: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'

// 类型: PascalCase
type UserId = string
type UserRole = 'admin' | 'user'

// 私有成员: 前缀 #
class User {
  #internalState = {}
  
  #privateMethod() {}
}
```

### 7. Input Validation (输入验证)

**永远验证用户输入**

```python
from pydantic import BaseModel, Field, validator

class CreateUserRequest(BaseModel):
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    username: str = Field(..., min_length=3, max_length=50)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must be alphanumeric')
        return v.lower()
```

### 8. No Magic Numbers (无魔法数字)

#### ❌ 错误：魔法数字

```python
# WRONG - 什么是 86400？
if time_diff > 86400:
    send_reminder()

# WRONG - 什么是 0.8？
if score > 0.8:
    mark_as_high_quality()
```

#### ✅ 正确：命名常量

```python
# CORRECT - 清晰的常量
SECONDS_PER_DAY = 86400
HIGH_QUALITY_THRESHOLD = 0.8

if time_diff > SECONDS_PER_DAY:
    send_reminder()

if score > HIGH_QUALITY_THRESHOLD:
    mark_as_high_quality()
```

### 9. No Console.log (无 console.log)

#### ❌ 错误：使用 console.log

```typescript
// WRONG - 生产代码中的 console.log
function processData(data: Data) {
  console.log('Processing:', data)  // 不要这样！
  const result = transform(data)
  console.log('Result:', result)    // 不要这样！
  return result
}
```

#### ✅ 正确：使用日志库

```typescript
// CORRECT - 使用日志库
import { logger } from '@/lib/logger'

function processData(data: Data) {
  logger.debug('Processing data', { data })
  const result = transform(data)
  logger.info('Data processed', { result })
  return result
}
```

```python
# CORRECT - Python 日志
import logging

logger = logging.getLogger(__name__)

def process_data(data: dict):
    logger.debug(f"Processing data: {data}")
    result = transform(data)
    logger.info(f"Data processed: {result}")
    return result
```

## Code Quality Checklist (代码质量检查清单)

在标记工作完成之前：

### 可读性
- [ ] 代码易读且命名良好
- [ ] 函数小于 50 行
- [ ] 文件小于 800 行
- [ ] 嵌套深度不超过 4 层
- [ ] 无魔法数字（使用命名常量）

### 正确性
- [ ] 适当的错误处理
- [ ] 所有边界情况都考虑
- [ ] 输入验证完整
- [ ] 无硬编码值

### 可维护性
- [ ] 无重复代码（DRY 原则）
- [ ] 使用不可变模式
- [ ] 单一职责原则
- [ ] 高内聚低耦合

### 清洁度
- [ ] 无 console.log 语句
- [ ] 无注释掉的代码
- [ ] 无 TODO 注释（或有对应的 issue）
- [ ] 无未使用的导入

### 性能
- [ ] 无明显的性能问题
- [ ] 算法复杂度合理
- [ ] 无不必要的计算
- [ ] 适当的缓存策略

## Common Code Smells (常见代码异味)

### 1. 长函数 (Long Function)
```python
# ❌ 100+ 行的函数
def process_everything():
    # 太多逻辑在一个函数里
    pass

# ✅ 拆分为小函数
def process_everything():
    validate_input()
    transform_data()
    save_results()
```

### 2. 重复代码 (Duplicate Code)
```python
# ❌ 重复的逻辑
def process_user():
    if user.age < 18:
        return "Minor"
    return "Adult"

def check_eligibility():
    if user.age < 18:
        return False
    return True

# ✅ 提取共同逻辑
def is_adult(user):
    return user.age >= 18

def process_user():
    return "Adult" if is_adult(user) else "Minor"

def check_eligibility():
    return is_adult(user)
```

### 3. 长参数列表 (Long Parameter List)
```python
# ❌ 太多参数
def create_user(name, email, age, address, phone, city, country, zip_code):
    pass

# ✅ 使用对象
from dataclasses import dataclass

@dataclass
class UserData:
    name: str
    email: str
    age: int
    address: str
    phone: str
    city: str
    country: str
    zip_code: str

def create_user(user_data: UserData):
    pass
```

### 4. 神类 (God Class)
```python
# ❌ 一个类做太多事
class UserManager:
    def create_user(self): pass
    def delete_user(self): pass
    def send_email(self): pass
    def process_payment(self): pass
    def generate_report(self): pass
    # 太多职责！

# ✅ 单一职责
class UserService:
    def create_user(self): pass
    def delete_user(self): pass

class EmailService:
    def send_email(self): pass

class PaymentService:
    def process_payment(self): pass

class ReportService:
    def generate_report(self): pass
```

## Tools & Automation (工具和自动化)

### Python

```bash
# 代码格式化
uv run ruff format .

# 代码检查
uv run ruff check .

# 类型检查
uv run mypy app/

# 复杂度检查
uv run radon cc app/ -a
```

### TypeScript

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

## Resources (资源)

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring by Martin Fowler](https://refactoring.com/)
- [Python PEP 8](https://peps.python.org/pep-0008/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

**记住：代码是写给人看的，顺便让机器执行。优先考虑可读性和可维护性。**
