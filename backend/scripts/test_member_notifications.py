"""
Script to test member notifications - check if admin messages are being counted correctly.
"""
import os
from dotenv import load_dotenv
load_dotenv('.env.local')

from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')

client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=== Testing Member Notifications ===\n")

# Get all threads
result = client.table('message_threads').select('*').order('last_message_at', desc=True).execute()
all_threads = result.data or []
print(f"Total threads in DB: {len(all_threads)}")

# Get all thread messages
messages_result = client.table('thread_messages').select('*').execute()
all_messages = messages_result.data or []
print(f"Total thread messages in DB: {len(all_messages)}")

# Count messages by sender_type
admin_messages = [m for m in all_messages if m.get('sender_type') == 'admin']
member_messages = [m for m in all_messages if m.get('sender_type') == 'member']
print(f"\nAdmin messages: {len(admin_messages)}")
print(f"Member messages: {len(member_messages)}")

# Count unread admin messages
unread_admin_messages = [m for m in admin_messages if not m.get('is_read')]
print(f"\nUnread admin messages (is_read=False): {len(unread_admin_messages)}")

# Show details of unread admin messages
if unread_admin_messages:
    print("\n=== Unread Admin Messages Details ===")
    for msg in unread_admin_messages:
        print(f"\nMessage ID: {msg['id']}")
        print(f"  Thread ID: {msg['thread_id']}")
        print(f"  Sender Type: {msg['sender_type']}")
        print(f"  is_read: {msg['is_read']}")
        print(f"  Content: {msg['content'][:50]}..." if len(msg.get('content', '')) > 50 else f"  Content: {msg.get('content')}")
        print(f"  Created At: {msg['created_at']}")

# For each thread, calculate member's unread count (admin messages that member hasn't read)
print("\n=== Thread Unread Counts for Members ===")
for thread in all_threads:
    tid = str(thread['id'])
    member_id = thread.get('member_id')
    
    # Count unread admin messages in this thread
    unread_query = client.table('thread_messages').select('*', count='exact')
    unread_query = unread_query.eq('thread_id', tid).eq('sender_type', 'admin').eq('is_read', False)
    unread_result = unread_query.execute()
    unread_count = unread_result.count or 0
    
    print(f"\nThread: {thread['subject']}")
    print(f"  Thread ID: {tid}")
    print(f"  Member ID: {member_id}")
    print(f"  Unread admin messages: {unread_count}")
    print(f"  Status: {thread.get('status')}")

# Simulate getMemberUnreadCount for a specific member
print("\n=== Simulating getMemberUnreadCount ===")
# Get first member
members_result = client.table('members').select('id, company_name').limit(1).execute()
if members_result.data:
    member = members_result.data[0]
    member_id = member['id']
    print(f"Testing for member: {member['company_name']} (ID: {member_id})")
    
    # Get member's thread IDs
    threads_result = client.table('message_threads').select('id').eq('member_id', member_id).execute()
    thread_ids = [t['id'] for t in (threads_result.data or [])]
    print(f"Member's threads: {len(thread_ids)}")
    
    if thread_ids:
        # Count unread admin messages in member's threads
        thread_messages_query = client.table('thread_messages').select('*', count='exact')
        thread_messages_query = thread_messages_query.in_('thread_id', thread_ids).eq('sender_type', 'admin').eq('is_read', False)
        thread_result = thread_messages_query.execute()
        thread_count = thread_result.count or 0
        print(f"Unread admin messages in member's threads: {thread_count}")
