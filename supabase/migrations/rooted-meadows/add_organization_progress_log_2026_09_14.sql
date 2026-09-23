-- Organization progress log: September 14, 2026 — Committees, school bulletin, and mobile admin tools (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_13.sql

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
  '2026-09-14'::date,
  '07',
  'v1 launch prep',
  'Committees, school bulletin, and mobile admin tools',
  $summary$School admins can set up parent committees and publish school bulletin posts from the MudKitchen mobile app. Parents can browse committees and request to join from their phone, respond to classroom volunteer sign-ups, and choose which email addresses receive school notifications.$summary$,
  $highlights$[
    "Committee hub — admins create committees on the web; parents browse and request to join from mobile",
    "School bulletin on mobile — admins write and publish posts from the app",
    "Staff roster on mobile — browse team members and portal login status",
    "Notification email preferences — parents pick which addresses get school emails",
    "Classroom volunteer sign-ups — parents respond to teacher requests from mobile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
