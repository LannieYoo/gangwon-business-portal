# Backend Tests Documentation

## 📋 概述

本文档包含 Gangwon Business Portal 后端测试的完整指南，包括集成测试、单元测试和测试覆盖率提升计划。

### 目标

- **当前覆盖率**: 40-50%
- **目标覆盖率**: 70%+
- **关键模块覆盖率**: 80%+

---

## 📁 目录结构

```
backend/
├── tests/
│   ├── __init__.py
│   ├── README.md                      # 本文档
│   ├── conftest.py                    # 共享 fixtures
│   ├── setup_test_data.py             # 数据库测试数据设置（异步）
│   ├── setup_test_users_api.py        # 通过 API 设置测试用户
│   ├── run_all_tests.py               # 主测试运行器
│   ├── run_all_tests_with_coverage.py # 运行所有测试并生成覆盖率报告
│   ├── run_unit_tests.py              # 单元测试运行器
│   ├── unit/                          # 单元测试（快速、隔离）
│   │   ├── __init__.py
│   │   ├── test_auth_service.py
│   │   ├── test_member_service.py
│   │   ├── test_performance_service.py
│   │   ├── test_project_service.py
│   │   ├── test_content_service.py
│   │   ├── test_support_service.py
│   │   ├── test_upload_service.py
│   │   ├── test_email_service.py
│   │   ├── test_audit_service.py
│   │   └── test_export_service.py
│   ├── integration/                   # 集成测试（需要数据库/服务器）
│   │   ├── __init__.py
│   │   ├── test_auth_api.py           # 认证测试
│   │   ├── test_member_api.py         # 会员管理测试
│   │   ├── test_performance_api.py    # 绩效管理测试
│   │   ├── test_project_api.py        # 项目管理测试
│   │   ├── test_content_api.py        # 内容管理测试
│   │   ├── test_support_api.py        # 支持模块测试
│   │   ├── test_nice_dnb_api.py       # Nice D&B API 集成测试（Mock）
│   │   └── test_nice_dnb_api_real.py  # Nice D&B API 真实集成测试
│   └── test_results/                  # 测试结果（自动生成）
│       ├── auth_test_results.json
│       ├── member_test_results.json
│       ├── performance_test_results.json
│       ├── project_test_results.json
│       ├── content_test_results.json
│       ├── support_test_results.json
│       ├── nice_dnb_test_results.json
│       └── integration_test_summary.json
├── pytest.ini                         # Pytest 配置
├── .coveragerc                         # Coverage 配置
├── coverage.json                       # 覆盖率 JSON 报告
├── coverage.xml                        # 覆盖率 XML 报告
├── .coverage                           # Coverage 数据文件
├── htmlcov/                            # HTML 覆盖率报告目录
└── .pytest_cache/                      # Pytest 缓存目录
```

---

## 🚀 快速开始

### 前置条件

1. **安装依赖**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **启动后端服务器**（集成测试需要）:
   ```bash
   python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
   ```

3. **创建测试用户**:
   ```bash
   # 方式 1: 通过数据库（推荐）
   python tests/setup_test_data.py
   
   # 方式 2: 通过 API
   python tests/setup_test_users_api.py
   ```

### 运行测试

#### 后端测试

```bash
# 运行所有测试（单元 + 集成）并生成覆盖率报告
cd backend
python tests/run_all_tests_with_coverage.py

# 只运行单元测试
python tests/run_unit_tests.py --coverage

# 只运行集成测试
python tests/run_all_tests.py

# 使用 pytest 直接运行
pytest tests/unit/ -v --cov=src --cov-report=html
pytest tests/integration/ -v

# 运行单个模块测试
python tests/integration/test_auth_api.py
python tests/integration/test_member_api.py
python tests/integration/test_performance_api.py
python tests/integration/test_project_api.py
python tests/integration/test_content_api.py
python tests/integration/test_support_api.py
python tests/integration/test_nice_dnb_api.py

# 运行真实 Nice D&B API 测试（需要 API 凭证）
python tests/integration/test_nice_dnb_api_real.py
python tests/integration/test_nice_dnb_api_real.py --business-number "123-45-67890"
```

#### 查看覆盖率报告

```bash
# HTML 报告
open tests/htmlcov/index.html

# 终端报告
pytest tests/unit/ --cov=src --cov-report=term-missing
```

