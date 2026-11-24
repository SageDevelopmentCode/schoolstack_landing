-- Organization progress log: November 17, 2026 — My Hours refresh and a new app intro (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_16.sql

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
  '2026-11-17'::date,
  '07',
  'v1 launch prep',
  'My Hours refresh and a new app intro',
  $summary$My Hours for teachers has a clearer On the clock / Off the clock card. Sign-up reminders are limited to one per hour, and teachers are told if no family could be reached. The MudKitchen mobile app now opens with a short intro that walks through a school day before sign-in.$summary$,
  $highlights$[
    "Time clock card — On the clock or Off the clock at a glance",
    "Considerate reminders — at most one sign-up reminder per hour, with feedback if nobody was reached",
    "App intro — a short walkthrough of the time clock, attendance, and messages"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
