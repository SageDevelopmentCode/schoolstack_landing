-- Friday Branch org settings (e.g. pause parent portal signup)
-- Run after: 20261113_committee_section_unread_digest.sql

alter table public.organization_settings
  add column if not exists friday_branch jsonb not null default '{}'::jsonb;
