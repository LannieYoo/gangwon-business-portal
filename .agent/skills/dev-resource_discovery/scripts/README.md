# Resource Discovery Scripts

Scripts for discovering and evaluating AI resources, tools, and frameworks.

## Overview

The resource discovery system helps find high-quality AI resources from multiple sources (GitHub, HackerNews, Reddit) and evaluates them based on quality metrics.

## Core Scripts Location

**Note:** Discovery scripts remain in `backend/scripts/discover/` due to their complexity and interdependencies. This README provides guidance on using them.

## Available Discovery Scripts

### AI Agents

```bash
cd backend/scripts
python -m discover.core.discover_ai_agents
```

Discovers AI agent frameworks like AutoGen, CrewAI, LangGraph, MetaGPT.

### LLM Models

```bash
python -m discover.core.discover_ai_llm_models
```

Discovers open-source LLM models (Llama, Mistral, Qwen, etc.).

### LLM Providers

```bash
python -m discover.core.discover_ai_llm_providers
```

Discovers LLM API providers and platforms.

### RAG Frameworks

```bash
python -m discover.core.discover_ai_rag_frameworks
```

Discovers RAG frameworks and tools.

### Vector Databases

```bash
python -m discover.core.discover_ai_vector_databases
```

Discovers vector database solutions.

### Prompts & Skills

```bash
python -m discover.core.discover_ai_prompts
python -m discover.core.discover_ai_skills
```

Discovers prompt libraries and Claude skills.

## Creating a New Discovery Script

1. **Check domain tags** in `backend/scripts/data/domain/tags.py`
2. **Create discovery script** in `backend/scripts/discover/core/`

```python
from scripts.discover.base import DomainDiscoverScript
from scripts.discover.sources.github import GitHubSource

class DiscoverMyDomainScript(DomainDiscoverScript):
    NAME = "discover_my_domain"
    DOMAIN_CODE = "my_domain"  # Must match tags.py
    MIN_QUALITY_SCORE = 60.0

    @property
    def KEYWORDS(self) -> list[str]:
        return ["keyword1", "keyword2", "framework"]

    @property
    def CATEGORY_KEYWORDS(self) -> dict[str, list[str]]:
        return {
            "framework": ["framework", "library"],
            "tool": ["tool", "utility"],
        }

    def _init_sources(self) -> None:
        self.SOURCES = [
            GitHubSource(verbose=self.verbose, min_stars=300)
        ]
```

3. **Run discovery:**

```bash
python -m discover.core.discover_my_domain
```

4. **Review output** in `backend/scripts/discover/raw_data/raw_my_domain.py`

## Quality Scoring

Resources are scored based on:

- **Source Trust (30%)**: GitHub stars, HN points, Reddit upvotes
- **Relevance (30%)**: Keyword matches, tag alignment
- **Freshness (20%)**: Recent updates, active development
- **Activity (20%)**: Commit frequency, community engagement

### Score Boosts

- GitHub: 100+ stars (+10), 500+ (+15), 1000+ (+20)
- HackerNews: 50+ points (+10), 100+ (+15), 200+ (+20)
- Recent updates: <3 months (+10), <6 months (+5)

## Data Sources

### GitHub Source

```python
GitHubSource(
    verbose=True,
    min_stars=300,      # Minimum stars filter
    max_results=50      # Max results per keyword
)
```

### HackerNews Source

```python
HackerNewsSource(
    verbose=True,
    min_points=50,      # Minimum points filter
    max_results=30
)
```

### Reddit Source

```python
RedditSource(
    verbose=True,
    subreddits=["MachineLearning", "LocalLLaMA"],
    min_upvotes=100
)
```

## Output Format

Discovered resources are saved to `raw_data/raw_<domain>.py`:

```python
RAW_DATA = [
    {
        "url": "https://github.com/user/repo",
        "name": "Resource Name",
        "description": "Description...",
        "category": "framework",
        "source": "github",
        "repo": "user/repo",
        "platform": "github",
        "tags": ["tag1", "tag2"],
        "metadata": {
            "stars": 1000,
            "language": "Python",
            "last_updated": "2024-01-15"
        },
        "quality_score": 85.5,
        "is_active": True
    }
]
```

## Evaluation & Benchmarking

For LLM and RAG benchmarking, see `backend/scripts/discover/evaluate/`:

```bash
# LLM provider benchmark
python -m discover.evaluate.llm.run_benchmark

# RAG framework benchmark
python -m discover.evaluate.rag.run_benchmark
```

## Configuration

### Adjusting Quality Threshold

Edit `MIN_QUALITY_SCORE` in your discovery script:

```python
MIN_QUALITY_SCORE = 70.0  # Higher = more selective
```

### Adding Keywords

Update the `KEYWORDS` property:

```python
@property
def KEYWORDS(self) -> list[str]:
    keywords = []
    # Auto-generate from tags
    for tag in self._get_domain_tags():
        keywords.append(tag["name_en"])
    # Add custom keywords
    keywords.extend(["custom", "keywords"])
    return keywords
```

## Troubleshooting

### No results found

- Lower `MIN_QUALITY_SCORE`
- Add more keywords
- Check if domain_code exists in tags.py

### Too many low-quality results

- Increase `MIN_QUALITY_SCORE`
- Increase `min_stars` for GitHub
- Refine keywords to be more specific

### Rate limiting

- Add delays between requests
- Use GitHub token for higher limits
- Reduce `max_results`

## Dependencies

```bash
uv add requests beautifulsoup4 python-dateutil
```

## Related Files

- `backend/scripts/discover/base.py` - Base classes
- `backend/scripts/discover/sources/` - Data source implementations
- `backend/scripts/data/domain/tags.py` - Domain definitions
- `backend/scripts/discover/raw_data/` - Output files
