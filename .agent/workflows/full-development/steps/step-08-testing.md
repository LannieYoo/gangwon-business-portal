# Step 8: 测试

## 阶段信息
- **阶段**: 8/10 - 测试
- **Skill**: `dev-senior_qa`
- **输入**: `docs/prd.md`, `src/`
- **产出物**: `tests/`, 测试报告

---

## 执行步骤

### 1. 加载上下文

读取并分析：
- `docs/prd.md` - 验收标准
- `docs/stories.md` - 功能列表
- `src/backend/` - 后端代码
- `src/frontend/` - 前端代码

### 2. 加载 Skill

加载 `dev-senior_qa` skill，获取测试专业知识。

### 3. 测试策略

```
测试金字塔:
                    ┌─────┐
                    │ E2E │  少量
                   ─┴─────┴─
                  │Integration│  中量
                 ─┴───────────┴─
                │   Unit Tests   │  大量
               ─┴────────────────┴─
```

| 测试类型 | 覆盖目标 | 工具 |
|----------|----------|------|
| 单元测试 | 函数、类 | pytest/jest |
| 集成测试 | API、服务 | pytest/supertest |
| E2E 测试 | 用户流程 | playwright/cypress |

### 4. 目录结构

```
tests/
├── backend/
│   ├── unit/
│   │   ├── test_models.py
│   │   ├── test_services.py
│   │   └── test_utils.py
│   ├── integration/
│   │   ├── test_api_users.py
│   │   ├── test_api_orders.py
│   │   └── conftest.py
│   └── conftest.py
├── frontend/
│   ├── unit/
│   │   ├── components/
│   │   └── hooks/
│   ├── integration/
│   │   └── pages/
│   └── setup.ts
├── e2e/
│   ├── specs/
│   │   ├── auth.spec.ts
│   │   ├── orders.spec.ts
│   │   └── ...
│   └── playwright.config.ts
└── fixtures/
    ├── users.json
    └── orders.json
```

### 5. 单元测试

#### 5.1 后端单元测试
```python
# tests/backend/unit/test_user_service.py
import pytest
from unittest.mock import Mock, patch
from services.user_service import UserService
from schemas.user import UserCreate

class TestUserService:
    @pytest.fixture
    def mock_db(self):
        return Mock()

    @pytest.fixture
    def service(self, mock_db):
        return UserService(mock_db)

    def test_create_user_success(self, service, mock_db):
        # Arrange
        user_data = UserCreate(email="test@example.com", password="123456", name="Test")

        # Act
        result = service.create(user_data)

        # Assert
        assert result is not None
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_user_duplicate_email(self, service, mock_db):
        # Arrange
        mock_db.query.return_value.filter.return_value.first.return_value = Mock()
        user_data = UserCreate(email="existing@example.com", password="123456", name="Test")

        # Act & Assert
        with pytest.raises(ValueError, match="Email already exists"):
            service.create(user_data)
```

#### 5.2 前端单元测试
```tsx
// tests/frontend/unit/components/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from '@/components/features/UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<UserCard user={mockUser} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));

    expect(handleClick).toHaveBeenCalledWith(1);
  });
});
```

### 6. 集成测试

```python
# tests/backend/integration/test_api_users.py
import pytest
from fastapi.testclient import TestClient
from main import app

class TestUserAPI:
    @pytest.fixture
    def client(self):
        return TestClient(app)

    def test_create_user(self, client):
        # Arrange
        payload = {
            "email": "test@example.com",
            "password": "123456",
            "name": "Test User"
        }

        # Act
        response = client.post("/api/v1/users", json=payload)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

    def test_get_user_not_found(self, client):
        response = client.get("/api/v1/users/99999")
        assert response.status_code == 404
```

### 7. E2E 测试

```typescript
// tests/e2e/specs/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="name"]', 'New User');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.welcome-message')).toContainText('Welcome, New User');
  });

  test('user can login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

### 8. 覆盖率要求

| 类型 | 最低覆盖率 |
|------|------------|
| 后端单元测试 | 80% |
| 前端单元测试 | 70% |
| 集成测试 | 关键路径 100% |
| E2E 测试 | 核心流程 100% |

### 9. 运行测试

```bash
# 后端测试
cd src/backend
pytest --cov=. --cov-report=html

# 前端测试
cd src/frontend
npm run test -- --coverage

# E2E 测试
npx playwright test

# 全部测试
npm run test:all
```

### 10. 测试报告

生成 `docs/test-report.md`：

```markdown
# 测试报告

## 概览
- 测试日期: {date}
- 总测试数: {total}
- 通过: {passed}
- 失败: {failed}
- 跳过: {skipped}

## 覆盖率
| 模块 | 行覆盖率 | 分支覆盖率 |
|------|----------|------------|
| backend | 85% | 78% |
| frontend | 72% | 65% |

## 失败用例
(如有)

## E2E 测试结果
| 场景 | 状态 | 用时 |
|------|------|------|
| 用户注册 | ✓ | 2.3s |
| 用户登录 | ✓ | 1.8s |
```

---

## 完成检查

- [ ] 单元测试覆盖率达标
- [ ] 集成测试通过
- [ ] E2E 测试通过
- [ ] 无阻断性 Bug
- [ ] 测试报告已生成

## 状态更新

```yaml
phases:
  testing:
    status: completed
    completed_at: {current_time}
    coverage:
      backend: 85%
      frontend: 72%
    tests_passed: {n}
    tests_failed: 0
```

## 下一步

→ 进入 `step-09-review.md`
