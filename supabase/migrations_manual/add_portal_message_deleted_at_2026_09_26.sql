-- Promoted to supabase/migrations/20261030_add_portal_message_deleted_at.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.portal_messages
  add column if not exists deleted_at timestamptz null;
