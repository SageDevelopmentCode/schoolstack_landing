-- Performance audit runs and results for admin Performance tab
-- Run after: add_product_rls_helpers.sql

create table if not exists public.performance_audit_runs (
  id              uuid primary key default gen_random_uuid(),
  environment     text not null,
  status          text not null default 'pending',
  triggered_by    uuid references auth.users(id) on delete set null,
  page_ids        text[] not null default '{}',
  form_factor     text not null default 'mobile',
  completed_count int not null default 0,
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint performance_audit_runs_environment_check
    check (environment in ('production', 'local')),
  constraint performance_audit_runs_status_check
    check (status in ('pending', 'running', 'completed', 'failed')),
  constraint performance_audit_runs_form_factor_check
    check (form_factor in ('mobile', 'desktop'))
);

create table if not exists public.performance_audit_results (
  id                uuid primary key default gen_random_uuid(),
  run_id            uuid not null references public.performance_audit_runs(id) on delete cascade,
  page_id           text not null,
  label             text not null,
  category          text not null,
  url               text not null,
  status            text not null,
  skip_reason       text,
  performance_score int,
  fcp_ms            numeric,
  lcp_ms            numeric,
  tbt_ms            numeric,
  cls               numeric,
  speed_index_ms    numeric,
  total_byte_weight int,
  opportunities     jsonb not null default '[]'::jsonb,
  raw_report        jsonb,
  error_message     text,
  created_at        timestamptz not null default now(),

  constraint performance_audit_results_status_check
    check (status in ('success', 'failed', 'skipped'))
);

create index if not exists performance_audit_runs_status_created_idx
  on public.performance_audit_runs (status, created_at asc);

create index if not exists performance_audit_runs_env_status_idx
  on public.performance_audit_runs (environment, status, created_at desc);

create index if not exists performance_audit_results_run_id_idx
  on public.performance_audit_results (run_id);

create index if not exists performance_audit_results_page_created_idx
  on public.performance_audit_results (page_id, created_at desc);

create index if not exists performance_audit_results_run_page_idx
  on public.performance_audit_results (run_id, page_id);

alter table public.performance_audit_runs enable row level security;
alter table public.performance_audit_results enable row level security;

create policy "Platform admins read performance_audit_runs"
  on public.performance_audit_runs
  for select
  to authenticated
  using (public.is_platform_admin());

create policy "Platform admins read performance_audit_results"
  on public.performance_audit_results
  for select
  to authenticated
  using (public.is_platform_admin());
