"""
数据库字段检查脚本模板

用途: 检查数据库表中的字段是否存在以及实际数据情况
使用方法:
    1. 复制此脚本到项目的 backend 目录
    2. 修改 TABLE_NAME 和 FIELDS_TO_CHECK
    3. 运行: uv run python check_database_fields.py
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# ============ 配置区域 - 根据实际需求修改 ============
TABLE_NAME = 'members'  # 要检查的表名
FIELDS_TO_CHECK = ['gangwon_industry', 'future_tech']  # 要检查的字段列表
DISPLAY_FIELDS = ['id', 'company_name']  # 用于显示的标识字段
LIMIT = 5  # 显示的记录数量
# ===================================================

# 加载环境变量
load_dotenv('.env.local')

# 创建 Supabase 客户端
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("❌ 错误: 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_KEY")
    print("请确保 .env.local 文件存在并包含这些环境变量")
    exit(1)

supabase: Client = create_client(url, key)

print(f"{'='*60}")
print(f"检查表 '{TABLE_NAME}' 中的字段")
print(f"{'='*60}\n")

# 构建查询字段列表
select_fields = DISPLAY_FIELDS + FIELDS_TO_CHECK
select_query = ', '.join(select_fields)

# 查询数据
try:
    response = supabase.table(TABLE_NAME)\
        .select(select_query)\
        .limit(LIMIT)\
        .execute()
    
    if not response.data:
        print(f"⚠️  表 '{TABLE_NAME}' 中没有数据")
    else:
        print(f"✅ 找到 {len(response.data)} 条记录:\n")
        
        for i, record in enumerate(response.data, 1):
            print(f"记录 {i}:")
            
            # 显示标识字段
            for field in DISPLAY_FIELDS:
                value = record.get(field, '(未找到)')
                print(f"  {field}: {value}")
            
            # 显示要检查的字段
            for field in FIELDS_TO_CHECK:
                value = record.get(field)
                status = "✅ 有值" if value else "❌ 空值"
                print(f"  {field}: {value or '(空)'} {status}")
            
            print()
    
    # 统计每个字段有值的记录数
    print(f"\n{'='*60}")
    print("字段统计:")
    print(f"{'='*60}\n")
    
    for field in FIELDS_TO_CHECK:
        try:
            count_response = supabase.table(TABLE_NAME)\
                .select('id', count='exact')\
                .not_.is_(field, 'null')\
                .execute()
            
            total_response = supabase.table(TABLE_NAME)\
                .select('id', count='exact')\
                .execute()
            
            count = count_response.count or 0
            total = total_response.count or 0
            percentage = (count / total * 100) if total > 0 else 0
            
            print(f"字段 '{field}':")
            print(f"  有值记录数: {count}/{total} ({percentage:.1f}%)")
            
            if count == 0:
                print(f"  ⚠️  警告: 所有记录的 '{field}' 字段都为空")
            
            print()
        
        except Exception as e:
            print(f"❌ 统计字段 '{field}' 时出错: {e}\n")
    
    print(f"{'='*60}")
    print("检查完成")
    print(f"{'='*60}")

except Exception as e:
    print(f"❌ 查询数据时出错: {e}")
    print("\n可能的原因:")
    print("1. 表名不存在")
    print("2. 字段名不存在")
    print("3. 数据库连接失败")
    print("4. 权限不足")
    exit(1)
