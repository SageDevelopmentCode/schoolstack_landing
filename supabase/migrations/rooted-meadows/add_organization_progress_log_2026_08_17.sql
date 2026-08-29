-- Organization progress log: August 17, 2026 — Mobile app launch (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_16.sql

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
  '2026-08-17'::date,
  '06',
  'Mobile app',
  'MudKitchen mobile app — sign in on your phone',
  $summary$We started the Rooted Meadows mobile app for iOS and Android. Families and school staff can download the app, walk through a short intro, pick their school, and sign in with the same secure email link you use on the web. After login, the app sends you to the right place — family portal or school admin — so phone access matches what you already have in the browser.$summary$,
  $highlights$[
    "Mobile app for iOS and Android — school-branded MudKitchen app",
    "Secure sign-in — same magic-link email login as the web portals",
    "School picker — choose Rooted Meadows after install",
    "Smart routing — lands on family or school admin based on your role",
    "Foundation for upcoming parent and admin features on mobile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
