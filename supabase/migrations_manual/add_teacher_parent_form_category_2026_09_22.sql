-- Promoted to supabase/migrations/20261026_add_teacher_parent_form_category.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.teacher_parent_forms
  add column if not exists form_category text not null default 'general'
    check (form_category in ('general', 'tuition'));

create index if not exists teacher_parent_forms_org_category_status_idx
  on public.teacher_parent_forms (organization_id, form_category, status);
