# Level 4: Optimization

## Goal

Improve retrieval quality with advanced techniques.

## Hybrid Search

Combine semantic search with keyword search (BM25).

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# BM25 (keyword-based)
bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 4

# Vector (semantic)
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# Combine with weights
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.3, 0.7]  # 30% keyword, 70% semantic
)
```

## Reranking

Re-score retrieved documents for better relevance.

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

# Cohere Reranker
reranker = CohereRerank(model="rerank-english-v3.0", top_n=4)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 10})
)
```

### Local Reranker (Free)

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query, docs, top_k=4):
    pairs = [(query, doc.page_content) for doc in docs]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in ranked[:top_k]]
```

## Query Transformation

### Multi-Query

Generate multiple queries for better coverage.

```python
from langchain.retrievers.multi_query import MultiQueryRetriever

retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=llm
)
# Generates 3 query variations automatically
```

### HyDE (Hypothetical Document Embeddings)

```python
from langchain.chains import HypotheticalDocumentEmbedder

hyde_embeddings = HypotheticalDocumentEmbedder.from_llm(
    llm=llm,
    base_embeddings=embeddings,
    prompt_key="web_search"
)
# Generates hypothetical answer, then searches
```

## Better Prompts

```python
from langchain.prompts import PromptTemplate

RAG_PROMPT = PromptTemplate.from_template("""
Answer based ONLY on the context below. If unsure, say "I don't know."

Context:
{context}

Question: {question}

Answer:""")
```

### With Source Citation

```python
RAG_PROMPT_WITH_SOURCES = PromptTemplate.from_template("""
Answer the question using the context. Cite sources as [1], [2], etc.

Context:
{context}

Question: {question}

Answer (with citations):""")
```

## Evaluation

```python
def evaluate_retrieval(queries, expected_docs, retriever):
    hits = 0
    for query, expected in zip(queries, expected_docs):
        results = retriever.invoke(query)
        retrieved_ids = [doc.metadata.get("id") for doc in results]
        if expected in retrieved_ids:
            hits += 1
    return hits / len(queries)  # Recall@k
```

## Next Step

Go to Level 5 for production deployment.
