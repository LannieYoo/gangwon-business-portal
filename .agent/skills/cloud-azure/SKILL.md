---
name: cloud-azure
description: Azure 云服务专家，专注于 AI 和数据服务。Use when (1) 集成 Azure OpenAI/AI Search/Blob Storage, (2) 配置 Azure 服务, (3) 优化 Azure 成本和性能, (4) 解决 Azure 服务问题, (5) 选择合适的 Azure 服务
---

# Azure Cloud Services Expert

## Objectives

- 帮助集成和配置 Azure AI 服务
- 提供 Azure 服务最佳实践
- 解决 Azure 服务集成问题
- 优化成本和性能
- 提供代码示例和配置指南

## Core Azure Services for AI Applications

### 1. Azure OpenAI Service

**用途**: 访问 GPT-4, GPT-4o, ADA-002 等模型

**关键概念**:
- **Deployment**: 模型部署实例（如 gpt-4o-deployment）
- **Endpoint**: 服务端点 URL
- **API Key**: 认证密钥
- **API Version**: API 版本（如 2024-02-15-preview）

**Python SDK 集成**:
```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

# Chat Completion (GPT-4o)
response = client.chat.completions.create(
    model="gpt-4o",  # deployment name
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    temperature=0.7,
    max_tokens=800
)

# Embeddings (ADA-002)
embedding_response = client.embeddings.create(
    model="text-embedding-ada-002",  # deployment name
    input="Your text here"
)
```

**配置最佳实践**:
```python
# core/config.py
from pydantic_settings import BaseSettings

class AzureOpenAIConfig(BaseSettings):
    endpoint: str
    api_key: str
    api_version: str = "2024-02-15-preview"
    
    # Deployments
    chat_deployment: str = "gpt-4o"
    embedding_deployment: str = "text-embedding-ada-002"
    
    # Rate limiting
    max_retries: int = 3
    timeout: int = 60
    
    class Config:
        env_prefix = "AZURE_OPENAI_"
```

**常见问题**:
- **429 Rate Limit**: 实现指数退避重试
- **Token Limit**: 使用 tiktoken 计算 token 数
- **Cost Control**: 设置 max_tokens 限制

### 2. Azure AI Search (formerly Cognitive Search)

**用途**: 向量搜索和全文搜索

**关键概念**:
- **Index**: 搜索索引（存储文档和向量）
- **Vector Search**: 向量相似度搜索
- **Semantic Search**: 语义搜索
- **Skillset**: 数据处理管道

**Python SDK 集成**:
```python
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.core.credentials import AzureKeyCredential

# 创建索引
index_client = SearchIndexClient(
    endpoint=os.getenv("AZURE_SEARCH_ENDPOINT"),
    credential=AzureKeyCredential(os.getenv("AZURE_SEARCH_KEY"))
)

# 定义索引结构
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    VectorSearch,
    VectorSearchProfile,
    HnswAlgorithmConfiguration
)

index = SearchIndex(
    name="documents",
    fields=[
        SearchField(name="id", type=SearchFieldDataType.String, key=True),
        SearchField(name="content", type=SearchFieldDataType.String, searchable=True),
        SearchField(name="embedding", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                   searchable=True, vector_search_dimensions=1536,
                   vector_search_profile_name="my-vector-profile"),
        SearchField(name="metadata", type=SearchFieldDataType.String, filterable=True)
    ],
    vector_search=VectorSearch(
        profiles=[VectorSearchProfile(name="my-vector-profile", algorithm_configuration_name="my-hnsw")],
        algorithms=[HnswAlgorithmConfiguration(name="my-hnsw")]
    )
)

index_client.create_or_update_index(index)

# 搜索文档
search_client = SearchClient(
    endpoint=os.getenv("AZURE_SEARCH_ENDPOINT"),
    index_name="documents",
    credential=AzureKeyCredential(os.getenv("AZURE_SEARCH_KEY"))
)

# 向量搜索
from azure.search.documents.models import VectorizedQuery

vector_query = VectorizedQuery(
    vector=query_embedding,  # 1536-dim vector from ADA-002
    k_nearest_neighbors=5,
    fields="embedding"
)

results = search_client.search(
    search_text=None,
    vector_queries=[vector_query],
    select=["id", "content", "metadata"]
)

for result in results:
    print(f"Score: {result['@search.score']}")
    print(f"Content: {result['content']}")
```

**配置最佳实践**:
```python
class AzureSearchConfig(BaseSettings):
    endpoint: str
    api_key: str
    index_name: str = "documents"
    
    # Vector search settings
    vector_dimensions: int = 1536  # ADA-002
    top_k: int = 5
    
    # Performance
    max_retries: int = 3
    timeout: int = 30
    
    class Config:
        env_prefix = "AZURE_SEARCH_"
```

