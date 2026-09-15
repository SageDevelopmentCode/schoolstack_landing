-- Organization progress log: September 13, 2026 — Mobile app redesign (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_12.sql

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
  '2026-09-13'::date,
  '07',
  'v1 launch prep',
  'Mobile app redesign',
  $summary$The MudKitchen mobile app got a major refresh. Parents land on a clearer home screen with important tasks up front, plus redesigned billing, calendar, and child records. School admins get the same updated look across schedule, students, classrooms, transactions, and messages — and can reach out for help directly from the dashboard.$summary$,
  $highlights$[
    "Parent home — a Start here section highlights enrollment tasks and urgent items",
    "Mobile billing — balances, payment plans, and receipts organized by child",
    "Calendar and child records — day/week calendar view and a cleaner children overview",
    "Admin screens refreshed — schedule, students, classrooms, transactions, and messages",
    "In-app support — admins can send a help request without leaving the app"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
