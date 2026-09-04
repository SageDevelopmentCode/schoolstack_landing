-- Messages isolation walkthrough setup for rooted-meadows-demo (Cecilia family).
-- Run in Supabase SQL Editor before manual UI test (Step 0 of walkthrough plan).
-- Date: 2026-09-04
--
-- Test account: juliuscecilia33@gmail.com
-- Family id:   14ffb928-3922-4ece-a1e9-90d51ef4594d
-- Co-op program id: 0e4d91d2-9f42-41d5-9b6f-a651cb46bd78 (portal_slug kindergarten-co-op)

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 0 — Enroll Julia Cecilia in Kindergarten Co-op
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.enrollments (organization_id, student_id, program_id, status)
select
  o.id,
  s.id,
  '0e4d91d2-9f42-41d5-9b6f-a651cb46bd78'::uuid,
  'enrolled'
from public.organizations o
join public.students s on s.organization_id = o.id
where o.slug = 'rooted-meadows-demo'
  and s.family_id = '14ffb928-3922-4ece-a1e9-90d51ef4594d'
  and s.first_name = 'Julia'
on conflict (student_id, program_id) do update
  set status = 'enrolled', updated_at = now();

-- Sanity check: Julia should appear in School Year + Kindergarten Co-op
select s.first_name, p.name, e.status
from public.enrollments e
join public.students s on s.id = e.student_id
join public.programs p on p.id = e.program_id
join public.organizations o on o.id = e.organization_id
where o.slug = 'rooted-meadows-demo'
  and s.family_id = '14ffb928-3922-4ece-a1e9-90d51ef4594d'
order by s.first_name, p.name;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1 — Baseline: main-portal threads (program_id IS NULL only)
-- Guardian: e9aed79e-4376-4e51-9d17-8d9b017caade
-- ═══════════════════════════════════════════════════════════════════════════════

select
  mt.id,
  mt.program_id,
  mt.participant_signature,
  mt.last_message_at
from public.message_threads mt
join public.organizations o on o.id = mt.organization_id
where o.slug = 'rooted-meadows-demo'
  and mt.participant_signature like '%e9aed79e-4376-4e51-9d17-8d9b017caade%'
order by mt.last_message_at desc nulls last;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEPS 2–3 — After sending co-op Julius Staff message in UI, expect TWO threads:
-- one program_id null (legacy/main), one program_id = co-op uuid
-- Staff member id: de361d3a-02a2-4fbb-9ed9-e102e4b1edb5
-- ═══════════════════════════════════════════════════════════════════════════════

select mt.id, mt.program_id, mt.participant_signature, mt.last_message_at
from public.message_threads mt
where mt.organization_id = (select id from public.organizations where slug = 'rooted-meadows-demo')
  and mt.participant_signature like '%de361d3a-02a2-4fbb-9ed9-e102e4b1edb5%'
order by mt.last_message_at desc;

-- Co-op inbox scope (school-wide OR co-op program_id)
select mt.id, mt.program_id, mt.participant_signature
from public.message_threads mt
join public.organizations o on o.id = mt.organization_id
where o.slug = 'rooted-meadows-demo'
  and mt.participant_signature like '%e9aed79e-4376-4e51-9d17-8d9b017caade%'
  and (mt.program_id is null or mt.program_id = '0e4d91d2-9f42-41d5-9b6f-a651cb46bd78'::uuid)
order by mt.last_message_at desc nulls last;

-- Main inbox scope (program_id IS NULL only)
select mt.id, mt.program_id, mt.participant_signature
from public.message_threads mt
join public.organizations o on o.id = mt.organization_id
where o.slug = 'rooted-meadows-demo'
  and mt.participant_signature like '%e9aed79e-4376-4e51-9d17-8d9b017caade%'
  and mt.program_id is null
order by mt.last_message_at desc nulls last;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 7 (optional rollback) — withdraw Julia from co-op for compose edge case
-- Re-run STEP 0 insert to restore.
-- ═══════════════════════════════════════════════════════════════════════════════

-- update public.enrollments e
-- set status = 'withdrawn', updated_at = now()
-- from public.organizations o, public.students s
-- where e.organization_id = o.id
--   and e.student_id = s.id
--   and o.slug = 'rooted-meadows-demo'
--   and s.family_id = '14ffb928-3922-4ece-a1e9-90d51ef4594d'
--   and s.first_name = 'Julia'
--   and e.program_id = '0e4d91d2-9f42-41d5-9b6f-a651cb46bd78'::uuid;
