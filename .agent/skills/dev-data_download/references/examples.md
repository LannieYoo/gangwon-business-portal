# Data Download Code Examples

Complete code examples for various download scenarios.

## Basic HTTP Download with Progress

```python
import requests
from pathlib import Path
from tqdm import tqdm

def download_file(url: str, output_path: Path, chunk_size: int = 8192):
    """Download file with progress bar."""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'wb') as f:
        with tqdm(total=total_size, unit='B', unit_scale=True, desc=output_path.name) as pbar:
            for chunk in response.iter_content(chunk_size=chunk_size):
                f.write(chunk)
                pbar.update(len(chunk))
    
    return output_path

# Usage
download_file(
    'https://example.com/dataset.csv',
    Path('data/dataset.csv')
)
```

## Download with Retry Logic

```python
from tenacity import retry, stop_after_attempt, wait_exponential
import requests
from pathlib import Path

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
def download_with_retry(url: str, output_path: Path):
    """Download with automatic retry on failure."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(response.content)
    
    return output_path

# Usage
try:
    download_with_retry('https://example.com/data.csv', Path('data/data.csv'))
    print("✓ Download successful")
except Exception as e:
    print(f"✗ Download failed after retries: {e}")
```

## Resume Partial Downloads

```python
import requests
from pathlib import Path

def download_resumable(url: str, output_path: Path):
    """Download with resume capability."""
    headers = {}
    mode = 'wb'
    
    if output_path.exists():
        # Resume from where we left off
        existing_size = output_path.stat().st_size
        headers['Range'] = f'bytes={existing_size}-'
        mode = 'ab'
        print(f"Resuming from byte {existing_size}")
    
    response = requests.get(url, headers=headers, stream=True)
    
    if response.status_code == 416:  # Range not satisfiable
        print("File already complete")
        return output_path
    
    with open(output_path, mode) as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return output_path

# Usage
download_resumable('https://example.com/large_file.zip', Path('data/large_file.zip'))
```

## Caching Strategy

```python
from pathlib import Path
import time
import requests

def download_with_cache(
    url: str,
    cache_dir: Path = Path('.cache'),
    max_age_days: int = 7
):
    """Download file with local caching."""
    cache_dir.mkdir(exist_ok=True)
    
    # Generate cache filename from URL
    filename = url.split('/')[-1]
    cache_path = cache_dir / filename
    
    # Check if cached file exists and is recent
    if cache_path.exists():
        age_days = (time.time() - cache_path.stat().st_mtime) / 86400
        if age_days < max_age_days:
            print(f"Using cached file (age: {age_days:.1f} days)")
            return cache_path
    
    # Download fresh copy
    print(f"Downloading from {url}")
    response = requests.get(url)
    response.raise_for_status()
    cache_path.write_bytes(response.content)
    
    return cache_path

# Usage
file_path = download_with_cache(
    'https://example.com/dataset.csv',
    cache_dir=Path('.cache'),
    max_age_days=7
)
```

## Batch Downloads with Concurrency

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import requests

def download_one(url: str, output_dir: Path):
    """Download single file."""
    filename = url.split('/')[-1]
    output_path = output_dir / filename
    
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    output_path.write_bytes(response.content)
    
    return filename