---

## 📊 测试类型

### 单元测试 (Unit Tests)

**特点**:
- 快速执行（< 1秒）
- 完全隔离（使用 mocks）
- 不依赖外部服务
- 测试单个函数/方法

**位置**: `backend/tests/unit/`

**示例**:
```python
# backend/tests/unit/test_auth_service.py
@pytest.mark.unit
def test_verify_password_success(auth_service):
    result = auth_service.verify_password("password", hashed)
    assert result is True
```

### 集成测试 (Integration Tests)

**特点**:
- 需要数据库连接
- 需要运行中的服务器
- 测试完整流程
- 较慢（几秒到几分钟）

**位置**: `backend/tests/integration/`

**示例**:
```python
# backend/tests/integration/test_auth_api.py
def test_member_login():
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "business_number": "123-45-67890",
        "password": "Member123!"
    })
    assert response.status_code == 200
```

---

## 🎭 为什么使用 Mock 测试？

### 核心原因

Mock 测试是单元测试的核心策略，用于隔离被测试代码与外部依赖。以下是使用 Mock 的主要原因：

#### 1. **测试隔离（Isolation）**
- **只测试你的代码逻辑**，不测试数据库、文件系统、网络等外部系统
- 每个测试都是独立的，不会相互影响
- 例如：测试 `MemberService.get_member()` 时，只关注服务层逻辑，不依赖真实的数据库连接

```python
# 使用 Mock 替代真实数据库
mock_db_session.execute.return_value = mock_result
result = await service.get_member(member_id, mock_db_session)
# 测试只关注 MemberService 的逻辑，不依赖数据库
```

#### 2. **测试速度快**
- **真实数据库操作**：需要连接、查询、事务等，每个测试可能需要几百毫秒
- **Mock 操作**：内存操作，几乎瞬间完成（< 1ms）
- **效果**：80+ 个测试用例可以在几秒内完成，而不是几分钟

#### 3. **可控的测试环境**
- 可以轻松模拟各种场景：
  - ✅ 成功场景：数据库返回正常数据
  - ❌ 失败场景：数据库返回 None（找不到记录）
  - ⚠️ 异常场景：数据库连接失败、超时等
- 可以测试边界条件：空数据、大数据量、网络错误等

```python
# 模拟数据库查询返回 None（找不到记录）
mock_result.scalar_one_or_none.return_value = None
# 测试代码如何处理"找不到会员"的情况
```

#### 4. **不依赖外部资源**
- **不需要配置**：数据库、文件系统、第三方服务
- **可以在任何环境运行**：开发机器、CI/CD 服务器、没有网络的环境
- **不需要测试数据准备和清理**：Mock 数据是临时的，测试结束后自动消失

#### 5. **测试稳定性**
- **真实数据库**：可能因为数据变化导致测试结果不一致
- **Mock**：每次返回相同的结果，测试可重复
- **不会因为外部问题失败**：网络问题、数据库故障、第三方服务不可用

#### 6. **测试难以复现的错误场景**
- 可以模拟各种错误情况：
  - 数据库超时
  - 磁盘空间不足
  - 权限错误
  - 网络中断
- 不需要真的制造这些错误，就能测试代码的错误处理逻辑

```python
# 模拟文件上传失败
mock_storage_service.upload_file.side_effect = Exception("Storage error")
# 测试代码如何处理存储错误
```

#### 7. **符合单元测试原则**
单元测试应该遵循 **FIRST** 原则：
- **F**ast（快速）：Mock 测试执行速度快
- **I**ndependent（独立）：每个测试不依赖其他测试
- **R**epeatable（可重复）：每次运行结果相同
- **S**elf-validating（自验证）：测试结果明确（通过/失败）
- **T**imely（及时）：可以在开发过程中快速运行

### 实际例子对比

#### ❌ 不使用 Mock（集成测试方式）

```python
# 需要真实的数据库
async def test_get_member():
    # 需要先创建测试数据
    member = await create_test_member()
    # 需要真实数据库连接
    result = await service.get_member(member.id, db_session)
    # 需要清理测试数据
    await delete_test_member(member.id)
    assert result is not None
```

**问题**：
- ⏱️ **慢**：需要数据库操作（几百毫秒）
- 🔧 **复杂**：需要数据准备和清理
- 🎲 **不稳定**：可能因为数据库状态变化失败
- 🔌 **依赖外部**：需要数据库服务运行

