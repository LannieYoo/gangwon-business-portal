---
name: resource-discovery
description: 资源发现、评估与选型。Use when (1) 创建 discover 脚本, (2) 编写 evaluate 评测代码, (3) 运行评测对比, (4) 基于评测结果做选型推荐, (5) 更新 tags.py
---

# Resource Discovery & Evaluation

## Project Structure

```
backend/scripts/discover/
├── base.py              # DataSource, DomainDiscoverScript
├── core/                # Domain discover scripts
├── sources/             # GitHub, HackerNews, Reddit
├── raw_data/            # 探索数据（raw_*.py）
└── evaluate/            # 评测代码
    ├── llm/             # LLM provider 评测
    │   ├── base.py      # LLMProvider, LLMResult, LLMBenchmarkResult
    │   ├── impl_*.py    # 各 provider 实现
    │   ├── data/        # 测试数据
    │   └── run_benchmark.py
    └── rag/             # RAG 框架评测
        ├── base.py      # RAGFramework, RAGResult, BenchmarkResult
        ├── impl_*.py    # 各框架实现
        ├── data/        # 测试文档和问题
        └── run_benchmark.py
```

## 1. Create Discover Script

```python
from scripts.discover.base import DomainDiscoverScript
from scripts.discover.sources.github import GitHubSource

class DiscoverMyDomainScript(DomainDiscoverScript):
    NAME = "discover_my_domain"
    DOMAIN_CODE = "my_domain"
    MIN_QUALITY_SCORE = 60.0

    @property
    def KEYWORDS(self) -> list[str]:
        return ["keyword1", "keyword2"]

    def _init_sources(self) -> None:
        self.SOURCES = [GitHubSource(verbose=self.verbose, min_stars=300)]
```

Run: `uv run python -m scripts.discover.core.discover_my_domain`

## 2. Write Evaluate Code

### LLM Provider

继承 `LLMProvider`，实现 `generate` 方法：

```python
from scripts.discover.evaluate.llm.base import LLMProvider, LLMResult

class MyProvider(LLMProvider):
    NAME = "my_provider"
    MODEL = "model-name"
    IS_FREE = True
    COST_PER_1K_INPUT = 0.0
    COST_PER_1K_OUTPUT = 0.0

    def generate(self, prompt: str) -> LLMResult:
        # 调用 API，返回 LLMResult
        return LLMResult(answer=..., latency_ms=..., input_tokens=..., output_tokens=..., cost_usd=...)
```

### RAG Framework

继承 `RAGFramework`，实现 `build_index` 和 `query`：

```python
from scripts.discover.evaluate.rag.base import RAGFramework, RAGResult

class MyRAG(RAGFramework):
    NAME = "my_rag"

    def build_index(self, docs: list[str]) -> None:
        # 构建向量索引
        pass

    def query(self, question: str, top_k: int = 4) -> RAGResult:
        # 检索并生成答案
        return RAGResult(answer=..., sources=..., latency_ms=..., tokens_used=...)
```

## 3. Run Benchmark

```bash
uv run python -m scripts.discover.evaluate.llm.run_benchmark
uv run python -m scripts.discover.evaluate.rag.run_benchmark
```

输出 `BenchmarkResult`：accuracy、avg_latency_ms、total_tokens、total_cost_usd

## 4. Selection Recommendation

基于评测结果推荐，考虑维度：

- **成本**：is_free、cost_per_1k
- **质量**：accuracy、benchmark 得分
- **速度**：avg_latency_ms
- **部署**：本地（ollama）vs 云端（groq/gemini）

推荐流程：

1. 读取 `raw_data/raw_*.py` 了解可选方案
2. 查看 `evaluate/*/impl_*.py` 已有评测
3. 运行 benchmark 获取实测数据
4. 结合用户场景（成本敏感/质量优先/低延迟）给出建议

## 5. Deep Evaluation (Optional)

对候选方案深入评估时，用 webFetch 读取 GitHub README：

1. 先用 raw_data 快速筛选出 3-5 个候选
2. 对候选方案，访问 `url` 获取详细信息：
   - 定价信息、免费额度限制
   - 安装/部署方式
   - 支持的模型列表
   - 性能指标、benchmark 数据

GitHub README URL 格式：`https://raw.githubusercontent.com/{repo}/main/README.md`

**For workflow details:** See `references/workflow.md`
