---
inclusion: always
---

# Data Transformation Boundaries

Define where different types of data transformations should occur in the application architecture.

## Core Rule

Data transformations are strictly separated into two categories:

1. **Technical transformations**: Field naming format (camelCase ↔ snake_case)
2. **Business transformations**: Display formatting (dates, numbers, null values)

## Transformation Boundaries

### Technical Transformations → API Interceptors ONLY

**Location**: `frontend/src/shared/services/api.service.js`

**Responsibility**: Automatic conversion between frontend (camelCase) and backend (snake_case) naming conventions

**Allowed**:
```javascript
// ✅ CORRECT - Field naming conversion in interceptor
apiClient.interceptors.request.use((config) => {
  if (config.data && typeof config.data === 'object') {
    config.data = toSnakeCase(config.data);
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object') {
    return toCamelCase(response.data);
  }
  return response.data;
});
```

**Forbidden**:
```javascript
// ❌ NEVER format data in interceptors
apiClient.interceptors.response.use((response) => {
  response.data.createdAt = formatDate(response.data.createdAt);  // ❌
  response.data.name = response.data.name || '-';                 // ❌
  response.data.amount = formatNumber(response.data.amount);      // ❌
  return response.data;
});
```

### Business Transformations → Component Layer ONLY

**Location**: React components or custom hooks

**Responsibility**: Format data for user display while preserving original values

**Required Hook**: `useDateFormatter` from `@shared/hooks`

**Allowed**:
```javascript
// ✅ CORRECT - Format in component using hook
import { useDateFormatter } from '@shared/hooks';

function PerformanceDetail({ record }) {
  const { formatDateTime, formatDate, formatNumber, formatValue } = useDateFormatter();
  
  return (
    <div>
      <span>{formatDateTime(record.createdAt)}</span>
      <span>{formatDate(record.startDate)}</span>
      <span>{formatNumber(record.salesAmount)}</span>
      <span>{formatValue(record.companyName)}</span>
    </div>
  );
}
```

**Forbidden**:
```javascript
// ❌ NEVER transform data in service layer
async function getProjects() {
  const response = await api.get('/projects');
  return response.data.map(project => ({
    ...project,
    createdAt: formatDate(project.createdAt),  // ❌
    amount: formatNumber(project.amount),      // ❌
    name: project.name || '-'                  // ❌
  }));
}

// ✅ CORRECT - Service returns raw data
async function getProjects() {
  const response = await api.get('/projects');
  return response.data;
}
```

## Service Layer Rules

Service layer functions (`*.service.js`) MUST:
- Only handle API communication
- Return raw response data without transformation
- Not perform any data formatting or mapping

Service layer functions MUST NOT:
- Format dates, numbers, or other values
- Convert null/undefined to display strings like '-'
- Map or rename fields (handled by interceptor)
- Apply any business logic transformations

## useDateFormatter Hook

**Location**: `frontend/src/shared/hooks/index.js`

**Available methods**:
- `formatDateTime(dateString)` - Format date with time (YYYY-MM-DD HH:mm)
- `formatDate(dateString)` - Format date only (YYYY-MM-DD)
- `formatNumber(value)` - Add thousand separators
- `formatValue(value)` - Display '-' for null/undefined/empty values

**Features**:
- Automatic language detection (Chinese/Korean)
- Null-safe (handles null, undefined, empty string)
- Error handling to prevent crashes
- Performance optimized with useCallback

## Quick Reference Table

| Transformation Type | Purpose | Correct Location | Forbidden Locations | Reason |
|---------------------|---------|------------------|---------------------|--------|
| camelCase ↔ snake_case | Naming convention | ✅ API interceptor | ❌ Service layer<br>❌ Components | Technical boundary - handle once at API edge |
| Date formatting | User display | ✅ Components<br>✅ Hooks | ❌ API interceptor<br>❌ Service layer | Needs language context, preserves raw data |
| Number formatting | User display | ✅ Components<br>✅ Hooks | ❌ API interceptor<br>❌ Service layer | Needs language context, preserves raw data |
| Null → '-' display | User display | ✅ Components<br>✅ Hooks | ❌ API interceptor<br>❌ Service layer | Loses original data type, breaks conditionals |

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Formatting in Interceptor
```javascript
// ❌ WRONG - Loses original date, breaks date calculations
apiClient.interceptors.response.use((response) => {
  response.data.createdAt = new Date(response.data.createdAt).toLocaleDateString();
  return response.data;
});
```

**Problems**: Loses original date object, can't perform date math, can't adapt to user language, breaks form editing

### ❌ Anti-Pattern 2: Transforming in Service
```javascript
// ❌ WRONG - Service should only communicate with API
async function getPerformance(id) {
  const response = await api.get(`/performance/${id}`);
  return {
    ...response.data,
    createdAt: formatDate(response.data.createdAt),
    amount: formatNumber(response.data.amount)
  };
}
```

**Problems**: Violates single responsibility, hard to test, loses raw data for calculations

### ❌ Anti-Pattern 3: Converting Nulls in Interceptor
```javascript
// ❌ WRONG - Loses data type information
apiClient.interceptors.response.use((response) => {
  function convertEmpty(obj) {
    if (obj === null || obj === undefined || obj === '') return '-';
    // ...recursive processing
  }
  return convertEmpty(response.data);
});
```

**Problems**: Loses null/undefined/empty distinction, breaks `if (value)` checks, form editing treats '-' as real value

## Validation Checklist

When writing or reviewing code, verify:

- [ ] API interceptor only performs camelCase ↔ snake_case conversion
- [ ] Service layer returns raw API responses without transformation
- [ ] Date formatting uses `useDateFormatter` in components
- [ ] Number formatting uses `useDateFormatter` in components
- [ ] Null display uses `formatValue` in components
- [ ] Original data preserved for logic and calculations

## Summary

**Remember this simple rule**:

```
API Interceptor  = Technical transformation (naming format)
Component/Hook   = Business transformation (display format)
Service Layer    = No transformation (pure API communication)
```

Following this separation ensures predictable data flow, maintainable code, and proper separation of concerns.