#### ✅ 使用 Mock（单元测试方式）

```python
# 只需要 Mock 对象
async def test_get_member(mock_db_session, sample_member):
    # Mock 数据库查询结果
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = sample_member
    mock_db_session.execute.return_value = mock_result
    
    # 测试服务逻辑
    result = await service.get_member(sample_member.id, mock_db_session)
    
    # 验证结果
    assert result is not None
    assert result.id == sample_member.id
```

**优势**：
- ⚡ **快**：内存操作（< 1ms）
- 🎯 **简单**：不需要真实数据
- 🎯 **稳定**：每次都一样
- 🚀 **独立**：不依赖外部服务

### 测试什么 vs 不测试什么

使用 Mock 时，应该明确测试的边界：

#### ✅ 应该测试（你的代码逻辑）
- 服务方法是否正确调用数据库查询
- 服务方法如何处理查询结果
- 服务方法如何处理错误情况
- 业务逻辑是否正确（验证、转换、计算等）

#### ❌ 不应该测试（外部系统的职责）
- 数据库是否能正常连接（这是数据库的职责）
- SQL 查询是否正确（这是 ORM 的职责）
- 文件系统是否能写入（这是操作系统的职责）
- 网络请求是否能成功（这是网络库的职责）

### Mock 使用示例

```python
from unittest.mock import AsyncMock, MagicMock, patch

# 1. Mock 数据库会话
mock_db_session = MagicMock()
mock_result = MagicMock()
mock_result.scalar_one_or_none.return_value = sample_member
mock_db_session.execute.return_value = mock_result

# 2. Mock 外部服务
@patch('src.modules.upload.service.StorageService')
async def test_upload_file(mock_storage):
    mock_storage.upload_file.return_value = "https://example.com/file.jpg"
    result = await service.upload_file(file, member_id)
    assert result.url == "https://example.com/file.jpg"

# 3. Mock 异常情况
mock_db_session.execute.side_effect = Exception("Database error")
# 测试代码如何处理数据库错误
```

### 总结

Mock 测试的核心思想是：**只测试你的代码逻辑，而不是测试数据库、文件系统或其他外部系统**。

- 🎯 **专注**：测试更专注，只关注业务逻辑
- ⚡ **快速**：测试执行速度快，可以频繁运行
- 🎲 **可靠**：测试结果稳定，不会因为外部因素失败
- 🔧 **简单**：不需要复杂的测试环境配置

这就是为什么我们的单元测试都使用 Mock 的原因！

---

## 🔐 测试凭证

| Role | Business Number | Password | Status |
|------|-----------------|----------|--------|
| **Member** | 123-45-67890 | Member123! | approved |
| **Admin** | 000-00-00000 | Admin123! | approved |

---

## 📋 集成测试模块

### 1. Authentication (`test_auth_api.py`)
- TC1.1: Member login
- TC1.2: Member login (wrong password)
- TC1.3: Admin login
- TC1.4: Member registration
- TC1.5: Password reset request
- TC1.6: Get current user
- TC1.7: Token refresh
- ERR1.1: Access without token

### 2. Member Management (`test_member_api.py`)
- TC2.1: Get member profile
- TC2.2: Update member profile
- TC2.3: Admin list members
- TC2.3b: Admin list members (filtered)
- TC2.4: Admin get member detail
- ERR2.1: Member access admin endpoint
- ERR3.1: Get non-existent member

### 3. Performance Management (`test_performance_api.py`)
- TC3.1: Create performance record
- TC3.2: List performance records
- TC3.3: Get performance detail
- TC3.4: Update performance
- TC3.5: Submit performance
- TC3.6: Admin list performance
- TC3.7: Admin approve performance

### 4. Project Management (`test_project_api.py`)
- TC4.1: List projects (public)
- TC4.2: Get project detail
- TC4.3: Apply to project
- TC4.4: Get my applications
- TC4.5: Admin create project
- TC4.6: Admin get applications
- TC4.7: Admin update project
- TC4.8: List projects (filtered)

### 5. Content Management (`test_content_api.py`)
- TC5.1: List notices (public)
- TC5.2: Get latest notices
- TC5.3: List press releases
- TC5.3b: Get latest press
- TC5.4: Get banners
- TC5.5: Admin create notice
- TC5.5b: Admin update notice
- TC5.6: Admin create banner
- TC5.6b: Admin get all banners
- TC5.7: Get system info

