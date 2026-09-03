-- Restore Rooted Meadows 2026 application form steps (2026-09-03)
--
-- Copies the full 9-step schema from rooted-meadows-school into production and demo.
-- Safe to re-run: only updates targets that have fewer sections than the source.
--
-- Source: rooted-meadows-school form a57d66cf-1c0b-4052-a1cd-3067c07361d3
-- Targets:
--   rooted-meadows       → 8f76b936-c56e-4045-a01f-bb7807570ad0
--   rooted-meadows-demo  → 6c8fe60b-48b6-4882-bd7f-4892159a3835
--
-- Run in Supabase SQL Editor.

begin;

update public.application_form_versions target
set
  schema = source.schema,
  updated_at = now()
from public.application_form_versions source
where source.id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and target.id in (
    '8f76b936-c56e-4045-a01f-bb7807570ad0',
    '6c8fe60b-48b6-4882-bd7f-4892159a3835'
  )
  and jsonb_array_length(target.schema->'sections')
    < jsonb_array_length(source.schema->'sections');

-- Verify (expect 2 rows with section_count = 9)
select
  o.slug,
  afv.id,
  afv.title,
  jsonb_array_length(afv.schema->'sections') as section_count,
  (
    select string_agg(s->>'title', ' | ' order by ord)
    from jsonb_array_elements(afv.schema->'sections') with ordinality as t(s, ord)
  ) as section_titles
from public.application_form_versions afv
join public.organizations o on o.id = afv.organization_id
where afv.id in (
  'a57d66cf-1c0b-4052-a1cd-3067c07361d3',
  '8f76b936-c56e-4045-a01f-bb7807570ad0',
  '6c8fe60b-48b6-4882-bd7f-4892159a3835'
)
order by o.slug;

commit;
