---
name: dev-tdd_workflow
description: TDD 工作流专家。Use when (1) writing new features, (2) fixing bugs, (3) refactoring code. Enforces test-driven development with 80%+ coverage.
---

# 测试驱动开发工作流

确保所有代码开发遵循 TDD 原则，具有全面的测试覆盖。

## 触发场景

- 编写新功能或特性
- 修复 bug 或问题
- 重构现有代码
- 添加 API 端点
- 创建新组件

## 前置依赖

> **⚠️ 开始开发前，必须先检查以下 skill：**
>
> 1. **`dev-terminology`** - 确保命名符合项目术语字典
> 2. **`dev-libs_compatibility`** - 添加新依赖时检查兼容性

## 核心原则

### 1. 测试先于代码

始终先写测试，然后实现代码使测试通过。

### 2. 覆盖率要求

- **最低 80% 覆盖率**（单元 + 集成 + E2E）
- 所有边界情况覆盖
- 错误场景测试
- 边界条件验证

### 3. 测试类型

#### 单元测试

- 单独的函数和工具
- 组件逻辑
- 纯函数
- 辅助工具

#### 集成测试

- API 端点
- 数据库操作
- 服务交互
- 外部 API 调用

#### E2E 测试 (Playwright)

- 关键用户流程
- 完整工作流
- 浏览器自动化
- UI 交互

## TDD 工作流步骤

### 步骤 1: 编写用户故事

```
作为 [角色]，我想要 [行动]，以便 [收益]

示例：
作为用户，我想要语义搜索市场，
以便即使没有精确关键词也能找到相关市场。
```

### 步骤 2: 生成测试用例

对每个用户故事创建全面的测试用例：

```python
# Python/pytest
import pytest

class TestSemanticSearch:
    @pytest.mark.asyncio
    async def test_returns_relevant_markets(self, client):
        """测试返回相关市场"""
        response = await client.get("/api/search?q=election")
        assert response.status_code == 200
        assert len(response.json()["data"]) > 0

    @pytest.mark.asyncio
    async def test_handles_empty_query(self, client):
        """测试处理空查询"""
        response = await client.get("/api/search?q=")
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_fallback_when_redis_unavailable(self, client, mock_redis_down):
        """测试 Redis 不可用时的回退"""
        response = await client.get("/api/search?q=test")
        assert response.status_code == 200  # 回退成功

    @pytest.mark.asyncio
    async def test_sorts_by_similarity(self, client):
        """测试按相似度排序"""
        response = await client.get("/api/search?q=election")
        data = response.json()["data"]
        scores = [item["score"] for item in data]
        assert scores == sorted(scores, reverse=True)
```

```typescript
// TypeScript/Vitest
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Semantic Search", () => {
  it("returns relevant markets for query", async () => {
    // 使用 vitest 原生 fetch 模拟或 msw
    const response = await fetch("/api/search?q=election");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("handles empty query gracefully", async () => {
    const response = await fetch("/api/search?q=");
    expect(response.status).toBe(400);
  });

  it("falls back to substring search when Redis unavailable", async () => {
    // 使用 vi.mock 代替 jest.mock
    const mockRedis = vi.fn().mockRejectedValue(new Error("Connection failed"));
    // ... 测试逻辑
  });
});
```

### 步骤 3: 运行测试（应该失败）

```bash
# Python
uv run pytest tests/ -v

# TypeScript (Vitest)
npm test
# 或者指定文件
npx vitest tests/my-test.test.tsx

# 测试应该失败 - 我们还没有实现
```

### 步骤 4: 实现代码

编写最少的代码使测试通过：

```python
# 由测试指导的实现
async def search_markets(query: str) -> list[Market]:
    if not query:
        raise ValueError("查询不能为空")

    try:
        results = await redis_search(query)
    except RedisError:
        results = await fallback_search(query)

    return sorted(results, key=lambda x: x.score, reverse=True)
```

### 步骤 5: 再次运行测试

```bash
uv run pytest tests/ -v
# 测试现在应该通过
```

### 步骤 6: 重构

在保持测试通过的同时改进代码质量：

- 消除重复
- 改进命名
- 优化性能
- 增强可读性

### 步骤 7: 验证覆盖率

```bash
# Python
uv run pytest tests/ --cov=app --cov-report=html

# TypeScript
npm run test:coverage

# 验证达到 80%+ 覆盖率
```

## 测试模式

### 单元测试模式 (pytest)

```python
import pytest
from unittest.mock import AsyncMock, patch
from app.users.service import UserService

class TestUserService:
    @pytest.fixture
    def user_service(self):
        repo = AsyncMock()
        return UserService(repo)

    @pytest.mark.asyncio
    async def test_get_user_returns_user(self, user_service):
        # Arrange
        expected_user = User(id="1", name="Test")
        user_service.repo.find_by_id.return_value = expected_user

        # Act
        result = await user_service.get_user("1")

        # Assert
        assert result == expected_user
        user_service.repo.find_by_id.assert_called_once_with("1")

    @pytest.mark.asyncio
    async def test_get_user_raises_not_found(self, user_service):
        # Arrange
        user_service.repo.find_by_id.return_value = None

        # Act & Assert
        with pytest.raises(NotFoundError):
            await user_service.get_user("nonexistent")
```

