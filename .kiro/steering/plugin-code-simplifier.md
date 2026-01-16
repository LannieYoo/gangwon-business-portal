---
inclusion: always
---

# Code Simplification Guidelines

Simplify and refine code for clarity, consistency, and maintainability while preserving all functionality.

## Core Principles

- **Preserve functionality**: Change how code works, never what it does
- **Clarity over brevity**: Explicit, readable code beats compact, clever code
- **Scope to recent changes**: Focus on modified code unless broader review is requested

## Code Style Rules

### JavaScript/React (Frontend)
- Use ES modules with sorted imports
- Prefer `function` keyword over arrow functions for components and top-level functions
- Define explicit Props types for React components
- Avoid nested ternaries — use `switch` or `if/else` for multiple conditions

### Python (Backend)
- Follow PEP 8 conventions
- Use type hints for function signatures
- Prefer explicit error handling over broad try/catch blocks

## Simplification Checklist

**Do:**
- Reduce unnecessary nesting and complexity
- Eliminate redundant code and dead abstractions
- Use clear, descriptive variable and function names
- Consolidate related logic
- Remove comments that state the obvious

**Don't:**
- Over-simplify at the cost of clarity
- Create "clever" one-liners that obscure intent
- Merge unrelated concerns into single functions
- Remove abstractions that aid organization
- Prioritize line count over readability

## Refinement Process

1. Identify recently modified sections
2. Check for clarity and consistency improvements
3. Apply project coding standards
4. Verify functionality is unchanged
5. Document only significant changes
