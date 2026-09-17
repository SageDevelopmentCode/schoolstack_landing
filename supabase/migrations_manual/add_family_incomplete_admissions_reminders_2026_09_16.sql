-- Promoted to supabase/migrations/20261002_add_family_incomplete_admissions_reminders.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.families
  add column if not exists incomplete_admissions_reminder_count smallint not null default 0,
  add column if not exists incomplete_admissions_reminder_sent_at timestamptz;

create index if not exists families_incomplete_admissions_reminder_idx
  on public.families (organization_id, incomplete_admissions_reminder_count)
  where incomplete_admissions_reminder_count < 2;
