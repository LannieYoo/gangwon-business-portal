"""
向量化 Sutton RL 教科书
生成单个 JSON 文件存储文本块和向量

使用本地模型（完全免费）
"""

import json
from pathlib import Path
from typing import List, Dict
import pypdf
from sentence_transformers import SentenceTransformer

# 配置
PDF_PATH = Path("../resources/SuttonReinforcementLearning.pdf")
OUTPUT_PATH = Path("../resources/textbook_vectors.json")
CHUNK_SIZE = 500  # 每块字符数
CHUNK_OVERLAP = 50  # 重叠字符数
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # 本地模型，完全免费


def extract_text_from_pdf(pdf_path: Path) -> List[Dict[str, any]]:
    """从 PDF 提取文本，按页分组"""
    print(f"📖 读取 PDF: {pdf_path}")
    
    pages = []
    with open(pdf_path, 'rb') as file:
        reader = pypdf.PdfReader(file)
        total_pages = len(reader.pages)
        
        for page_num, page in enumerate(reader.pages, 1):
            text = page.extract_text()
            if text.strip():
                pages.append({
                    'page': page_num,
                    'text': text.strip()
                })
            
            if page_num % 50 == 0:
                print(f"  处理进度: {page_num}/{total_pages} 页")
    
    print(f"✓ 提取了 {len(pages)} 页文本")
    return pages


def chunk_text(pages: List[Dict], chunk_size: int, overlap: int) -> List[Dict]:
    """将文本分块"""
    print(f"✂️  分块文本 (块大小: {chunk_size}, 重叠: {overlap})")
    
    chunks = []
    chunk_id = 0
    
    for page_data in pages:
        text = page_data['text']
        page_num = page_data['page']
        
        # 简单分块：按字符数
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]
            
            if chunk_text.strip():
                chunks.append({
                    'id': chunk_id,
                    'page': page_num,
                    'text': chunk_text.strip(),
                    'start': start,
                    'end': end
                })
                chunk_id += 1
            
            start = end - overlap
    
    print(f"✓ 生成了 {len(chunks)} 个文本块")
    return chunks


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """使用本地模型获取向量（完全免费）"""
    print(f"🔢 生成向量 (模型: {EMBEDDING_MODEL})")
    print("  首次运行会自动下载模型（约 80MB），之后会使用缓存")
    
    # 加载本地模型
    model = SentenceTransformer(EMBEDDING_MODEL)
    
    # 批量处理
    batch_size = 32
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        print(f"  处理进度: {i}/{len(texts)}")
        
        # 生成向量
        embeddings = model.encode(batch, show_progress_bar=False)
        all_embeddings.extend(embeddings.tolist())
    
    print(f"✓ 生成了 {len(all_embeddings)} 个向量")
    return all_embeddings


def save_vectors(chunks: List[Dict], embeddings: List[List[float]], output_path: Path):
    """保存为单个 JSON 文件"""
    print(f"💾 保存向量数据: {output_path}")
    
    # 组合数据
    data = {
        'metadata': {
            'total_chunks': len(chunks),
            'embedding_model': EMBEDDING_MODEL,
            'embedding_dim': len(embeddings[0]) if embeddings else 0,
            'chunk_size': CHUNK_SIZE,
            'chunk_overlap': CHUNK_OVERLAP
        },
        'chunks': []
    }
    
    for chunk, embedding in zip(chunks, embeddings):
        data['chunks'].append({
            'id': chunk['id'],
            'page': chunk['page'],
            'text': chunk['text'],
            'embedding': embedding
        })
    
    # 保存
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 显示文件大小
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"✓ 保存成功！文件大小: {size_mb:.2f} MB")


def main():
    """主流程"""
    print("=" * 60)
    print("向量化 Sutton RL 教科书")
    print("=" * 60)
    
    # 1. 提取文本
    pages = extract_text_from_pdf(PDF_PATH)
    
    # 2. 分块
    chunks = chunk_text(pages, CHUNK_SIZE, CHUNK_OVERLAP)
    
    # 3. 生成向量
    texts = [chunk['text'] for chunk in chunks]
    embeddings = get_embeddings(texts)
    
    # 4. 保存
    save_vectors(chunks, embeddings, OUTPUT_PATH)
    
    print("\n" + "=" * 60)
    print("✅ 完成！")
    print(f"📁 输出文件: {OUTPUT_PATH}")
    print(f"📊 总块数: {len(chunks)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
