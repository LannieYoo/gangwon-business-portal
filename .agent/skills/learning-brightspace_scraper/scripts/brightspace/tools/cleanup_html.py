# 清理父目录的重复 HTML 文件（只保留 index.html）
from pathlib import Path


def has_submodules(module_dir: Path) -> bool:
    """判断是否有子模块目录"""
    for item in module_dir.iterdir():
        if item.is_dir() and item.name not in ("html", "links", "files"):
            return True
    return False


def cleanup_parent_html(module_dir: Path):
    """清理父目录的 HTML 文件，只保留 index.html"""
    html_dir = module_dir / "html"
    if not html_dir.exists():
        return
    
    # 先递归处理子目录
    for subdir in module_dir.iterdir():
        if subdir.is_dir() and subdir.name not in ("html", "links", "files"):
            cleanup_parent_html(subdir)
    
    # 如果有子模块，清理父目录的非 index.html 文件
    if has_submodules(module_dir):
        deleted = 0
        for html_file in html_dir.glob("*.html"):
            if html_file.name != "index.html":
                html_file.unlink()
                deleted += 1
        
        if deleted > 0:
            print(f"{module_dir.name}: deleted {deleted} duplicate HTML files")


def main():
    data_dir = Path(__file__).parent / "data" / "ml"
    
    for module_dir in data_dir.iterdir():
        if not module_dir.is_dir():
            continue
        if module_dir.name in ("html", "links", "files"):
            continue
        
        cleanup_parent_html(module_dir)
    
    print("\nDone!")


if __name__ == "__main__":
    main()
