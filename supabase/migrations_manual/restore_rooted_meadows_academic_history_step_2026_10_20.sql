-- Rooted Meadows: restore Academic History step instructions (2026-10-20)
--
-- Form: Rooted Meadows 2026 Application (apply), id 8f76b936-c56e-4045-a01f-bb7807570ad0
-- Section: Academic History, id a8f2c914e6b0
--
-- Prefer revision 3 schema snapshot (known-good long step instructions).
-- Run entire script in Supabase SQL Editor (project: rxrmlfyoqzdpjxztluyd).
-- Expect RETURNING academic_history_desc_len ≈ 594.

begin;

with restored as (
  select r.schema as new_schema
  from public.application_form_version_revisions r
  where r.form_version_id = '8f76b936-c56e-4045-a01f-bb7807570ad0'
    and r.revision_number = 3
)
update public.application_form_versions afv
set
  schema = restored.new_schema,
  updated_at = now()
from restored
where afv.id = '8f76b936-c56e-4045-a01f-bb7807570ad0'
returning
  afv.id,
  (
    select length(s->>'description')
    from jsonb_array_elements(afv.schema->'sections') as s
    where s->>'title' = 'Academic History'
  ) as academic_history_desc_len;

commit;

-- If the UPDATE above returned no rows, revision 3 is missing — use section-only patch:
-- (run separately after rollback if needed)
/*
with patched as (
  select
    afv.id,
    jsonb_set(
      afv.schema,
      '{sections}',
      (
        select coalesce(
          jsonb_agg(
            case
              when s->>'id' = 'a8f2c914e6b0'
              then jsonb_set(
                s,
                '{description}',
                to_jsonb(
                  'Please know that we will need unofficial transcripts/reports that list subjects taught and their level of proficiency to complete the application. You may upload them at the end of this section. If you have homeschooled, please create a pdf document that lists the different topics for each subject you have taught for each grade, curriculum used, and their level of proficiency (mastered, proficient, needs practice, still learning the concept). I.e. Grade 1 Math - place value (mastered), counting 1-100 (proficient), single digit addition (needs practice), etc.  Curriculums used: Math U See'::text
                )
              )
              else s
            end
            order by ord
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(afv.schema->'sections') with ordinality as t(s, ord)
      ),
      true
    ) as new_schema
  from public.application_form_versions afv
  where afv.id = '8f76b936-c56e-4045-a01f-bb7807570ad0'
)
update public.application_form_versions afv
set schema = patched.new_schema, updated_at = now()
from patched
where afv.id = patched.id
returning afv.id, (
  select length(s->>'description')
  from jsonb_array_elements(afv.schema->'sections') s
  where s->>'title' = 'Academic History'
) as academic_history_desc_len;
*/
