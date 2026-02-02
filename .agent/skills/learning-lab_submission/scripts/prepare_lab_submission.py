#!/usr/bin/env python3
"""
Universal Lab Submission Package Creator

Prepares lab assignments for submission by:
- Validating required files
- Creating proper folder structure
- Generating zip package
- Providing submission checklist

Usage:
    python prepare_lab_submission.py <lab_dir> [--files file1 file2 ...]
    
Example:
    python prepare_lab_submission.py lab1 --files lab1_zipf_law.ipynb Lab1.docx
    python prepare_lab_submission.py lab2 --files lab2.py lab2.ipynb Lab2.pdf
"""
import sys
import os
import shutil
import argparse
from pathlib import Path
from datetime import datetime


def format_size(size_bytes):
    """Format file size in human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


def validate_files(lab_dir, required_files):
    """
    Validate that all required files exist.
    
    Args:
        lab_dir: Path to lab directory
        required_files: List of required filenames
        
    Returns:
        tuple: (success, missing_files)
    """
    missing = []
    for filename in required_files:
        filepath = os.path.join(lab_dir, filename)
        if not os.path.exists(filepath):
            missing.append(filename)
    
    return len(missing) == 0, missing


def create_submission_package(lab_dir, required_files, output_name=None):
    """
    Create submission package (zip file).
    
    Args:
        lab_dir: Path to lab directory
        required_files: List of files to include
        output_name: Output zip filename (optional)
        
    Returns:
        tuple: (success, zip_path, error_message)
    """
    lab_name = os.path.basename(os.path.abspath(lab_dir))
    
    if output_name is None:
        output_name = f"{lab_name}.zip"
    
    # Remove .zip extension if provided
    if output_name.endswith('.zip'):
        output_name = output_name[:-4]
    
    print(f"\n{'='*60}")
    print(f"Creating Lab Submission Package")
    print(f"{'='*60}")
    print(f"Lab: {lab_name}")
    print(f"Output: {output_name}.zip")
    print(f"{'='*60}\n")
    
    # Create temporary submission folder
    temp_dir = f"{lab_name}_submission"
    submission_folder = os.path.join(temp_dir, lab_name)
    
    try:
        # Clean up if exists
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        
        # Create folder structure
        os.makedirs(submission_folder, exist_ok=True)
        print(f"✓ Created folder structure: {submission_folder}")
        
        # Copy required files
        print(f"\n📋 Copying files:")
        total_size = 0
        for filename in required_files:
            src = os.path.join(lab_dir, filename)
            dst = os.path.join(submission_folder, filename)
            
            # Create subdirectories if needed
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            
            shutil.copy2(src, dst)
            file_size = os.path.getsize(src)
            total_size += file_size
            print(f"  ✓ {filename} ({format_size(file_size)})")
        
        # Create zip file
        print(f"\n📦 Creating zip archive...")
        zip_path = os.path.join(lab_dir, output_name)
        shutil.make_archive(zip_path, 'zip', temp_dir, lab_name)
        zip_path = f"{zip_path}.zip"
        
        zip_size = os.path.getsize(zip_path)
        
        # Clean up temp folder
        shutil.rmtree(temp_dir)
        
        print(f"\n{'='*60}")
        print(f"✅ Submission package created successfully!")
        print(f"{'='*60}")
        print(f"File: {zip_path}")
        print(f"Size: {format_size(zip_size)}")
        print(f"Files: {len(required_files)}")
        print(f"{'='*60}\n")
        
        return True, zip_path, None
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        return False, None, str(e)


def verify_zip_contents(zip_path):
    """Verify zip file contents."""
    import zipfile
    
    print(f"🔍 Verifying zip contents:\n")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_file:
        for info in zip_file.filelist:
            if not info.is_dir():
                print(f"  ✓ {info.filename} ({format_size(info.file_size)})")
    
    print()


def generate_submission_report(lab_name, zip_path, required_files):
    """Generate submission checklist report."""
    zip_size = os.path.getsize(zip_path)
    
    print(f"{'='*60}")
    print(f"📝 Submission Checklist")
    print(f"{'='*60}\n")
    
    print(f"**Lab:** {lab_name}")
    print(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"**Package:** {os.path.basename(zip_path)}")
    print(f"**Size:** {format_size(zip_size)}\n")
    
    print(f"**Files Included:**")
    for filename in required_files:
        print(f"  ✅ {filename}")
    
    print(f"\n**Pre-Upload Checklist:**")
    print(f"  [ ] All required files are included")
    print(f"  [ ] File names are correct")
    print(f"  [ ] Code runs without errors")
    print(f"  [ ] Documentation is complete")
    print(f"  [ ] Student info is correct")
    print(f"  [ ] Zip file size is reasonable (<50MB)")
    
    print(f"\n**Upload Steps:**")
    print(f"  1. Go to Brightspace course page")
    print(f"  2. Navigate to Assignments > {lab_name.upper()}")
    print(f"  3. Upload {os.path.basename(zip_path)}")
    print(f"  4. Verify upload success")
    print(f"  5. Check submission confirmation")
    
    print(f"\n{'='*60}")
    print(f"✨ Ready for submission!")
    print(f"{'='*60}\n")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Prepare lab assignment for submission',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python prepare_lab_submission.py lab1 --files lab1.ipynb Lab1.docx
  python prepare_lab_submission.py lab2 --files lab2.py lab2.ipynb Lab2.pdf
  python prepare_lab_submission.py . --files assignment.py report.docx
        """
    )
    
    parser.add_argument('lab_dir', help='Lab directory path')
    parser.add_argument('--files', nargs='+', required=True,
                       help='Required files to include in submission')
    parser.add_argument('--output', help='Output zip filename (optional)')
    parser.add_argument('--no-verify', action='store_true',
                       help='Skip zip verification step')
    
    args = parser.parse_args()
    
    # Validate lab directory
    if not os.path.isdir(args.lab_dir):
        print(f"✗ Error: Directory not found: {args.lab_dir}")
        sys.exit(1)
    
    # Validate required files
    print(f"🔍 Validating required files...")
    success, missing = validate_files(args.lab_dir, args.files)
    
    if not success:
        print(f"\n✗ Error: Missing required files:")
        for filename in missing:
            print(f"  - {filename}")
        print(f"\nPlease ensure all required files exist in {args.lab_dir}")
        sys.exit(1)
    
    print(f"✓ All required files found\n")
    
    # Create submission package
    success, zip_path, error = create_submission_package(
        args.lab_dir,
        args.files,
        args.output
    )
    
    if not success:
        print(f"✗ Error creating submission package: {error}")
        sys.exit(1)
    
    # Verify zip contents
    if not args.no_verify:
        verify_zip_contents(zip_path)
    
    # Generate submission report
    lab_name = os.path.basename(os.path.abspath(args.lab_dir))
    generate_submission_report(lab_name, zip_path, args.files)


if __name__ == '__main__':
    main()
