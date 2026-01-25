---
name: dev-architecture_refactor
description: 基于架构图进行系统级重构。Use when (1) 需要根据架构图重构整个项目, (2) 对齐代码结构与架构设计, (3) 实现架构图中的组件和流程, (4) 验证现有代码是否符合架构设计
---

# Architecture-Driven Refactoring

## Objectives

- 分析架构图，识别所有组件和数据流
- 对比现有代码结构与目标架构
- 制定详细的重构计划
- 逐步实施重构，确保系统可用性
- 验证重构后的代码符合架构设计

## Refactoring Workflow

### Phase 1: Architecture Analysis (架构分析)

**从架构图中提取信息：**

1. **识别组件 (Components)**
   - 列出所有服务/模块（如 FastAPI, RAG Orchestrator, Azure OpenAI）
   - 标注每个组件的职责
   - 识别组件间的依赖关系

2. **识别数据流 (Data Flow)**
   - 追踪用户请求的完整路径
   - 标注每个步骤的输入输出
   - 识别异步/同步处理点

3. **识别外部依赖 (External Dependencies)**
   - 云服务（Azure Blob Storage, Azure AI Search）
   - API 服务（Azure OpenAI）
   - 数据库和缓存

4. **识别关键流程 (Key Processes)**
   - 文档上传和处理流程
   - 查询和检索流程
   - 生成和返回流程

**输出：架构组件清单**

```markdown
## Architecture Components

### Core Services
- [ ] FastAPI Backend
- [ ] RAG Orchestrator
- [ ] Document Processor
- [ ] Vector Store Manager

### External Services
- [ ] Azure Blob Storage
- [ ] Azure AI Search
- [ ] Azure OpenAI (GPT-4o, ADA002)

### Data Flow
1. User Query → FastAPI → RAG Orchestrator
2. RAG Orchestrator → Vector Search → Azure AI Search
3. Retrieved Context + Query → Prompt Engineering
4. Prompt → Azure OpenAI GPT-4o → Response
5. Response → FastAPI → User
```

### Phase 2: Current State Assessment (现状评估)

**分析现有代码结构：**

1. **扫描项目目录**
   ```bash
   # 列出所有主要目录和文件
   tree -L 3 -I 'node_modules|__pycache__|.git'
   ```

2. **识别现有组件**
   - 哪些架构组件已经实现？
   - 哪些组件缺失？
   - 哪些代码不在架构图中？

3. **评估代码质量**
   - 组件职责是否清晰？
   - 是否存在紧耦合？
   - 是否有重复代码？

4. **识别技术债务**
   - 临时解决方案（TODO, FIXME）
   - 过时的依赖
   - 不一致的命名和结构

**输出：Gap Analysis（差距分析）**

```markdown
## Gap Analysis

### ✅ Already Implemented
- FastAPI backend structure
- Basic document upload

### ⚠️ Partially Implemented
- RAG logic (needs refactoring)
- Vector search (incomplete)

### ❌ Missing Components
- RAG Orchestrator (as separate service)
- Prompt Engineering module
- Azure AI Search integration
- Proper error handling and logging

### 🔧 Needs Refactoring
- Document processing (scattered across files)
- API endpoints (inconsistent structure)
- Configuration management
```

### Phase 3: Refactoring Plan (重构计划)

**制定分阶段重构计划：**

**原则：**
- 增量式重构（不破坏现有功能）
- 先重构结构，再优化性能
- 每个阶段都可独立测试

**阶段划分：**

