-- Promoted to supabase/migrations/20260826_performance_audit_results_upsert.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Run after: add_guardian_message_participants_2026_08_24.sql (or latest applied migration).

delete from public.performance_audit_results;
delete from public.performance_audit_runs;

alter table public.performance_audit_results
  alter column run_id drop not null;

alter table public.performance_audit_results
  add column if not exists environment text,
  add column if not exists form_factor text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists source_ref text;

alter table public.performance_audit_results
  alter column environment set not null,
  alter column form_factor set not null;

alter table public.performance_audit_results
  drop constraint if exists performance_audit_results_environment_check;

alter table public.performance_audit_results
  add constraint performance_audit_results_environment_check
    check (environment in ('production', 'local', 'ci'));

alter table public.performance_audit_results
  drop constraint if exists performance_audit_results_form_factor_check;

alter table public.performance_audit_results
  add constraint performance_audit_results_form_factor_check
    check (form_factor in ('mobile', 'desktop'));

drop index if exists public.performance_audit_results_page_created_idx;

create index if not exists performance_audit_results_env_form_factor_idx
  on public.performance_audit_results (environment, form_factor);

alter table public.performance_audit_results
  drop constraint if exists performance_audit_results_page_env_form_factor_key;

alter table public.performance_audit_results
  add constraint performance_audit_results_page_env_form_factor_key
    unique (page_id, environment, form_factor);