**常见问题**:
- **Index Not Found**: 确保索引已创建
- **Vector Dimension Mismatch**: 确保向量维度匹配（ADA-002 = 1536）
- **Slow Search**: 使用 HNSW 算法优化

### 3. Azure Blob Storage

**用途**: 存储文档、图片等文件

**Python SDK 集成**:
```python
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient

# 连接到存储账户
blob_service_client = BlobServiceClient.from_connection_string(
    os.getenv("AZURE_STORAGE_CONNECTION_STRING")
)

# 获取容器
container_client = blob_service_client.get_container_client("documents")

# 上传文件
with open("document.pdf", "rb") as data:
    blob_client = container_client.upload_blob(
        name="documents/document.pdf",
        data=data,
        overwrite=True
    )

# 下载文件
blob_client = container_client.get_blob_client("documents/document.pdf")
with open("downloaded.pdf", "wb") as download_file:
    download_file.write(blob_client.download_blob().readall())

# 列出文件
blob_list = container_client.list_blobs(name_starts_with="documents/")
for blob in blob_list:
    print(f"Name: {blob.name}, Size: {blob.size}")

# 删除文件
container_client.delete_blob("documents/document.pdf")
```

**配置最佳实践**:
```python
class AzureStorageConfig(BaseSettings):
    connection_string: str
    container_name: str = "documents"
    
    # Upload settings
    max_single_put_size: int = 4 * 1024 * 1024  # 4MB
    max_block_size: int = 4 * 1024 * 1024
    
    class Config:
        env_prefix = "AZURE_STORAGE_"
```

**常见问题**:
- **Connection String vs SAS Token**: 开发用 Connection String，生产用 SAS Token
- **Large File Upload**: 使用 block blob 分块上传
- **Access Control**: 使用 Azure AD 或 SAS Token

### 4. Azure AI Foundry (formerly Azure ML)

**用途**: 模型训练、部署、监控

**关键功能**:
- Model Registry: 模型版本管理
- Endpoints: 模型部署端点
- Monitoring: 模型性能监控
- Prompt Flow: 可视化 LLM 应用开发

**集成示例**:
```python
from azure.ai.ml import MLClient
from azure.identity import DefaultAzureCredential

ml_client = MLClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.getenv("AZURE_SUBSCRIPTION_ID"),
    resource_group_name=os.getenv("AZURE_RESOURCE_GROUP"),
    workspace_name=os.getenv("AZURE_ML_WORKSPACE")
)

# 部署模型
from azure.ai.ml.entities import ManagedOnlineEndpoint, ManagedOnlineDeployment

endpoint = ManagedOnlineEndpoint(
    name="my-endpoint",
    description="RAG model endpoint"
)

ml_client.online_endpoints.begin_create_or_update(endpoint).result()
```

## Common Integration Patterns

### Pattern 1: RAG Pipeline with Azure Services

```python
# services/rag_orchestrator.py
from typing import List, Dict
import asyncio

class AzureRAGOrchestrator:
    def __init__(
        self,
        openai_client: AzureOpenAI,
        search_client: SearchClient,
        storage_client: BlobServiceClient
    ):
        self.openai = openai_client
        self.search = search_client
        self.storage = storage_client
    
    async def process_document(self, file_path: str) -> str:
        """上传文档并创建向量索引"""
        # 1. 上传到 Blob Storage
        blob_name = f"documents/{Path(file_path).name}"
        with open(file_path, "rb") as data:
            self.storage.get_blob_client(blob_name).upload_blob(data)
        
        # 2. 提取文本
        text = self._extract_text(file_path)
        
        # 3. 分块
        chunks = self._chunk_text(text)
        
        # 4. 生成嵌入
        embeddings = []
        for chunk in chunks:
            response = self.openai.embeddings.create(
                model="text-embedding-ada-002",
                input=chunk
            )
            embeddings.append(response.data[0].embedding)
        
        # 5. 索引到 Azure AI Search
        documents = [
            {
                "id": f"{blob_name}_{i}",
                "content": chunk,
                "embedding": embedding,
                "metadata": blob_name
            }
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        
        self.search.upload_documents(documents)
        
        return blob_name
    
    async def query(self, question: str, top_k: int = 5) -> str:
        """查询并生成回答"""
        # 1. 生成查询嵌入
        query_embedding = self.openai.embeddings.create(
            model="text-embedding-ada-002",
            input=question
        ).data[0].embedding
        
        # 2. 向量搜索
        vector_query = VectorizedQuery(
            vector=query_embedding,
            k_nearest_neighbors=top_k,
            fields="embedding"
        )
        
        results = self.search.search(
            search_text=None,
            vector_queries=[vector_query],
            select=["content"]
        )
        
        # 3. 构建上下文
        context = "\n\n".join([r["content"] for r in results])
        
        # 4. 生成回答
        response = self.openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Answer based on the context provided."},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        return response.choices[0].message.content
```

