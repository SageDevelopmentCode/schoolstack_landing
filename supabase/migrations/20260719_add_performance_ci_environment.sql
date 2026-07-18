-- Allow CI Lighthouse runs in performance_audit_runs.environment

alter table public.performance_audit_runs
  drop constraint if exists performance_audit_runs_environment_check;

alter table public.performance_audit_runs
  add constraint performance_audit_runs_environment_check
    check (environment in ('production', 'local', 'ci'));