def download_batch(urls: list[str], output_dir: Path, max_workers: int = 5):
    """Download multiple files concurrently."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_one, url, output_dir): url for url in urls}
        
        for future in as_completed(futures):
            url = futures[future]
            try:
                filename = future.result()
                print(f"✓ Downloaded: {filename}")
            except Exception as e:
                print(f"✗ Failed {url}: {e}")

# Usage
urls = [
    'https://example.com/file1.csv',
    'https://example.com/file2.csv',
    'https://example.com/file3.csv',
]
download_batch(urls, Path('data/'), max_workers=3)
```

## Download and Extract Archive

```python
import zipfile
import tarfile
from pathlib import Path
import requests

def download_and_extract(url: str, extract_to: Path):
    """Download and extract compressed file."""
    # Download
    filename = url.split('/')[-1]
    download_path = Path(f'/tmp/{filename}')
    
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(download_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    # Extract
    extract_to.mkdir(parents=True, exist_ok=True)
    
    if filename.endswith('.zip'):
        with zipfile.ZipFile(download_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
    elif filename.endswith(('.tar.gz', '.tgz')):
        with tarfile.open(download_path, 'r:gz') as tar_ref:
            tar_ref.extractall(extract_to)
    else:
        raise ValueError(f"Unsupported archive format: {filename}")
    
    # Cleanup
    download_path.unlink()
    
    print(f"✓ Extracted to: {extract_to}")
    return extract_to

# Usage
download_and_extract(
    'https://example.com/dataset.zip',
    Path('data/extracted/')
)
```

## Checksum Verification

```python
import hashlib
from pathlib import Path

def calculate_md5(file_path: Path) -> str:
    """Calculate MD5 checksum of file."""
    md5_hash = hashlib.md5()
    
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            md5_hash.update(chunk)
    
    return md5_hash.hexdigest()

def verify_checksum(file_path: Path, expected_md5: str) -> bool:
    """Verify file integrity using MD5 checksum."""
    actual_md5 = calculate_md5(file_path)
    
    if actual_md5 != expected_md5:
        raise ValueError(f"Checksum mismatch: {actual_md5} != {expected_md5}")
    
    print(f"✓ Checksum verified: {actual_md5}")
    return True

# Usage
file_path = Path('data/dataset.csv')
expected_md5 = 'abc123def456...'
verify_checksum(file_path, expected_md5)
```

## Data Validation

```python
import pandas as pd
from pathlib import Path

def validate_csv(file_path: Path, expected_columns: list = None, min_rows: int = 1):
    """Validate CSV file structure and content."""
    try:
        df = pd.read_csv(file_path)
        
        # Check if empty
        if df.empty or len(df) < min_rows:
            raise ValueError(f"File has fewer than {min_rows} rows")
        
        # Check columns
        if expected_columns:
            missing = set(expected_columns) - set(df.columns)
            if missing:
                raise ValueError(f"Missing columns: {missing}")
        
        print(f"✓ Valid CSV: {len(df)} rows, {len(df.columns)} columns")
        print(f"  Columns: {df.columns.tolist()}")
        return True
        
    except Exception as e:
        print(f"✗ Invalid CSV: {e}")
        return False

# Usage
validate_csv(
    Path('data/dataset.csv'),
    expected_columns=['age', 'sex', 'bmi', 'target'],
    min_rows=100
)
```

## API with Pagination

```python
import requests
import time

def fetch_paginated_data(base_url: str, api_key: str, max_pages: int = None):
    """Fetch data from paginated API."""
    headers = {'Authorization': f'Bearer {api_key}'}
    all_data = []
    page = 1
    
    while True:
        if max_pages and page > max_pages:
            break
        
        response = requests.get(
            f"{base_url}?page={page}",
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get('results'):
            break
        
        all_data.extend(data['results'])
        print(f"Fetched page {page}: {len(data['results'])} items")
        
        page += 1
        
        # Rate limiting
        time.sleep(0.5)
    
    print(f"✓ Total items fetched: {len(all_data)}")
    return all_data

# Usage
data = fetch_paginated_data(
    'https://api.example.com/data',
    api_key='your-api-key',
    max_pages=10
)
```

## Conditional Download

```python
from pathlib import Path
import requests

def download_if_missing(url: str, output_path: Path, force: bool = False):
    """Download only if file doesn't exist or force is True."""
    if output_path.exists() and not force:
        print(f"File exists: {output_path}")
        return output_path
    
    print(f"Downloading: {url}")
    response = requests.get(url)
    response.raise_for_status()
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(response.content)
    
    print(f"✓ Downloaded to: {output_path}")
    return output_path

# Usage
download_if_missing(
    'https://example.com/dataset.csv',
    Path('data/dataset.csv'),
    force=False  # Set to True to re-download
)
```
