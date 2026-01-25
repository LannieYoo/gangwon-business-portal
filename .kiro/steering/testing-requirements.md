---
inclusion: fileMatch
fileMatchPattern: "**/test_*.py,**/*.test.{ts,tsx,js,jsx},**/*.spec.{ts,tsx,js,jsx}"
---

# Testing Requirements (测试要求)

## Minimum Test Coverage: 80% (最低测试覆盖率：80%)

**MANDATORY**: All production code must have at least 80% test coverage.

### Test Types (ALL Required)

1. **Unit Tests** (单元测试)
   - Individual functions
   - Utilities
   - Components
   - Business logic

2. **Integration Tests** (集成测试)
   - API endpoints
   - Database operations
   - Service interactions
   - External API calls

3. **E2E Tests** (端到端测试)
   - Critical user flows
   - Authentication flows
   - Payment processes
   - Core business workflows

## Test-Driven Development (TDD) - MANDATORY

**Required workflow for ALL new features:**

```
1. RED    - Write failing test first
2. GREEN  - Implement minimal code to pass
3. REFACTOR - Improve code quality
4. VERIFY - Check 80%+ coverage
5. REPEAT - Continue cycle
```

### Why TDD is Mandatory

- **Prevents bugs**: Catches issues before they reach production
- **Better design**: Forces you to think about interfaces first
- **Confidence**: Enables fearless refactoring
- **Documentation**: Tests serve as living documentation
- **Coverage**: Naturally achieves high coverage

## Test Structure (AAA Pattern)

```typescript
test('descriptive test name', () => {
  // Arrange - Set up test data
  const input = { name: 'Test', age: 25 }
  
  // Act - Execute the code under test
  const result = processUser(input)
  
  // Assert - Verify the result
  expect(result.isValid).toBe(true)
  expect(result.name).toBe('Test')
})
```

```python
def test_descriptive_name():
    # Arrange
    input_data = {"name": "Test", "age": 25}
    
    # Act
    result = process_user(input_data)
    
    # Assert
    assert result["is_valid"] is True
    assert result["name"] == "Test"
```

## Test Naming Conventions

### ✅ Good Test Names

```typescript
test('returns empty array when no items match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to cache when database unavailable', () => {})
test('validates email format before saving user', () => {})
```

### ❌ Bad Test Names

```typescript
test('works', () => {})
test('test search', () => {})
test('it should work correctly', () => {})
```

## Test Organization

### File Structure

```
src/
├── services/
│   ├── user-service.ts
│   └── user-service.test.ts      # Co-located tests
├── utils/
│   ├── validation.ts
│   └── validation.test.ts
tests/
├── integration/
│   ├── api/
│   │   └── users.test.ts         # Integration tests
│   └── database/
│       └── queries.test.ts
└── e2e/
    ├── auth-flow.spec.ts         # E2E tests
    └── checkout-flow.spec.ts
```

### Python Structure

```
backend/
├── app/
│   ├── services/
│   │   └── user_service.py
│   └── utils/
│       └── validation.py
└── tests/
    ├── unit/
    │   ├── test_user_service.py
    │   └── test_validation.py
    ├── integration/
    │   ├── test_api_users.py
    │   └── test_database.py
    └── e2e/
        └── test_auth_flow.py
```

## Unit Test Examples

### TypeScript

```typescript
import { calculateDiscount } from './pricing'

describe('calculateDiscount', () => {
  test('applies 10% discount for orders over $100', () => {
    const result = calculateDiscount(150)
    expect(result).toBe(135)
  })

  test('applies no discount for orders under $100', () => {
    const result = calculateDiscount(50)
    expect(result).toBe(50)
  })

  test('throws error for negative amounts', () => {
    expect(() => calculateDiscount(-10)).toThrow('Invalid amount')
  })
})
```

### Python

```python
import pytest
from app.services.pricing import calculate_discount

def test_applies_discount_for_large_orders():
    result = calculate_discount(150)
    assert result == 135

def test_no_discount_for_small_orders():
    result = calculate_discount(50)
    assert result == 50

def test_raises_error_for_negative_amounts():
    with pytest.raises(ValueError, match="Invalid amount"):
        calculate_discount(-10)
```

## Integration Test Examples

### API Testing (TypeScript)

