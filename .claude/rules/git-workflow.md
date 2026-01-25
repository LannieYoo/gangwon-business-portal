# Git Workflow

## Commit Message Format

Follow Conventional Commits:

```
<type>: <description>

<optional body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `style`: Code style changes (formatting, missing semicolons, etc.)

Examples:
```
feat: 添加用户认证功能
fix: 修复登录页面表单验证错误
refactor: 重构项目列表组件以提高性能
docs: 更新 API 文档
```

## Branch Naming

```
feature/feature-name
fix/bug-description
refactor/component-name
```

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff main...HEAD` to see all changes
3. Draft comprehensive PR summary in Chinese and English
4. Include test plan with checklist
5. Push with `-u` flag if new branch

PR Template:
```markdown
## Summary
[简要描述变更内容]

## Changes
- [变更点 1]
- [变更点 2]

## Test Plan
- [ ] 单元测试通过
- [ ] E2E 测试通过
- [ ] 手动测试关键流程
- [ ] i18n 翻译完整

## Screenshots (if UI changes)
[截图]
```

## Feature Implementation Workflow

1. **Plan First**
   - Break down into phases
   - Identify dependencies and risks
   - Use `/plan` command if complex

2. **TDD Approach**
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify coverage

3. **Code Review**
   - Use `/code-review` command
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Detailed commit messages
   - Follow conventional commits format
   - Include co-author attribution

## Pre-commit Checklist

- [ ] No console.log statements
- [ ] No hardcoded secrets
- [ ] All tests passing
- [ ] i18n keys added for new strings
- [ ] Code formatted (Prettier)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
