# 迁移现有数据到按模块组织的目录结构
import re
import shutil
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data" / "ml"
HTML_DIR = DATA_DIR / "html"

# content ID 到模块的映射（从模块 HTML 文件中提取）
CONTENT_TO_MODULE = {
    # Course Information
    "12627092": "Course Information",
    # Week 1 - Data Preprocessing
    "12627096": "Week 1 - Data Preprocessing",
    "12627097": "Week 1 - Data Preprocessing",
    "12627098": "Week 1 - Data Preprocessing",
    # Hybrid1 - PCA, LDA
    "12627123": "Hybrid1 - PCA, LDA",
    "12627124": "Hybrid1 - PCA, LDA",
    "12627125": "Hybrid1 - PCA, LDA",
    # Hybrid2 - SVM
    "12627127": "Hybrid2 - SVM",
    "12627128": "Hybrid2 - SVM",
    "12627129": "Hybrid2 - SVM",
    # Hybrid3 - CNN
    "12627131": "Hybrid3 - CNN",
    "12627132": "Hybrid3 - CNN",
    # Hybrid4 - Bayes, Naïve Bayes
    "12627134": "Hybrid4 - Bayes, Naïve Bayes",
    "12627135": "Hybrid4 - Bayes, Naïve Bayes",
    "12627136": "Hybrid4 - Bayes, Naïve Bayes",
    "12627137": "Hybrid4 - Bayes, Naïve Bayes",
    # Hybrid5-Clustering
    "12627139": "Hybrid5-Clustering",
    # Hybrid6 - Class Imbalance Problem
    "12627141": "Hybrid6 - Class Imbalance Problem",
    "12627142": "Hybrid6 - Class Imbalance Problem",
    # Hybrid7 - Classifier Fusion
    "12627144": "Hybrid7 - Classifier Fusion",
    "12627145": "Hybrid7 - Classifier Fusion",
    "12627146": "Hybrid7 - Classifier Fusion",
    "12627147": "Hybrid7 - Classifier Fusion",
    # Hybrid8 - PowerBI & Tableau
    "12627149": "Hybrid8 - PowerBI & Tableau",
    "12627150": "Hybrid8 - PowerBI & Tableau",
    "12627151": "Hybrid8 - PowerBI & Tableau",
}


def sanitize_filename(name: str) -> str:
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name[:100]


def migrate():
    if not HTML_DIR.exists():
        print("HTML directory not found")
        return
    
    # 迁移模块 HTML 文件
    for html_file in HTML_DIR.glob("module_*.html"):
        module_name = html_file.stem.replace("module_", "")
        safe_module = sanitize_filename(module_name)
        target_dir = DATA_DIR / safe_module / "html"
        target_dir.mkdir(parents=True, exist_ok=True)
        
        target_file = target_dir / "index.html"
        if not target_file.exists():
            shutil.copy(html_file, target_file)
            print(f"Migrated: {html_file.name} -> {safe_module}/html/index.html")
        else:
            print(f"Skip (exists): {safe_module}/html/index.html")
    
    # 迁移 content HTML 文件
    for html_file in HTML_DIR.glob("content_*.html"):
        match = re.match(r"content_(\d+)_(.+)\.html", html_file.name)
        if not match:
            print(f"Skip (no match): {html_file.name}")
            continue
        
        content_id = match.group(1)
        title = match.group(2)
        
        module_name = CONTENT_TO_MODULE.get(content_id)
        if not module_name:
            print(f"Skip (no module): {html_file.name}")
            continue
        
        safe_module = sanitize_filename(module_name)
        target_dir = DATA_DIR / safe_module / "html"
        target_dir.mkdir(parents=True, exist_ok=True)
        
        target_file = target_dir / f"{content_id}_{title}.html"
        if not target_file.exists():
            shutil.copy(html_file, target_file)
            print(f"Migrated: {html_file.name} -> {safe_module}/html/")
        else:
            print(f"Skip (exists): {target_file.name}")
    
    # 保留课程首页 index.html
    index_file = HTML_DIR / "index.html"
    if index_file.exists():
        target_dir = DATA_DIR / "html"
        target_dir.mkdir(parents=True, exist_ok=True)
        target_file = target_dir / "index.html"
        if not target_file.exists():
            shutil.copy(index_file, target_file)
            print("Migrated: index.html -> html/index.html")
    
    print("\nMigration completed!")
    print("You can now delete the old html/ directory if everything looks correct.")


if __name__ == "__main__":
    migrate()
