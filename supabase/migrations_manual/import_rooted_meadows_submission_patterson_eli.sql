-- Import Eli Patterson legacy Google Form application into rooted-meadows (production).
-- Source: 26-27 Patterson, Eli Application.pdf
-- Idempotent: skips if __import_source tag already exists.
--
-- No storage upload required (transcript field left empty).
-- Optional: upload PDF via `node scripts/import-rooted-meadows-submission.mjs patterson-eli`
-- After import: create anniepatterson980@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id          uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_form_version_id uuid := '8f76b936-c56e-4045-a01f-bb7807570ad0';
  v_program_id      uuid := '5ffe9d11-da38-4521-88bd-23a702190250';

  v_family_id       uuid := 'c1d2e3f4-a5b6-4789-c012-3456789abc02';
  v_guardian_id     uuid := 'd2e3f4a5-b6c7-4890-d123-456789abcdef';
  v_student_id      uuid := 'e3f4a5b6-c7d8-4901-e234-56789abcdef1';
  v_application_id  uuid := 'f4a5b6c7-d8e9-4012-f345-6789abcdef02';
  v_payment_id      uuid := 'a5b6c7d8-e9f0-4123-a456-789abcdef013';

  v_submitted_at    timestamptz := '2026-03-26 14:00:00+00';

  v_responses       jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' = 'legacy_google_form_2026_27_patterson_eli'
  ) then
    raise notice 'Eli Patterson import already exists — skipping.';
    return;
  end if;

  v_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_patterson_eli",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Eli",
  "student_last_name": "Patterson",
  "student_date_of_birth": "2019-03-28",
  "student_grade": "2",
  "b4e6a819f0c2": "Eli",
  "d7f9b123a4e8": "{\"line1\":\"270 E Woodhaven Lane\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83404\"}",
  "e8a0c234b5f9": "male",
  "b1d3f567e8c2": "Idaho Falls",
  "c2e4a678f9d3": "ID",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "District 91",
  "c0b4e136a8d2": "Sunnyside Elementary",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "no",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Greg Peters",
  "b6d0e792a4c8": "pgreg9@ida.net",
  "c7e1f8a3b5d9": "Piano Teacher",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "None",
  "f6b0c469e1d5": "None",
  "b8d2e681a3b9": "Astronomy",
  "c9e3f792b4c0": "I'd like him to have more attention in a smaller learning environment.",
  "d0f4a803c5d1": "No",
  "p1f001a1b2c3": "Annie",
  "p1f003c3d4e5": "Patterson",
  "p1f005e5f6a7": "anniepatterson980@gmail.com",
  "p1f006f6a7b8": "2087092884",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"270 E Woodhaven Lane\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83404\"}",
  "p1f012f2a3b4": "Self-employed",
  "p1f013a3b4c5": "Gas Products Inc",
  "p1f014b4c5d6": "2087092884",
  "p1f015c5d6e7": "Church of Jesus Christ of Latter-Day Saints",
  "p2f001a1b2c3": "Chris",
  "p2f003c3d4e5": "Patterson",
  "p2f005e5f6a7": "anniepatterson980@gmail.com",
  "p2f006f6a7b8": "2087092296",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"270 E Woodhaven Lane\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83404\"}",
  "p2f012f2a3b4": "Self-employed",
  "p2f013a3b4c5": "Gas Products Inc",
  "p2f014b4c5d6": "2087092296",
  "p2f015c5d6e7": "LDS",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Patterson Family', 'anniepatterson980@gmail.com', '2087092884'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Annie', 'Patterson', 'anniepatterson980@gmail.com', '2087092884'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values (
    v_student_id, v_org_id, v_family_id, 'Eli', 'Patterson', '2019-03-28', '2', 'prospect'
  );

  insert into public.applications (
    id, organization_id, program_id, form_version_id,
    family_id, student_id, primary_guardian_id,
    status, responses, acknowledgments,
    fee_status, fee_paid_at, submitted_at, created_by_user_id
  ) values (
    v_application_id, v_org_id, v_program_id, v_form_version_id,
    v_family_id, v_student_id, v_guardian_id,
    'submitted', v_responses, '{}'::jsonb,
    'paid', v_submitted_at, v_submitted_at, null
  );

  insert into public.application_payments (
    id, organization_id, application_id,
    payment_type, label, amount_cents, currency, status, paid_at
  ) values (
    v_payment_id, v_org_id, v_application_id,
    'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
  );

  insert into public.activity_events (
    organization_id, actor_type, surface, action,
    entity_type, entity_id, summary, metadata
  ) values (
    v_org_id, 'system', 'admissions', 'application.submitted',
    'application', v_application_id,
    'Imported legacy application for Eli Patterson',
    jsonb_build_object('import_source', 'legacy_google_form_2026_27_patterson_eli')
  );

  raise notice 'Imported Eli Patterson application: %', v_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after anniepatterson980@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: anniepatterson980@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'anniepatterson980@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'd2e3f4a5-b6c7-4890-d123-456789abcdef';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id = 'f4a5b6c7-d8e9-4012-f345-6789abcdef02';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
