-- Remove prefilled step message from locked Student information steps.

update public.application_form_versions
set schema = schema #- '{sections,0,stepNotice}'
where public_slug = 'apply'
  and status in ('draft', 'published')
  and coalesce(schema->'sections'->0->>'system', 'false') = 'true'
  and schema->'sections'->0->'stepNotice' is not null;
