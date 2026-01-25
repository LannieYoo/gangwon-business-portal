---
name: dev-github_review
description: GitHub 项目审查与集成专家。Use when (1) 审查 GitHub 开源项目, (2) 评估项目质量和架构, (3) 提取可复用的模式和组件, (4) 集成优秀实践到现有项目, (5) 学习和借鉴开源项目
---

# GitHub Project Review Expert

## Objectives

- 系统性评估 GitHub 项目的整体质量
- 分析项目架构、代码组织和技术选型
- 识别可复用的模式、组件和最佳实践
- 提取有价值的配置和工具链设置
- 制定集成计划，将优秀实践应用到现有项目
- 避免直接复制，理解原理后适配到自己的场景

## Project Location Convention

所有下载的 GitHub 项目统一存放在 `.github/` 目录：
```
.github/
├── project-name-1/          # 下载的开源项目
├── project-name-2/
└── everything-claude-code/  # 已有项目示例
```

## Review Workflow

### 1. Initial Assessment

**Project Overview:**
- Read README.md for project purpose, features, and setup instructions
- Check LICENSE for legal compliance
- Review CONTRIBUTING.md and CODE_OF_CONDUCT.md for community guidelines
- Examine .gitignore and .gitattributes for repository configuration

**Repository Health:**
- Check commit frequency and recency
- Review issue and PR activity
- Assess branch strategy (main/develop/feature branches)
- Verify release/tag management

### 2. Architecture Analysis

**Project Structure:**
```bash
# Examine directory layout
dir /s /b

# Identify key components
- Source code organization (src/, app/, lib/)
- Configuration files (package.json, pyproject.toml, etc.)
- Build and deployment configs (Dockerfile, docker-compose.yml)
- Infrastructure as code (terraform/, k8s/)
```

**Technology Stack:**
- Identify languages, frameworks, and libraries
- Check dependency management (package.json, requirements.txt, go.mod)
- Assess version constraints and update frequency
- Look for deprecated or unmaintained dependencies

**Design Patterns:**
- Identify architectural patterns (MVC, microservices, monolith)
- Check separation of concerns (layers, modules)
- Evaluate code organization (feature-based vs layer-based)
- Review API design and contracts

### 3. Code Quality Review

**Code Standards:**
- Check for linter/formatter configuration (.eslintrc, .prettierrc, ruff.toml)
- Review code style consistency
- Assess naming conventions (files, functions, variables)
- Verify type safety (TypeScript, Python type hints)

**Best Practices:**
- Error handling patterns
- Logging and monitoring setup
- Security practices (no hardcoded secrets, input validation)
- Performance considerations (caching, async operations)

**Code Smells:**
- Large files (>500 lines)
- Deep nesting (>3 levels)
- Duplicate code
- Complex functions (cyclomatic complexity)
- God objects/classes

### 4. Testing Assessment

**Test Coverage:**
- Locate test directories (tests/, __tests__, spec/)
- Check test types (unit, integration, e2e)
- Review test configuration (pytest.ini, jest.config.js)
- Assess coverage reports and thresholds

**Test Quality:**
- Test naming and organization
- Use of fixtures and mocks
- Test independence and isolation
- Edge case coverage

### 5. Documentation Review

**Essential Documentation:**
- [ ] README.md - Clear, comprehensive, up-to-date
- [ ] API documentation (OpenAPI/Swagger, JSDoc, docstrings)
- [ ] Architecture diagrams or ADRs (Architecture Decision Records)
- [ ] Setup and deployment guides
- [ ] Troubleshooting and FAQ

**Code Documentation:**
- Inline comments for complex logic
- Function/class docstrings
- Type annotations
- Examples and usage patterns

### 6. DevOps & CI/CD

**Automation:**
- Check CI/CD pipelines (.github/workflows/, .gitlab-ci.yml)
- Review build and test automation
- Assess deployment strategies
- Verify environment management

**Infrastructure:**
- Docker configuration quality
- Kubernetes manifests (if applicable)
- Cloud provider configurations
- Monitoring and logging setup

### 7. Security Review

**Security Checklist:**
- [ ] No hardcoded credentials or API keys
- [ ] Secrets management (environment variables, vaults)
- [ ] Dependency vulnerability scanning
- [ ] Input validation and sanitization
- [ ] Authentication and authorization implementation
- [ ] HTTPS/TLS configuration
- [ ] Security headers and CORS setup

**Dependency Security:**
```bash
# Check for known vulnerabilities
npm audit
pip-audit
```

### 8. Performance & Scalability

**Performance Indicators:**
- Database query optimization
- Caching strategies (Redis, in-memory)
- Async/concurrent operations
- Resource management (connections, file handles)
- Bundle size and optimization (frontend)

