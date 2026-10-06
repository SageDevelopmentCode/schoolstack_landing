-- Promoted to supabase/migrations/20261114_add_friday_branch_org_settings.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-10-05 — Friday Branch org settings (pause parent portal signup)

alter table public.organization_settings
  add column if not exists friday_branch jsonb not null default '{}'::jsonb;
