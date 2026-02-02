---
name: rag-learning
description: Learn RAG by building real applications. Use when (1) building first RAG from scratch, (2) understanding RAG component design, (3) debugging retrieval problems, (4) optimizing retrieval quality, (5) comparing RAG frameworks.
---

# RAG Learning

## Learning Path

### Level 1: Minimal RAG

Build working RAG with LangChain + Chroma in 30 minutes.

**For step-by-step:** See `references/level1-minimal.md`

### Level 2: Core Components

Understand and experiment with each RAG component.

**For details:** See `references/level2-components.md`

### Level 3: Real Documents

Handle PDF, web pages, tables. Build personal knowledge base.

**For details:** See `references/level3-documents.md`

### Level 4: Optimization

Implement Hybrid Search, Reranking, better prompts.

**For details:** See `references/level4-optimization.md`

### Level 5: Production

Compare frameworks, choose vector DB, add caching.

**For details:** See `references/level5-production.md`

## Quick Reference

### Frameworks by Use Case

| Use Case        | Framework  | Why                       |
| --------------- | ---------- | ------------------------- |
| Quick prototype | LangChain  | Most examples, easy start |
| Data-heavy apps | LlamaIndex | Best data connectors      |
| No prompting    | DSPy       | Programmatic LLM          |
| Production RAG  | RAGFlow    | End-to-end solution       |

### Common Issues

| Problem                    | Solution                            |
| -------------------------- | ----------------------------------- |
| Chunk too large/small      | Adjust chunk_size (500-1000 tokens) |
| Wrong embedding model      | Try domain-specific model           |
| Retrieved but wrong answer | Check prompt template               |
| No results                 | Lower similarity threshold          |
| Slow retrieval             | Add caching, use hybrid search      |

## Resources

- [LangChain](https://github.com/langchain-ai/langchain) - 124k stars
- [LlamaIndex](https://github.com/run-llama/llama_index) - 46k stars
- [RAGFlow](https://github.com/infiniflow/ragflow) - 71k stars
- [DSPy](https://github.com/stanfordnlp/dspy) - 31k stars
- [Chonkie](https://github.com/bhavnicksm/chonkie) - Lightweight chunking