**Scalability Considerations:**
- Horizontal scaling capability
- Stateless design
- Load balancing readiness
- Database connection pooling

## Review Output Format

### Executive Summary
```markdown
## Project: [Name]
**Repository:** [URL]
**Language/Stack:** [Primary technologies]
**Overall Rating:** ⭐⭐⭐⭐☆ (4/5)

### Quick Assessment
- **Strengths:** [2-3 key strengths]
- **Concerns:** [2-3 main issues]
- **Recommendation:** [Adopt/Consider/Avoid with reasoning]
```

### Detailed Findings

**1. Architecture & Design**
- Rating: ⭐⭐⭐⭐☆
- Observations: [Key findings]
- Recommendations: [Specific improvements]

**2. Code Quality**
- Rating: ⭐⭐⭐☆☆
- Observations: [Key findings]
- Recommendations: [Specific improvements]

**3. Testing**
- Rating: ⭐⭐⭐⭐⭐
- Observations: [Key findings]
- Recommendations: [Specific improvements]

**4. Documentation**
- Rating: ⭐⭐⭐☆☆
- Observations: [Key findings]
- Recommendations: [Specific improvements]

**5. DevOps & CI/CD**
- Rating: ⭐⭐⭐⭐☆
- Observations: [Key findings]
- Recommendations: [Specific improvements]

**6. Security**
- Rating: ⭐⭐⭐⭐☆
- Observations: [Key findings]
- Recommendations: [Specific improvements]

### Priority Action Items

**High Priority:**
1. [Critical issue with specific fix]
2. [Security concern with remediation]

**Medium Priority:**
1. [Code quality improvement]
2. [Documentation gap]

**Low Priority:**
1. [Nice-to-have enhancement]
2. [Minor optimization]

### Learning Opportunities

- [Interesting pattern or technique used]
- [Novel approach to common problem]
- [Reusable component or utility]

## Review Strategies by Project Type

### Web Application
- Focus on: API design, frontend architecture, state management, security
- Check: CORS, authentication, input validation, XSS prevention

### Library/Package
- Focus on: API surface, documentation, examples, versioning
- Check: Semantic versioning, changelog, breaking changes, backward compatibility

### CLI Tool
- Focus on: User experience, error messages, help documentation
- Check: Argument parsing, exit codes, output formatting

### Microservice
- Focus on: Service boundaries, communication patterns, observability
- Check: Health checks, metrics, distributed tracing, circuit breakers

### Data Pipeline
- Focus on: Data validation, error handling, idempotency
- Check: Retry logic, dead letter queues, monitoring, data quality

## Common Red Flags

**Critical Issues:**
- ⚠️ Hardcoded secrets or credentials
- ⚠️ No tests or very low coverage (<30%)
- ⚠️ Outdated dependencies with known vulnerabilities
- ⚠️ No error handling or logging
- ⚠️ Missing authentication/authorization

**Warning Signs:**
- ⚠️ No recent commits (>6 months)
- ⚠️ Many open issues with no responses
- ⚠️ Inconsistent code style
- ⚠️ Large files (>1000 lines)
- ⚠️ Complex nested logic (>5 levels)

**Minor Concerns:**
- ⚠️ Incomplete documentation
- ⚠️ No CI/CD setup
- ⚠️ Missing type annotations
- ⚠️ No contribution guidelines

## Validation Steps

Before finalizing review:

1. **Completeness Check:**
   - [ ] All major directories explored
   - [ ] Key files reviewed (README, package.json, main source files)
   - [ ] Configuration files examined
   - [ ] Test suite assessed

2. **Accuracy Verification:**
   - [ ] Technology stack correctly identified
   - [ ] Architecture pattern accurately described
   - [ ] Ratings justified with evidence
   - [ ] Recommendations are actionable

3. **Balance Assessment:**
   - [ ] Both strengths and weaknesses identified
   - [ ] Constructive tone maintained
   - [ ] Context-appropriate expectations
   - [ ] Fair comparison to similar projects

## Quick Commands

```bash
# Clone and explore
git clone [repo-url]
cd [repo-name]

# Check project stats
git log --oneline --graph --all --decorate
git shortlog -sn --all

# Find large files
dir /s /b | ForEach-Object { Get-Item $_ | Where-Object { $_.Length -gt 100KB } }

# Count lines of code
Get-ChildItem -Recurse -Include *.py,*.js,*.ts | Get-Content | Measure-Object -Line

# Check dependencies
npm list --depth=0
pip list
```

## Resources

