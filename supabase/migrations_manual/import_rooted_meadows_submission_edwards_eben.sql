-- Import Eben Edwards legacy Google Form application into rooted-meadows (production).
-- Source: 26-27 Edwards, Eben Application.pdf
-- Idempotent: skips if __import_source tag already exists.
--
-- No storage upload required (transcript field left empty).
-- Optional: upload PDF via `node scripts/import-rooted-meadows-submission.mjs edwards-eben`
-- After import: create pegandsam@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id          uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_form_version_id uuid := '8f76b936-c56e-4045-a01f-bb7807570ad0';
  v_program_id      uuid := '5ffe9d11-da38-4521-88bd-23a702190250';

  v_family_id       uuid := 'f1a2b3c4-d5e6-4789-f012-3456789abcde';
  v_guardian_id     uuid := 'a2b3c4d5-e6f7-4890-a123-456789abcdef';
  v_student_id      uuid := 'b3c4d5e6-f7a8-4901-b234-56789abcdef0';
  v_application_id  uuid := 'c4d5e6f7-a8b9-4012-c345-6789abcdef01';
  v_payment_id      uuid := 'd5e6f7a8-b9c0-4123-d456-789abcdef012';

  v_submitted_at    timestamptz := '2026-03-22 14:00:00+00';

  v_responses       jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' = 'legacy_google_form_2026_27_edwards_eben'
  ) then
    raise notice 'Eben Edwards import already exists — skipping.';
    return;
  end if;

  v_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_edwards_eben",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Eben",
  "student_last_name": "Edwards",
  "student_date_of_birth": "2017-03-02",
  "student_grade": "3",
  "b4e6a819f0c2": "Eben",
  "d7f9b123a4e8": "{\"line1\":\"333 Shoshone Ave\",\"line2\":\"\",\"city\":\"Rexburg\",\"state\":\"ID\",\"zip\":\"83440\"}",
  "e8a0c234b5f9": "male",
  "b1d3f567e8c2": "Washington",
  "c2e4a678f9d3": "DC",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Madison",
  "c0b4e136a8d2": "Home School",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "no",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Peggy Edwards",
  "b6d0e792a4c8": "pegandsam@gmail.com",
  "c7e1f8a3b5d9": "mother",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "none",
  "f6b0c469e1d5": "none",
  "b8d2e681a3b9": "He loves history. He listens to Story of the World and Jim Weiss.",
  "c9e3f792b4c0": "Community",
  "d0f4a803c5d1": "Our exposure to mold has changed our family dynamic. The healing journey includes the support of a community to help us move forward.",
  "p1f001a1b2c3": "Peggy",
  "p1f003c3d4e5": "Edwards",
  "p1f005e5f6a7": "pegandsam@gmail.com",
  "p1f006f6a7b8": "2027601686",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"333 Shoshone Ave\",\"line2\":\"\",\"city\":\"Rexburg\",\"state\":\"ID\",\"zip\":\"83440\"}",
  "p1f012f2a3b4": "homemaker",
  "p1f013a3b4c5": "none",
  "p1f014b4c5d6": "2027601686",
  "p1f015c5d6e7": "Church of Jesus Christ of Latter-day Saints",
  "p2f001a1b2c3": "Samuel",
  "p2f003c3d4e5": "Edwards",
  "p2f005e5f6a7": "pegandsam@gmail.com",
  "p2f006f6a7b8": "2022707937",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"333 Shoshone Ave\",\"line2\":\"\",\"city\":\"Rexburg\",\"state\":\"ID\",\"zip\":\"83440\"}",
  "p2f012f2a3b4": "Engineer/Project Manager",
  "p2f013a3b4c5": "INL",
  "p2f014b4c5d6": "2022707937",
  "p2f015c5d6e7": "Church of Jesus Christ of Latter-day Saints",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Edwards Family', 'pegandsam@gmail.com', '2027601686'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Peggy', 'Edwards', 'pegandsam@gmail.com', '2027601686'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values (
    v_student_id, v_org_id, v_family_id, 'Eben', 'Edwards', '2017-03-02', '3', 'prospect'
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
    'Imported legacy application for Eben Edwards',
    jsonb_build_object('import_source', 'legacy_google_form_2026_27_edwards_eben')
  );

  raise notice 'Imported Eben Edwards application: %', v_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after pegandsam@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: pegandsam@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'pegandsam@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'a2b3c4d5-e6f7-4890-a123-456789abcdef';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id = 'c4d5e6f7-a8b9-4012-c345-6789abcdef01';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
