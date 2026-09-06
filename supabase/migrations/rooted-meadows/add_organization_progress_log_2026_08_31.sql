-- Organization progress log: August 31, 2026 — Schedule, calendar, classroom signups (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_30.sql

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
  '2026-08-31'::date,
  '05',
  'Teacher portal',
  'Schedule overview, school calendar, and classroom volunteer signups',
  $summary$We redesigned the admin schedule page with a clearer overview of tours, shadow days, and upcoming visits. Your team can now manage a full school events calendar and control who can create events. Teachers can set up classroom volunteer signups — families get a prompt on their home screen and can pick a slot or role right from the portal.$summary$,
  $highlights$[
    "Schedule overview tab — open slots, shadow days, and upcoming visits in one place",
    "School events calendar — create and manage school-wide events on a month or week view",
    "Event permissions — choose which staff can manage the calendar",
    "Classroom signups — teachers publish volunteer slots; families respond from home",
    "Teacher calendar — guides see their schedule in the same calendar experience"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
