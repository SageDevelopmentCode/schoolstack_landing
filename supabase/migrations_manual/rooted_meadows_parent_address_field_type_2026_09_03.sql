-- Rooted Meadows: parent home address fields → type "address" (2026-09-03)
--
-- Parent 1/2 home address fields were textarea in schema but responses store
-- structured address JSON. Updates field type so apply form and admin builder match.
--
-- Orgs: rooted-meadows, rooted-meadows-demo, rooted-meadows-school
-- Field ids: p1f011e1f2a3, p2f011e1f2a3
--
-- Safe to re-run: only patches fields that are not already type "address".
-- Run in Supabase SQL Editor.

begin;

update public.application_form_versions afv
set
  schema = jsonb_set(
    afv.schema,
    '{sections}',
    (
      select coalesce(
        jsonb_agg(
          case
            when section ? 'fields' then
              jsonb_set(
                section,
                '{fields}',
                (
                  select coalesce(
                    jsonb_agg(
                      case
                        when field->>'id' in ('p1f011e1f2a3', 'p2f011e1f2a3')
                          and field->>'type' is distinct from 'address'
                        then (field - 'rows') || jsonb_build_object('type', 'address', 'width', 'full')
                        else field
                      end
                      order by field_ord
                    ),
                    '[]'::jsonb
                  )
                  from jsonb_array_elements(section->'fields') with ordinality as t(field, field_ord)
                )
              )
            else section
          end
          order by section_ord
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(afv.schema->'sections') with ordinality as t(section, section_ord)
    )
  ),
  updated_at = now()
from public.organizations o
where afv.organization_id = o.id
  and o.slug in ('rooted-meadows', 'rooted-meadows-demo', 'rooted-meadows-school')
  and exists (
    select 1
    from jsonb_array_elements(afv.schema->'sections') as section
    join jsonb_array_elements(section->'fields') as field on true
    where field->>'id' in ('p1f011e1f2a3', 'p2f011e1f2a3')
      and field->>'type' is distinct from 'address'
  );

-- Verify (expect type = address for both field ids)
select
  o.slug,
  afv.id as form_version_id,
  field->>'id' as field_id,
  field->>'label' as field_label,
  field->>'type' as field_type
from public.application_form_versions afv
join public.organizations o on o.id = afv.organization_id
join jsonb_array_elements(afv.schema->'sections') as section on true
join jsonb_array_elements(section->'fields') as field on true
where o.slug in ('rooted-meadows', 'rooted-meadows-demo', 'rooted-meadows-school')
  and field->>'id' in ('p1f011e1f2a3', 'p2f011e1f2a3')
order by o.slug, field->>'id';

commit;
