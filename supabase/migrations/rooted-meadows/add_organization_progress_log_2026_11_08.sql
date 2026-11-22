-- Organization progress log: November 8, 2026 — Adjust hours (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_07.sql

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
  '2026-11-08'::date,
  '07',
  'v1 launch prep',
  'Adjust hours',
  $summary$Teachers can now add or fix time clock sessions for past days from a new Adjust hours panel, so a forgotten clock-in is easy to correct. School-wide lists like staff and the tuition catalog are now visible only to staff.$summary$,
  $highlights$[
    "Adjust hours — add or correct clocked sessions for earlier days",
    "Tighter access — staff lists and the tuition catalog are staff-only",
    "Accurate totals — day totals include sessions still in progress"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
