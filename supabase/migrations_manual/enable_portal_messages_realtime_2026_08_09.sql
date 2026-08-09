-- Promoted to supabase/migrations/20260808_enable_portal_messages_realtime.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter publication supabase_realtime add table public.portal_messages;
alter publication supabase_realtime add table public.message_threads;
