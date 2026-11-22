-- Organization progress log: November 12, 2026 — Hours polish and application PDF fix (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_10.sql

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
  '2026-11-12'::date,
  '07',
  'v1 launch prep',
  'Hours polish and application PDF fix',
  $summary$The staff time clock is sturdier: saving an hours change is all-or-nothing, overlapping sessions are blocked, and teachers can step back through earlier weeks. Downloading an application as a PDF works again for admins.$summary$,
  $highlights$[
    "All-or-nothing saves — a failed save never leaves a day half-changed",
    "Overlap protection — sessions can no longer overlap",
    "Earlier weeks — teachers can browse back through past weeks",
    "Application PDFs — admins can download applications as PDFs again"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
