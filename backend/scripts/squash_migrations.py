"""
Script to squash all migrations into a single initial migration.
This creates a fresh migration based on current models.

WARNING: This will delete all existing migration files!
Only run this on a development database that can be recreated.

Usage:
    python scripts/squash_migrations.py
"""
import os
import shutil
from pathlib import Path

# Paths
BACKEND_DIR = Path(__file__).parent.parent
VERSIONS_DIR = BACKEND_DIR / "alembic" / "versions"
PYCACHE_DIR = VERSIONS_DIR / "__pycache__"


def main():
    print("=" * 60)
    print("Migration Squash Script")
    print("=" * 60)
    
    # Count existing migrations
    migration_files = list(VERSIONS_DIR.glob("*.py"))
    print(f"\nFound {len(migration_files)} migration files")
    
    # Confirm
    confirm = input("\nThis will DELETE all migration files. Continue? (yes/no): ")
    if confirm.lower() != "yes":
        print("Aborted.")
        return
    
    # Delete all migration files
    print("\nDeleting migration files...")
    for f in migration_files:
        print(f"  Deleting: {f.name}")
        f.unlink()
    
    # Clear pycache
    if PYCACHE_DIR.exists():
        print("\nClearing __pycache__...")
        shutil.rmtree(PYCACHE_DIR)
    
    print("\n" + "=" * 60)
    print("Migration files deleted!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Drop and recreate your database (or use a fresh one)")
    print("2. Run: alembic revision --autogenerate -m 'Initial schema'")
    print("3. Run: alembic upgrade head")
    print("=" * 60)


if __name__ == "__main__":
    main()
