-- 2026-08-10 — rooted-meadows production
-- Change Helene's legal last name from Caballero to Miller (sister Clara stays Caballero).
-- Idempotent: updates only when Helene still has last_name Caballero on student + application.
--
-- Source IDs from import_rooted_meadows_submission_caballero_helene_clara.sql

begin;

-- Preview (optional)
select s.id, s.first_name, s.last_name, a.responses->>'student_last_name' as app_last_name
from public.students s
join public.applications a on a.student_id = s.id
where s.id = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0';

update public.students
set last_name = 'Miller',
    updated_at = now()
where id = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'
  and organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'
  and first_name = 'Helene'
  and last_name = 'Caballero';

update public.applications
set responses = jsonb_set(responses, '{student_last_name}', '"Miller"', false),
    updated_at = now()
where id = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
  and organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'
  and student_id = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'
  and responses->>'student_last_name' = 'Caballero';

-- Optional cosmetic: activity log import summary
update public.activity_events
set summary = 'Imported legacy application for Helene Miller'
where organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'
  and entity_type = 'application'
  and entity_id = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
  and summary = 'Imported legacy application for Helene Caballero';

-- Verify
select s.first_name, s.last_name,
       a.responses->>'student_first_name' as app_first,
       a.responses->>'student_last_name' as app_last
from public.students s
join public.applications a on a.id = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
where s.id = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0';

-- Clara unchanged (sanity check)
select s.first_name, s.last_name
from public.students s
where s.id = 'f6a7b8c9-d0e1-4234-f567-89abcdef0120';

commit;
