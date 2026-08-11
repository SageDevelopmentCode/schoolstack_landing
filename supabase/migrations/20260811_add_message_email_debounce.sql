-- Message email debounce: track last email sent per user per thread.
-- Run after: 20260806_add_portal_messages.sql

alter table public.message_thread_reads
  add column if not exists last_email_notified_at timestamptz;
