-- Organization progress log: September 11, 2026 — Classroom volunteer sign-ups (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_10.sql

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
  '2026-09-11'::date,
  '07',
  'v1 launch prep',
  'Classroom volunteer sign-ups',
  $summary$Teachers can set up volunteer sign-up sheets with a guided wizard, and parents get a dedicated page to see requests and respond — making it easier to coordinate classroom help.$summary$,
  $highlights$[
    "Teacher setup wizard — create volunteer opportunities in a few guided steps",
    "Parent sign-ups page — families see all classroom volunteer requests in one place",
    "Clearer signup details — view what's needed and respond without digging through menus"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
