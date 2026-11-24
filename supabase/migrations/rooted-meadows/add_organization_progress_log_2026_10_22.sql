-- Organization progress log: October 22, 2026 — Co-op curriculum and teaching schedule in the app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_21.sql

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
  '2026-10-22'::date,
  '07',
  'v1 launch prep',
  'Co-op curriculum and teaching schedule in the app',
  $summary$Co-op families can now open the curriculum, supply list, and their teaching schedule in the MudKitchen mobile app. Billing, calendar, and Friday Branch screens in the co-op portal were refreshed, and committee workspaces got a mobile-friendly menu on the web.$summary$,
  $highlights$[
    "Curriculum on mobile — read the co-op curriculum in the app",
    "Supply list and teaching schedule — see what to bring and when you teach",
    "Committee menu — committee workspaces are easier to navigate on a phone browser",
    "Smoother loading — placeholders while committees, curriculum, and PDFs load"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
