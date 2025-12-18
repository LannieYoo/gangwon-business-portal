"""
Script to test the admin threads API endpoint directly.
"""
import os
import requests
from dotenv import load_dotenv
load_dotenv('.env.local')

# You need to get a valid admin token first
# For testing, we'll simulate what the API should return

from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')

client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=== Simulating API response for /api/admin/messages/threads?has_unread=true ===")

# Get all threads
result = client.table('message_threads').select('*').order('last_message_at', desc=True).execute()
all_threads = result.data or []
print(f"Total threads in DB: {len(all_threads)}")

# Calculate unread count for each thread
for thread in all_threads:
    tid = str(thread['id'])
    unread_query = client.table('thread_messages').select('*', count='exact')
    unread_query = unread_query.eq('thread_id', tid).eq('sender_type', 'member').eq('is_read', False)
    unread_result = unread_query.execute()
    thread['admin_unread_count'] = unread_result.count or 0

# Filter by has_unread=True
filtered_threads = [t for t in all_threads if t['admin_unread_count'] > 0]
print(f"Filtered threads with unread: {len(filtered_threads)}")

# Get member names
member_ids = list(set(t['member_id'] for t in filtered_threads if t.get('member_id')))
member_names = {}
if member_ids:
    member_result = client.table('members').select('id, company_name').in_('id', member_ids).execute()
    for member in (member_result.data or []):
        member_names[str(member['id'])] = member.get('company_name') or "会员"

# Enrich threads
for thread in filtered_threads:
    thread['member_name'] = member_names.get(str(thread['member_id']), "会员")

print("\n=== Expected API Response ===")
print(f"total: {len(filtered_threads)}")
print(f"items: {len(filtered_threads)}")

for t in filtered_threads:
    print(f"\nThread:")
    print(f"  id: {t['id']}")
    print(f"  subject: {t['subject']}")
    print(f"  admin_unread_count: {t['admin_unread_count']}")
    print(f"  member_name: {t['member_name']}")
    print(f"  last_message_at: {t.get('last_message_at')}")