### 6. Support Module (`test_support_api.py`)
- TC6.1: List FAQs (public)
- TC6.1b: List FAQs (filtered)
- TC6.1c: Admin create FAQ
- TC6.1d: Admin update FAQ
- TC6.2: Create inquiry
- TC6.3: List my inquiries
- TC6.4: Get inquiry detail
- TC6.5: Admin list inquiries
- TC6.5b: Admin reply inquiry
- TC6.6: View replied inquiry

### 7. Nice D&B API Integration (`test_nice_dnb_api.py`)
- TC1: OAuth 2.0 Token Retrieval
- TC2: OAuth Token Caching
- TC3: Company Search - Success
- TC4: Company Verification - Success
- TC5: Company Verification - Name Mismatch
- TC6: Company Search - Not Configured
- TC7: Verify Company Endpoint (`/api/members/verify-company`)
- TC8: Admin Company Search Endpoint (`/api/admin/members/nice-dnb`)

**Note**: These tests use mocks to simulate Nice D&B API responses.

### 8. Nice D&B API Real Integration (`test_nice_dnb_api_real.py`)
- Real OAuth 2.0 Token Retrieval
- Real Company Search
- Real Company Verification
- API Endpoints Integration

**前置条件**:
```bash
# 设置环境变量
export NICE_DNB_API_KEY=your-api-key
export NICE_DNB_API_SECRET_KEY=your-secret-key
export NICE_DNB_API_URL=https://openapi.nicednb.com  # 可选，默认为此值
```

**用法**:
```bash
# 使用默认业务号码运行
python tests/integration/test_nice_dnb_api_real.py

# 使用特定业务号码运行
python tests/integration/test_nice_dnb_api_real.py --business-number "123-45-67890"

# 使用公司名称验证运行
python tests/integration/test_nice_dnb_api_real.py --business-number "123-45-67890" --company-name "Example Corp"

# 跳过 API 端点测试（如果服务器未运行）
python tests/integration/test_nice_dnb_api_real.py --skip-endpoints
```

---

## 📈 预期输出

```
======================================================================
Gangwon Business Portal - Integration Test Suite
======================================================================
Start Time: 2025-11-26 10:00:00
Base URL: http://127.0.0.1:8000
======================================================================

✓ Server health check passed

============================================================
Running: authentication
============================================================

✅ PASS - TC1.1: Member Login
   Status: 200, Token received: eyJhbGciOiJIUzI1NiIs...

✅ PASS - TC1.2: Member Login (Wrong Password)
   Status: 401, Correctly rejected invalid credentials

...

======================================================================
INTEGRATION TEST SUMMARY REPORT
======================================================================
Timestamp: 2025-11-26T10:05:00.000000

📊 OVERALL RESULTS:
   Total Tests: 50
   Passed: 48 ✅
   Failed: 2 ❌
   Success Rate: 96.0%

📋 MODULE BREAKDOWN:
----------------------------------------------------------------------
Module                      Tests   Passed   Failed       Rate
----------------------------------------------------------------------
authentication                  8        8        0     100.0% ✅
member_management               7        7        0     100.0% ✅
performance_management          9        9        0     100.0% ✅
project_management              8        7        1      87.5%
content_management             10       10        0     100.0% ✅
support                        10        9        1      90.0%
nice_dnb_api                   8        8        0     100.0% ✅
----------------------------------------------------------------------

⚠️ 2 TEST(S) FAILED - Review failed tests above
======================================================================
```

---

## 📝 编写测试指南

### 后端单元测试

1. **测试 Service 层**:
   ```python
   @pytest.mark.unit
   @pytest.mark.asyncio
   async def test_service_method(mock_db_session):
       service = MyService()
       result = await service.my_method(mock_db_session)
       assert result is not None
   ```

2. **使用 Fixtures**:
   ```python
   # 使用 conftest.py 中的 fixtures
   def test_with_fixture(sample_member, mock_db_session):
       assert sample_member.id is not None
   ```

3. **Mock 外部依赖**:
   ```python
   @patch('module.external_service')
   def test_with_mock(mock_service):
       mock_service.return_value = "mocked"
       # test code
   ```

### 添加新的集成测试

