-- Organization progress log: November 14, 2026 — New parent navigation and admin Dashboard (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_13.sql

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
  '2026-11-14'::date,
  '07',
  'v1 launch prep',
  'New parent navigation and admin Dashboard',
  $summary$Parents have new navigation with a notifications bell, a portal switcher for the co-op, and a profile menu, and the child record, Forms, Attendance, Photos, and Classroom signups pages were redesigned. Admins have a new Dashboard with a Today's focus list, setup progress, key numbers, and a live attendance board.$summary$,
  $highlights$[
    "Parent navigation — notifications bell, portal switcher, and profile menu",
    "Redesigned parent pages — child record, Forms, Attendance, Photos, Classroom signups, and the applicant dashboard",
    "Admin Today's focus — a list of what needs doing today",
    "Attendance board — mark present or record pickup in one click from the Dashboard"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
