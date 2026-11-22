-- Organization progress log: November 19, 2026 — Newsletters for teachers and a new reader (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_18.sql

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
  '2026-11-19'::date,
  '07',
  'v1 launch prep',
  'Newsletters for teachers and a new reader',
  $summary$Teachers can now read school newsletters on the web and in the MudKitchen mobile app. The admin newsletter editor was rebuilt with a Before you publish checklist and the school's colours, and parents get a new full-screen reader with earlier editions close at hand. The app also recovers more gracefully on older phones.$summary$,
  $highlights$[
    "Newsletters for teachers — staff read every edition on web and mobile",
    "Rebuilt editor — a Before you publish checklist and school colours",
    "Parent reader — full-screen reading with earlier editions",
    "Steadier app — viewers recover on their own and older Android versions get an update hint instead of crashing"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
