---
inclusion: manual
---

# Git Workflow Standards (Git 工作流规范)

## Commit Message Format (提交信息格式)

```
<type>: <description>

<optional body>
```

### Types (类型)

- **feat**: New feature (新功能)
- **fix**: Bug fix (修复)
- **refactor**: Code refactoring (重构)
- **docs**: Documentation changes (文档)
- **test**: Test additions/changes (测试)
- **chore**: Build/tooling changes (构建/工具)
- **perf**: Performance improvements (性能)
- **ci**: CI/CD changes (持续集成)

### Examples (示例)

```
feat: add semantic search for markets

fix: resolve race condition in cache invalidation

refactor: extract user validation into separate service

docs: update API documentation for search endpoint

test: add integration tests for market creation

perf: optimize database queries with proper indexing
```

## Commit Best Practices (提交最佳实践)

### 1. Atomic Commits (原子提交)

Each commit should represent a single logical change:

```bash
# ✅ Good - Single logical change
git commit -m "feat: add user authentication"

# ❌ Bad - Multiple unrelated changes
git commit -m "feat: add auth, fix bug, update docs"
```

### 2. Descriptive Messages (描述性消息)

```bash
# ✅ Good - Clear and specific
git commit -m "fix: prevent duplicate market creation by adding unique constraint"

# ❌ Bad - Vague
git commit -m "fix: bug"
```

### 3. Present Tense (现在时态)

```bash
# ✅ Good
git commit -m "feat: add search functionality"

# ❌ Bad
git commit -m "feat: added search functionality"
```

## Branch Naming (分支命名)

```
<type>/<short-description>

Examples:
feature/semantic-search
fix/cache-race-condition
refactor/user-service
docs/api-documentation
```

## Pull Request Workflow (PR 工作流)

### 1. Before Creating PR (创建 PR 前)

```bash
# Update from main
git checkout main
git pull origin main

# Rebase your branch
git checkout feature/my-feature
git rebase main

# Run tests
uv run pytest tests/

# Check code quality
uv run ruff check .
uv run ruff format .
```

### 2. Creating PR (创建 PR)

**Analyze full commit history:**

```bash
# See all changes from base branch
git diff main...HEAD

# View commit history
git log main..HEAD --oneline
```

**PR Title Format:**

```
<type>: <clear description>

Examples:
feat: Add semantic search with OpenAI embeddings
fix: Resolve race condition in Redis cache
refactor: Extract market validation into service layer
```

**PR Description Template:**

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded secrets
```

### 3. Pushing Changes (推送更改)

```bash
# First push of new branch
git push -u origin feature/my-feature

# Subsequent pushes
git push
```

## Feature Implementation Workflow (功能实现工作流)

### 1. Plan First (先规划)

Before writing code:
- Define clear objectives
- Identify dependencies
- Break down into phases
- Consider edge cases

### 2. TDD Approach (测试驱动开发)

```
1. Write failing test (RED)
2. Implement minimal code (GREEN)
3. Refactor (IMPROVE)
4. Verify 80%+ coverage
```

### 3. Incremental Commits (增量提交)

```bash
# Commit after each logical step
git add tests/test_search.py
git commit -m "test: add tests for semantic search"

git add app/services/search.py
git commit -m "feat: implement semantic search service"

git add app/api/routes/search.py
git commit -m "feat: add search API endpoint"
```

### 4. Code Review (代码审查)

Before requesting review:
- [ ] Self-review all changes
- [ ] Run all tests
- [ ] Check code quality
- [ ] Update documentation
- [ ] Remove debug code

## Git Commands Reference (Git 命令参考)

### Common Operations (常用操作)

```bash
# Check status
git status

# View changes
git diff

# Stage changes
git add <file>
git add .

# Commit
git commit -m "type: description"

# Push
git push

# Pull latest
git pull

# Create branch
git checkout -b feature/my-feature

# Switch branch
git checkout main

# Delete branch
git branch -d feature/my-feature
```

### Advanced Operations (高级操作)

```bash
# Interactive rebase (clean up commits)
git rebase -i HEAD~3

# Amend last commit
git commit --amend

# Stash changes
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Reset to previous commit
git reset --soft HEAD~1  # Keep changes
git reset --hard HEAD~1  # Discard changes
```

## Merge vs Rebase (合并 vs 变基)

### Use Rebase (使用变基)

For feature branches to keep history clean:

```bash
git checkout feature/my-feature
git rebase main
```

### Use Merge (使用合并)

For integrating feature branches into main:

```bash
git checkout main
git merge feature/my-feature
```

## Handling Conflicts (处理冲突)

```bash
# During rebase
git rebase main

# If conflicts occur:
# 1. Resolve conflicts in files
# 2. Stage resolved files
git add <resolved-file>

# 3. Continue rebase
git rebase --continue

# Or abort if needed
git rebase --abort
```

## .gitignore Best Practices (.gitignore 最佳实践)

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
.venv/
__pycache__/

# Build outputs
dist/
build/
*.pyc

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary files
tmp/
temp/
```

## Pre-commit Checklist (提交前检查清单)

Before every commit:

- [ ] Code compiles/runs without errors
- [ ] All tests pass
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets or API keys
- [ ] Code follows style guidelines
- [ ] Comments explain WHY, not WHAT
- [ ] No unnecessary files included

## Common Mistakes to Avoid (常见错误)

### 1. Committing Secrets (提交密钥)

```bash
# ❌ Never commit
.env
config/secrets.json

# ✅ Always add to .gitignore
echo ".env" >> .gitignore
```

### 2. Large Commits (大型提交)

```bash
# ❌ Bad - Too many changes
git add .
git commit -m "feat: add everything"

# ✅ Good - Logical chunks
git add app/services/search.py
git commit -m "feat: add search service"

git add tests/test_search.py
git commit -m "test: add search tests"
```

### 3. Unclear Messages (不清晰的消息)

```bash
# ❌ Bad
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "update"

# ✅ Good
git commit -m "fix: resolve cache invalidation race condition"
git commit -m "feat: implement user authentication"
git commit -m "refactor: extract validation logic"
```

## Git Hooks (Git 钩子)

Consider setting up pre-commit hooks:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run tests
uv run pytest tests/ || exit 1

# Check code quality
uv run ruff check . || exit 1

# Check for secrets
if grep -r "sk-proj-" .; then
    echo "Error: API key found in code"
    exit 1
fi
```

## Resources (资源)

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**记住：清晰的 Git 历史是团队协作的基础。每次提交都应该是有意义的、可追溯的。**
