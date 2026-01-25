# 为现有 HTML 文件初始化 hash
import json
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from helpers import compute_content_hash

DATA_DIR = Path(__file__).parent / "data"


def init_hashes():
    for course_dir in DATA_DIR.iterdir():
        if not course_dir.is_dir():
            continue
        
        hashes = {}
        
        for html_file in course_dir.rglob("*.html"):
            content = html_file.read_text(encoding="utf-8")
            hash_key = str(html_file.relative_to(course_dir))
            hashes[hash_key] = compute_content_hash(content)
            print(f"  {hash_key}")
        
        hash_file = course_dir / ".content_hashes.json"
        hash_file.write_text(
            json.dumps(hashes, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        print(f"Saved {len(hashes)} hashes to {hash_file}")


if __name__ == "__main__":
    init_hashes()
