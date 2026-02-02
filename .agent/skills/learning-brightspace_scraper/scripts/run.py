#!/usr/bin/env python
"""Brightspace scraper entry point"""
import asyncio
import sys
from pathlib import Path

# Add brightspace directory to path
sys.path.insert(0, str(Path(__file__).parent / "brightspace"))

from brightspace.scraper import main as bs_main


if __name__ == "__main__":
    asyncio.run(bs_main())
