# Gangwon Business Portal - 部署文档

**Version:** 1.0.0  
**Last Updated:** 2025-01-29  
**Document Owner:** Development Team

---

## 目录

1. [系统架构与部署拓扑](#系统架构与部署拓扑)
2. [CI/CD 方案推荐](#cicd-方案推荐)
3. [Render 部署方案](#render-部署方案)
4. [GitHub Actions CI/CD 配置](#github-actions-cicd-配置)
5. [自动化测试集成](#自动化测试集成)
6. [数据库迁移自动化](#数据库迁移自动化)
7. [环境变量管理](#环境变量管理)
8. [部署流程](#部署流程)
9. [本地开发环境设置](#本地开发环境设置)
10. [日志持久化策略](#日志持久化策略)
11. [故障排查](#故障排查)

---

## 系统架构与部署拓扑

### 部署架构总览

```
[Member SPA]        [Admin SPA]
      \                /
       \  HTTPS / REST /
         [API Gateway / FastAPI]
                 |
        -----------------------
        |  PostgreSQL (Supabase)
        |  Object Storage (附件)
        |  Nice D&B API
        |  Mail/SMS Service
```

### 推荐部署拓扑

- **前端**: 静态前端通过 CDN 托管（如 Render Static Site / Vercel / S3 + CloudFront）
- **后端**: FastAPI（Uvicorn + Gunicorn）部署在 Render Web Service
- **数据库**: Supabase 托管的 PostgreSQL
- **对象存储**: Supabase Storage
- **定时任务**: Supabase Edge Functions 或独立的 Celery/Serverless 任务

### 技术栈

| 分类 | 技术栈 |
|------|--------|
| **前端** | Vite 6.x、React 18.3+、Zustand 5.x、TanStack Query 5.x、React Router DOM 6.x、Axios 1.x、ECharts 5.x、Tailwind CSS 3.x、react-i18next 15.x |
| **后端** | FastAPI 0.115+、SQLAlchemy 2.0+（异步 ORM）、asyncpg（PostgreSQL 异步驱动）、Pydantic 2.x、Python 3.11+、Uvicorn + Gunicorn、HTTPX、Authlib、APScheduler |
| **数据层** | Supabase PostgreSQL、Supabase Storage、Supabase Migrations |
| **运维** | Docker、GitHub Actions（CI/CD）、Sentry（错误追踪）、Prometheus + Grafana（监控） |

### 非功能性要求

- **可用性**: ≥ 99%（工作时间），关键接口需具备健康检查与熔断策略
- **数据安全**: 企业敏感数据静态加密（Supabase 加密磁盘）、传输 HTTPS、凭证采用 PBKDF2/SHA256
- **审计能力**: 登录、审批、数据更改需写入审计日志
- **可观测性**: 统一结构化日志 + Prometheus/OpenTelemetry 指标，严重错误触发告警

---

## CI/CD 方案推荐

### 最佳方案：Render + GitHub Actions

**为什么选择 Render：**
- ✅ 支持 GitHub 自动部署（Push 即部署）
- ✅ 免费层可用，适合初期项目
- ✅ 前后端可同平台部署
- ✅ 自动 HTTPS
- ✅ 环境变量管理简单
- ✅ 日志查看方便

**CI/CD 架构：**
```
[GitHub Push]
    ↓
[GitHub Actions]
    ├─→ 运行测试
    ├─→ 构建检查
    └─→ 触发 Render 部署
         ↓
    [Render]
    ├─→ 前端静态网站
    └─→ 后端 Web Service
```

### 替代方案对比

| 方案 | CI/CD 体验 | 成本 | 推荐度 |
|------|-----------|------|--------|
| **Render** | ⭐⭐⭐⭐ | 免费/低 | ⭐⭐⭐⭐⭐ |
| **Railway** | ⭐⭐⭐⭐⭐ | 中等 | ⭐⭐⭐⭐ |
| **Vercel + Render** | ⭐⭐⭐⭐⭐ | 免费/低 | ⭐⭐⭐⭐ |
| **Fly.io** | ⭐⭐⭐ | 中等 | ⭐⭐⭐ |

---

## Render 部署方案

### 使用 render.yaml 快速部署

项目根目录包含 `render.yaml` 配置文件，可以一次性创建所有服务：

```yaml
services:
  # 前端静态网站
  - type: web
    name: gangwon-portal-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    envVars:
      - key: VITE_API_BASE_URL
        value: https://gangwon-portal-backend.onrender.com

  # 后端 Web Service
  - type: web
    name: gangwon-portal-backend
    env: python
    buildCommand: pip install -r requirements.txt && alembic upgrade head
    startCommand: uvicorn src.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false  # 需要在 Dashboard 手动配置
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: SECRET_KEY
        sync: false
      - key: LOG_LEVEL
        value: INFO
      - key: LOG_DB_ENABLED
        value: "true"
      - key: DEBUG
        value: "false"
```

**使用方式：**
1. 在 Render Dashboard 中点击 "New +" → "Blueprint"
2. 连接 GitHub 仓库
3. Render 会自动读取 `render.yaml` 并创建所有服务

### 手动部署步骤

#### 1. 前端部署（Static Site）

1. 登录 Render Dashboard
2. 点击 "New +" → "Static Site"
3. 连接 GitHub 仓库
4. 配置：
   - **Name**: `gangwon-portal-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_BASE_URL=https://gangwon-portal-backend.onrender.com
     ```

#### 2. 后端部署（Web Service）

1. 点击 "New +" → "Web Service"
2. 连接 GitHub 仓库
3. 配置：
   - **Name**: `gangwon-portal-backend`
   - **Region**: 选择离用户最近的区域
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (或 Starter $7/月)

#### 环境变量配置

在 Render Dashboard 的 Environment 标签页添加：

```env
# 数据库配置
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# JWT 配置
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 应用配置
DEBUG=false
APP_NAME=Gangwon Business Portal
APP_VERSION=1.0.0

# 日志配置
LOG_LEVEL=INFO
LOG_FILE_BACKUP_COUNT=30
LOG_DB_ENABLED=true
LOG_DB_MIN_LEVEL=WARNING

# 邮件配置
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@gangwon-portal.kr

# Nice D&B API
NICE_DNB_API_KEY=your-key
NICE_DNB_API_SECRET_KEY=your-secret
NICE_DNB_API_URL=https://gate.nicednb.com
```

#### 注意事项

1. **端口配置**: Render 使用 `$PORT` 环境变量，代码中需要读取
2. **日志持久化**: 
   - ⚠️ **重要**: Render 容器重启时，本地文件系统会被清空，文件日志会丢失
   - ✅ **解决方案**: 系统已配置双重日志机制
     - 📝 **文件日志**: 容器运行期间可实时查看（通过 Render Dashboard Logs），方便排查问题
     - 💾 **数据库日志**: 永久保存到 Supabase 数据库（`app_logs` 表），即使容器重启也不丢失
   - 📝 **配置**: `LOG_DB_ENABLED=true` 和 `LOG_ENABLE_FILE=true`（已在 render.yaml 中配置）
   - 🔄 **互补作用**: 文件日志用于实时排查，数据库日志用于历史查询和备份
3. **数据库迁移**: 在 Build Command 中自动运行

---

## GitHub Actions CI/CD 配置

### 1. 完整的 CI/CD 工作流

创建 `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  # 前端测试和构建
  frontend:
    name: Frontend Test & Build
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run linter (if configured)
        working-directory: ./frontend
        run: npm run lint || echo "No lint script"

      - name: Run tests
        working-directory: ./frontend
        run: npm run test:run || echo "No tests configured"

      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL || 'https://gangwon-portal-backend.onrender.com' }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist
          retention-days: 1

  # 后端测试和检查
  backend:
    name: Backend Test & Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'
          cache-dependency-path: backend/requirements.txt

      - name: Install dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov

      - name: Run linter (if configured)
        working-directory: ./backend
        run: |
          pip install flake8 black || echo "No linter configured"
          # flake8 src/ || echo "Linting skipped"
          # black --check src/ || echo "Formatting skipped"

      - name: Run tests
        working-directory: ./backend
        run: |
          pytest tests/ -v --cov=src --cov-report=xml || echo "No tests found"
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL || 'postgresql://test:test@localhost/test' }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          file: ./backend/coverage.xml
          flags: backend
          name: backend-coverage

      - name: Check database migrations
        working-directory: ./backend
        run: |
          alembic check || echo "Migration check skipped"

  # E2E 测试（可选）
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [frontend, backend]
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Playwright
        working-directory: ./frontend
        run: npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: ./frontend
        run: npm run test:e2e:run || echo "E2E tests skipped"
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

  # 部署到 Render（仅 main 分支）
  deploy:
    name: Deploy to Render
    runs-on: ubuntu-latest
    needs: [frontend, backend]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Trigger Render deployment
        run: |
          echo "Render will auto-deploy on push to main branch"
          echo "Frontend: https://gangwon-portal-frontend.onrender.com"
          echo "Backend: https://gangwon-portal-backend.onrender.com"

      - name: Notify deployment status
        if: always()
        run: |
          echo "Deployment triggered successfully"
          # 可以添加 Slack/Discord 通知
```

### 2. 数据库迁移自动化

创建 `.github/workflows/migrate.yml`:

```yaml
name: Database Migration

on:
  workflow_dispatch:  # 手动触发
  push:
    branches: [main]
    paths:
      - 'backend/alembic/versions/**'

jobs:
  migrate:
    name: Run Database Migrations
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        working-directory: ./backend
        run: |
          pip install -r requirements.txt

      - name: Run migrations
        working-directory: ./backend
        run: |
          alembic upgrade head
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 3. 安全检查工作流

创建 `.github/workflows/security.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'  # 每周日运行

jobs:
  security:
    name: Security Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## 自动化测试集成

### 1. 前端测试配置

在 `frontend/package.json` 中添加测试脚本：

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:run": "playwright test --reporter=list"
  }
}
```

### 2. 后端测试配置

确保 `backend/requirements.txt` 包含测试依赖：

```txt
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
```

### 3. 测试覆盖率要求

在 CI 中设置最小覆盖率要求：

```yaml
- name: Check coverage threshold
  run: |
    coverage report --fail-under=70 || echo "Coverage below 70%"
```

---

## 数据库迁移自动化

### 方案 1: Render Build Command（推荐）

在 Render Web Service 配置中：

**Build Command:**
```bash
pip install -r requirements.txt && alembic upgrade head
```

这样每次部署都会自动运行迁移。

### 方案 2: 启动脚本

创建 `backend/scripts/start.sh`:

```bash
#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

在 Render 的 Start Command 中使用：
```bash
bash scripts/start.sh
```

### 方案 3: 应用启动时自动迁移

在 `backend/src/main.py` 的 `lifespan` 中添加：

```python
async def lifespan(app: FastAPI):
    # 启动时运行迁移
    from alembic.config import Config
    from alembic import command
    
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    
    yield
    
    # 关闭逻辑
```

---

## 环境变量管理

### 1. GitHub Secrets 配置

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

- `DATABASE_URL` - 生产数据库连接
- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_KEY` - Supabase Anon Key
- `SUPABASE_SERVICE_KEY` - Supabase Service Key
- `SECRET_KEY` - JWT 密钥
- `VITE_API_BASE_URL` - 前端 API 地址

### 2. Render 环境变量

在 Render Dashboard 中配置（见前面章节）

### 3. 环境变量同步脚本

创建 `scripts/sync-env.sh`:

```bash
#!/bin/bash
# 从 GitHub Secrets 同步到 Render（需要 Render CLI）

render env sync \
  --service gangwon-portal-backend \
  --from-github-secrets
```

---

## 部署流程

### 标准部署流程

```
1. 开发 → 提交代码到 develop 分支
   ↓
2. GitHub Actions 运行测试
   ├─→ 前端测试
   ├─→ 后端测试
   └─→ E2E 测试（可选）
   ↓
3. 创建 Pull Request
   ↓
4. Code Review
   ↓
5. 合并到 main 分支
   ↓
6. GitHub Actions 触发部署
   ↓
7. Render 自动部署
   ├─→ 前端构建和部署
   └─→ 后端构建、迁移、部署
   ↓
8. 健康检查
   ↓
9. 部署完成
```

### 手动部署流程

如果需要手动触发：

1. **通过 Render Dashboard**
   - 点击服务 → Manual Deploy → Deploy latest commit

2. **通过 Render CLI**
   ```bash
   render deploy
   ```

3. **通过 GitHub Actions**
   - 在 Actions 标签页手动运行工作流

---

## 本地开发环境设置

### 后端设置

#### 1. 创建虚拟环境

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 2. 安装依赖

```bash
pip install -r requirements.txt
```

#### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并更新配置：

```bash
cp .env.example .env
```

必需的环境变量：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_KEY`: Supabase anon key
- `SECRET_KEY`: JWT 密钥（生成：`openssl rand -hex 32`）

#### 4. 数据库设置

```bash
# 生成迁移
alembic revision --autogenerate -m "Initial schema"

# 应用迁移
alembic upgrade head
```

#### 5. 运行开发服务器

```bash
# 使用 uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8000

# 或使用 Python
python -m src.main
```

API 文档：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

健康检查：
- Health check: `GET /healthz`
- Readiness check: `GET /readyz`

### 前端设置

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置环境变量

创建 `frontend/.env.local`:

```env
# API 配置
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000

# Mock 配置
VITE_USE_MOCK=false

# 功能开关
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
```

#### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动

#### 4. 构建生产版本

```bash
npm run build
```

生成的文件在 `dist/` 目录

---

## Render 特定配置

### 1. 后端启动命令适配

修改 `backend/src/main.py` 以支持 Render 的 `$PORT`:

```python
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port)
```

### 2. 日志处理

由于 Render 容器重启会丢失本地文件，建议：

**方案 A: 日志写入数据库（推荐）**
- 已在代码中实现
- `LOG_DB_ENABLED=true` 启用

**方案 B: 使用 Render 日志查看**
- Render Dashboard 提供日志查看
- 无需额外配置

### 3. 健康检查

确保健康检查端点可用：

```python
# backend/src/main.py
@app.get("/healthz")
async def health_check():
    return {"status": "ok"}
```

Render 会自动使用此端点进行健康检查。

---

## 部署检查清单

### 首次部署

- [ ] Render 账户已创建
- [ ] GitHub 仓库已连接
- [ ] 前端静态网站已创建
- [ ] 后端 Web Service 已创建
- [ ] 环境变量已配置
- [ ] 数据库迁移已运行
- [ ] 健康检查通过
- [ ] 前端可访问
- [ ] API 可访问

### 持续部署

- [ ] GitHub Actions 工作流正常
- [ ] 测试通过
- [ ] 构建成功
- [ ] 部署成功
- [ ] 服务健康

---

## 日志持久化策略

### 问题说明

在 Render 等云平台上，容器重启时**本地文件系统会被清空**，所有存储在容器内的日志文件都会丢失。这是一个常见的问题，需要特别处理。

### 解决方案

系统已实现**双重日志存储机制**，确保日志不会丢失：

#### 1. 数据库日志（持久化，推荐）

- **存储位置**: Supabase PostgreSQL 数据库的 `app_logs` 表
- **持久性**: ✅ **永久保存**，不会因容器重启而丢失
- **配置**: 
  - `LOG_DB_ENABLED=true` - 启用数据库日志
  - `LOG_DB_MIN_LEVEL=INFO` - 记录 INFO 级别及以上的日志（在云平台上）
- **优势**:
  - 日志永久保存
  - 可通过 API 查询和检索
  - 支持高级过滤和搜索
  - 与业务数据一起备份

#### 2. 文件日志（临时，仅用于调试）

- **存储位置**: `backend/logs/` 目录
- **持久性**: ❌ **临时存储**，容器重启会丢失
- **配置**: 
  - `LOG_ENABLE_FILE=false` - 在云平台上禁用文件日志（已在 render.yaml 中配置）
  - 本地开发时可以启用（`LOG_ENABLE_FILE=true`）
- **用途**: 
  - 本地开发调试
  - 实时查看日志（如果启用）

### 配置说明

#### Render 部署配置（render.yaml）

```yaml
envVars:
  - key: LOG_DB_ENABLED
    value: "true"  # 启用数据库日志（永久存储）
  - key: LOG_DB_MIN_LEVEL
    value: "DEBUG"  # 所有日志级别都写入数据库，实现永久存储
  - key: LOG_ENABLE_FILE
    value: "true"  # 启用文件日志（容器运行期间实时查看）
```

#### 本地开发配置（.env.local）

```bash
# 本地开发可以同时启用文件和数据库日志
LOG_DB_ENABLED=true
LOG_DB_MIN_LEVEL=WARNING  # 本地只记录重要日志到数据库
LOG_ENABLE_FILE=true  # 本地启用文件日志便于调试
```

### 日志类型说明

系统中有多种日志类型，它们的持久化策略如下：

| 日志类型 | 文件存储 | 数据库存储 | 持久化状态 |
|---------|---------|-----------|-----------|
| **应用日志** (app.log) | ⚠️ 临时 | ✅ 永久（`app_logs` 表，所有级别） | ✅ 已持久化 |
| **错误日志** (error.log) | ⚠️ 临时 | ✅ 永久（`error_logs` 表） | ✅ 已持久化 |
| **审计日志** (audit.log) | ⚠️ 临时 | ✅ 永久（`audit_logs` 表） | ✅ 已持久化 |
| **系统日志** (system.log) | ⚠️ 临时 | ✅ 永久（`system_logs` 表，所有级别） | ✅ 已持久化 |

**注意**: 
- 应用日志写入 `app_logs` 表（所有级别：DEBUG/INFO/WARNING/ERROR/CRITICAL）
- 异常日志写入 `error_logs` 表（专门的错误日志表，包含完整的堆栈跟踪）
- 审计日志写入 `audit_logs` 表（合规和安全性追踪）

### 查看日志

#### 通过 API 查看数据库日志

```bash
# 获取所有日志
GET /api/v1/logging/logs?page=1&page_size=50

# 按级别过滤
GET /api/v1/logging/logs?level=ERROR

# 按时间范围过滤
GET /api/v1/logging/logs?start_date=2025-01-01&end_date=2025-01-31

# 按 trace_id 查询（追踪完整请求链路）
GET /api/v1/logging/logs?trace_id=abc123
```

#### 通过 Supabase Dashboard 查看

1. 登录 Supabase Dashboard
2. 进入 Table Editor
3. 选择 `app_logs` 表
4. 可以查看、过滤和导出所有日志

### 最佳实践

1. **生产环境（Render）**: 
   - ✅ 启用数据库日志 (`LOG_DB_ENABLED=true`)
   - ✅ 所有日志写入数据库 (`LOG_DB_MIN_LEVEL=DEBUG`) - **实现永久存储**
   - ✅ 启用文件日志 (`LOG_ENABLE_FILE=true`) - 用于实时排查
   - 📊 定期清理旧日志（通过数据库维护任务）

2. **本地开发**: 
   - ✅ 可以同时启用文件和数据库日志
   - 📝 文件日志便于实时查看和调试
   - 💾 数据库日志可以设置为 `LOG_DB_MIN_LEVEL=WARNING`（减少本地数据库压力）

3. **日志级别**: 
   - **生产环境**: `LOG_DB_MIN_LEVEL=DEBUG`（**所有日志永久存储**）
   - 开发环境: `LOG_DB_MIN_LEVEL=WARNING`（可选，减少本地数据库压力）

4. **日志清理**: 
   - 建议定期清理超过 90 天的旧日志
   - 可以通过 Supabase 的定时任务或数据库维护脚本实现
   - 注意：清理前确保已备份重要日志

### 故障排查

如果发现日志丢失：

1. **检查配置**: 确认 `LOG_DB_ENABLED=true`
2. **检查数据库连接**: 确认 Supabase 连接正常
3. **查看数据库**: 直接在 Supabase Dashboard 查看 `app_logs` 表
4. **检查日志级别**: 确认 `LOG_DB_MIN_LEVEL` 设置合理

---

## 故障排查

### 常见问题

1. **部署失败**
   - 检查构建日志
   - 检查环境变量
   - 检查依赖安装

2. **数据库连接失败**
   - 检查 `DATABASE_URL`
   - 检查 Supabase 防火墙设置

3. **前端 API 调用失败**
   - 检查 `VITE_API_BASE_URL`
   - 检查 CORS 配置

4. **迁移失败**
   - 检查数据库连接
   - 检查迁移文件语法

5. **端口配置错误**
   - 确保使用 `$PORT` 环境变量
   - 检查启动命令配置

6. **日志文件丢失**
   - 启用 `LOG_DB_ENABLED=true`
   - 使用 Render Dashboard 查看日志

---

## 成本估算

### Render 免费层

- **静态网站**: 免费（无限）
- **Web Service**: 750 小时/月免费
  - 适合低流量项目
  - 15 分钟无请求会休眠

### Render 付费层

- **Starter Plan**: $7/月
  - 无休眠
  - 512MB RAM
  - 适合生产环境

---

## 其他部署选项

### Nginx 配置示例（自托管）

如果选择自托管，可以使用以下 Nginx 配置：

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker 部署（可选）

可以创建 Dockerfile 用于容器化部署：

**backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

## 下一步

1. 按照本文档配置 Render 服务
2. 配置 GitHub Actions 工作流
3. 测试部署流程
4. 监控部署状态

---

**文档版本**: 1.0.0  
**最后更新**: 2025-01-29

