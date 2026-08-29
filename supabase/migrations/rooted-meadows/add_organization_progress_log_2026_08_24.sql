-- Organization progress log: August 24, 2026 — Mobile polish + portal help (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_23.sql

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
  '2026-08-24'::date,
  '07',
  'v1 launch prep',
  'Mobile polish and Need Help button in every portal',
  $summary$We refined the mobile app navigation with a floating tab bar, smoother screen transitions, and account settings including notification preferences. We also added a Need Help? button to the apply form, parent portal, and school admin — families and staff can send a quick support message without hunting for a contact email.$summary$,
  $highlights$[
    "Floating tab bar on mobile — easier thumb navigation between main sections",
    "Account and notification settings — manage preferences from the More menu",
    "Smoother animations — less jank when moving between screens",
    "Need Help? button — available on apply, parent, and admin portals",
    "One-tap support requests — sends your message and current page to the MudKitchen team"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
