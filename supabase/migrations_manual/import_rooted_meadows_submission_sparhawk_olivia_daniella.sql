-- Import Olivia & Daniella Sparhawk legacy Google Form applications into rooted-meadows (production).
-- Source: 26-27 Sparhawk, Olivia & Daniella Application.pdf
-- Idempotent: skips if either __import_source tag already exists.
--
-- Two applications (one per child), one family, $75 fee each ($150 total).
-- Optional: upload PDF via `node scripts/import-rooted-meadows-submission.mjs sparhawk-olivia-daniella`
-- After import: create rakel.sparhawk@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id                uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_form_version_id       uuid := '8f76b936-c56e-4045-a01f-bb7807570ad0';
  v_program_id            uuid := '5ffe9d11-da38-4521-88bd-23a702190250';

  v_family_id             uuid := 'b1c2d3e4-f5a6-4789-b012-3456789abc02';
  v_guardian_id           uuid := 'c2d3e4f5-a6b7-4890-c123-456789abcdef';
  v_olivia_student_id     uuid := 'd3e4f5a6-b7c8-4901-d234-56789abcdef0';
  v_olivia_application_id uuid := 'e4f5a6b7-c8d9-4012-e345-6789abcdef01';
  v_olivia_payment_id     uuid := 'f5a6b7c8-d9e0-4123-f456-789abcdef012';
  v_daniella_student_id   uuid := '06b7c8d9-e0f1-4234-a567-89abcdef0123';
  v_daniella_application_id uuid := '17c8d9e0-f1a2-4345-b678-9abcdef01234';
  v_daniella_payment_id   uuid := '28d9e0f1-a2b3-4456-c789-abcdef012346';

  v_submitted_at          timestamptz := '2026-03-29 14:00:00+00';

  v_parent_fields         jsonb;
  v_olivia_responses      jsonb;
  v_daniella_responses    jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' in (
        'legacy_google_form_2026_27_sparhawk_olivia',
        'legacy_google_form_2026_27_sparhawk_daniella'
      )
  ) then
    raise notice 'Sparhawk import already exists — skipping.';
    return;
  end if;

  v_parent_fields := $json$
{
  "d7f9b123a4e8": "{\"line1\":\"3833 E 200 N\",\"line2\":\"\",\"city\":\"Rigby\",\"state\":\"ID\",\"zip\":\"83442\"}",
  "p1f001a1b2c3": "Rachael",
  "p1f003c3d4e5": "Sparhawk",
  "p1f005e5f6a7": "rakel.sparhawk@gmail.com",
  "p1f006f6a7b8": "8016169403",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"3833 E 200 N\",\"line2\":\"\",\"city\":\"Rigby\",\"state\":\"ID\",\"zip\":\"83442\"}",
  "p1f012f2a3b4": "SAHM",
  "p1f013a3b4c5": "n/a",
  "p1f014b4c5d6": "",
  "p1f015c5d6e7": "",
  "p2f001a1b2c3": "Andrew",
  "p2f003c3d4e5": "Sparhawk",
  "p2f005e5f6a7": "sparhawkal@gmail.com",
  "p2f006f6a7b8": "3603581813",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"3833 E 200 N\",\"line2\":\"\",\"city\":\"Rigby\",\"state\":\"ID\",\"zip\":\"83442\"}",
  "p2f012f2a3b4": "Sales Engineer",
  "p2f013a3b4c5": "Salesforce",
  "p2f014b4c5d6": "",
  "p2f015c5d6e7": "",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  v_olivia_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_sparhawk_olivia",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Olivia",
  "student_last_name": "Sparhawk",
  "student_date_of_birth": "2014-07-01",
  "student_grade": "6",
  "b4e6a819f0c2": "Olivia",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Bellevue",
  "c2e4a678f9d3": "WA",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Jefferson School District",
  "c0b4e136a8d2": "Whatcom Hills Waldorf School",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Homeschool (2025-2026, 2020-2023), Burlington (2024, 2020)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Suzie MacKay",
  "b6d0e792a4c8": "suzannemackay00@gmail.com",
  "c7e1f8a3b5d9": "3-4th grade teacher",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "none",
  "f6b0c469e1d5": "none",
  "b8d2e681a3b9": "History, Science, music and fiber arts, speaking and projects and building",
  "c9e3f792b4c0": "I find Rudolf Steiner's principles resonate with our family values, and believe this is the kind of education if done well will create adults that are good and do good in the world.",
  "d0f4a803c5d1": "Olivia is an excellent student and loves school."
}
$json$::jsonb || v_parent_fields;

  v_daniella_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_sparhawk_daniella",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Daniella",
  "student_last_name": "Sparhawk",
  "student_date_of_birth": "2016-05-02",
  "student_grade": "4",
  "b4e6a819f0c2": "Daniella",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Bellevue",
  "c2e4a678f9d3": "WA",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Jefferson School District",
  "c0b4e136a8d2": "Whatcom Hills Waldorf School",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Homeschool (2021-2022), Burlington (2023)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Pax Piper",
  "b6d0e792a4c8": "ppiper@whws.org",
  "c7e1f8a3b5d9": "1st-2nd Grade Teacher",
  "e9a3b792d4c8": "yes",
  "f0b4c803e5d9": "Daniella had trouble with her R's and did 2 months of private Speech therapy. She is good.",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "none",
  "f6b0c469e1d5": "none",
  "b8d2e681a3b9": "Movement, Handwork, Math, Plays",
  "c9e3f792b4c0": "Rudolf Steiner's principles resonate with our family values, and I feel this education when done right will create adults that are good and do good in the world.",
  "d0f4a803c5d1": "Daniella is good student, super social, and works hard. In my experience as a homeschool mom, she rushes and sort of skips the little things, so helping her slow and enjoy the process and the journey is helpful."
}
$json$::jsonb || v_parent_fields;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Sparhawk Family', 'rakel.sparhawk@gmail.com', '8016169403'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Rachael', 'Sparhawk', 'rakel.sparhawk@gmail.com', '8016169403'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values
    (v_olivia_student_id, v_org_id, v_family_id, 'Olivia', 'Sparhawk', '2014-07-01', '6', 'prospect'),
    (v_daniella_student_id, v_org_id, v_family_id, 'Daniella', 'Sparhawk', '2016-05-02', '4', 'prospect');

  insert into public.applications (
    id, organization_id, program_id, form_version_id,
    family_id, student_id, primary_guardian_id,
    status, responses, acknowledgments,
    fee_status, fee_paid_at, submitted_at, created_by_user_id
  ) values
    (
      v_olivia_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_olivia_student_id, v_guardian_id,
      'submitted', v_olivia_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    ),
    (
      v_daniella_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_daniella_student_id, v_guardian_id,
      'submitted', v_daniella_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    );

  insert into public.application_payments (
    id, organization_id, application_id,
    payment_type, label, amount_cents, currency, status, paid_at
  ) values
    (
      v_olivia_payment_id, v_org_id, v_olivia_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    ),
    (
      v_daniella_payment_id, v_org_id, v_daniella_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    );

  insert into public.activity_events (
    organization_id, actor_type, surface, action,
    entity_type, entity_id, summary, metadata
  ) values
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_olivia_application_id,
      'Imported legacy application for Olivia Sparhawk',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_sparhawk_olivia')
    ),
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_daniella_application_id,
      'Imported legacy application for Daniella Sparhawk',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_sparhawk_daniella')
    );

  raise notice 'Imported Olivia Sparhawk application: %', v_olivia_application_id;
  raise notice 'Imported Daniella Sparhawk application: %', v_daniella_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after rakel.sparhawk@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: rakel.sparhawk@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'rakel.sparhawk@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'c2d3e4f5-a6b7-4890-c123-456789abcdef';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id in (
--   'e4f5a6b7-c8d9-4012-e345-6789abcdef01',
--   '17c8d9e0-f1a2-4345-b678-9abcdef01234'
-- );
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
