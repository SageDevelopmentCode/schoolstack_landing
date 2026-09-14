-- Rooted Meadows build logs: September 11–13, 2026 (3 entries)
-- Paste into Supabase SQL Editor after add_organization_progress_log_2026_09_10.sql
-- Idempotent — safe to re-run.

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

-- Organization progress log: September 12, 2026 — Co-op family roster and smarter tuition billing (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_11.sql

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
  '2026-09-12'::date,
  '07',
  'v1 launch prep',
  'Co-op family roster and smarter tuition billing',
  $summary$Admins can browse every family in a co-op program and quickly see who still needs supply items or teaching slots. Tuition also handles mid-year enrollments better, with clearer split-billing details when multiple guardians share the cost.$summary$,
  $highlights$[
    "Co-op families view — see enrollment, supply, and teaching status for each family",
    "Late enrollment billing — tuition start dates adjust when a family joins mid-year",
    "Split billing summary — see how costs are divided between guardians",
    "Smoother curriculum reading — PDF viewer improvements in the co-op portal"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

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