- [GitHub Best Practices](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12 Factor App](https://12factor.net/)
- [Semantic Versioning](https://semver.org/)

---

## Integration & Application

评估完成后，将优秀实践集成到你的项目中。

### Phase 1: Extraction (提取)

**识别可复用资源：**

1. **配置文件**
   ```bash
   # 查找配置文件
   dir .github\project-name\.* /s /b
   
   # 常见配置
   - .eslintrc.json, .prettierrc      # 代码风格
   - tsconfig.json                     # TypeScript 配置
   - pytest.ini, jest.config.js        # 测试配置
   - .pre-commit-config.yaml           # Git hooks
   - Dockerfile, docker-compose.yml    # 容器化
   - .github/workflows/*.yml           # CI/CD
   ```

2. **工具链脚本**
   ```bash
   # 查找脚本目录
   dir .github\project-name\scripts /s /b
   
   # 常见脚本
   - scripts/setup.sh                  # 环境设置
   - scripts/test.sh                   # 测试运行
   - scripts/build.sh                  # 构建脚本
   - scripts/deploy.sh                 # 部署脚本
   ```

3. **代码模式和组件**
   ```bash
   # 识别可复用模块
   - utils/                            # 工具函数
   - middleware/                       # 中间件
   - hooks/                            # React hooks 或其他 hooks
   - decorators/                       # 装饰器
   - types/                            # 类型定义
   ```

4. **文档模板**
   ```bash
   # 文档资源
   - README.md                         # 项目说明模板
   - CONTRIBUTING.md                   # 贡献指南
   - docs/                             # 文档结构
   - API.md                            # API 文档格式
   ```

### Phase 2: Analysis (分析)

**理解实现原理：**

1. **阅读核心代码**
   - 不要直接复制，理解设计思路
   - 识别关键抽象和接口
   - 理解依赖关系和数据流

2. **分析适用场景**
   - 这个模式解决什么问题？
   - 在我的项目中是否有类似需求？
   - 需要什么前置条件？

3. **评估集成成本**
   - 需要引入哪些依赖？
   - 是否与现有架构冲突？
   - 维护成本如何？

### Phase 3: Adaptation (适配)

**根据项目需求调整：**

1. **配置文件集成**
   ```bash
   # 比较现有配置
   # 示例：集成 ESLint 规则
   
   # 1. 查看源项目配置
   type .github\project-name\.eslintrc.json
   
   # 2. 提取有用规则
   # 3. 合并到项目配置
   # 4. 测试是否工作
   ```

2. **代码模式迁移**
   ```python
   # 示例：迁移错误处理模式
   
   # 源项目模式（理解）
   # .github/project-name/middleware/error_handler.py
   
   # 适配到你的项目
   # backend/app/middleware/error_handler.py
   # - 调整导入路径
   # - 适配日志系统
   # - 匹配异常类型
   ```

3. **工具链集成**
   ```bash
   # 示例：集成 pre-commit hooks
   
   # 1. 复制配置
   Copy-Item .github\project-name\.pre-commit-config.yaml .
   
   # 2. 调整 hook 配置
   # 3. 安装依赖
   uv add --dev pre-commit
   
   # 4. 安装 hooks
   uv run pre-commit install
   ```

### Phase 4: Integration Checklist (集成清单)

**按优先级集成：**

**High Priority (立即集成):**
- [ ] 安全相关配置（secrets 管理、依赖扫描）
- [ ] 关键错误处理模式
- [ ] 测试框架和配置
- [ ] CI/CD 流程改进

**Medium Priority (计划集成):**
- [ ] 代码风格和 linting 规则
- [ ] 项目结构优化
- [ ] 文档模板和规范
- [ ] 性能优化模式

**Low Priority (可选集成):**
- [ ] 辅助工具脚本
- [ ] 开发体验改进
- [ ] 额外的工具链集成

### Phase 5: Validation (验证)

**确保集成成功：**

1. **功能验证**
   ```bash
   # 运行测试
   uv run pytest
   
   # 检查 linting
   uv run ruff check .
   
   # 构建验证
   uv run python -m build
   ```

2. **兼容性检查**
   - 与现有代码是否冲突
   - 依赖版本是否兼容
   - 性能是否受影响

3. **文档更新**
   - 更新 README 说明新功能
   - 记录配置变更
   - 添加使用示例

### Integration Patterns (集成模式)

**Pattern 1: Configuration Merge (配置合并)**
```bash
# 适用于：ESLint, Prettier, TypeScript 配置等

# 1. 备份现有配置
Copy-Item .eslintrc.json .eslintrc.json.backup

# 2. 提取源项目规则
# 3. 选择性合并（不是全部复制）
# 4. 测试并调整
```

**Pattern 2: Module Extraction (模块提取)**
```bash
# 适用于：独立的工具函数、中间件、组件

# 1. 复制模块到临时位置
Copy-Item .github\project-name\utils\helper.py temp\

# 2. 调整导入和依赖
# 3. 编写测试
# 4. 集成到项目
```

**Pattern 3: Pattern Implementation (模式实现)**
```bash
# 适用于：设计模式、架构模式

# 1. 理解模式原理
# 2. 从零实现（不复制代码）
# 3. 根据项目需求调整
# 4. 添加文档说明
```

**Pattern 4: Tool Chain Adoption (工具链采用)**
```bash
# 适用于：CI/CD、pre-commit、测试工具

# 1. 复制配置文件
Copy-Item .github\project-name\.github\workflows\test.yml .github\workflows\

# 2. 调整路径和命令
# 3. 配置 secrets 和环境变量
# 4. 测试工作流
```

### Common Integration Scenarios

**Scenario 1: 集成 CI/CD 流程**
```yaml
# 从 .github/project-name/.github/workflows/ci.yml

# 提取有用的步骤：
- name: Run tests with coverage
  run: |
    pytest --cov=app --cov-report=xml
    
- name: Upload coverage
  uses: codecov/codecov-action@v3

# 适配到你的项目：
# - 调整测试路径
# - 配置 codecov token
# - 添加到你的 workflow
```

**Scenario 2: 集成错误处理中间件**
```python
# 从 .github/project-name/middleware/error_handler.py

# 理解核心逻辑：
# - 异常捕获机制
# - 错误响应格式
# - 日志记录方式

# 实现到你的项目：
# backend/app/middleware/error_handler.py
# - 使用你的日志系统
# - 匹配你的响应格式
# - 集成你的监控工具
```

**Scenario 3: 集成测试策略**
```python
# 从 .github/project-name/tests/

# 学习测试组织：
# - 目录结构
# - Fixture 使用
# - Mock 策略
# - 参数化测试

# 应用到你的项目：
# - 创建类似结构
# - 编写测试模板
# - 配置测试工具
```

**Scenario 4: 集成文档系统**
```bash
# 从 .github/project-name/docs/

# 提取文档结构：
- docs/
  ├── getting-started.md
  ├── api/
  ├── guides/
  └── architecture/

# 创建你的文档：
# - 复制结构
# - 使用模板格式
# - 添加你的内容
```

### Integration Best Practices

1. **渐进式集成**
   - 一次集成一个功能
   - 每次集成后测试
   - 确保稳定后再继续

2. **保持可追溯性**
   ```bash
   # 在 commit 中记录来源
   git commit -m "feat: add error handling middleware
   
   Inspired by: https://github.com/author/project
   Adapted for our FastAPI setup with custom logging"
   ```

3. **创建集成文档**
   ```markdown
   # docs/integrations.md
   
   ## Error Handling Middleware
   - Source: project-name
   - Integrated: 2024-01-23
   - Changes: Adapted for FastAPI, added custom logging
   - Maintainer: @your-name
   ```

4. **定期回顾**
   - 检查源项目更新
   - 评估集成效果
   - 考虑进一步优化

### Anti-Patterns (避免)

❌ **直接复制粘贴整个文件**
- 会引入不需要的依赖
- 可能与现有代码冲突
- 难以维护和理解

✅ **理解后重新实现**
- 只提取需要的部分
- 适配到项目上下文
- 保持代码一致性

❌ **盲目追求新技术**
- 不考虑团队技能
- 增加维护负担
- 过度工程化

✅ **务实选择**
- 评估团队能力
- 考虑长期维护
- 解决实际问题

### Quick Integration Commands

```bash
# 1. 探索项目结构
dir .github\project-name /s /b

# 2. 查找特定文件类型
dir .github\project-name\*.json /s /b
dir .github\project-name\*.yml /s /b

# 3. 比较配置文件
# 使用 VS Code 的 compare 功能
code --diff .github\project-name\.eslintrc.json .eslintrc.json

# 4. 复制并重命名
Copy-Item .github\project-name\utils\helper.py backend\app\utils\helper.py

# 5. 搜索特定模式
Select-String -Path .github\project-name\**\*.py -Pattern "class.*Middleware"

# 6. 统计代码行数
Get-ChildItem .github\project-name -Recurse -Include *.py | Get-Content | Measure-Object -Line
```

### Integration Output Template

```markdown
## Integration Report: [Feature Name]

**Source Project:** [project-name]
**Integration Date:** [YYYY-MM-DD]
**Integrated By:** [Your Name]

### What Was Integrated
- [ ] Configuration files
- [ ] Code patterns/modules
- [ ] Tool chain setup
- [ ] Documentation templates

### Changes Made
1. [Specific change 1]
2. [Specific change 2]
3. [Specific change 3]

### Dependencies Added
- package-name==version (reason)

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

### Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Integration notes added

### Follow-up Tasks
- [ ] Monitor performance
- [ ] Gather team feedback
- [ ] Consider additional features

### Notes
[Any additional context or considerations]
```
