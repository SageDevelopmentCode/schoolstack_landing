-- Organization progress log: October 5, 2026 — Pause Friday Branch sign-ups and rate catalog assignment (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_03.sql

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
  '2026-10-05'::date,
  '07',
  'v1 launch prep',
  'Pause Friday Branch sign-ups and rate catalog assignment',
  $summary$Admins can pause Friday Branch sign-ups when classes are full or between sessions, and parents see a clear paused message on the web and in the app. In Tuition, admins can choose which rate catalog a student is billed from, or move them to another one.$summary$,
  $highlights$[
    "Pause Friday Branch — one switch stops new sign-ups, with a Paused badge for admins",
    "Clear for parents — Friday Branch signup is paused shows on web and mobile",
    "Rate catalog assignment — assign or move a student to a specific rate catalog",
    "Catalog details — see each family's rate catalog on the Families panel"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