```typescript
import { describe, test, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app'

describe('POST /api/users', () => {
  test('creates new user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User'
      })

    expect(response.status).toBe(201)
    expect(response.body.data.email).toBe('test@example.com')
  })

  test('returns 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'invalid-email',
        name: 'Test User'
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid email')
  })
})
```

### API Testing (Python)

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_user_with_valid_data():
    response = client.post(
        "/api/users",
        json={"email": "test@example.com", "name": "Test User"}
    )
    assert response.status_code == 201
    assert response.json()["data"]["email"] == "test@example.com"

def test_returns_400_for_invalid_email():
    response = client.post(
        "/api/users",
        json={"email": "invalid-email", "name": "Test User"}
    )
    assert response.status_code == 400
    assert "Invalid email" in response.json()["error"]
```

## E2E Test Examples

### Playwright (TypeScript)

```typescript
import { test, expect } from '@playwright/test'

test('user can sign up and log in', async ({ page }) => {
  // Navigate to sign up page
  await page.goto('/signup')

  // Fill in form
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'SecurePass123!')
  await page.click('button[type="submit"]')

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Welcome')
})

test('user cannot access protected page without auth', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Should redirect to login
  await expect(page).toHaveURL('/login')
})
```

## Test Isolation

### ✅ Good - Isolated Tests

```typescript
describe('UserService', () => {
  let service: UserService
  let mockDb: MockDatabase

  beforeEach(() => {
    mockDb = new MockDatabase()
    service = new UserService(mockDb)
  })

  afterEach(() => {
    mockDb.clear()
  })

  test('creates user', async () => {
    const user = await service.createUser({ email: 'test@example.com' })
    expect(user.email).toBe('test@example.com')
  })
})
```

### ❌ Bad - Shared State

```typescript
// DON'T DO THIS
let sharedUser: User

test('creates user', async () => {
  sharedUser = await service.createUser({ email: 'test@example.com' })
})

test('updates user', async () => {
  // Depends on previous test!
  await service.updateUser(sharedUser.id, { name: 'New Name' })
})
```

## Mocking Best Practices

### Mock External Dependencies

```typescript
import { vi } from 'vitest'

// Mock external API
vi.mock('./api-client', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked' })
}))

test('handles API response', async () => {
  const result = await processData()
  expect(result).toBe('mocked')
})
```

```python
from unittest.mock import patch, MagicMock

@patch('app.services.api_client.fetch_data')
def test_handles_api_response(mock_fetch):
    mock_fetch.return_value = {"data": "mocked"}
    result = process_data()
    assert result == "mocked"
```

## Coverage Requirements

### Minimum Coverage by Type

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical paths only

### Check Coverage

```bash
# TypeScript/JavaScript
npm run test:coverage

# Python
uv run pytest --cov=app --cov-report=html
uv run pytest --cov=app --cov-report=term-missing
```

### Coverage Report

```
Name                      Stmts   Miss  Cover   Missing
-------------------------------------------------------
app/services/user.py         45      2    96%   23-24
app/utils/validation.py      30      0   100%
app/api/routes.py            60      8    87%   45-52
-------------------------------------------------------
TOTAL                       135     10    93%
```

## Troubleshooting Test Failures

### 1. Test Fails Unexpectedly

```
✓ Check test isolation
✓ Verify mocks are correct
✓ Check for race conditions
✓ Review test data setup
✓ Check environment variables
```

### 2. Flaky Tests

```
✓ Add proper waits in E2E tests
✓ Avoid time-dependent assertions
✓ Use deterministic test data
✓ Mock external dependencies
✓ Increase timeouts if needed
```

### 3. Low Coverage

```
✓ Identify untested code paths
✓ Add tests for edge cases
✓ Test error handling
✓ Test validation logic
✓ Test business rules
```

## Pre-Commit Testing Checklist

Before every commit:

- [ ] All tests pass locally
- [ ] Coverage is 80%+ (check with coverage tool)
- [ ] No skipped tests (unless documented)
- [ ] No console.log in tests
- [ ] Test names are descriptive
- [ ] Tests are isolated (no shared state)
- [ ] Mocks are properly configured
- [ ] E2E tests pass for critical flows

## CI/CD Testing

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Check coverage
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**记住：测试不是可选的。80% 覆盖率是最低要求，不是目标。始终先写测试（TDD）。**
