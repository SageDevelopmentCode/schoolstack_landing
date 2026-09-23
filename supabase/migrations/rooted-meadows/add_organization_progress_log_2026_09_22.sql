-- Organization progress log: September 22, 2026 — Friday Branch pricing, flyers, and schedule polish (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_21.sql

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
  '2026-09-22'::date,
  '07',
  'v1 launch prep',
  'Friday Branch pricing, flyers, and schedule polish',
  $summary$Admins can set an optional price and attach a PDF flyer to each Friday class. Parents see the cost and can open the flyer when browsing classes. Schedule editing in the admin tool is smoother, with clearer confirmation when changes are saved.$summary$,
  $highlights$[
    "Class price and flyer — optional fee and downloadable PDF per Friday class",
    "Parent enrollment view — see price and open the flyer before signing up",
    "Schedule editor polish — easier time-slot editing and clearer save feedback"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
