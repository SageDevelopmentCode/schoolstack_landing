-- Organization progress log: September 6, 2026 — Tuition autopay reliability (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_05.sql

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
  '2026-09-06'::date,
  '07',
  'v1 launch prep',
  'More reliable tuition autopay',
  $summary$We tightened how autopay matches guardians to billing records so scheduled payments run correctly for the right family member.$summary$,
  $highlights$[
    "Autopay guardian matching — payments charge the correct parent or guardian",
    "Billing reliability — fewer edge cases when a family has multiple guardians on file"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