1. 在 `tests/integration/` 中创建新的测试文件:
   ```python
   # test_new_module_api.py
   class NewModuleAPITester:
       def __init__(self, base_url: str):
           self.base_url = base_url
           self.results = []
       
       def log_result(self, test_name: str, success: bool, details: str):
           # ... logging logic
       
       def test_something(self) -> bool:
           # ... test logic
           return True
       
       def run_all_tests(self) -> dict:
           # ... run all tests
           return summary
   
   def main():
       tester = NewModuleAPITester(BASE_URL)
       return tester.run_all_tests()
   
   if __name__ == "__main__":
       main()
   ```

2. 在 `run_all_tests.py` 的 `TEST_MODULES` 中添加:
   ```python
   TEST_MODULES = [
       # ... existing modules
       ("new_module", "integration.test_new_module_api"),
   ]
   ```

---

## 🎯 测试优先级

### 高优先级（必须测试）

1. **认证服务** (`user/service.py`)
   - ✅ 密码验证
   - ✅ Token 创建和验证
   - ✅ 用户注册
   - ✅ 登录逻辑

2. **会员服务** (`member/service.py`)
   - ✅ 会员资料获取
   - ✅ 会员资料更新
   - ✅ 会员审批

3. **绩效服务** (`performance/service.py`)
   - ⚠️ 绩效数据创建
   - ⚠️ 绩效数据更新
   - ⚠️ 绩效审批

4. **API 端点** (所有 router.py)
   - ⚠️ 关键端点测试
   - ⚠️ 错误处理测试

### 中优先级（重要功能）

1. **项目服务** (`project/service.py`)
2. **内容服务** (`content/service.py`)
3. **支持服务** (`support/service.py`)
4. **上传服务** (`upload/service.py`)

### 低优先级（可选）

1. **工具函数** (`shared/utils/`)
2. **通用模块** (email, export, audit)

---

## 📈 覆盖率目标

### 模块覆盖率目标

| 模块 | 当前 | 目标 | 状态 |
|------|------|------|------|
| 后端 Services | ~30% | 80% | 🔄 进行中 |
| 后端 Routers | ~50% | 70% | ⚠️ 待开始 |
| **总体** | **40-50%** | **70%+** | 🔄 进行中 |

---

## ✅ 测试覆盖率提升计划

### 已完成的工作

#### 1. 后端测试框架配置 ✅

- ✅ **添加测试依赖** (`requirements.txt`)
  - `pytest-cov==4.1.0` - 覆盖率工具
  - `pytest-mock==3.12.0` - Mock 支持
  - `pytest-xdist==3.5.0` - 并行测试
  - `httpx==0.27.0` - HTTP 客户端（用于测试）

- ✅ **创建 Pytest 配置** (`pytest.ini`)
  - 配置测试发现模式
  - 配置覆盖率报告（HTML, XML, JSON）
  - 设置覆盖率阈值（70%）
  - 定义测试标记（unit, integration, slow 等）

- ✅ **创建覆盖率配置** (`.coveragerc`)
  - 配置源代码路径
  - 排除不需要测试的文件
  - 配置报告格式

- ✅ **创建共享 Fixtures** (`tests/conftest.py`)
  - `mock_db_session` - Mock 数据库会话
  - `sample_member_data` - 示例会员数据
  - `sample_member` - 示例会员对象
  - `sample_member_profile` - 示例会员资料
  - `auth_service` - AuthService 实例
  - `mock_settings` - Mock 应用设置

- ✅ **创建单元测试目录结构** (`tests/unit/`)
  - `__init__.py` - 包初始化
  - `test_auth_service.py` - AuthService 单元测试（包含密码验证、Token 创建/验证等）
  - `test_member_service.py` - MemberService 单元测试（包含资料获取、更新、审批等）
  - `test_performance_service.py` - PerformanceService 单元测试（包含绩效记录 CRUD、审批流程等）
  - `test_project_service.py` - ProjectService 单元测试（包含项目管理、申请流程等）
  - `test_content_service.py` - ContentService 单元测试（包含通知、新闻、横幅、系统信息等）
  - `test_support_service.py` - SupportService 单元测试（包含 FAQ、咨询管理等）
  - `test_upload_service.py` - UploadService 单元测试（包含文件上传、下载、删除等）
  - `test_email_service.py` - EmailService 单元测试（包含邮件发送、模板渲染等）
  - `test_audit_service.py` - AuditLogService 单元测试（包含审计日志创建、查询等）
  - `test_export_service.py` - ExportService 单元测试（包含 Excel/CSV 导出等）

