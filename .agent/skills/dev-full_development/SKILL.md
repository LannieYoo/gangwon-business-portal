---
name: full-development
description: Complete software development lifecycle from requirements to deployment. Use when (1) starting a new project from scratch, (2) need structured end-to-end development process, (3) require comprehensive documentation and quality gates at each phase.
---

# Full Development

Execute complete software development lifecycle with automated phase management, quality gates, and state tracking.

## Objectives

- Guide through 11-phase development process from requirements to deployment
- Automatically skip completed phases based on state tracking
- Ensure quality gates at each phase transition
- Generate comprehensive documentation at each stage
- Maintain development state for resumable workflows

## Quick Start

### Commands

```bash
/full-dev                    # Start or continue development process
/full-dev status             # View current progress
/full-dev reset              # Reset state and start from beginning
/full-dev skip               # Skip current phase (with confirmation)
/full-dev goto <phase>       # Jump to specific phase
```

### Shortcuts

- `/spec-only` - Execute phases 1-5 (specification stages only, including UX design)
- `/impl-only` - Execute phases 6-10 (implementation stages only)
- `/quick-dev` - Skip documentation phases, go straight to implementation

## Development Phases

### Phase 1: Requirements Analysis

**Output:** `docs/requirements.md`

**Skills:** `dev-product_manager`

**Workflow:** `1-analysis/create-product-brief`

**Actions:**
1. Engage user to understand project vision
2. Identify target users and use cases
3. Define core features and constraints
4. Document non-functional requirements

**Completion Criteria:**
- Requirements document exists and contains: background, users, features, NFRs

### Phase 2: Product Requirements Document (PRD)

**Output:** `docs/prd.md`

**Skills:** `dev-product_manager`

**Workflow:** `2-plan-workflows/create-prd`

**Actions:**
1. Read requirements document
2. Create detailed user stories
3. Define acceptance criteria
4. Prioritize features

**Completion Criteria:**
- PRD exists with user stories, acceptance criteria, and priorities

### Phase 3: UX Design

**Output:** `docs/ux-design.md`

**Skills:** `dev-ux_designer`

**Workflow:** `2-plan-workflows/create-ux-design`

**Actions:**
1. Read PRD document
2. Create user personas from target users
3. Map user journeys for key workflows
4. Design information architecture
5. Define interaction patterns
6. Create visual design system
7. Plan usability testing framework

**Completion Criteria:**
- UX design document exists with personas, journey maps, IA, interaction patterns, design system

### Phase 4: System Architecture

**Output:** `docs/architecture.md`

**Skills:** `dev-senior_architect`

**Workflow:** `3-solutioning/create-architecture`

**Actions:**
1. Analyze PRD and UX design requirements
2. Select technology stack
3. Design system components
4. Define data flow and API contracts
5. Ensure architecture supports UX design needs

**Completion Criteria:**
- Architecture document exists with tech stack, components, data flow, API design
- Architecture aligns with UX design specifications

### Phase 5: Task Breakdown

**Output:** `docs/stories.md`

**Skills:** `dev-product_manager`

**Workflow:** `3-solutioning/create-epics-and-stories`

**Actions:**
1. Read architecture and UX design documents
2. Break down into epics
3. Create detailed stories
4. Establish task dependencies
5. Ensure stories cover all UX user journeys

**Completion Criteria:**
- Stories document exists with epics, stories, and dependency graph
- Stories cover all UX design user journeys

### Phase 6: Database Design

**Output:** `docs/database.md` + migration files

**Skills:** `dev-senior_data_engineer`

**Actions:**
1. Read architecture document
2. Design database schema
3. Create ER diagrams
4. Generate migration files
5. Design indexes and constraints

**Completion Criteria:**
- Database document exists with ER diagram, table structures, indexes
- Migration files created (if applicable)

### Phase 7: Backend Development

**Output:** Backend source code in `src/` or `backend/`

**Skills:** `dev-senior_backend`

**Workflow:** `4-implementation/dev-story`

**Actions:**
1. Read stories document
2. Implement models, routers, services, schemas
3. Follow TDD process (RED → GREEN → REFACTOR)
4. Run validation checks after each module

**Completion Criteria:**
- All backend stories completed
- Code quality checks pass
- Tests pass with 80%+ coverage
- API endpoints match design specifications

### Phase 8: Frontend Development

**Output:** Frontend source code in `src/` or `frontend/`

**Skills:** `dev-senior_frontend`, `dev-ux_designer`

**Workflow:** `4-implementation/dev-story`

**Actions:**
1. Read stories and UX design documents
2. Implement components, pages, state management
3. Follow TDD process
4. Ensure implementation matches UX design specifications
5. Run validation checks after each module

**Completion Criteria:**
- All frontend stories completed
- Code quality checks pass
- Tests pass with 80%+ coverage
- UI/UX matches design specifications

