"""清空所有日志数据."""
from supabase import create_client
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from dotenv import load_dotenv

# Load from backend/.env.local
env_path = backend_path / '.env.local'
load_dotenv(env_path)

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY')

client = create_client(url, key)

# 日志表列表
log_tables = [
    'app_logs',
    'error_logs', 
    'performance_logs',
    'audit_logs',
    'system_logs'
]

print("=== 清空日志数据 ===")
for table in log_tables:
    try:
        # 删除所有记录 (使用 neq 条件删除所有)
        result = client.table(table).delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        count = len(result.data) if result.data else 0
        print(f"✓ {table}: 删除 {count} 条记录")
    except Exception as e:
        print(f"✗ {table}: {e}")

print("\n完成!")
