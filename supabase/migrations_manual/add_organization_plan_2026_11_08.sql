-- Promoted to supabase/migrations/20261156_add_organization_plan.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08 — organizations.plan ('free' | 'custom'). Existing rows become 'custom'.
--
-- Paste and confirm the column exists before deploying code that selects plan.
-- Re-running is a no-op once the column exists.

alter table public.organizations
  add column if not exists plan text not null default 'custom'
    check (plan in ('free', 'custom'));