- ✅ **创建测试运行脚本**
  - `run_unit_tests.py` - 运行单元测试
  - `run_all_tests_with_coverage.py` - 运行所有测试并生成覆盖率报告

#### 2. 后端单元测试实现 ✅

**已完成**:
- ✅ 完善 `test_auth_service.py`（包含密码验证、Token 创建/验证、注册等测试用例）
- ✅ 完善 `test_member_service.py`（包含资料获取、更新、列表、审批等完整测试用例）
- ✅ 创建 `test_performance_service.py`（包含绩效记录 CRUD、状态管理、审批流程等）
- ✅ 创建 `test_project_service.py`（包含项目管理、申请流程、状态更新等）
- ✅ 创建 `test_content_service.py`（包含通知、新闻、横幅、系统信息管理等）
- ✅ 创建 `test_support_service.py`（包含 FAQ 管理、咨询创建/回复等）
- ✅ 创建 `test_upload_service.py`（包含文件上传、下载、删除、权限验证等）
- ✅ 创建 `test_email_service.py`（包含邮件发送、模板渲染、各种通知邮件等）
- ✅ 创建 `test_audit_service.py`（包含审计日志创建、查询、过滤等）
- ✅ 创建 `test_export_service.py`（包含 Excel/CSV 导出、格式化等）

**测试覆盖**:
- 所有主要 Service 层方法
- 成功场景和错误场景
- 权限验证和边界条件
- 使用 Mock 隔离外部依赖

**待完成**:
- [x] 创建通用模块测试（email, export, audit）✅
- [x] 修复 bcrypt 版本兼容性问题（测试环境）✅
- [x] 运行完整测试套件并生成覆盖率报告 ✅
- [ ] 修复失败的测试用例（50 个失败，14 个错误）
- [ ] 提高测试覆盖率至 70%+

### 进行中的工作

#### 1. 测试环境优化

**待完成**:
- [ ] 修复 bcrypt 库版本兼容性问题
- [ ] 确保所有测试可以在 CI/CD 环境中运行
- [ ] 优化测试执行速度

### 下一步计划

#### 立即执行（本周）

1. **修复测试环境问题**
   - 修复 bcrypt 版本兼容性问题（测试中的警告）
   - 确保所有测试可以正常运行
   - 验证新创建的通用模块测试

2. **运行完整测试套件**
   - 运行所有单元测试并生成覆盖率报告
   - 检查测试覆盖率是否达到目标（70%+）
   - 修复任何失败的测试用例

3. **测试优化和文档更新**
   - 优化测试执行速度
   - 更新测试文档和示例
   - 确保所有测试可以在 CI/CD 环境中运行

#### 短期目标（1-2周）

4. **集成测试优化**
   - 优化现有集成测试
   - 添加缺失的集成测试用例

5. **覆盖率报告**
   - 设置 CI/CD 自动生成覆盖率报告
   - 配置覆盖率阈值检查

---

## 📋 检查清单

### 后端

- [x] 配置 pytest 和 pytest-cov
- [x] 创建单元测试目录结构
- [x] 创建共享 fixtures (conftest.py)
- [x] 编写 AuthService 单元测试（密码验证、Token 管理、注册等）
- [x] 编写 MemberService 单元测试（资料管理、审批流程等）
- [x] 编写 PerformanceService 单元测试（绩效记录 CRUD、审批流程等）
- [x] 编写 ProjectService 单元测试（项目管理、申请流程等）
- [x] 编写 ContentService 单元测试（通知、新闻、横幅、系统信息等）
- [x] 编写 SupportService 单元测试（FAQ、咨询管理等）
- [x] 编写 UploadService 单元测试（文件上传、下载、权限验证等）
- [x] 编写通用模块测试（email, export, audit）✅
- [ ] 修复测试环境问题（bcrypt 版本兼容性）

---

## 🔧 工具和配置

### 后端

- **pytest**: 测试框架
- **pytest-cov**: 覆盖率工具
- **pytest-asyncio**: 异步测试支持
- **pytest-mock**: Mock 支持
- **pytest-xdist**: 并行测试支持

### 配置

