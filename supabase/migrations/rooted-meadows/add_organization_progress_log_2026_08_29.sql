-- Organization progress log: August 29, 2026 — Teachers, reminders, admissions (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_26.sql

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
  '2026-08-29'::date,
  '05',
  'Teacher portal',
  'Multiple teachers per student, draft reminders, and clearer admissions queue',
  $summary$Students can now have more than one assigned guide — useful when co-teaching or covering specialties. School admins assign teachers from an improved picker on web and mobile, and parents see all assigned teachers on each child's profile. Families who start but don't finish an application get a friendly reminder email after a day or two. On the admissions submissions page, applications that still need your attention are highlighted so nothing sits unnoticed.$summary$,
  $highlights$[
    "Multiple teachers per student — assign more than one guide to a child",
    "Improved assignment picker — search and select teachers on web and mobile",
    "Parents see assigned teachers — new Teachers tab on each child's profile",
    "Draft application reminders — automatic email nudge for unfinished applications",
    "Action-needed highlighting — submitted and in-review applications stand out in the admin list"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
