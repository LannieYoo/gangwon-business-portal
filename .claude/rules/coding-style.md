# Coding Style

## Project Context
- Frontend: React + Vite + Zustand
- i18n: Multi-language support (ko, zh)
- Architecture: Feature-based module organization

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}

// Zustand Store Updates (CORRECT)
set((state) => ({
  users: state.users.map(u =>
    u.id === id ? { ...u, name } : u
  )
}))

// WRONG in Zustand
set((state) => {
  state.users.push(newUser)  // MUTATION!
  return state
})
```

## File Organization

Follow feature-based modular architecture:

```
frontend/src/
├── features/           # New feature modules (preferred)
│   └── feature-name/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── stores/
│       └── locales/
├── shared/            # Shared utilities
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   └── utils/
```

Guidelines:
- MANY SMALL FILES > FEW LARGE FILES
- 200-400 lines typical, 800 max
- High cohesion, low coupling
- Extract utilities from large components
- Organize by feature/domain, not by type

## Component Best Practices

```javascript
// PREFER: Named exports for tree-shaking
export const UserCard = ({ user }) => {
  // Component logic
}

// AVOID: Default exports (harder to refactor)
export default UserCard

// ALWAYS: Destructure props
const UserCard = ({ name, email, role }) => {
  // Use name, email, role directly
}

// NEVER: Use props object directly
const UserCard = (props) => {
  return <div>{props.name}</div>  // AVOID
}
```

## i18n Best Practices

```javascript
// ALWAYS: Use translation keys
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
<h1>{t('common.welcome')}</h1>

// NEVER: Hardcoded strings
<h1>Welcome</h1>  // WRONG
```

## Error Handling

ALWAYS handle errors comprehensively:

```javascript
try {
  const result = await apiService.fetchData()
  return result
} catch (error) {
  console.error('Failed to fetch data:', error)
  // Show user-friendly error message
  throw new Error(t('errors.fetchFailed'))
}
```

## Input Validation

```javascript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  name: z.string().min(1).max(100)
})

const validated = userSchema.parse(input)
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] No hardcoded values (use constants or env vars)
- [ ] No mutation (immutable patterns used)
- [ ] All strings internationalized (i18n)
- [ ] Components follow React best practices
- [ ] Zustand stores use immutable updates
