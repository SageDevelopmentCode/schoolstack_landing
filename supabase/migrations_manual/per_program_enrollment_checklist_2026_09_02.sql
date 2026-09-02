-- Promoted to supabase/migrations/20260842_per_program_enrollment_checklist.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-09-02: Allow one active enrollment checklist per program (not one per org).

drop index if exists public.enrollment_checklist_templates_org_path_active_key;

create unique index if not exists enrollment_checklist_templates_org_program_active_key
  on public.enrollment_checklist_templates (organization_id, program_id)
  where status in ('draft', 'published')
    and program_id is not null;
