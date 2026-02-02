"""
查询向量化的 Sutton RL 教科书
使用语义搜索找到相关内容

使用本地模型（完全免费）
"""

import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
from sentence_transformers import SentenceTransformer

# 配置
VECTORS_PATH = Path("../resources/textbook_vectors.json")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # 与向量化时使用的模型一致


def load_vectors() -> Dict:
    """加载向量数据"""
    print(f"📂 加载向量数据: {VECTORS_PATH}")
    
    with open(VECTORS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✓ 加载了 {data['metadata']['total_chunks']} 个文本块")
    return data


def get_query_embedding(query: str) -> List[float]:
    """获取查询的向量（使用本地模型）"""
    model = SentenceTransformer(EMBEDDING_MODEL)
    embedding = model.encode([query], show_progress_bar=False)
    return embedding[0].tolist()


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """计算余弦相似度"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


def search(query: str, data: Dict, top_k: int = 5) -> List[Tuple[Dict, float]]:
    """搜索最相关的文本块"""
    print(f"🔍 搜索: '{query}'")
    
    # 获取查询向量
    query_embedding = get_query_embedding(query)
    
    # 计算相似度
    results = []
    for chunk in data['chunks']:
        similarity = cosine_similarity(query_embedding, chunk['embedding'])
        results.append((chunk, similarity))
    
    # 排序并返回 top_k
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]


def display_results(results: List[Tuple[Dict, float]]):
    """显示搜索结果"""
    print("\n" + "=" * 80)
    print("搜索结果")
    print("=" * 80)
    
    for i, (chunk, score) in enumerate(results, 1):
        print(f"\n【结果 {i}】相似度: {score:.4f} | 页码: {chunk['page']}")
        print("-" * 80)
        
        # 显示文本（限制长度）
        text = chunk['text']
        if len(text) > 300:
            text = text[:300] + "..."
        print(text)
        print()


def interactive_mode():
    """交互式查询模式"""
    print("\n" + "=" * 80)
    print("Sutton RL 教科书 - 交互式查询")
    print("=" * 80)
    print("输入查询内容，输入 'quit' 或 'exit' 退出")
    print()
    
    # 加载数据
    data = load_vectors()
    
    while True:
        try:
            query = input("\n🔍 查询 > ").strip()
            
            if query.lower() in ['quit', 'exit', 'q']:
                print("👋 再见！")
                break
            
            if not query:
                continue
            
            # 搜索
            results = search(query, data, top_k=3)
            display_results(results)
            
        except KeyboardInterrupt:
            print("\n👋 再见！")
            break
        except Exception as e:
            print(f"❌ 错误: {e}")


def single_query(query: str, top_k: int = 5):
    """单次查询"""
    data = load_vectors()
    results = search(query, data, top_k=top_k)
    display_results(results)


def main():
    """主函数"""
    import sys
    
    if len(sys.argv) > 1:
        # 命令行查询
        query = ' '.join(sys.argv[1:])
        single_query(query)
    else:
        # 交互式模式
        interactive_mode()


if __name__ == "__main__":
    main()
