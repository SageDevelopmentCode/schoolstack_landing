-- Organization progress log: September 24, 2026 — Clearer payments in the mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_23.sql

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
  '2026-09-24'::date,
  '07',
  'v1 launch prep',
  'Clearer payments in the mobile app',
  $summary$Paying tuition in the MudKitchen mobile app is clearer. After checkout, parents land back in the app with a clear confirmation, and every charge shows a simple status. The app also lets families know when a new version is ready.$summary$,
  $highlights$[
    "Payment confirmation — see Payment received or Card saved after checking out",
    "Status tags — each charge shows Paid, Overdue, Scheduled, Late fee, or Waived",
    "Retry-friendly checkout — a checkout that could not start no longer leaves a payment stuck",
    "In-app updates — a prompt to restart when a new version of the app is available"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
