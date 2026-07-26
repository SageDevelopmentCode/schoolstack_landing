-- Import Helene & Clara Caballero legacy Google Form applications into rooted-meadows (production).
-- Source: 26-27 Caballero, Helene & Clara Application.pdf
-- Idempotent: skips if either __import_source tag already exists.
--
-- Two applications (one per child), one family, $75 fee each ($150 total).
-- Optional: upload PDF via `node scripts/import-rooted-meadows-submission.mjs caballero-helene-clara`
-- After import: create jaz.h.cab@gmail.com in Supabase Auth, then run
-- the LINK PARENT ACCOUNT block at the bottom of this file.

begin;

do $$
declare
  v_org_id               uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_form_version_id      uuid := '8f76b936-c56e-4045-a01f-bb7807570ad0';
  v_program_id           uuid := '5ffe9d11-da38-4521-88bd-23a702190250';

  v_family_id            uuid := 'a1b2c3d4-e5f6-4789-a012-3456789abc01';
  v_guardian_id          uuid := 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
  v_helene_student_id    uuid := 'c3d4e5f6-a7b8-4901-c234-56789abcdef0';
  v_helene_application_id uuid := 'd4e5f6a7-b8c9-4012-d345-6789abcdef01';
  v_helene_payment_id    uuid := 'e5f6a7b8-c9d0-4123-e456-789abcdef012';
  v_clara_student_id     uuid := 'f6a7b8c9-d0e1-4234-f567-89abcdef0120';
  v_clara_application_id uuid := '07a8b9c0-d1e2-4345-a678-9abcdef01201';
  v_clara_payment_id     uuid := '18b9c0d1-e2f3-4456-b789-abcdef012012';

  v_submitted_at         timestamptz := '2026-03-25 14:00:00+00';

  v_parent_fields        jsonb;
  v_helene_responses     jsonb;
  v_clara_responses      jsonb;
