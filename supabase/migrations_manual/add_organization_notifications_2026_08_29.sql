-- Promoted to supabase/migrations/20260834_add_organization_notifications.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.organization_settings
  add column if not exists notifications jsonb not null default '{}'::jsonb;
