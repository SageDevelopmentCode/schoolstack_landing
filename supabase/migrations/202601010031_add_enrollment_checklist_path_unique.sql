-- Enforce unique enrollment_path per org among active checklist templates.
-- Run after: add_product_enrollment_checklist_templates.sql

create unique index if not exists enrollment_checklist_templates_org_path_active_key
  on public.enrollment_checklist_templates (organization_id, enrollment_path)
  where status in ('draft', 'published');
