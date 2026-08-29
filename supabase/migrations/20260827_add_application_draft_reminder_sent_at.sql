-- Track one-time draft application reminder emails
-- Run after: 20260826_performance_audit_results_upsert.sql

alter table public.applications
  add column if not exists draft_reminder_sent_at timestamptz;

create index if not exists applications_draft_reminder_pending_idx
  on public.applications (organization_id, updated_at)
  where status = 'draft' and draft_reminder_sent_at is null;
