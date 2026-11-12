-- Organization plan. 'custom' is uncapped and is the default for every
-- existing school. 'free' is capped in application code (plans.ts).
-- Run after: 20261155_family_scoped_visit_and_checklist_reads.sql

alter table public.organizations
  add column if not exists plan text not null default 'custom'
    check (plan in ('free', 'custom'));
