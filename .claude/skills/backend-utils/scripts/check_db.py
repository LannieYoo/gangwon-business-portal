"""查询日志数据."""
from supabase import create_client
import os
import sys
from pathlib import Path
import json

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

# 查看系统日志的 module 和 message 字段
print("=== 系统日志字段检查 ===")
result = client.table('system_logs').select('module, message, extra_data').limit(5).execute()
for row in result.data:
    print(f"module: {row.get('module')}")
    print(f"message长度: {len(row.get('message', ''))}")
    print(f"extra_data: {row.get('extra_data')}")
    print("---")
