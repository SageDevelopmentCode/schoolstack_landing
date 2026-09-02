-- Per-program apply forms: distinguish apply vs custom forms and enforce one active apply form per program.
-- Run after: 20260840_add_classroom_signups.sql

alter table public.application_form_versions
  add column if not exists form_kind text not null default 'custom'
  check (form_kind in ('apply', 'custom'));

update public.application_form_versions
set form_kind = 'apply'
where public_slug = 'apply'
   or (
     schema is not null
     and exists (
       select 1
       from jsonb_array_elements(coalesce(schema -> 'sections', '[]'::jsonb)) as section
       where coalesce(section ->> 'system', 'false') = 'true'
     )
   );

create unique index if not exists application_form_versions_org_program_apply_active_key
  on public.application_form_versions (organization_id, program_id)
  where form_kind = 'apply'
    and status in ('draft', 'published')
    and program_id is not null;
