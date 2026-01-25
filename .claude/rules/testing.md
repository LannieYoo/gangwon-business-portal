# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, components (Vitest)
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (Playwright)

## Test-Driven Development (TDD)

MANDATORY workflow for new features:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

Use `/tdd` command to enforce this workflow.

## Frontend Testing (React + Vitest)

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('renders user information correctly', () => {
    const user = { name: 'John', email: 'john@example.com' }
    render(<UserCard user={user} />)

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('handles missing user data gracefully', () => {
    render(<UserCard user={null} />)
    expect(screen.getByText(/no user/i)).toBeInTheDocument()
  })
})
```

## Zustand Store Testing

```javascript
import { renderHook, act } from '@testing-library/react'
import { useUserStore } from './userStore'

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ users: [] })
  })

  it('adds user correctly', () => {
    const { result } = renderHook(() => useUserStore())

    act(() => {
      result.current.addUser({ id: 1, name: 'John' })
    })

    expect(result.current.users).toHaveLength(1)
    expect(result.current.users[0].name).toBe('John')
  })
})
```

## E2E Testing (Playwright)

Use `/e2e` command for E2E test generation.

```javascript
import { test, expect } from '@playwright/test'

test.describe('User Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'invalid@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error')).toBeVisible()
  })
})
```

## i18n Testing

```javascript
import { renderWithI18n } from '@/test-utils'

it('renders translated text correctly', () => {
  const { getByText } = renderWithI18n(<Component />, { locale: 'ko' })
  expect(getByText('환영합니다')).toBeInTheDocument()
})
```

## Test Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Troubleshooting Test Failures

1. Use **tdd-guide** agent for complex test scenarios
2. Check test isolation (each test should be independent)
3. Verify mocks are correct
4. Fix implementation, not tests (unless tests are wrong)
5. Use `/build-fix` if tests fail after refactoring

## Test File Organization

```
frontend/src/
├── features/
│   └── feature-name/
│       ├── components/
│       │   ├── Component.jsx
│       │   └── Component.test.jsx
│       ├── hooks/
│       │   ├── useHook.js
│       │   └── useHook.test.js
│       └── services/
│           ├── service.js
│           └── service.test.js
```

## Critical User Flows (Must Have E2E Tests)

- [ ] User registration and login
- [ ] Project application submission
- [ ] Performance report submission
- [ ] FAQ and inquiry submission
- [ ] Language switching
- [ ] Admin member management
