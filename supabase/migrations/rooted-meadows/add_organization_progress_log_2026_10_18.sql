-- Organization progress log: October 18, 2026 — School Photos (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_15.sql

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
  '2026-10-18'::date,
  '07',
  'v1 launch prep',
  'School Photos',
  $summary$Rooted Meadows now has a school photo gallery. Admins can upload photos in batches grouped by date, teachers can share photos from their classrooms, and parents can browse the gallery in their portal.$summary$,
  $highlights$[
    "Admin photo uploads — add photos in batches, grouped by date, with edit and delete",
    "Teacher uploads — staff share photos and manage the ones they added",
    "Parent gallery — families browse school photos in the parent portal",
    "Smarter committee alerts — tapping a committee notification opens the right workspace"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
