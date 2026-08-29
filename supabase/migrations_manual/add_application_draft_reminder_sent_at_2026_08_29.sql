-- Promoted to supabase/migrations/20260827_add_application_draft_reminder_sent_at.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.applications
  add column if not exists draft_reminder_sent_at timestamptz;

create index if not exists applications_draft_reminder_pending_idx
  on public.applications (organization_id, updated_at)
  where status = 'draft' and draft_reminder_sent_at is null;
