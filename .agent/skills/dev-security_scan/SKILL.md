---
name: dev-security_scan
description: Automated security vulnerability scanner. Use when (1) checking for hardcoded secrets, (2) scanning for SQL injection risks, (3) detecting security issues before commit, (4) reviewing code security.
---

# Security Scanner

Automated security vulnerability detection tool.

## Objectives

- Detect hardcoded secrets (API keys, passwords, tokens)
- Identify SQL injection risks
- Find potential XSS vulnerabilities
- Check for insecure patterns
- Generate security reports

## Usage

### Scan Single File

```powershell
uv run python .skills/dev-security_scan/scripts/security_scanner.py <file_path>
```

### Scan Multiple Files

```powershell
Get-ChildItem -Recurse -Include *.py,*.ts,*.tsx,*.js,*.jsx | ForEach-Object {
    uv run python .skills/dev-security_scan/scripts/security_scanner.py $_.FullName
}
```

## Detection Patterns

### 1. Hardcoded Secrets

Detects:
- API keys (OpenAI, AWS, Azure, etc.)
- Database passwords
- JWT tokens
- Private keys
- Access tokens

### 2. SQL Injection

Detects:
- String concatenation in SQL queries
- Unparameterized queries
- Dynamic SQL construction

### 3. XSS Vulnerabilities

Detects:
- Unescaped user input
- Direct HTML injection
- Unsafe innerHTML usage

### 4. Insecure Patterns

Detects:
- Weak cryptography
- Insecure random number generation
- Unsafe deserialization
- Path traversal risks

## Output Format

```
Scanning: app/api/routes.py

CRITICAL Issues:
- Line 15: Hardcoded API key detected: "sk-proj-xxxxx"
- Line 42: SQL injection risk: string concatenation in query

HIGH Issues:
- Line 78: Potential XSS: unescaped user input

Summary:
- CRITICAL: 2
- HIGH: 1
- MEDIUM: 0
- Total Issues: 3
```

## Severity Levels

- **CRITICAL**: Immediate security risk (hardcoded secrets, SQL injection)
- **HIGH**: Serious vulnerability (XSS, weak crypto)
- **MEDIUM**: Potential issue (missing validation)
- **LOW**: Best practice violation

## Integration with Hooks

This script is automatically called by the `security-check` hook when you save code files.

## Related

- **Rule**: `.kiro/steering/security-guidelines.md`
- **Skill**: `.skills/dev-security_review/SKILL.md`
- **Hook**: `.kiro/hooks/security-check.json`