**Note:** Can run in parallel with Phase 7 if configured

### Phase 9: Testing

**Output:** Test suite in `tests/`

**Skills:** `dev-senior_qa`

**Workflow:** `testarch/automate`

**Actions:**
1. Read PRD acceptance criteria and UX design
2. Design test strategy
3. Implement automated tests (unit, integration, E2E)
4. Execute usability tests based on UX design framework
5. Execute test suite

**Completion Criteria:**
- Test coverage meets target (80%+)
- All tests pass
- Integration tests cover critical paths
- Usability tests validate UX design

### Phase 10: Code Review

**Output:** Review report

**Skills:** `dev-code_reviewer`

**Workflow:** `4-implementation/code-review`

**Actions:**
1. Review code quality and readability
2. Check security vulnerabilities
3. Verify test coverage
4. Validate architecture compliance
5. Generate review report
6. Fix critical issues

**Completion Criteria:**
- Review report generated
- All critical issues resolved
- No security vulnerabilities

### Phase 11: Deployment

**Output:** Deployment configuration and successful deployment

**Skills:** `dev-senior_devops`

**Actions:**
1. Configure deployment environment
2. Set up CI/CD pipeline
3. Execute deployment
4. Run health checks

**Completion Criteria:**
- Deployment successful
- Health checks pass
- Monitoring configured

## State Management

### State File: `.dev-state.yaml`

```yaml
project: project-name
started_at: 2025-02-01T10:00:00
current_phase: 4
config:
  parallel_frontend_backend: true
  auto_check: true
  docs_dir: docs
  src_dir: src
  tests_dir: tests
phases:
  requirements:
    status: completed
    completed_at: 2025-02-01T10:30:00
    output: docs/requirements.md
  prd:
    status: completed
    completed_at: 2025-02-01T11:00:00
    output: docs/prd.md
  ux_design:
    status: completed
    completed_at: 2025-02-01T11:30:00
    output: docs/ux-design.md
  architecture:
    status: in_progress
    started_at: 2025-02-01T12:00:00
  # ... other phases
```

### Phase Status Values

- `pending` - Not started
- `in_progress` - Currently executing
- `completed` - Finished and validated
- `skipped` - Manually skipped

### Skip Logic

For each phase, check in order:
1. State file marks as `completed`? → Skip
2. Output file exists and valid? → Mark completed, skip
3. Otherwise → Execute phase

## Validation Rules

### Document Validation

- File exists and is not empty
- Contains required sections
- Passes format validation

### Code Validation

- Syntax check passes
- Linting passes
- Tests pass
- Coverage meets threshold

### Deployment Validation

- Build succeeds
- Health checks pass
- No critical errors in logs

## Configuration Options

Add to `.dev-state.yaml`:

```yaml
config:
  # Enable parallel frontend/backend development
  parallel_frontend_backend: true
  
  # Auto-run validation checks
  auto_check: true
  
  # Custom check scripts
  check_scripts:
    database: scripts/check-database.py
    backend: scripts/check-backend.py
    frontend: scripts/check-frontend.py
  
  # Output directories
  docs_dir: docs
  src_dir: src
  tests_dir: tests
  
  # Quality thresholds
  test_coverage_threshold: 80
  code_quality_threshold: B
```

## Integration with Other Skills

This skill orchestrates multiple specialized skills:

- `dev-product_manager` - Requirements and PRD
- `dev-ux_designer` - UX research and design
- `dev-senior_architect` - Architecture design
- `dev-senior_backend` - Backend implementation
- `dev-senior_frontend` - Frontend implementation
- `dev-senior_data_engineer` - Database design
- `dev-senior_qa` - Testing strategy
- `dev-code_reviewer` - Code review
- `dev-senior_devops` - Deployment

## Best Practices

1. **Don't skip phases** - Each phase builds on previous work
2. **Validate before proceeding** - Ensure quality gates pass
3. **Update state regularly** - Keep `.dev-state.yaml` current
4. **Review outputs** - Check generated documents before moving forward
5. **Use parallel development** - Enable for faster iteration when possible

## Common Issues

### Phase Won't Skip

**Problem:** Phase re-executes despite output file existing

**Solution:** Check that output file is not empty and contains required sections

### State File Corruption

**Problem:** State file becomes invalid

**Solution:** Run `/full-dev reset` to reinitialize

### Validation Failures

**Problem:** Quality checks fail repeatedly

**Solution:** Review check script output, fix issues, then retry phase

## References

**For detailed workflow documentation:** See `.github/ai-dev-config/core/workflows/full-development/workflow.md`

**For phase-specific workflows:** See `.github/ai-dev-config/core/workflows/` subdirectories

**For skill documentation:** See individual skill SKILL.md files in `.github/ai-dev-config/core/skills/`
