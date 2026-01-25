# Level 5: Production

## Goal

Deploy RAG at scale with reliability and performance.

## Framework Comparison

| Framework  | Best For     | Pros                          | Cons                   |
| ---------- | ------------ | ----------------------------- | ---------------------- |
| LangChain  | Prototyping  | Most examples, flexible       | Complex abstractions   |
| LlamaIndex | Data apps    | Best loaders, indexing        | Steeper learning curve |
| DSPy       | No prompting | Programmatic, optimizable     | New paradigm           |
| RAGFlow    | End-to-end   | UI included, production-ready | Less flexible          |

## Vector DB Selection

| DB       | Type            | Best For                 |
| -------- | --------------- | ------------------------ |
| Chroma   | Local           | Development, small scale |
| FAISS    | In-memory       | Fast search, read-heavy  |
| Qdrant   | Cloud/Self-host | Production, filtering    |
| Pinecone | Managed         | Zero-ops, enterprise     |
| pgvector | PostgreSQL      | Existing Postgres users  |

### Qdrant Example

```python
from qdrant_client import QdrantClient
from langchain_qdrant import QdrantVectorStore

client = QdrantClient(url="http://localhost:6333")

vectorstore = QdrantVectorStore(
    client=client,
    collection_name="my_docs",
    embedding=embeddings
)
```

## Caching

### Embedding Cache

```python
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import LocalFileStore

store = LocalFileStore("./embedding_cache")
cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
    embeddings, store, namespace="openai"
)
```

### LLM Response Cache

```python
from langchain.cache import SQLiteCache
from langchain.globals import set_llm_cache

set_llm_cache(SQLiteCache(database_path=".langchain.db"))
```

## Streaming

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = ChatOpenAI(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# Or async streaming
async for chunk in chain.astream({"question": query}):
    print(chunk, end="", flush=True)
```

## Monitoring with Langfuse

```python
from langfuse.callback import CallbackHandler

handler = CallbackHandler(
    public_key="pk-...",
    secret_key="sk-..."
)

chain.invoke({"question": query}, config={"callbacks": [handler]})
```

## Production Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   FastAPI   │────▶│  RAG Chain  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Redis    │     │  Qdrant/    │
                    │   (Cache)   │     │  Pinecone   │
                    └─────────────┘     └─────────────┘
```

## FastAPI Integration

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Query(BaseModel):
    question: str

@app.post("/ask")
async def ask(query: Query):
    result = await chain.ainvoke({"question": query.question})
    return {"answer": result}
```

## Checklist

- [ ] Vector DB with persistence
- [ ] Embedding cache
- [ ] LLM response cache
- [ ] Error handling and retries
- [ ] Rate limiting
- [ ] Monitoring (Langfuse/LangSmith)
- [ ] Streaming responses
- [ ] Health checks
