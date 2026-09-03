-- Per-program enrollment checklists: one active draft/published checklist per program.
-- Run after: 20260841_add_application_form_kind.sql

drop index if exists public.enrollment_checklist_templates_org_path_active_key;

create unique index if not exists enrollment_checklist_templates_org_program_active_key
  on public.enrollment_checklist_templates (organization_id, program_id)
  where status in ('draft', 'published')
    and program_id is not null;
