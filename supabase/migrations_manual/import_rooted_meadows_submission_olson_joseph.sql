-- Import Joseph Olson legacy Google Form application into rooted-meadows-demo.
-- Source: 26-27 Olson, Joseph Application.pdf
-- Idempotent: skips if __import_source tag already exists.
--
-- No storage upload required (transcript field left empty).
-- After import: create bolsonmft@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id          uuid := '1085332b-aef4-4910-a35d-ccb2611d9b11';
  v_form_version_id uuid := '6c8fe60b-48b6-4882-bd7f-4892159a3835';
  v_program_id      uuid := '3b84dea2-13eb-4bb8-82f2-f45479b547d3';

  v_family_id       uuid := 'd1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f61';
  v_guardian_id     uuid := 'e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a72';
  v_student_id      uuid := 'f3a4b5c6-7d8e-9f0a-1b2c-3d4e5f6a7b83';
  v_application_id  uuid := 'a4b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c94';
  v_payment_id      uuid := 'b5c6d7e8-9f0a-1b2c-3d4e-5f6a7b8c9d05';

  v_submitted_at    timestamptz := '2026-03-18 14:00:00+00';

  v_responses       jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' = 'legacy_google_form_2026_27_olson_joseph'
  ) then
    raise notice 'Joseph Olson import already exists — skipping.';
    return;
  end if;

  v_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_olson_joseph",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Joseph",
  "student_last_name": "Olson",
  "student_date_of_birth": "2016-06-06",
  "student_grade": "5",
  "b4e6a819f0c2": "Joseph",
  "d7f9b123a4e8": "{\"line1\":\"477 North 3700 East\",\"line2\":\"\",\"city\":\"Rigby\",\"state\":\"ID\",\"zip\":\"83442\"}",
  "e8a0c234b5f9": "male",
  "b1d3f567e8c2": "Manteca",
  "c2e4a678f9d3": "CA",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "english",
  "b9a3d025f7c1": "Jefferson County",
  "c0b4e136a8d2": "Lighthouse Montessori",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Hacienda Environmental Science School",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Patti Foster",
  "b6d0e792a4c8": "pattifoster58@gmail.com",
  "c7e1f8a3b5d9": "Friend/Employer",
  "e9a3b792d4c8": "yes",
  "f0b4c803e5d9": "OT for Dyslexia",
  "a1c5d914f6e0": "yes",
  "b2d6e025a7f1": "OT for Dyslexia",
  "c3e7f136b8a2": "yes",
  "d4f8a247c9b3": "OT for Dyslexia",
  "e5a9b358d0c4": "none",
  "f6b0c469e1d5": "None",
  "b8d2e681a3b9": "sports, nature, history and math",
  "c9e3f792b4c0": "learning and growth",
  "d0f4a803c5d1": "He loves outdoors and sports, also loves to socialize",
  "p1f001a1b2c3": "Belinda",
  "p1f003c3d4e5": "Olson",
  "p1f005e5f6a7": "bolsonmft@gmail.com",
  "p1f006f6a7b8": "2095966998",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"477 North 3700 East\",\"line2\":\"\",\"city\":\"Rigby\",\"state\":\"ID\",\"zip\":\"83442\"}",
  "p1f012f2a3b4": "Therapist",
  "p1f013a3b4c5": "independent Contractor",
  "p1f014b4c5d6": "2095966998",
  "p1f015c5d6e7": "LDS",
  "p2f001a1b2c3": "Robert",
  "p2f003c3d4e5": "Olson",
  "p2f005e5f6a7": "bobolsonart@gmail.com",
  "p2f006f6a7b8": "4085294944",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"477 North 3700 East\",\"line2\":\"\",\"city\":\"Rigby\",\"state\":\"ID\",\"zip\":\"83442\"}",
  "p2f012f2a3b4": "retired",
  "p2f013a3b4c5": "retired",
  "p2f014b4c5d6": "4085294944",
  "p2f015c5d6e7": "LDS",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Olson Family', 'bolsonmft@gmail.com', '2095966998'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Belinda', 'Olson', 'bolsonmft@gmail.com', '2095966998'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values (
    v_student_id, v_org_id, v_family_id, 'Joseph', 'Olson', '2016-06-06', '5', 'prospect'
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
    'Imported legacy application for Joseph Olson',
    jsonb_build_object('import_source', 'legacy_google_form_2026_27_olson_joseph')
  );

  raise notice 'Imported Joseph Olson application: %', v_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after bolsonmft@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: bolsonmft@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'bolsonmft@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a72';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id = 'a4b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c94';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- values ('1085332b-aef4-4910-a35d-ccb2611d9b11', 'USER_UUID', 'parent', 'active')
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
