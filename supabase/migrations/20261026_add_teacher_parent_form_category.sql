-- Add form_category to teacher_parent_forms for tuition vs general forms.
-- Run after: 20261025_add_public_support_requests.sql

alter table public.teacher_parent_forms
  add column if not exists form_category text not null default 'general'
    check (form_category in ('general', 'tuition'));

create index if not exists teacher_parent_forms_org_category_status_idx
  on public.teacher_parent_forms (organization_id, form_category, status);
