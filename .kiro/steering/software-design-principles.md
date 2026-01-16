---
inclusion: always
---

# Software Design Principles

Apply SOLID + DRY + KISS principles when writing or modifying code.

## Principle Reference

| Principle | Requirement | Validation Check |
|-----------|-------------|------------------|
| SRP | One class, one responsibility | Can the responsibility be described in one sentence? |
| OCP | Extend via interfaces, don't modify existing code | Does adding features require changing existing code? |
| LSP | Subclasses must safely substitute parent classes | Does the subclass throw exceptions not declared by parent? |
| ISP | Keep interfaces small and focused | Must implementers provide all methods? |
| DIP | Depend on abstractions, use dependency injection | Does high-level code depend on interfaces or concrete classes? |
| DRY | No duplication, centralize definitions | Does changing one logic require edits in multiple places? |
| KISS | Keep it simple, avoid over-engineering | Can a newcomer understand this quickly? |

## Application Priority

**KISS > SRP > DRY > OCP/DIP > LSP/ISP**

When principles conflict, favor simplicity and single responsibility over abstraction.

## Guidelines for AI Assistants

- Prefer simple, readable solutions over clever abstractions
- Extract repeated logic only when duplication is clear (3+ occurrences)
- Use dependency injection for services and repositories
- Keep functions/methods focused on a single task
- Avoid premature optimization or over-generalization
- When refactoring, preserve existing behavior unless explicitly asked to change it