### Pattern 2: Error Handling and Retry

```python
from tenacity import retry, stop_after_attempt, wait_exponential
from azure.core.exceptions import AzureError

class AzureServiceWrapper:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def call_openai_with_retry(self, **kwargs):
        """带重试的 OpenAI 调用"""
        try:
            return await self.openai.chat.completions.create(**kwargs)
        except Exception as e:
            if "429" in str(e):  # Rate limit
                print("Rate limited, retrying...")
                raise
            elif "timeout" in str(e).lower():
                print("Timeout, retrying...")
                raise
            else:
                print(f"Error: {e}")
                raise
```

### Pattern 3: Cost Optimization

```python
class CostOptimizer:
    """Azure 成本优化策略"""
    
    def __init__(self):
        self.cache = {}  # 简单缓存
    
    def get_cached_embedding(self, text: str):
        """缓存嵌入向量"""
        if text in self.cache:
            return self.cache[text]
        
        embedding = self.openai.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        ).data[0].embedding
        
        self.cache[text] = embedding
        return embedding
    
    def batch_embeddings(self, texts: List[str], batch_size: int = 16):
        """批量生成嵌入（降低 API 调用次数）"""
        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            response = self.openai.embeddings.create(
                model="text-embedding-ada-002",
                input=batch
            )
            embeddings.extend([d.embedding for d in response.data])
        return embeddings
```

## Environment Configuration

**`.env` 文件示例**:
```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_KEY=your-search-key
AZURE_SEARCH_INDEX_NAME=documents

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=documents

# Azure AI Foundry (optional)
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_RESOURCE_GROUP=your-resource-group
AZURE_ML_WORKSPACE=your-workspace
```

## Dependencies

**安装 Azure SDK**:
```bash
# Core Azure packages
uv add azure-identity azure-core

# Azure OpenAI
uv add openai  # Official OpenAI SDK with Azure support

# Azure AI Search
uv add azure-search-documents

# Azure Blob Storage
uv add azure-storage-blob

# Azure AI ML (optional)
uv add azure-ai-ml

# Utilities
uv add tenacity  # Retry logic
uv add tiktoken  # Token counting
```

## Best Practices

### 1. 认证管理
- **开发环境**: 使用 API Key
- **生产环境**: 使用 Managed Identity 或 Service Principal
- **永远不要**: 硬编码密钥到代码中

### 2. 成本控制
- 缓存嵌入向量（相同文本不重复调用）
- 批量处理（减少 API 调用次数）
- 设置 max_tokens 限制
- 使用更便宜的模型（如 GPT-3.5 而非 GPT-4）

### 3. 性能优化
- 使用异步调用（asyncio）
- 实现连接池
- 启用 HTTP/2
- 使用 CDN 加速 Blob Storage

### 4. 错误处理
- 实现指数退避重试
- 区分可重试错误（429, 503）和不可重试错误（401, 400）
- 记录详细日志
- 设置超时

### 5. 监控和日志
- 记录所有 API 调用（请求、响应、耗时）
- 监控成本（token 使用量）
- 设置告警（错误率、延迟）
- 使用 Azure Monitor 或 Application Insights

## Common Issues & Solutions

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 401 Unauthorized | API Key 错误 | 检查 Key 和 Endpoint |
| 429 Rate Limit | 请求过多 | 实现重试和限流 |
| 404 Not Found | 资源不存在 | 检查 Deployment/Index 名称 |
| Timeout | 网络或服务慢 | 增加 timeout，使用重试 |
| Vector Dimension Mismatch | 向量维度不匹配 | 确保使用相同的嵌入模型 |
| High Cost | Token 使用过多 | 实现缓存，优化 prompt |

## Quick Start Checklist

开始使用 Azure 服务前：

- [ ] 创建 Azure 账户和订阅
- [ ] 创建 Azure OpenAI 资源
- [ ] 部署模型（GPT-4o, ADA-002）
- [ ] 创建 Azure AI Search 服务
- [ ] 创建 Storage Account
- [ ] 获取所有 API Keys 和 Endpoints
- [ ] 配置 `.env` 文件
- [ ] 安装 Azure SDK
- [ ] 测试连接

## Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure AI Search Documentation](https://learn.microsoft.com/en-us/azure/search/)
- [Azure Blob Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)
- [Azure SDK for Python](https://github.com/Azure/azure-sdk-for-python)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
