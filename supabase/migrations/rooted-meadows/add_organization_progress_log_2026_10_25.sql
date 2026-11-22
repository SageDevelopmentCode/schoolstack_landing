-- Organization progress log: October 25, 2026 — Dashboard tabs, enrollment flows, and a newsletter workspace (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_22.sql

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
  '2026-10-25'::date,
  '07',
  'v1 launch prep',
  'Dashboard tabs, enrollment flows, and a newsletter workspace',
  $summary$The admin Dashboard is organised into Today, Journey, Activity, and Guides so it is easier to see what needs attention. A new Enrollment Flows overview shows each program's forms and steps, and a first newsletter workspace lets admins draft newsletters with stories, events, and reminders. Admins can also book a tour or observation for a family themselves.$summary$,
  $highlights$[
    "Dashboard tabs — Today, Journey, Activity, and Guides",
    "Enrollment Flows — one card per program showing its forms, steps, and what needs attention",
    "Newsletter workspace — three layouts with stories, events, reminders, and a preview",
    "Book a visit for a family — admins can schedule a tour or observation slot for a family or guest"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
