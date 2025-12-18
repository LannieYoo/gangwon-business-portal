"""
Script to test the get_admin_threads logic directly.
"""
import os
from dotenv import load_dotenv
load_dotenv('.env.local')

from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')

client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=== Simulating get_admin_threads logic ===")

# Get all threads
result = client.table('message_threads').select('*').order('last_message_at', desc=True).execute()
threads = result.data or []
print(f"Total threads: {len(threads)}")

# Calculate unread count for each thread
for thread in threads:
    tid = str(thread['id'])
    unread_query = client.table('thread_messages').select('*', count='exact')
    unread_query = unread_query.eq('thread_id', tid).eq('sender_type', 'member').eq('is_read', False)
    unread_result = unread_query.execute()
    thread['admin_unread_count'] = unread_result.count or 0
    print(f"  Thread: {thread['subject']}")
    print(f"    admin_unread_count: {thread['admin_unread_count']}")

# Filter by has_unread
filtered = [t for t in threads if t['admin_unread_count'] > 0]
print(f"\nFiltered threads with unread: {len(filtered)}")
for t in filtered:
    print(f"  {t['subject']} - unread: {t['admin_unread_count']}")
