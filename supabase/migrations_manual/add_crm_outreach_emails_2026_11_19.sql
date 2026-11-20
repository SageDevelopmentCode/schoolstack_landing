-- Promoted to supabase/migrations/20261171_add_crm_outreach_emails.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Requires add_crm_outreach_touches_2026_11_19.sql first.

-- Log of cold outreach steps sent from /admin/demos (emails via Zoho, plus social notes logged by hand).
-- Step ids and copy come from src/data/outreach/<demo slug>.ts.
-- Run after: 20261169_add_crm_outreach_touches.sql

create table if not exists public.crm_outreach_emails (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  demo_slug    text not null,
  step_id      text not null
               check (step_id in ('first', 'follow-1', 'social', 'follow-2', 'close')),
  channel      text not null default 'email'
               check (channel in ('email', 'social')),
  to_email     text,
  subject      text not null default '',
  body_text    text not null default '',
  message_id   text,
  in_reply_to  text,
  status       text not null
               check (status in ('sending', 'sent', 'skipped_unsubscribed', 'failed', 'logged')),
  error        text,
  sent_by      uuid references auth.users(id) on delete set null,
  sent_at      timestamptz not null default now()
);

create index if not exists crm_outreach_emails_school_sent_idx
  on public.crm_outreach_emails (school_id, sent_at desc);

create index if not exists crm_outreach_emails_sent_at_idx
  on public.crm_outreach_emails (sent_at desc);

-- A step goes out once per school, counting in-flight sends (failed / skipped attempts can be retried).
create unique index if not exists crm_outreach_emails_one_success_per_step
  on public.crm_outreach_emails (school_id, step_id)
  where status in ('sending', 'sent', 'logged');

alter table public.crm_outreach_emails enable row level security;

drop policy if exists "Platform admins manage crm outreach emails"
  on public.crm_outreach_emails;
create policy "Platform admins manage crm outreach emails"
  on public.crm_outreach_emails
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
