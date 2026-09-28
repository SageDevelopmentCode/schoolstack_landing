-- Track one-time daily unread message digest per thread/user
-- Run after: 20260811_add_message_email_debounce.sql

alter table public.message_thread_reads
  add column if not exists last_unread_digest_notified_at timestamptz;
