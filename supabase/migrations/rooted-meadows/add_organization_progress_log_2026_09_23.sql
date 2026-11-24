-- Organization progress log: September 23, 2026 — Friday Branch in the mobile app and account controls (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_22.sql

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
  '2026-09-23'::date,
  '07',
  'v1 launch prep',
  'Friday Branch in the mobile app and account controls',
  $summary$Friday Branch now lives in the MudKitchen mobile app. Parents can browse the Friday class schedule, open class flyers, and see a Friday Branch card on Home, while admins can manage time slots and email class rosters from their phones. Parents and teachers can also request account deletion right from the app.$summary$,
  $highlights$[
    "Friday Branch for parents on mobile — class schedule, class details, and flyers in the app",
    "Friday Branch for admins on mobile — add time slots, edit classes, and email a class roster",
    "Account controls — request account deletion from the Account screen",
    "Committee task alerts — people are notified when a committee task is assigned to them"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
