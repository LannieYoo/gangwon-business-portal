"""Helper functions for Brightspace scraper"""
import hashlib
import re


def sanitize_filename(name: str, max_length: int = 100) -> str:
    """清理文件名，移除非法字符"""
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name[:max_length]


def compute_content_hash(content: str) -> str:
    """计算内容 hash，忽略动态部分（session、token 等）"""
    # 移除动态内容，避免每次抓取都认为内容变化
    clean = re.sub(r'Session\.UserId[^;]+;', '', content)
    clean = re.sub(r'XSRF\.Token[^;]+;', '', clean)
    clean = re.sub(r'sessionToken=[^"]+', '', clean)
    return hashlib.md5(clean.encode("utf-8")).hexdigest()
