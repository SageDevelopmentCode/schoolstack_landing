-- Import Claire, Olivia & Georgie Sekyere legacy Google Form applications into rooted-meadows (production).
-- Source: 26-27 Sekyere Application.pdf
-- Idempotent: skips if any __import_source tag already exists.
--
-- Three applications (one per child), one family, $75 fee each ($225 total).
-- Optional: upload PDF via `node scripts/import-rooted-meadows-submission.mjs sekyere-claire-olivia-georgie`
-- After import: create lifeschoolingfam@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id                uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_form_version_id       uuid := '8f76b936-c56e-4045-a01f-bb7807570ad0';
  v_program_id            uuid := '5ffe9d11-da38-4521-88bd-23a702190250';

  v_family_id             uuid := 'a2b3c4d5-e6f7-4890-a123-456789abcdef';
  v_guardian_id           uuid := 'b3c4d5e6-f7a8-4901-b234-56789abcdef0';
  v_claire_student_id     uuid := 'c4d5e6f7-a8b9-4012-c345-6789abcdef01';
  v_claire_application_id uuid := 'd5e6f7a8-b9c0-4123-d456-789abcdef012';
  v_claire_payment_id     uuid := 'e6f7a8b9-c0d1-4234-e567-89abcdef0123';
  v_olivia_student_id     uuid := 'f7a8b9c0-d1e2-4345-f678-9abcdef01234';
  v_olivia_application_id uuid := '08b9c0d1-e2f3-4456-a789-abcdef012346';
  v_olivia_payment_id     uuid := '19c0d1e2-f3a4-4567-b890-abcdef012346';
  v_georgie_student_id    uuid := '2ad1e2f3-a4b5-4678-c901-bcdef0123456';
  v_georgie_application_id uuid := '3be2f3a4-b5c6-4789-d012-cdef01234567';
  v_georgie_payment_id    uuid := '4cf3a4b5-c6d7-4890-e123-def012345678';

  v_submitted_at          timestamptz := '2026-03-28 14:00:00+00';

  v_parent_fields         jsonb;
  v_claire_responses      jsonb;
  v_olivia_responses      jsonb;
  v_georgie_responses     jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' in (
        'legacy_google_form_2026_27_sekyere_claire',
        'legacy_google_form_2026_27_sekyere_olivia',
        'legacy_google_form_2026_27_sekyere_georgie'
      )
  ) then
    raise notice 'Sekyere import already exists — skipping.';
    return;
  end if;

  v_parent_fields := $json$
{
  "d7f9b123a4e8": "{\"line1\":\"4665 E 49th N\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83401\"}",
  "p1f001a1b2c3": "Candace",
  "p1f002b2c3d4": "Kathleen",
  "p1f003c3d4e5": "Sekyere",
  "p1f005e5f6a7": "lifeschoolingfam@gmail.com",
  "p1f006f6a7b8": "2088814573",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "divorced",
  "p1f011e1f2a3": "{\"line1\":\"4665 E 49th N\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83401\"}",
  "p1f012f2a3b4": "Self-employed, Property Management",
  "p1f013a3b4c5": "Self",
  "p1f014b4c5d6": "2085246653",
  "p1f015c5d6e7": "Member of the Church of Jesus Christ of Latter-day Saints",
  "p2f001a1b2c3": "Richmond",
  "p2f003c3d4e5": "Sekyere",
  "p2f005e5f6a7": "candosurfacesolutions@gmail.com",
  "p2f006f6a7b8": "2088818926",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "divorced",
  "p2f011e1f2a3": "{\"line1\":\"2698 Rebel Rd\",\"line2\":\"\",\"city\":\"Idaho Falls\",\"state\":\"ID\",\"zip\":\"83401\"}",
  "p2f012f2a3b4": "Marketing",
  "p2f013a3b4c5": "Unknown",
  "p2f014b4c5d6": "",
  "p2f015c5d6e7": "Member of the Church of Jesus Christ of Latter-day Saints",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  v_claire_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_sekyere_claire",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Claire",
  "student_last_name": "Sekyere",
  "student_date_of_birth": "2015-04-18",
  "student_grade": "5",
  "b4e6a819f0c2": "Claire",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Pocatello",
  "c2e4a678f9d3": "ID",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Bonneville Joint School District",
  "c0b4e136a8d2": "Homeschool",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Iona Elementary (Sept 2023- March 2024), Homeschool (2022-2023), Acton Academy (2020-2022)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Ashley Lindley",
  "b6d0e792a4c8": "lindleya@d93mail.com",
  "c7e1f8a3b5d9": "School Teacher at Iona Elementary",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "NA",
  "f6b0c469e1d5": "Due to emotional struggles stemming from my divorce I have all my daughters in counseling with Play Therapist Stephanie Westover",
  "b8d2e681a3b9": "Mythology, History, Animals, Biology, Entrepreneurship, etc",
  "c9e3f792b4c0": "I want my daughters to attend Rooted Meadows Waldorf School because I seek a supportive community to enrich their learning journey. While I am dedicated to homeschooling and would continue if public school were the only option, I value the opportunity for my girls to learn alongside peers in a nurturing environment. Rooted Meadows' emphasis on hands-on learning, life skills, and following individual interests aligns perfectly with the educational values I uphold at home. I believe this school will offer the support and inspiration that will help my children thrive both academically and personally, complementing our homeschooling efforts.",
  "d0f4a803c5d1": "Claire is quite reserved and timid at first, especially around peers. However, given time and trust, she will open up and loves to talk, play and learn."
}
$json$::jsonb || v_parent_fields;

  v_olivia_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_sekyere_olivia",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Olivia",
  "student_last_name": "Sekyere",
  "student_date_of_birth": "2018-07-06",
  "student_grade": "2",
  "b4e6a819f0c2": "Olivia",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Idaho Falls",
  "c2e4a678f9d3": "ID",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Bonneville County Joint",
  "c0b4e136a8d2": "Homeschool",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Iona Elementary (Sept 2024- March 2025), Homeschool (2023-2024), Acton Academy (2021-2023)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Nicole Taylor",
  "b6d0e792a4c8": "taylorni@d93mail.com",
  "c7e1f8a3b5d9": "School Teacher, Iona Elementary",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "NA",
  "f6b0c469e1d5": "All my girls are currently working through emotional struggles due to my divorce.",
  "b8d2e681a3b9": "Math, Reading, Cooking, Art, etc",
  "c9e3f792b4c0": "Please see answer under Claire's section",
  "d0f4a803c5d1": "Olivia is timid at first, but warms up quickly. She is aching for friendship with peers, but she is also drawn to bonding with older women. She may have ADHD, and struggles with criticism and correction. She can also get very overwhelmed with large tasks."
}
$json$::jsonb || v_parent_fields;

  v_georgie_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_sekyere_georgie",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Georgie",
  "student_last_name": "Sekyere",
  "student_date_of_birth": "2020-07-24",
  "student_grade": "k",
  "b4e6a819f0c2": "Georgie or Gigi",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Idaho Falls",
  "c2e4a678f9d3": "ID",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Bonneville County Joint",
  "c0b4e136a8d2": "Homeschool",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "no",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Diane Kofoed",
  "b6d0e792a4c8": "d.kofoed@hotmail.com",
  "c7e1f8a3b5d9": "Former Daycare Provider",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "NA",
  "f6b0c469e1d5": "All of my daughters are working through emotional challenges with some counseling due to my divorce.",
  "b8d2e681a3b9": "Art, numbers, anything with her body (dancing, sports, biking...), working with her hands, cooking, etc.",
  "c9e3f792b4c0": "See answer in Claire's section",
  "d0f4a803c5d1": "Georgie is outgoing and always on the go. She loves to move her body. She doesn't really have any interest in learning to read at this time, but is open to most all other learning and activities."
}
$json$::jsonb || v_parent_fields;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Sekyere Family', 'lifeschoolingfam@gmail.com', '2088814573'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Candace', 'Sekyere', 'lifeschoolingfam@gmail.com', '2088814573'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values
    (v_claire_student_id, v_org_id, v_family_id, 'Claire', 'Sekyere', '2015-04-18', '5', 'prospect'),
    (v_olivia_student_id, v_org_id, v_family_id, 'Olivia', 'Sekyere', '2018-07-06', '2', 'prospect'),
    (v_georgie_student_id, v_org_id, v_family_id, 'Georgie', 'Sekyere', '2020-07-24', 'k', 'prospect');

  insert into public.applications (
    id, organization_id, program_id, form_version_id,
    family_id, student_id, primary_guardian_id,
    status, responses, acknowledgments,
    fee_status, fee_paid_at, submitted_at, created_by_user_id
  ) values
    (
      v_claire_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_claire_student_id, v_guardian_id,
      'submitted', v_claire_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    ),
    (
      v_olivia_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_olivia_student_id, v_guardian_id,
      'submitted', v_olivia_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    ),
    (
      v_georgie_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_georgie_student_id, v_guardian_id,
      'submitted', v_georgie_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    );

  insert into public.application_payments (
    id, organization_id, application_id,
    payment_type, label, amount_cents, currency, status, paid_at
  ) values
    (
      v_claire_payment_id, v_org_id, v_claire_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    ),
    (
      v_olivia_payment_id, v_org_id, v_olivia_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    ),
    (
      v_georgie_payment_id, v_org_id, v_georgie_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    );

  insert into public.activity_events (
    organization_id, actor_type, surface, action,
    entity_type, entity_id, summary, metadata
  ) values
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_claire_application_id,
      'Imported legacy application for Claire Sekyere',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_sekyere_claire')
    ),
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_olivia_application_id,
      'Imported legacy application for Olivia Sekyere',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_sekyere_olivia')
    ),
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_georgie_application_id,
      'Imported legacy application for Georgie Sekyere',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_sekyere_georgie')
    );

  raise notice 'Imported Claire Sekyere application: %', v_claire_application_id;
  raise notice 'Imported Olivia Sekyere application: %', v_olivia_application_id;
  raise notice 'Imported Georgie Sekyere application: %', v_georgie_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after lifeschoolingfam@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: lifeschoolingfam@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'lifeschoolingfam@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'b3c4d5e6-f7a8-4901-b234-56789abcdef0';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id in (
--   'd5e6f7a8-b9c0-4123-d456-789abcdef012',
--   '08b9c0d1-e2f3-4456-a789-abcdef012346',
--   '3be2f3a4-b5c6-4789-d012-cdef01234567'
-- );
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
