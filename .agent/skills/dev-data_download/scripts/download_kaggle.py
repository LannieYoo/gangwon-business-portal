#!/usr/bin/env python3
"""
Download dataset from Kaggle.

Usage:
    python download_kaggle.py <dataset-id> [output-dir]
    python download_kaggle.py uciml/iris data/kaggle/
    python download_kaggle.py --competition titanic data/competitions/
"""

import sys
from pathlib import Path
import argparse


def download_dataset(dataset_id: str, output_dir: Path, unzip: bool = True):
    """Download Kaggle dataset."""
    try:
        import kaggle
    except ImportError:
        print("✗ Kaggle package not installed")
        print("  Install with: pip install kaggle")
        sys.exit(1)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading Kaggle dataset: {dataset_id}")
    print(f"Output directory: {output_dir}")
    
    try:
        kaggle.api.dataset_download_files(
            dataset_id,
            path=str(output_dir),
            unzip=unzip
        )
        print(f"✓ Downloaded successfully to: {output_dir}")
    except Exception as e:
        print(f"✗ Download failed: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure kaggle.json is in ~/.kaggle/")
        print("  2. Check dataset ID is correct")
        print("  3. Verify you have accepted the dataset's terms")
        sys.exit(1)


def download_competition(competition: str, output_dir: Path):
    """Download Kaggle competition data."""
    try:
        import kaggle
    except ImportError:
        print("✗ Kaggle package not installed")
        print("  Install with: pip install kaggle")
        sys.exit(1)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading Kaggle competition: {competition}")
    print(f"Output directory: {output_dir}")
    
    try:
        kaggle.api.competition_download_files(
            competition,
            path=str(output_dir)
        )
        print(f"✓ Downloaded successfully to: {output_dir}")
    except Exception as e:
        print(f"✗ Download failed: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure kaggle.json is in ~/.kaggle/")
        print("  2. Check competition name is correct")
        print("  3. Verify you have joined the competition")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='Download from Kaggle')
    parser.add_argument('identifier', help='Dataset ID or competition name')
    parser.add_argument('output_dir', nargs='?', default='data/kaggle/', help='Output directory')
    parser.add_argument('--competition', '-c', action='store_true', help='Download competition data')
    parser.add_argument('--no-unzip', action='store_true', help='Do not unzip files')
    
    args = parser.parse_args()
    
    output_dir = Path(args.output_dir)
    
    if args.competition:
        download_competition(args.identifier, output_dir)
    else:
        download_dataset(args.identifier, output_dir, unzip=not args.no_unzip)


if __name__ == '__main__':
    main()