环境变量:
```bash
# 自定义基础 URL
export TEST_BASE_URL=http://localhost:8000

# Nice D&B API 凭证（真实 API 测试）
export NICE_DNB_API_KEY=your-api-key
export NICE_DNB_API_SECRET_KEY=your-secret-key
export NICE_DNB_API_URL=https://openapi.nicednb.com
```

---

## 🚨 常见问题

### 1. 测试运行缓慢

**解决方案**:
- 使用单元测试而不是集成测试
- 使用 mocks 而不是真实服务
- 并行运行测试 (`pytest -n auto`)

### 2. 测试不稳定

**解决方案**:
- 避免依赖外部服务
- 使用固定的测试数据
- 清理测试状态

### 3. 覆盖率不准确

**解决方案**:
- 确保所有测试文件被包含
- 检查 `.coveragerc` 配置
- 排除不需要测试的文件

### 4. 测试环境问题

**注意事项**:
- 后端测试需要 Python 3.11+
- 确保所有依赖已安装
- 使用 fixtures 和 mocks，避免依赖真实数据
- 测试数据应该是独立的、可重复的

### 5. 覆盖率目标

- 关键业务逻辑：80%+
- 一般功能：70%+
- 工具函数：60%+

---

## 📚 参考资源

- [Pytest 文档](https://docs.pytest.org/)
- [Vitest 文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [测试最佳实践](https://testingjavascript.com/)

---

## 📝 更新日志

- **2025-01-29**: 创建测试覆盖率提升指南
- **2025-01-29**: 配置后端测试框架和工具
- **2025-01-29**: 创建测试示例和工具函数
- **2025-01-29**: 合并测试文档为统一 README.md
- **2025-11-28**: 完成主要 Service 层单元测试
  - 完善 AuthService 和 MemberService 测试
  - 创建 PerformanceService、ProjectService、ContentService 测试
  - 创建 SupportService 和 UploadService 测试
  - 总计新增 80+ 个单元测试用例
- **2025-11-28**: 完成通用模块单元测试
  - 创建 EmailService 测试（邮件发送、模板渲染等）
  - 创建 AuditLogService 测试（审计日志管理）
  - 创建 ExportService 测试（Excel/CSV 导出）
  - 总计新增 30+ 个单元测试用例
- **2025-11-28**: 修复测试环境问题
  - 修复 bcrypt 版本兼容性问题（降级到 3.2.2 以兼容 passlib 1.7.4）
  - 修复导入路径问题（email 和 export 服务）
  - 更新 pytest.ini 配置以过滤 bcrypt 警告
  - 当前测试覆盖率：50.39%（目标：70%+）
  - 测试统计：65 通过，50 失败，14 错误（共 129 个测试）
- **2025-11-28**: 整理测试相关文件到 tests/ 目录
  - 移动配置文件：`pytest.ini`, `.coveragerc` 到 `tests/` 目录
  - 移动覆盖率报告：`coverage.json`, `coverage.xml`, `htmlcov/`, `.coverage` 到 `tests/` 目录
  - 移动缓存目录：`.pytest_cache/` 到 `tests/` 目录
  - 更新所有测试脚本中的路径引用（`run_all_tests_with_coverage.py`, `run_unit_tests.py`）
  - 更新 `.gitignore` 配置以忽略 tests/ 目录中的测试文件
  - 所有测试相关文件现在统一在 `tests/` 目录中管理，保持项目根目录整洁
- **2025-11-28**: 修复注册相关测试
  - 修复了所有5个注册相关的测试用例（`test_auth_service.py` 和 `test_user_router.py`）
  - 修复了 `nice_dnb_client` 的 patch 路径问题
  - 添加了必需的 `terms_agreed` 字段到所有注册测试用例
  - 完善了数据库操作的 mock（`db.flush()`, `db.commit()`, `db.refresh()`）
  - 修复了 `email_service` 的 mock 设置
  - 测试通过数：从 171 个增加到 **176 个** ✅
  - 测试失败数：从 15 个减少到 **10 个** 🔄
  - 通过率：从 92% 提升到 **94.6%** ✅

---

## 📚 相关文档

- [Test Cases](../../docs/TEST_CASES.md) - 详细测试用例规范
- [API Documentation](http://localhost:8000/docs) - Swagger UI
- [Backend README](../README.md) - 后端开发指南
