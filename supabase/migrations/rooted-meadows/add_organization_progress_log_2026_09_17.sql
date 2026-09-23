-- Organization progress log: September 17, 2026 — Friday Branch scheduling and parent enrollment (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_16.sql

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
  '2026-09-17'::date,
  '07',
  'v1 launch prep',
  'Friday Branch scheduling and parent enrollment',
  $summary$Co-op families can now browse and sign up for Friday classes. Admins build the schedule by block and semester, track capacity and waitlists, and parents enroll or withdraw from the parent portal. A Friday Branch section on the parent home page highlights open classes when the feature is turned on.$summary$,
  $highlights$[
    "Schedule builder — admins arrange Friday classes by time block and semester",
    "Parent enrollment — browse open classes, see spots left, enroll or join the waitlist",
    "Capacity tracking — confirmed, waitlisted, and withdrawn status stays up to date",
    "Home page card — parents see Friday Branch when classes are available"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
