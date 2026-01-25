# Level 2: Core Components

## Goal

Understand each RAG component and how to tune them.

## RAG Pipeline

```
Documents → Loader → Splitter → Embeddings → Vector Store → Retriever → LLM → Answer
```

## Component 1: Document Loaders

```python
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    WebBaseLoader,
    DirectoryLoader,
)

# Single file
loader = TextLoader("doc.txt")
loader = PyPDFLoader("doc.pdf")

# Web page
loader = WebBaseLoader("https://example.com")

# Directory
loader = DirectoryLoader("./docs", glob="**/*.md")

documents = loader.load()
```

## Component 2: Text Splitters

```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
)

# Recommended: Recursive (respects structure)
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # tokens per chunk
    chunk_overlap=50,    # overlap between chunks
    separators=["\n\n", "\n", " ", ""]
)

chunks = splitter.split_documents(documents)
```

### Chunk Size Guidelines

| Content Type   | chunk_size | chunk_overlap |
| -------------- | ---------- | ------------- |
| Code           | 1000-1500  | 100           |
| Technical docs | 500-1000   | 50            |
| Conversational | 300-500    | 30            |

## Component 3: Embeddings

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

# OpenAI (best quality, paid)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# Local (free, good quality)
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
```

## Component 4: Vector Stores

```python
from langchain_community.vectorstores import Chroma, FAISS

# Chroma (persistent, local)
vectorstore = Chroma.from_documents(
    chunks,
    embeddings,
    persist_directory="./chroma_db"
)

# FAISS (in-memory, fast)
vectorstore = FAISS.from_documents(chunks, embeddings)
```

## Component 5: Retrievers

```python
# Basic retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4}  # return top 4
)

# With score threshold
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.7}
)

# MMR (diverse results)
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 4, "fetch_k": 10}
)
```

## Experiment: Compare Settings

```python
def test_retrieval(query, retriever):
    docs = retriever.invoke(query)
    for i, doc in enumerate(docs):
        print(f"{i+1}. {doc.page_content[:100]}...")

# Test different chunk sizes
for size in [200, 500, 1000]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=size)
    # rebuild vectorstore and test
```

## Next Step

Go to Level 3 to handle real-world documents.
