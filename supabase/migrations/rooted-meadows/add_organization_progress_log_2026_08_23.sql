-- Organization progress log: August 23, 2026 — Parent mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_22.sql

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
  '2026-08-23'::date,
  '06',
  'Mobile app',
  'Parent mobile app — home, billing, messages, and children',
  $summary$Families now have a full parent experience in the mobile app. The home screen surfaces what needs attention — balances, messages, and enrollment updates. Parents can pay tuition and view receipts, read and send messages with the school, check the school calendar, and open each child's profile to work through enrollment checklist items or update a profile photo.$summary$,
  $highlights$[
    "Parent home screen — balances, alerts, and quick links at a glance",
    "Pay tuition on mobile — view charges, pay now, and open payment receipts",
    "Messages — family inbox with real-time threads, same as the web portal",
    "School calendar — upcoming events in week or month view",
    "My Children — each child's profile, checklist steps, and profile photo"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