```markdown
## Refactoring Phases

### Phase 1: Directory Restructure (1-2 days)
**Goal**: 对齐目录结构与架构组件

**Actions**:
1. 创建新的目录结构
2. 移动现有文件到正确位置
3. 更新所有 import 路径
4. 运行测试确保无破坏

**Structure**:
```
backend/
├── app/
│   ├── core/              # 核心配置和依赖
│   │   ├── config.py
│   │   └── dependencies.py
│   ├── services/          # 业务服务层
│   │   ├── rag_orchestrator.py    # RAG 编排器
│   │   ├── document_processor.py  # 文档处理
│   │   ├── vector_store.py        # 向量存储管理
│   │   └── prompt_engineer.py     # 提示工程
│   ├── integrations/      # 外部服务集成
│   │   ├── azure_openai.py
│   │   ├── azure_search.py
│   │   └── azure_storage.py
│   ├── api/               # API 端点
│   │   ├── v1/
│   │   │   ├── documents.py
│   │   │   └── queries.py
│   │   └── deps.py
│   ├── models/            # 数据模型
│   │   ├── document.py
│   │   └── query.py
│   └── utils/             # 工具函数
│       ├── logging.py
│       └── validators.py
```

### Phase 2: Component Implementation (3-5 days)
**Goal**: 实现架构图中的核心组件

**Priority Order**:
1. **RAG Orchestrator** (核心编排逻辑)
2. **Document Processor** (文档处理流程)
3. **Vector Store Manager** (向量存储管理)
4. **Prompt Engineer** (提示工程模块)

**For each component**:
- [ ] 定义清晰的接口（Protocol/ABC）
- [ ] 实现核心逻辑
- [ ] 添加单元测试
- [ ] 添加日志和错误处理

### Phase 3: Integration (2-3 days)
**Goal**: 集成所有组件，实现完整数据流

**Actions**:
1. 连接 FastAPI → RAG Orchestrator
2. 集成 Azure 服务（OpenAI, Search, Storage）
3. 实现完整的查询流程
4. 添加集成测试

### Phase 4: Optimization (1-2 days)
**Goal**: 性能优化和代码清理

**Actions**:
1. 添加缓存层
2. 优化数据库查询
3. 异步处理优化
4. 代码审查和清理
```

### Phase 4: Implementation (实施)

**重构步骤：**

1. **创建新结构（不删除旧代码）**
   ```bash
   # 创建新目录
   mkdir -p backend/app/services
   mkdir -p backend/app/integrations
   ```

2. **逐个迁移组件**
   - 从最独立的组件开始（如 utils）
   - 创建新文件，复制并重构代码
   - 更新 import 路径
   - 运行测试

3. **更新 API 层**
   - 修改 API 端点使用新的服务层
   - 保持 API 接口不变（向后兼容）

4. **删除旧代码**
   - 确认新代码完全工作后
   - 删除旧文件
   - 清理未使用的 import

**每个步骤后验证：**
```bash
# 运行测试
uv run pytest tests/

# 检查类型
uv run mypy backend/

# 启动服务验证
uv run python backend/main.py
```

### Phase 5: Validation (验证)

**验证清单：**

- [ ] **功能完整性**
  - 所有原有功能正常工作
  - 新功能按架构图实现

- [ ] **架构对齐**
  - 代码结构与架构图一致
  - 组件职责清晰
  - 数据流符合设计

- [ ] **代码质量**
  - 通过所有测试
  - 无类型错误
  - 代码覆盖率 > 80%

- [ ] **文档更新**
  - README 反映新结构
  - API 文档更新
  - 架构文档同步

## Key Principles

### 1. 增量式重构 (Incremental Refactoring)
- 小步快跑，每次改动可测试
- 不要一次性重写整个系统
- 保持系统始终可运行

### 2. 测试驱动 (Test-Driven)
- 重构前：确保有测试覆盖
- 重构中：测试持续通过
- 重构后：添加新测试

### 3. 向后兼容 (Backward Compatible)
- API 接口保持不变
- 数据格式保持兼容
- 配置文件平滑迁移

### 4. 文档同步 (Documentation Sync)
- 代码变更同步更新文档
- 架构图与代码保持一致
- 添加迁移指南

## Common Patterns

### Pattern 1: Service Layer Extraction

