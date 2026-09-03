-- Revert Holly Evensen / Autumn Evensen (rooted-meadows) from enrolling → submitted.
-- Date: 2026-09-02
-- Safe to re-run: guarded by status checks.
--
-- Target org: rooted-meadows (8adbfe08-b25b-4626-b3ac-23424a1a0a3b)
-- Application: 700bd103-0daa-47d2-8cd9-810029e4db8c
-- Enrollment:  21cd5266-d68e-4075-95a8-216a7122112b
-- Run in Supabase SQL Editor.

begin;

-- Pre-flight: confirm the target row before mutating
select
  s.first_name || ' ' || s.last_name as student,
  g.first_name || ' ' || g.last_name as contact,
  g.email,
  a.id as application_id,
  a.status as application_status,
  a.fee_status,
  a.submitted_at,
  e.id as enrollment_id,
  ec.id as checklist_id
from public.applications a
join public.organizations o on o.id = a.organization_id
join public.students s on s.id = a.student_id
left join public.guardians g on g.id = a.primary_guardian_id
left join public.enrollments e
  on e.organization_id = a.organization_id
 and e.student_id = a.student_id
 and e.program_id = a.program_id
left join public.enrollment_checklists ec on ec.application_id = a.id
where a.id = '700bd103-0daa-47d2-8cd9-810029e4db8c'
  and o.slug = 'rooted-meadows';

-- Remove enrollment artifacts (cascades checklist, items, tuition assignment)
delete from public.enrollments
where id = '21cd5266-d68e-4075-95a8-216a7122112b'
  and organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';

-- Restore application status to submitted (fee_status/submitted_at left as-is)
update public.applications
set status = 'submitted',
    updated_at = now()
where id = '700bd103-0daa-47d2-8cd9-810029e4db8c'
  and organization_id = '8adbfe08-b25b-4626-b3ac-23424a1a0a3b'
  and status in ('enrolling', 'accepted');

commit;

-- Post-flight: expect submitted / paid fee / no checklist / no enrollment
select
  s.first_name,
  s.last_name,
  a.status as application_status,
  a.fee_status,
  a.submitted_at,
  e.id as enrollment_id,
  ec.id as checklist_id
from public.applications a
join public.students s on s.id = a.student_id
left join public.enrollments e
  on e.organization_id = a.organization_id
 and e.student_id = a.student_id
 and e.program_id = a.program_id
left join public.enrollment_checklists ec on ec.application_id = a.id
where a.id = '700bd103-0daa-47d2-8cd9-810029e4db8c';
