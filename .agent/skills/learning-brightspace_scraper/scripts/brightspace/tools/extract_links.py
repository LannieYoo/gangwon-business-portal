# 从已保存的 HTML 中提取外部链接（只在叶子节点保存）
from pathlib import Path


def extract_urls_from_html(html: str) -> list[str]:
    """从 HTML 中提取 OpenInNewWindow 的 URL - 只取第一个（当前页面的链接）"""
    start_marker = 'OpenInNewWindow\\",\\"P\\":[\\"'
    
    idx = html.find(start_marker)
    if idx == -1:
        return []
    
    url_start = idx + len(start_marker)
    url_end = html.find('\\"', url_start)
    if url_end == -1:
        return []
    
    url = html[url_start:url_end]
    url = url.replace("\\/", "/")
    
    if "brightspace" not in url and "d2l" not in url:
        return [url]
    
    return []


def is_leaf_module(module_dir: Path) -> bool:
    """判断是否是叶子模块（没有子模块目录）"""
    for item in module_dir.iterdir():
        if item.is_dir() and item.name not in ("html", "links", "files"):
            return False
    return True


def process_module(module_dir: Path, processed_files: set):
    """处理一个模块目录，只在叶子节点保存链接"""
    html_dir = module_dir / "html"
    if not html_dir.exists():
        return
    
    # 先递归处理子目录
    for subdir in module_dir.iterdir():
        if subdir.is_dir() and subdir.name not in ("html", "links", "files"):
            process_module(subdir, processed_files)
    
    # 只在叶子节点保存链接
    if not is_leaf_module(module_dir):
        # 删除父目录的 links 文件（如果存在）
        links_dir = module_dir / "links"
        if links_dir.exists():
            for f in links_dir.iterdir():
                f.unlink()
            links_dir.rmdir()
        return
    
    all_urls = []
    
    for html_file in html_dir.glob("*.html"):
        if html_file.name == "index.html":
            continue
        
        # 跳过已处理的文件（避免重复）
        file_id = html_file.stem.split("_")[0] if "_" in html_file.stem else html_file.stem
        if file_id in processed_files:
            continue
        processed_files.add(file_id)
        
        html = html_file.read_text(encoding="utf-8")
        urls = extract_urls_from_html(html)
        
        for url in urls:
            title = html_file.stem.split("_", 1)[-1] if "_" in html_file.stem else html_file.stem
            all_urls.append((title, url))
    
    if all_urls:
        links_dir = module_dir / "links"
        links_dir.mkdir(exist_ok=True)
        
        links_file = links_dir / "links.md"
        with open(links_file, "w", encoding="utf-8") as f:
            f.write(f"# {module_dir.name}\n\n")
            seen = set()
            for title, url in all_urls:
                key = (title, url)
                if key not in seen:
                    seen.add(key)
                    f.write(f"- [{title}]({url})\n")
        
        print(f"{module_dir.name}: {len(seen)} links saved")


def main():
    data_dir = Path(__file__).parent / "data" / "ml"
    processed_files = set()
    
    for module_dir in data_dir.iterdir():
        if not module_dir.is_dir():
            continue
        if module_dir.name in ("html", "links", "files"):
            continue
        
        process_module(module_dir, processed_files)


if __name__ == "__main__":
    main()
