#!/usr/bin/env python3
"""
Simple file downloader with retry and progress bar.

Usage:
    python download_file.py <url> <output_path>
    python download_file.py https://example.com/data.csv data/data.csv
"""

import sys
from pathlib import Path
import requests
from tqdm import tqdm
from tenacity import retry, stop_after_attempt, wait_exponential


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=4, max=10))
def download_file(url: str, output_path: Path, chunk_size: int = 8192):
    """Download file with progress bar and retry logic."""
    print(f"Downloading: {url}")
    print(f"Output: {output_path}")
    
    response = requests.get(url, stream=True, timeout=30)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'wb') as f:
        with tqdm(total=total_size, unit='B', unit_scale=True, desc=output_path.name) as pbar:
            for chunk in response.iter_content(chunk_size=chunk_size):
                f.write(chunk)
                pbar.update(len(chunk))
    
    print(f"✓ Downloaded successfully to: {output_path}")
    return output_path


def main():
    if len(sys.argv) != 3:
        print("Usage: python download_file.py <url> <output_path>")
        print("Example: python download_file.py https://example.com/data.csv data/data.csv")
        sys.exit(1)
    
    url = sys.argv[1]
    output_path = Path(sys.argv[2])
    
    try:
        download_file(url, output_path)
    except Exception as e:
        print(f"✗ Download failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
