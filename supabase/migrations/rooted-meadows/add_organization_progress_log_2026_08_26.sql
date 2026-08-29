-- Organization progress log: August 26, 2026 — Schedule availability (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_24.sql

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
  '2026-08-26'::date,
  '01',
  'Admissions',
  'Clearer tour and observation day scheduling',
  $summary$We improved how your team sets and reads admissions availability. The schedule calendar now uses a clear legend — which days are open, which already have a booking, and which are blocked — on both the web admin and the mobile schedule. Editing tour slots and observation-day availability is simpler and less error-prone.$summary$,
  $highlights$[
    "Calendar legend — open days, booked days, and blocked days at a glance",
    "Improved month view — easier to scan availability across weeks",
    "Tour availability editor — clearer controls for setting open slots",
    "Observation day availability — same improvements for shadow visits",
    "Matches on mobile — school admin schedule uses the same visual language"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