### API 集成测试模式

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    # Arrange
    user_data = {"email": "test@example.com", "name": "Test User"}

    # Act
    response = await client.post("/api/users", json=user_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_create_user_invalid_email(client: AsyncClient):
    # Arrange
    user_data = {"email": "invalid-email", "name": "Test"}

    # Act
    response = await client.post("/api/users", json=user_data)

    # Assert
    assert response.status_code == 400
```

### E2E 测试模式 (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test.describe("用户搜索和筛选市场", () => {
  test("用户可以搜索市场", async ({ page }) => {
    // 导航到市场页面
    await page.goto("/");
    await page.click('a[href="/markets"]');

    // 验证页面加载
    await expect(page.locator("h1")).toContainText("市场");

    // 搜索市场
    await page.fill('input[placeholder="搜索市场"]', "election");

    // 等待防抖和结果
    await page.waitForTimeout(600);

    // 验证搜索结果显示
    const results = page.locator('[data-testid="market-card"]');
    await expect(results).toHaveCount(5, { timeout: 5000 });
  });

  test("用户可以创建新市场", async ({ page }) => {
    // 先登录
    await page.goto("/creator-dashboard");

    // 填写市场创建表单
    await page.fill('input[name="name"]', "测试市场");
    await page.fill('textarea[name="description"]', "测试描述");
    await page.fill('input[name="endDate"]', "2025-12-31");

    // 提交表单
    await page.click('button[type="submit"]');

    // 验证成功消息
    await expect(page.locator("text=市场创建成功")).toBeVisible();
  });
});
```

## 测试文件组织

```
project/
├── app/
│   └── users/
│       ├── service.py
│       ├── routes.py
│       └── tests/
│           ├── test_service.py    # 单元测试
│           └── test_routes.py     # 集成测试
├── tests/
│   ├── conftest.py               # 共享 fixtures
│   ├── integration/              # 集成测试
│   └── e2e/                      # E2E 测试
│       ├── test_markets.py
│       └── test_auth.py
└── pyproject.toml
```

## Mock 外部服务

### Mock 数据库

```python
@pytest.fixture
def mock_db():
    return AsyncMock()

@pytest.fixture
def user_service(mock_db):
    return UserService(mock_db)
```

### Mock Redis

```python
@pytest.fixture
def mock_redis():
    with patch('app.core.redis.redis_client') as mock:
        mock.get.return_value = None
        mock.set.return_value = True
        yield mock
```

### Mock 外部 API

```python
@pytest.fixture
def mock_openai():
    with patch('app.services.openai.client') as mock:
        mock.embeddings.create.return_value = Mock(
            data=[Mock(embedding=[0.1] * 1536)]
        )
        yield mock
```

## 测试覆盖率验证

### 运行覆盖率报告

```bash
# Python
uv run pytest tests/ --cov=app --cov-report=term-missing

# TypeScript
npm run test:coverage
```

### 覆盖率阈值配置

```toml
# pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=app --cov-fail-under=80"
```

```typescript
// vitest.config.ts (或 vite.config.ts)
export default defineConfig({
  test: {
    environment: "jsdom", // 必须安装 jsdom 依赖
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## 常见测试错误

### ❌ 错误：测试实现细节

```python
# 不要测试内部状态
assert component._internal_count == 5
```

### ✅ 正确：测试用户可见行为

```python
# 测试用户看到的内容
assert response.json()["count"] == 5
```

### ❌ 错误：脆弱的选择器

```typescript
// 容易破坏
await page.click(".css-class-xyz");
```

### ✅ 正确：语义选择器

```typescript
// 对变化有弹性
await page.click('button:has-text("提交")');
await page.click('[data-testid="submit-button"]');
```

### ❌ 错误：测试不隔离

```python
# 测试互相依赖
def test_creates_user(): pass
def test_updates_same_user(): pass  # 依赖前一个测试
```

### ✅ 正确：独立测试

```python
# 每个测试设置自己的数据
def test_creates_user():
    user = create_test_user()
    # 测试逻辑

def test_updates_user():
    user = create_test_user()
    # 更新逻辑
```

## 持续测试

### 开发时监视模式

```bash
# Python
uv run pytest-watch

# TypeScript
npx vitest
# 监视模式是 Vitest 的默认模式
```

### Pre-commit Hook

```bash
# 每次提交前运行
uv run pytest tests/ && uv run ruff check .
```

### CI/CD 集成

```yaml
# GitHub Actions
- name: Run Tests
  run: uv run pytest tests/ --cov=app --cov-report=xml

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 最佳实践

1. **先写测试** - 始终 TDD
2. **每个测试一个断言** - 聚焦单一行为
3. **描述性测试名称** - 解释测试内容
4. **Arrange-Act-Assert** - 清晰的测试结构
5. **Mock 外部依赖** - 隔离单元测试
6. **测试边界情况** - Null, undefined, 空, 大值
7. **测试错误路径** - 不只是正常路径
8. **保持测试快速** - 单元测试 < 50ms
9. **测试后清理** - 无副作用
10. **审查覆盖率报告** - 识别差距

## 成功指标

- 80%+ 代码覆盖率达成
- 所有测试通过（绿色）
- 无跳过或禁用的测试
- 快速测试执行（单元测试 < 30s）
- E2E 测试覆盖关键用户流程
- 测试在生产前捕获 bug

---

**记住**：测试不是可选的。它们是使自信重构、快速开发和生产可靠性成为可能的安全网。
