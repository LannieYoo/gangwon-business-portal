# 从已保存的 HTML 中提取 PDF 下载链接
import re
from pathlib import Path


def extract_pdf_urls_from_html(html: str) -> list[tuple[str, str]]:
    """从 HTML 中提取 PDF 的 URL 和标题"""
    # 格式: data-location="/content/enforced/.../xxx.pdf?ou=846088" data-title="xxx.pdf"
    pattern = r'data-location="(/content/enforced/[^"]+\.pdf[^"]*)"[^>]*data-title="([^"]+)"'
    matches = re.findall(pattern, html)
    
    results = []
    for url, title in matches:
        if url not in [r[0] for r in results]:
            results.append((url, title))
    
    return results


def main():
    data_dir = Path(__file__).parent / "data" / "ml"
    
    all_pdfs = []
    
    for html_file in data_dir.rglob("*.html"):
        if html_file.name == "index.html":
            continue
        
        html = html_file.read_text(encoding="utf-8")
        pdfs = extract_pdf_urls_from_html(html)
        
        if pdfs:
            module_path = html_file.parent.parent.relative_to(data_dir)
            for url, title in pdfs:
                all_pdfs.append((str(module_path), title, url))
    
    print(f"Found {len(all_pdfs)} PDF files:\n")
    for module, title, url in all_pdfs:
        print(f"  [{module}] {title}")
        print(f"    URL: {url}\n")


if __name__ == "__main__":
    main()
