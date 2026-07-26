-- Import Arrow Calvert legacy Google Form application into rooted-meadows (production).
-- Source: 26-27 Calvert, Arrow application.pdf
-- Idempotent: skips if __import_source tag already exists.
--
-- No storage upload required (transcript field left empty).
-- Optional: upload PDF via `node scripts/import-rooted-meadows-submission.mjs calvert-arrow`
-- After import: create canidcafe@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id          uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_form_version_id uuid := '8f76b936-c56e-4045-a01f-bb7807570ad0';
  v_program_id      uuid := '5ffe9d11-da38-4521-88bd-23a702190250';

  v_family_id       uuid := 'a1c2d3e4-f5a6-4789-b012-3456789abcde';
  v_guardian_id     uuid := 'b2c3d4e5-f6a7-4890-c123-456789abcdef';
  v_student_id      uuid := 'c3d4e5f6-a7b8-4901-d234-56789abcdef0';
  v_application_id  uuid := 'd4e5f6a7-b8c9-4012-e345-6789abcdef01';
  v_payment_id      uuid := 'e5f6a7b8-c9d0-4123-f456-789abcdef012';

  v_submitted_at    timestamptz := '2026-03-20 14:00:00+00';

  v_responses       jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' = 'legacy_google_form_2026_27_calvert_arrow'
  ) then
    raise notice 'Arrow Calvert import already exists — skipping.';
    return;
  end if;

  v_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_calvert_arrow",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Arrow",
  "student_last_name": "Calvert",
  "student_date_of_birth": "2019-10-24",
  "student_grade": "1",
  "b4e6a819f0c2": "Arrow, RoeRoe",
  "d7f9b123a4e8": "{\"line1\":\"2430 South Bellin Road\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83402\"}",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Clarkston",
  "c2e4a678f9d3": "WA",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Bonneville",
  "c0b4e136a8d2": "American Heritage Charter School",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Blossom and Grow Pre-k (2023-25)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Kyaia Sammons",
  "b6d0e792a4c8": "Magicoftetonnutcracker@gmail.com",
  "c7e1f8a3b5d9": "First pre-k teacher and owner of Teton Ballet Productions",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "yes",
  "b2d6e025a7f1": "Arrow is AuDHD but she doesn't require treatment.",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "None",
  "f6b0c469e1d5": "None",
  "b8d2e681a3b9": "Arrow loves to learn about everything. Her favorite things right now are ballet, water polo, horseback riding, and acting. She just loves to learn! She's very inquisitive with math and science and she loves reading and art!",
  "c9e3f792b4c0": "Arrow loves school, but the full day of nonstop pubic school expectations left her overwhelmed and exhausted. She asked to be pulled out and homeschool so that's what I did. (I homeschooled big brother, 14, for 10 years for similar reasons). I have her involved in tons of activities because she needs it and she loves them, but we're still missing that consistent school-ish environment with other kids! And I can only teach so much. I know she would benefit from other communities opportunities that I might not be able to provide alone.",
  "d0f4a803c5d1": "She is not shy, but she is in that exploration of personality phase of what happens when I behave like xyz. She's concerned about if people will like her and developeding lasting friendships. She's very kind, and caring and always wants to help. She's mentally/emotionally strong but also very sensitive. We call her \"weasel\" because she's into everything all the time but in good way. She's just very curious about the world.",
  "p1f001a1b2c3": "Hayley",
  "p1f003c3d4e5": "Calvert",
  "p1f005e5f6a7": "canidcafe@gmail.com",
  "p1f006f6a7b8": "2083058034",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"2430 South Bellin Road\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83402\"}",
  "p1f012f2a3b4": "Nutritionist",
  "p1f013a3b4c5": "Self",
  "p1f014b4c5d6": "",
  "p1f015c5d6e7": "None",
  "p2f001a1b2c3": "Zach",
  "p2f003c3d4e5": "Fredrickson",
  "p2f005e5f6a7": "Zfredrickson07@gmail.com",
  "p2f006f6a7b8": "2089978926",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"2430 South Bellin Road\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83402\"}",
  "p2f012f2a3b4": "Electrician",
  "p2f013a3b4c5": "ES Solar",
  "p2f014b4c5d6": "2089978926",
  "p2f015c5d6e7": "None",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Calvert Family', 'canidcafe@gmail.com', '2083058034'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Hayley', 'Calvert', 'canidcafe@gmail.com', '2083058034'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values (
    v_student_id, v_org_id, v_family_id, 'Arrow', 'Calvert', '2019-10-24', '1', 'prospect'
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
    'Imported legacy application for Arrow Calvert',
    jsonb_build_object('import_source', 'legacy_google_form_2026_27_calvert_arrow')
  );

  raise notice 'Imported Arrow Calvert application: %', v_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after canidcafe@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: canidcafe@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'canidcafe@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'b2c3d4e5-f6a7-4890-c123-456789abcdef';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id = 'd4e5f6a7-b8c9-4012-e345-6789abcdef01';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
