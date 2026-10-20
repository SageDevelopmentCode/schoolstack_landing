-- Rooted Meadows: restore Academic History step instructions (2026-10-20)
--
-- Form: Rooted Meadows 2026 Application (apply), id 8f76b936-c56e-4045-a01f-bb7807570ad0
-- Section: Academic History, id a8f2c914e6b0
--
-- A 2026-10-20 save bug reverted section.description to the short blurb after revision 3
-- had captured the longer homeschool / transcript instructions. This restores revision 3 text.
--
-- Safe to re-run: only updates when the section still has the short description.
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
            when section->>'id' = 'a8f2c914e6b0'
            then jsonb_set(
              section,
              '{description}',
              to_jsonb(
                'Please know that we will need unofficial transcripts/reports that list subjects taught and their level of proficiency to complete the application. You may upload them at the end of this section. If you have homeschooled, please create a pdf document that lists the different topics for each subject you have taught for each grade, curriculum used, and their level of proficiency (mastered, proficient, needs practice, still learning the concept). I.e. Grade 1 Math - place value (mastered), counting 1-100 (proficient), single digit addition (needs practice), etc.  Curriculums used: Math U See'::text
              )
            )
            else section
          end
          order by section_ord
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(afv.schema->'sections') with ordinality as t(section, section_ord)
    ),
    true
  ),
  updated_at = now()
where afv.id = '8f76b936-c56e-4045-a01f-bb7807570ad0'
  and exists (
    select 1
    from jsonb_array_elements(afv.schema->'sections') as section
    where section->>'id' = 'a8f2c914e6b0'
      and section->>'description' =
        'Please know that we will need unofficial transcripts/reports to complete the application. You may upload them at the end of this section.'
  );

commit;
