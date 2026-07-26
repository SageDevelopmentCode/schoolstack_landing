-- Import Nina & Maggie Thompson legacy Google Form applications into rooted-meadows (production).
-- Source: 26-27 Thompson, Nina & Maggie application.pdf
-- Idempotent: skips if either __import_source tag already exists.
--
-- Two applications (one per child), one family, $75 fee each ($150 total).
-- Optional: upload PDF via `node scripts/import-rooted-meadows-submission.mjs thompson-nina-maggie`
-- After import: create ameliasisco@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id                uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_form_version_id       uuid := '8f76b936-c56e-4045-a01f-bb7807570ad0';
  v_program_id            uuid := '5ffe9d11-da38-4521-88bd-23a702190250';

  v_family_id             uuid := 'c1d2e3f4-a5b6-4789-c123-456789abcde0';
  v_guardian_id           uuid := 'd2e3f4a5-b6c7-4890-d234-56789abcdef1';
  v_nina_student_id       uuid := 'e3f4a5b6-c7d8-4901-e345-6789abcdef02';
  v_nina_application_id   uuid := 'f4a5b6c7-d8e9-4012-f456-789abcdef013';
  v_nina_payment_id       uuid := '05b6c7d8-e9f0-4123-a567-89abcdef0124';
  v_maggie_student_id     uuid := '16c7d8e9-f0a1-4234-b678-9abcdef01235';
  v_maggie_application_id uuid := '27d8e9f0-a1b2-4345-c789-abcdef012346';
  v_maggie_payment_id     uuid := '38e9f0a1-b2c3-4567-d890-abcdef012347';

  v_submitted_at          timestamptz := '2026-03-30 14:00:00+00';

  v_parent_fields         jsonb;
  v_nina_responses        jsonb;
  v_maggie_responses      jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' in (
        'legacy_google_form_2026_27_thompson_nina',
        'legacy_google_form_2026_27_thompson_maggie'
      )
  ) then
    raise notice 'Thompson import already exists — skipping.';
    return;
  end if;

  v_parent_fields := $json$
{
  "d7f9b123a4e8": "{\"line1\":\"5522 Clearfield Ln\",\"line2\":\"\",\"city\":\"Ammon\",\"state\":\"ID\",\"zip\":\"83406\"}",
  "p1f001a1b2c3": "Amy",
  "p1f002b2c3d4": "Sisco",
  "p1f003c3d4e5": "Thompson",
  "p1f005e5f6a7": "ameliasisco@gmail.com",
  "p1f006f6a7b8": "2078912010",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"5522 Clearfield Ln\",\"line2\":\"\",\"city\":\"Ammon\",\"state\":\"ID\",\"zip\":\"83406\"}",
  "p1f012f2a3b4": "Development Director",
  "p1f013a3b4c5": "Art Museum of Eastern Idaho",
  "p1f014b4c5d6": "2085247777",
  "p1f015c5d6e7": "LDS",
  "p2f001a1b2c3": "Clayton",
  "p2f003c3d4e5": "Thompson",
  "p2f005e5f6a7": "cjamesthompson@gmail.com",
  "p2f006f6a7b8": "8018334041",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"5522 Clearfield Ln\",\"line2\":\"\",\"city\":\"Ammon\",\"state\":\"ID\",\"zip\":\"83406\"}",
  "p2f012f2a3b4": "Owner/Designer/Cabinetmaker",
  "p2f013a3b4c5": "Clayton Thompson Design",
  "p2f014b4c5d6": "8018334041",
  "p2f015c5d6e7": "LDS",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  v_nina_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_thompson_nina",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Nina",
  "student_last_name": "Thompson",
  "student_date_of_birth": "2018-03-09",
  "student_grade": "3",
  "b4e6a819f0c2": "Nina",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Damariscotta",
  "c2e4a678f9d3": "ME",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "D93",
  "c0b4e136a8d2": "Homeschooled",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Woodland Hills Elementary (2023-2025)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Stephanie Aagard",
  "b6d0e792a4c8": "",
  "c7e1f8a3b5d9": "Homeschool co-op writing teacher; (208) 521-4863",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "none",
  "f6b0c469e1d5": "none",
  "b8d2e681a3b9": "Reading, writing, and art",
  "c9e3f792b4c0": "We 100% believe in the Waldorf model and have had great a experience with it in Maine.",
  "d0f4a803c5d1": "Nina's a lot of fun, very easy and rewarding to teach, you'll find her helpful, able to work independently and willing to help other students."
}
$json$::jsonb || v_parent_fields;

  v_maggie_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_thompson_maggie",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Maggie",
  "student_last_name": "Thompson",
  "student_date_of_birth": "2016-01-31",
  "student_grade": "5",
  "b4e6a819f0c2": "Maggie",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Rockport",
  "c2e4a678f9d3": "ME",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "D93",
  "c0b4e136a8d2": "Homeschooled",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Woodland Hills Elementary (2023-2025)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Stephanie Aagard",
  "b6d0e792a4c8": "",
  "c7e1f8a3b5d9": "Homeschool co-op writing teacher; (208) 521-4863",
  "e9a3b792d4c8": "yes",
  "f0b4c803e5d9": "Maggie was referred at Woodland Hills at our request, but the testing didn't turn up anything diagnosable. She still works with a therapist, mainly on helping her overcome things like shutting down if she feels like she doesn't have the right answer etc.",
  "a1c5d914f6e0": "yes",
  "b2d6e025a7f1": "Referred for testing at Woodland Hills; nothing diagnosable, but still works with a therapist on resilience and focus.",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "none",
  "f6b0c469e1d5": "Works with a therapist on resilience, focus, and overcoming shutdown when unsure of answers.",
  "b8d2e681a3b9": "Reading, writing, and art",
  "c9e3f792b4c0": "We 100% believe in the Waldorf model and have had great a experience with it in Maine.",
  "d0f4a803c5d1": "Maggie is also delightful, but has more trouble focusing and is a bit less resilient. She can get shaken by feeling like she's failed at something, or frustrated if she doesn't know the answer, and is VERY sensitive to feeling safe and loved or not. She will also take the easy way out and requires a lot of oversight to make sure she is really putting in her best effort and pushing herself to grow. She loves music and it's a great way to help her learn and to simply make it enjoyable. She also loves to help and feel needed."
}
$json$::jsonb || v_parent_fields;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Thompson Family', 'ameliasisco@gmail.com', '2078912010'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Amy', 'Thompson', 'ameliasisco@gmail.com', '2078912010'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values
    (v_nina_student_id, v_org_id, v_family_id, 'Nina', 'Thompson', '2018-03-09', '3', 'prospect'),
    (v_maggie_student_id, v_org_id, v_family_id, 'Maggie', 'Thompson', '2016-01-31', '5', 'prospect');

  insert into public.applications (
    id, organization_id, program_id, form_version_id,
    family_id, student_id, primary_guardian_id,
    status, responses, acknowledgments,
    fee_status, fee_paid_at, submitted_at, created_by_user_id
  ) values
    (
      v_nina_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_nina_student_id, v_guardian_id,
      'submitted', v_nina_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    ),
    (
      v_maggie_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_maggie_student_id, v_guardian_id,
      'submitted', v_maggie_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    );

  insert into public.application_payments (
    id, organization_id, application_id,
    payment_type, label, amount_cents, currency, status, paid_at
  ) values
    (
      v_nina_payment_id, v_org_id, v_nina_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    ),
    (
      v_maggie_payment_id, v_org_id, v_maggie_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    );

  insert into public.activity_events (
    organization_id, actor_type, surface, action,
    entity_type, entity_id, summary, metadata
  ) values
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_nina_application_id,
      'Imported legacy application for Nina Thompson',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_thompson_nina')
    ),
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_maggie_application_id,
      'Imported legacy application for Maggie Thompson',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_thompson_maggie')
    );

  raise notice 'Imported Nina Thompson application: %', v_nina_application_id;
  raise notice 'Imported Maggie Thompson application: %', v_maggie_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after ameliasisco@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: ameliasisco@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'ameliasisco@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'd2e3f4a5-b6c7-4890-d234-56789abcdef1';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id in (
--   'f4a5b6c7-d8e9-4012-f456-789abcdef013',
--   '27d8e9f0-a1b2-4345-c789-abcdef012346'
-- );
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
