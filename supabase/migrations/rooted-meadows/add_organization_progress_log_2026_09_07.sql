-- Organization progress log: September 7, 2026 — Admin dashboard and curriculum PDF viewer (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_06.sql

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
  '2026-09-07'::date,
  '07',
  'v1 launch prep',
  'Admin dashboard refresh and in-portal curriculum PDF viewer',
  $summary$The admin home screen now surfaces recent activity, payment history, and quick links to common tasks. Co-op families can read their program curriculum PDF right inside the portal, with a table of contents to jump to any section.$summary$,
  $highlights$[
    "Activity feed — see what's happening across admissions, billing, and portal activity",
    "Payment history — view recent tuition payments without opening each family",
    "Curriculum PDF viewer — read co-op guides in the browser with a clickable outline",
    "How-to guides on admin home — quick links to common admin tasks"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
