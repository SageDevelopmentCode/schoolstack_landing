-- Organization progress log: September 19, 2026 — Enrollment alerts and reminder timing (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_18.sql

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
  '2026-09-19'::date,
  '07',
  'v1 launch prep',
  'Enrollment alerts and reminder timing',
  $summary$School admins receive notifications when families enroll in Friday classes. Admissions reminder emails were refined so families are not contacted too soon after starting a draft application.$summary$,
  $highlights$[
    "Friday enrollment alerts — admins know when a child signs up for a Friday class",
    "Smarter reminder timing — admissions emails wait until a family has had time to finish",
    "Messaging reliability — continued improvements from the email and notifications release"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
