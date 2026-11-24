-- Organization progress log: November 16, 2026 — Teacher portal and admin app redesign (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_15.sql

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
  '2026-11-16'::date,
  '07',
  'v1 launch prep',
  'Teacher portal and admin app redesign',
  $summary$The teacher portal now opens with a Today's steps list and a guided roll call that goes one student at a time, and teachers can remind families who have not yet signed up for a classroom signup. The admin experience in the MudKitchen mobile app was redesigned, and the admin web portal gained a collapsible sidebar and a quick Find a page search.$summary$,
  $highlights$[
    "Teacher Today's steps — a clear list of the day plus guided roll call",
    "Sign-up reminders — teachers nudge families by email and push",
    "Admin app redesign — Dashboard, Admissions, Students, Staff, Schedule, Photos, Staff Hours, and more",
    "Faster admin navigation — collapsible sidebar and Find a page search (Cmd+K)",
    "Teacher app redesign — Home with a time clock card, Students, Calendar, Messages, and Photos"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
