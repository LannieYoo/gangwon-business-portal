---
name: data-download
description: 数据下载与获取。Use when (1) 从网络下载数据集, (2) 使用 API 获取数据, (3) 从 Kaggle/HuggingFace/UCI 等平台下载, (4) 批量下载文件, (5) 处理下载失败和重试
---

# Data Download & Acquisition

## Objectives

- Download datasets from various sources (HTTP, API, cloud platforms)
- Handle authentication and API keys securely
- Implement retry logic and resume capability
- Validate downloaded data integrity
- Cache downloads to avoid redundant requests

## Core Strategy

### 1. Choose the Right Method

Select download method based on source:

- **Built-in libraries**: Use sklearn, TensorFlow, PyTorch, HuggingFace datasets when available (fastest, most reliable)
- **Direct HTTP**: For simple file URLs, use `requests` with streaming
- **Platform APIs**: Use official clients for Kaggle, HuggingFace, AWS S3
- **Web scraping**: Only when no API exists (see `dev-web_scraping` skill)

### 2. Implement Reliability

Always include:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=4, max=10))
def download_with_retry(url: str, output_path: Path):
    response = requests.get(url, timeout=30, stream=True)
    response.raise_for_status()
    
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
```

### 3. Cache Downloads

Avoid redundant downloads:

```python
def download_with_cache(url: str, cache_dir: Path = Path('.cache')):
    filename = url.split('/')[-1]
    cache_path = cache_dir / filename
    
    if cache_path.exists():
        print(f"Using cached: {cache_path}")
        return cache_path
    
    cache_dir.mkdir(exist_ok=True)
    download_with_retry(url, cache_path)
    return cache_path
```

### 4. Validate Data

After download, verify integrity:

```python
# Check file size
if output_path.stat().st_size == 0:
    raise ValueError("Downloaded file is empty")

# Verify checksum if available
if expected_md5:
    verify_checksum(output_path, expected_md5)

# Validate format
df = pd.read_csv(output_path)  # Will raise if invalid
```

## Platform-Specific Downloads

### Built-in Datasets

```python
# Scikit-learn
from sklearn.datasets import load_diabetes, fetch_openml
data = load_diabetes()

# HuggingFace
from datasets import load_dataset
dataset = load_dataset('imdb', cache_dir='./cache')

# TensorFlow/Keras
from tensorflow.keras.datasets import mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()
```

### Kaggle

```bash
# Setup: Place kaggle.json in ~/.kaggle/
pip install kaggle
```

```python
import kaggle
kaggle.api.dataset_download_files('uciml/iris', path='data/', unzip=True)
```

### Direct HTTP

```python
import requests
from pathlib import Path

response = requests.get(url, stream=True)
response.raise_for_status()

with open(output_path, 'wb') as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)
```

### Google Drive

```bash
pip install gdown
```

```python
import gdown
gdown.download(f'https://drive.google.com/uc?id={file_id}', output_path)
```

## Security Best Practices

### Store API Keys Securely

```python
import os
from dotenv import load_dotenv

# Use environment variables
load_dotenv()
api_key = os.getenv('KAGGLE_KEY')

# Never hardcode keys in source code!
```

### Add to .gitignore

```gitignore
.env
.secrets/
kaggle.json
data/
*.csv
*.zip
.cache/
```

## Common Patterns

### Pattern 1: Download and Extract

```python
import zipfile

# Download
download_with_retry(url, Path('temp.zip'))

# Extract
with zipfile.ZipFile('temp.zip', 'r') as zip_ref:
    zip_ref.extractall('data/')

# Cleanup
Path('temp.zip').unlink()
```

### Pattern 2: Batch Download

```python
from concurrent.futures import ThreadPoolExecutor

def download_batch(urls: list[str], output_dir: Path, max_workers: int = 5):
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(download_file, url, output_dir) for url in urls]
        for future in futures:
            future.result()
```

### Pattern 3: Resume Partial Downloads

```python
def download_resumable(url: str, output_path: Path):
    headers = {}
    mode = 'wb'
    
    if output_path.exists():
        existing_size = output_path.stat().st_size
        headers['Range'] = f'bytes={existing_size}-'
        mode = 'ab'
    
    response = requests.get(url, headers=headers, stream=True)
    
    with open(output_path, mode) as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
```

## Validation Checklist

Before using downloaded data:

- [ ] File downloaded completely (check size > 0)
- [ ] Checksum verified (if available)
- [ ] File format is valid (can be opened/parsed)
- [ ] Data structure matches expectations
- [ ] Cached for future use
- [ ] API keys stored securely (not in code)

## Common Issues

**Timeout errors** → Increase timeout: `requests.get(url, timeout=300)`

**SSL certificate error** → Verify SSL: `requests.get(url, verify=True)`

**Rate limiting** → Add delays: `time.sleep(1)` between requests

**Memory error (large files)** → Use streaming: `response.iter_content(chunk_size=8192)`

**Partial download** → Implement resume capability with Range headers

## Helper Scripts

Use provided scripts for common tasks:

```bash
# Example: Download Ottawa Economic Development PDFs
uv run python .skills/dev-data_download/scripts/download_ottawa_pdfs.py --list-urls
uv run python .skills/dev-data_download/scripts/download_ottawa_pdfs.py --all
uv run python .skills/dev-data_download/scripts/download_ottawa_pdfs.py --year 2024 --quarter Q1

# The Ottawa PDF downloader demonstrates:
# - Retry logic with exponential backoff
# - Selenium for dynamic content extraction
# - Batch downloading with progress tracking
# - Metadata generation
# - Automatic URL discovery from web pages
```

**Script Features:**
- Automatic retry with exponential backoff
- Resume capability for interrupted downloads
- Progress tracking
- Metadata extraction and storage
- Selenium integration for dynamic content
- Batch processing support

## References

**For detailed code examples:** See `references/examples.md`

**For platform-specific guides:** See `references/platforms.md`

**For API authentication setup:** See `references/authentication.md`

## Quick Reference

```python
# Simple download
response = requests.get(url)
Path('data.csv').write_bytes(response.content)

# With retry and cache
download_with_cache(url, cache_dir=Path('.cache'))

# From Kaggle
kaggle.api.dataset_download_files('dataset-id', path='data/', unzip=True)

# From HuggingFace
dataset = load_dataset('dataset-name', cache_dir='./cache')

# From sklearn
from sklearn.datasets import load_iris
data = load_iris()
```
