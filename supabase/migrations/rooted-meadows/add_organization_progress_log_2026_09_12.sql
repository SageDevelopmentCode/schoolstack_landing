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
