-- Promoted to supabase/migrations/20261105_message_unread_digest.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-09-28: one-time unread message digest stamp per thread/user

alter table public.message_thread_reads
  add column if not exists last_unread_digest_notified_at timestamptz;
