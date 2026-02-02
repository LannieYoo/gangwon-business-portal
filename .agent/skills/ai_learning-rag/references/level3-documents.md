# Level 3: Real Documents

## Goal

Build a personal knowledge base with PDF, web, and structured data.

## PDF Processing

```python
from langchain_community.document_loaders import PyPDFLoader

# Basic PDF
loader = PyPDFLoader("document.pdf")
pages = loader.load()

# With OCR for scanned PDFs
from langchain_community.document_loaders import UnstructuredPDFLoader
loader = UnstructuredPDFLoader("scanned.pdf", mode="elements")
```

### Better PDF: PyMuPDF

```python
import fitz  # PyMuPDF

def extract_pdf_with_structure(path):
    doc = fitz.open(path)
    chunks = []
    for page in doc:
        text = page.get_text("text")
        chunks.append({
            "content": text,
            "page": page.number + 1,
            "metadata": {"source": path}
        })
    return chunks
```

## Web Scraping

```python
from langchain_community.document_loaders import WebBaseLoader

# Single page
loader = WebBaseLoader("https://docs.example.com/guide")
docs = loader.load()

# Multiple pages
urls = [
    "https://docs.example.com/intro",
    "https://docs.example.com/api",
]
loader = WebBaseLoader(urls)
docs = loader.load()
```

### Recursive Web Crawling

```python
from langchain_community.document_loaders import RecursiveUrlLoader

loader = RecursiveUrlLoader(
    url="https://docs.example.com",
    max_depth=2,
    extractor=lambda x: x.get_text()
)
```

## Structured Data (CSV, JSON)

```python
from langchain_community.document_loaders import CSVLoader, JSONLoader

# CSV
loader = CSVLoader("data.csv")

# JSON
loader = JSONLoader(
    file_path="data.json",
    jq_schema=".items[]",
    text_content=False
)
```

## Build Knowledge Base

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter

class KnowledgeBase:
    def __init__(self, persist_dir="./kb"):
        self.embeddings = OpenAIEmbeddings()
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=50
        )
        self.vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings
        )

    def add_documents(self, docs):
        chunks = self.splitter.split_documents(docs)
        self.vectorstore.add_documents(chunks)

    def search(self, query, k=4):
        return self.vectorstore.similarity_search(query, k=k)

# Usage
kb = KnowledgeBase()
kb.add_documents(pdf_docs)
kb.add_documents(web_docs)
results = kb.search("How to configure X?")
```

## Metadata for Better Retrieval

```python
# Add metadata during loading
for doc in documents:
    doc.metadata["source_type"] = "pdf"
    doc.metadata["category"] = "technical"
    doc.metadata["date"] = "2024-01"

# Filter by metadata
results = vectorstore.similarity_search(
    query,
    filter={"source_type": "pdf"}
)
```

## Next Step

Go to Level 4 to optimize retrieval quality.
