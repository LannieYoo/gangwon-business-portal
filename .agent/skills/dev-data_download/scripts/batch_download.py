#!/usr/bin/env python3
"""
Batch download files from a list of URLs.

Usage:
    python batch_download.py <urls_file> [output_dir] [--workers N]
    python batch_download.py urls.txt data/ --workers 5

URLs file format (one URL per line):
    https://example.com/file1.csv
    https://example.com/file2.csv
    https://example.com/file3.csv
"""

import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import argparse


def download_one(url: str, output_dir: Path) -> tuple[str, bool, str]:
    """Download single file."""
    try:
        filename = url.split('/')[-1].split('?')[0]  # Remove query params
        output_path = output_dir / filename
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        output_path.write_bytes(response.content)
        
        return filename, True, "Success"
    except Exception as e:
        return url, False, str(e)


def batch_download(urls: list[str], output_dir: Path, max_workers: int = 5):
    """Download multiple files concurrently."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading {len(urls)} files to {output_dir}")
    print(f"Using {max_workers} workers\n")
    
    results = {'success': 0, 'failed': 0}
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_one, url, output_dir): url for url in urls}
        
        for future in as_completed(futures):
            filename, success, message = future.result()
            
            if success:
                print(f"✓ {filename}")
                results['success'] += 1
            else:
                print(f"✗ {filename}: {message}")
                results['failed'] += 1
    
    print(f"\n{'='*60}")
    print(f"Results: {results['success']} succeeded, {results['failed']} failed")
    print(f"{'='*60}")
    
    return results


def main():
    parser = argparse.ArgumentParser(description='Batch download files')
    parser.add_argument('urls_file', help='File containing URLs (one per line)')
    parser.add_argument('output_dir', nargs='?', default='data/', help='Output directory')
    parser.add_argument('--workers', '-w', type=int, default=5, help='Number of concurrent workers')
    
    args = parser.parse_args()
    
    urls_file = Path(args.urls_file)
    
    if not urls_file.exists():
        print(f"✗ URLs file not found: {urls_file}")
        sys.exit(1)
    
    # Read URLs from file
    urls = [line.strip() for line in urls_file.read_text().splitlines() if line.strip() and not line.startswith('#')]
    
    if not urls:
        print("✗ No URLs found in file")
        sys.exit(1)
    
    output_dir = Path(args.output_dir)
    
    try:
        results = batch_download(urls, output_dir, max_workers=args.workers)
        
        if results['failed'] > 0:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n✗ Download interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Batch download failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