**Before**:
```python
# api/endpoints.py (混杂业务逻辑)
@app.post("/query")
async def query(text: str):
    # 直接在 API 层处理业务逻辑
    embedding = openai.embed(text)
    results = vector_db.search(embedding)
    prompt = f"Context: {results}\nQuestion: {text}"
    answer = openai.complete(prompt)
    return answer
```

**After**:
```python
# services/rag_orchestrator.py (独立服务层)
class RAGOrchestrator:
    def __init__(self, vector_store, llm, prompt_engineer):
        self.vector_store = vector_store
        self.llm = llm
        self.prompt_engineer = prompt_engineer
    
    async def query(self, text: str) -> str:
        # 1. 检索
        context = await self.vector_store.search(text)
        # 2. 构建提示
        prompt = self.prompt_engineer.build_prompt(text, context)
        # 3. 生成回答
        answer = await self.llm.generate(prompt)
        return answer

# api/v1/queries.py (纯 API 层)
@router.post("/query")
async def query(
    text: str,
    rag: RAGOrchestrator = Depends(get_rag_orchestrator)
):
    return await rag.query(text)
```

### Pattern 2: Dependency Injection

**Before**:
```python
# 硬编码依赖
class DocumentProcessor:
    def __init__(self):
        self.storage = AzureBlobStorage()  # 紧耦合
        self.embedder = OpenAIEmbedder()   # 紧耦合
```

**After**:
```python
# 依赖注入
class DocumentProcessor:
    def __init__(
        self,
        storage: StorageInterface,
        embedder: EmbedderInterface
    ):
        self.storage = storage
        self.embedder = embedder

# 在配置层组装
def get_document_processor():
    storage = AzureBlobStorage(config.azure_storage)
    embedder = OpenAIEmbedder(config.openai_api_key)
    return DocumentProcessor(storage, embedder)
```

### Pattern 3: Configuration Management

**Before**:
```python
# 配置散落各处
OPENAI_KEY = "sk-..."
AZURE_ENDPOINT = "https://..."
```

**After**:
```python
# core/config.py (集中配置)
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Azure OpenAI
    azure_openai_endpoint: str
    azure_openai_key: str
    azure_openai_deployment: str = "gpt-4o"
    
    # Azure AI Search
    azure_search_endpoint: str
    azure_search_key: str
    azure_search_index: str = "documents"
    
    # Azure Blob Storage
    azure_storage_connection: str
    azure_storage_container: str = "documents"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## Tools & Commands

### 分析现有结构
```bash
# 查看目录树
tree -L 3 -I 'node_modules|__pycache__|.git'

# 统计代码行数
find backend -name "*.py" | xargs wc -l

# 查找 TODO 和 FIXME
grep -r "TODO\|FIXME" backend/
```

### 重构辅助
```bash
# 查找所有 import
grep -r "^from\|^import" backend/ | sort | uniq

# 检查未使用的 import
uv run ruff check backend/ --select F401

# 自动格式化
uv run ruff format backend/
```

### 验证
```bash
# 运行测试
uv run pytest tests/ -v

# 类型检查
uv run mypy backend/

# 代码覆盖率
uv run pytest --cov=backend tests/
```

## Checklist

### 开始重构前
- [ ] 备份当前代码（git commit）
- [ ] 确保所有测试通过
- [ ] 理解完整的架构图
- [ ] 制定详细的重构计划
- [ ] 获得团队共识

### 重构过程中
- [ ] 每个小步骤后运行测试
- [ ] 频繁提交（每个组件完成后）
- [ ] 保持系统可运行
- [ ] 更新相关文档
- [ ] Code Review

### 重构完成后
- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] 文档完整更新
- [ ] 性能无明显下降
- [ ] 部署到测试环境验证

## References

- **Architecture Patterns**: See `references/architecture-patterns.md`
- **Refactoring Techniques**: See `references/refactoring-techniques.md`
- **Testing Strategies**: See `references/testing-strategies.md`
