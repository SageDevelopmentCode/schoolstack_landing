-- Organization progress log: September 2, 2026 — Per-program apply forms, faster admissions (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_31.sql

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
  '2026-09-02'::date,
  '01',
  'Admissions',
  'Separate apply forms per program and faster admissions workspace',
  $summary$Each program can now have its own application form and enrollment checklist instead of sharing one school-wide form. Families choose which program they are applying to when they start. On the admin side, the applications page and dashboard load faster and surface what needs attention — including whether a family has logged into the parent portal.$summary$,
  $highlights$[
    "Per-program apply forms — build and attach a unique form to each program",
    "Program enrollment flows — see each program's form and checklist together in the builder",
    "Program picker for families — choose the right program when applying",
    "Faster submissions page — loads in stages so you are not waiting on a blank screen",
    "Parent login indicator — see at a glance whether an applying family has signed in"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
