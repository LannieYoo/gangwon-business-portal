# Level 1: Minimal RAG

## Goal

Build a working RAG in 30 minutes. See it work first, understand later.

## Prerequisites

- Python 3.10+
- OpenAI API key (or other LLM provider)

## Steps

### Step 1: Install Dependencies

```bash
pip install langchain langchain-openai chromadb
```

### Step 2: Prepare Documents

Create a few `.txt` or `.md` files with content you want to query.

### Step 3: Build RAG

```python
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA

# Load documents
loader = DirectoryLoader("./docs", glob="**/*.txt")
documents = loader.load()

# Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)

# Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(chunks, embeddings)

# Create QA chain
llm = ChatOpenAI(model="gpt-4o-mini")
qa = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())

# Ask questions
answer = qa.invoke("Your question here")
print(answer)
```

### Step 4: Test

Ask questions that are answered in your documents. Did it work?

## What You Learned

- RAG = Retrieval + Generation
- Documents → Chunks → Embeddings → Vector Store → Retrieval → LLM → Answer
- You don't need to understand everything yet

## Next Step

Go to Level 2 to understand each component.