begin
  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__import_source' in (
        'legacy_google_form_2026_27_caballero_helene',
        'legacy_google_form_2026_27_caballero_clara'
      )
  ) then
    raise notice 'Caballero import already exists — skipping.';
    return;
  end if;

  v_parent_fields := $json$
{
  "d7f9b123a4e8": "{\"line1\":\"955 Airport Rd\",\"line2\":\"\",\"city\":\"Blackfoot\",\"state\":\"ID\",\"zip\":\"83221\"}",
  "p1f001a1b2c3": "Jazmin",
  "p1f002b2c3d4": "Helene",
  "p1f003c3d4e5": "Caballero",
  "p1f005e5f6a7": "jaz.h.cab@gmail.com",
  "p1f006f6a7b8": "2087054762",
  "p1f007a7b8c9": "yes",
  "p1f008b8c9d0": "yes",
  "p1f009c9d0e1": "yes",
  "p1f010d0e1f2": "married",
  "p1f011e1f2a3": "{\"line1\":\"955 Airport Rd\",\"line2\":\"\",\"city\":\"Blackfoot\",\"state\":\"ID\",\"zip\":\"83221\"}",
  "p1f012f2a3b4": "Handwork teacher",
  "p1f013a3b4c5": "Rooted Meadows",
  "p1f014b4c5d6": "2087054762",
  "p1f015c5d6e7": "Seeker",
  "p2f001a1b2c3": "Lane",
  "p2f002b2c3d4": "Kendall",
  "p2f003c3d4e5": "Miller",
  "p2f005e5f6a7": "idaho.lkmconstruction@gmail.com",
  "p2f006f6a7b8": "2082510385",
  "p2f007a7b8c9": "yes",
  "p2f008b8c9d0": "yes",
  "p2f009c9d0e1": "yes",
  "p2f010d0e1f2": "married",
  "p2f011e1f2a3": "{\"line1\":\"955 Airport Rd\",\"line2\":\"\",\"city\":\"Blackfoot\",\"state\":\"ID\",\"zip\":\"83221\"}",
  "p2f012f2a3b4": "Construction contractor",
  "p2f013a3b4c5": "Self employed",
  "p2f014b4c5d6": "2082510385",
  "p2f015c5d6e7": "Christian",
  "r8f001a1b2c3": ""
}
$json$::jsonb;

  v_helene_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_caballero_helene",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Helene",
  "student_last_name": "Caballero",
  "student_date_of_birth": "2018-06-23",
  "student_grade": "2",
  "b4e6a819f0c2": "Helene",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Pocatello",
  "c2e4a678f9d3": "ID",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Blackfoot school district #55",
  "c0b4e136a8d2": "Homeschool for kindergarten and first grade",
  "d1c5f247b9e3": "25-26",
  "e2d6a358c0f4": "Idaho home learning academy (2024-2025)",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "Marisha Rodeback",
  "b6d0e792a4c8": "marishaprodeback@gmail.com",
  "c7e1f8a3b5d9": "Family friend/nature group teacher",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "None",
  "f6b0c469e1d5": "None",
  "b8d2e681a3b9": "Helene loves nature group the best. She loves being outside and playing with her friends, learning about nature. She also loves form drawing.",
  "c9e3f792b4c0": "Waldorf principals align with our family values. We are excited to be a part of this upcoming school and to connect with this community. We hope for our children to be supported as the people they are.",
  "d0f4a803c5d1": "Helene can be very shy. She takes a bit of warming up. I appreciate when people in her life are patient and warm and give her time to respond."
}
$json$::jsonb || v_parent_fields;

  v_clara_responses := $json$
{
  "__import_source": "legacy_google_form_2026_27_caballero_clara",
  "__progress": { "stepIndex": 9 },
  "student_first_name": "Clara",
  "student_last_name": "Caballero",
  "student_date_of_birth": "2021-01-30",
  "student_grade": "k",
  "b4e6a819f0c2": "Clara",
  "e8a0c234b5f9": "female",
  "b1d3f567e8c2": "Blackfoot",
  "c2e4a678f9d3": "ID",
  "d3f5b789a0e4": "United States",
  "e4a6c890b1f5": "English",
  "b9a3d025f7c1": "Blackfoot school district #55",
  "c0b4e136a8d2": "",
  "d1c5f247b9e3": "",
  "e2d6a358c0f4": "no",
  "f3e7b469d1a5": "[]",
  "a5c9d681f3b7": "",
  "b6d0e792a4c8": "",
  "c7e1f8a3b5d9": "",
  "e9a3b792d4c8": "no",
  "f0b4c803e5d9": "",
  "a1c5d914f6e0": "no",
  "b2d6e025a7f1": "",
  "c3e7f136b8a2": "no",
  "d4f8a247c9b3": "",
  "e5a9b358d0c4": "None",
  "f6b0c469e1d5": "None",
  "b8d2e681a3b9": "",
  "c9e3f792b4c0": "",
  "d0f4a803c5d1": ""
}
$json$::jsonb || v_parent_fields;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id, v_org_id, 'Caballero Family', 'jaz.h.cab@gmail.com', '2087054762'
  );

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id, v_org_id, v_family_id, 'Jazmin', 'Caballero', 'jaz.h.cab@gmail.com', '2087054762'
  );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values
    (v_helene_student_id, v_org_id, v_family_id, 'Helene', 'Caballero', '2018-06-23', '2', 'prospect'),
    (v_clara_student_id, v_org_id, v_family_id, 'Clara', 'Caballero', '2021-01-30', 'k', 'prospect');

  insert into public.applications (
    id, organization_id, program_id, form_version_id,
    family_id, student_id, primary_guardian_id,
    status, responses, acknowledgments,
    fee_status, fee_paid_at, submitted_at, created_by_user_id
  ) values
    (
      v_helene_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_helene_student_id, v_guardian_id,
      'submitted', v_helene_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    ),
    (
      v_clara_application_id, v_org_id, v_program_id, v_form_version_id,
      v_family_id, v_clara_student_id, v_guardian_id,
      'submitted', v_clara_responses, '{}'::jsonb,
      'paid', v_submitted_at, v_submitted_at, null
    );

  insert into public.application_payments (
    id, organization_id, application_id,
    payment_type, label, amount_cents, currency, status, paid_at
  ) values
    (
      v_helene_payment_id, v_org_id, v_helene_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    ),
    (
      v_clara_payment_id, v_org_id, v_clara_application_id,
      'application_fee', 'Application fee', 7500, 'USD', 'succeeded', v_submitted_at
    );

  insert into public.activity_events (
    organization_id, actor_type, surface, action,
    entity_type, entity_id, summary, metadata
  ) values
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_helene_application_id,
      'Imported legacy application for Helene Caballero',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_caballero_helene')
    ),
    (
      v_org_id, 'system', 'admissions', 'application.submitted',
      'application', v_clara_application_id,
      'Imported legacy application for Clara Caballero',
      jsonb_build_object('import_source', 'legacy_google_form_2026_27_caballero_clara')
    );

  raise notice 'Imported Helene Caballero application: %', v_helene_application_id;
  raise notice 'Imported Clara Caballero application: %', v_clara_application_id;
end $$;

commit;

-- ── LINK PARENT ACCOUNT (run separately after jaz.h.cab@gmail.com is created) ──
--
-- 1. Create user in Supabase Auth: jaz.h.cab@gmail.com (auto-confirm)
-- 2. Look up the auth user id:
--    select id from auth.users where email = 'jaz.h.cab@gmail.com';
-- 3. Replace USER_UUID below and run:
--
-- begin;
--
-- update public.guardians
-- set user_id = 'USER_UUID'
-- where id = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
--
-- update public.applications
-- set created_by_user_id = 'USER_UUID'
-- where id in (
--   'd4e5f6a7-b8c9-4012-d345-6789abcdef01',
--   '07a8b9c0-d1e2-4345-a678-9abcdef01201'
-- );
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
