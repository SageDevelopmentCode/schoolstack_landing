-- Organization progress log: August 20, 2026 — School admin mobile (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_17.sql

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
  '2026-08-20'::date,
  '06',
  'Mobile app',
  'School admin mobile — review applications and students on the go',
  $summary$School admins can now handle admissions from their phone. The mobile app includes a dashboard, a searchable list of application submissions, and a full detail view for each family — status, form answers, enrollment checklist progress, and payments. You can also browse enrolled students, open a child's profile, and assign their primary teacher without opening a laptop.$summary$,
  $highlights$[
    "Admin dashboard on mobile — quick entry to admissions and students",
    "Application submissions list — filter and search from your phone",
    "Full submission detail — review answers, change status, and see enrollment progress",
    "Enrolled students list — tap any child for family and program info",
    "Assign a teacher — set a student's guide right from the mobile student profile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
