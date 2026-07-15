-- Import Olivia Ritchie legacy Google Form application into rooted-meadows-demo.
-- Source: 26-27 Ritchie, Olivia Application.pdf
-- Idempotent: skips if __import_source tag already exists.
--
-- No storage upload required (transcript field left empty).
-- After import: create francescathemaker@gmail.com via apply portal, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id          uuid := '1085332b-aef4-4910-a35d-ccb2611d9b11';
  v_form_version_id uuid := '6c8fe60b-48b6-4882-bd7f-4892159a3835';
  v_program_id      uuid := '3b84dea2-13eb-4bb8-82f2-f45479b547d3';

  v_family_id       uuid := '7c4e8f12-3a9b-4d5e-8f6a-1b2c3d4e5f60';
  v_guardian_id     uuid := '8d5f9a23-4b0c-5e6f-9a7b-2c3d4e5f6a71';
  v_student_id      uuid := '9e6a0b34-5c1d-6f7a-0b8c-3d4e5f6a7b82';
  v_application_id  uuid := 'a0f1b245-6d2e-7a8b-1c9d-4e5f6a7b8c93';
  v_payment_id      uuid := 'b1a2c356-7e3f-8b9c-2d0e-5f6a7b8c9d04';

  v_submitted_at    timestamptz := '2026-03-15 14:00:00+00';

  v_responses       jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' = 'legacy_google_form_2026_27_ritchie_olivia'
  ) then
    raise notice 'Olivia Ritchie import already exists — skipping.';
    return;
  end if;

  v_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_ritchie_olivia",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Olivia",
  "student_last_name": "Ritchie",
  "student_date_of_birth": "2016-03-11",
  "student_grade": "5",
  "b4e6a819f0c2": "Olivia",
  "d7f9b123a4e8": "{\"line1\":\"345 Evergreen Drive\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83401\"}",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Red Bluff",
  "c2e4a678f9d3": "CA",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "N/A",
  "c0b4e136a8d2": "Lighthouse Montessori",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "No/homeschooled",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Lori Robinson",
  "b6d0e792a4c8": "lighthouseschool@gmail.com",
  "c7e1f8a3b5d9": "Principal/teacher",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "None",
  "f6b0c469e1d5": "None",
  "b8d2e681a3b9": "Agricultural lesson, social studies, art",
  "c9e3f792b4c0": "Her father and I prioritize a more wholesome and enriching experience than a public school and we both have to work so this schedule and program works with our lifestyle and offers a better environment for her to learn as well as contribute.",
  "d0f4a803c5d1": "Olivia is tender hearted and she loves to learn. Her previous teacher has a reputation for yelling at the children and Olivia is looking forward to a change of environment. She is very creative and loves the outdoors.",
  "p1f001a1b2c3": "Francesca",
  "p1f002b2c3d4": "A",
  "p1f003c3d4e5": "Ritchie",
  "p1f005e5f6a7": "francescathemaker@gmail.com",
  "p1f006f6a7b8": "5303560063",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"345 Evergreen Drive\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83401\"}",
  "p1f012f2a3b4": "CEO/Founder",
  "p1f013a3b4c5": "Teton Leather",
  "p1f014b4c5d6": "5303560063",
  "p1f015c5d6e7": "Jehovahs Witness",
  "p2f001a1b2c3": "Zachary",
  "p2f002b2c3d4": "T",
  "p2f003c3d4e5": "Ritchie",
  "p2f005e5f6a7": "ztritchie@gmail.com",
  "p2f006f6a7b8": "5302628574",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"282 Wyatt Ave\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83401\"}",
  "p2f012f2a3b4": "Self Employed",
  "p2f013a3b4c5": "Construction",
  "p2f014b4c5d6": "5302628574",
  "p2f015c5d6e7": "Jehovah's Witness",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Ritchie Family', 'francescathemaker@gmail.com', '5303560063'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Francesca', 'Ritchie', 'francescathemaker@gmail.com', '5303560063'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values (
    v_student_id, v_org_id, v_family_id, 'Olivia', 'Ritchie', '2016-03-11', '5', 'prospect'
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
    'Imported legacy application for Olivia Ritchie',
    jsonb_build_object('import_source', 'legacy_google_form_2026_27_ritchie_olivia')
  );

  raise notice 'Imported Olivia Ritchie application: %', v_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after francescathemaker@gmail.com signs up) ──
--
-- 1. Sign up at /school/rooted-meadows-demo/apply with francescathemaker@gmail.com
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'francescathemaker@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = '8d5f9a23-4b0c-5e6f-9a7b-2c3d4e5f6a71';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id = 'a0f1b245-6d2e-7a8b-1c9d-4e5f6a7b8c93';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- values ('1085332b-aef4-4910-a35d-ccb2611d9b11', 'USER_UUID', 'parent', 'active')
-- on conflict do nothing;
--
-- commit;
