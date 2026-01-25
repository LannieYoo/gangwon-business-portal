# Brightspace 抓取配置
from pathlib import Path

# 课程 ID 到本地目录的映射
COURSES = {
    "846088": "ml",           # Advanced Machine Learning
    "846083": "nlp",          # Natural Language Processing
    "846092": "mv",           # Machine Vision
    "846085": "rl",           # Reinforcement Learning (100)
    "846095": "ai-project",   # AI Project 2
    "864511": "coop",         # Co-op / New Course
}

# Brightspace 基础 URL
BASE_URL = "https://brightspace.algonquincollege.com"

# 抓取数据存放目录（根目录的 data/）
OUTPUT_DIR = Path(__file__).parent.parent.parent.parent.parent / "data"

# Session 文件路径
SESSION_FILE = Path(__file__).parent / ".session.json"
