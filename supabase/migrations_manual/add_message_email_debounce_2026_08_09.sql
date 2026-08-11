-- Promoted to supabase/migrations/20260811_add_message_email_debounce.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Purpose: track last message email sent per user per thread for debounce/cooldown.

alter table public.message_thread_reads
  add column if not exists last_email_notified_at timestamptz;
