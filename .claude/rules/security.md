# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on all endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Sensitive data not logged in console

## Secret Management

```javascript
// NEVER: Hardcoded secrets
const apiKey = "your-api-key-here"
const dbPassword = "password123"

// ALWAYS: Environment variables
const apiKey = import.meta.env.VITE_API_KEY
const dbPassword = process.env.DB_PASSWORD

if (!apiKey) {
  throw new Error('VITE_API_KEY not configured')
}
```

## Frontend Security (React + Vite)

```javascript
// NEVER: Dangerous HTML injection
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ALWAYS: Sanitize user input
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />

// NEVER: Direct eval or Function constructor
eval(userCode)
new Function(userCode)()

// ALWAYS: Validate and parse safely
const validated = JSON.parse(safeString)
```

## API Security

```javascript
// ALWAYS: Validate request data
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100)
})

try {
  const validated = schema.parse(requestBody)
} catch (error) {
  return res.status(400).json({ error: 'Invalid input' })
}
```

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues
