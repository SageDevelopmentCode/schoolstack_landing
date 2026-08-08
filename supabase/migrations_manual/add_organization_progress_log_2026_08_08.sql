-- Rooted Meadows build log: August 8, 2026 — Student roster and teacher assignments
-- Run in Supabase SQL Editor on remote. Safe to re-run (idempotent).

insert into public.organization_progress_log (
  organization_id,
  entry_date,
  phase_number,
  phase_title,
  title,
  summary,
  highlights
)
select
  o.id,
  '2026-08-08'::date,
  '05',
  'Teacher portal',
  'Student roster and teacher assignments — admins assign, teachers see their class',
  $summary$We connected your enrolled students to the teacher portal. School admins now have a searchable Students page with a detail panel for each child — family contacts, programs, and enrollment info in one place. You can assign a primary teacher from the student list or from the student profile. On the other side, each guide's My Students page shows only the children assigned to them, with a student profile panel for day-to-day reference. The admin dashboard also gained quick links to copy or open your apply form and other key admin pages, plus clearer in-portal notifications when applications, enrollments, or committees need attention.$summary$,
  $highlights$[
    "Enrolled students page — searchable roster with student, program, parent, and enrollment date",
    "Student detail panel — overview, family and guardians, programs, and links back to admissions",
    "Assign primary teacher — pick a guide from the students list or student profile",
    "Admin dashboard quick links — copy or open your apply link, Stripe dashboard, and key admin pages",
    "Teacher My Students — each guide sees only students assigned to them",
    "Teacher student profile — grade, family contacts, programs, and enrollment details",
    "Admin activity notifications — alerts for new applications, enrollments, payments, and committee requests"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
