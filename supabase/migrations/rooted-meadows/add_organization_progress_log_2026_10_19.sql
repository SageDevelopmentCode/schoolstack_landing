-- Organization progress log: October 19, 2026 — School Profile and smarter visit reminders (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_18.sql

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
  '2026-10-19'::date,
  '07',
  'v1 launch prep',
  'School Profile and smarter visit reminders',
  $summary$A new School Profile keeps the school's details in one place: about and links, campus address, phones, emails, hours, directions, parking notes, and up to five school photos. Visit emails now pull from it, families get a reminder on the day of their visit, and applicants with open next steps get a gentle follow-up.$summary$,
  $highlights$[
    "School Profile — about, address, phones, emails, hours, directions, and parking notes",
    "School photos — up to five photos to show off the campus",
    "Day-of visit reminders — tours and observations get a same-day reminder with school contact details",
    "Application follow-ups — up to two reminders for families with required next steps"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
