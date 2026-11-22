-- Organization progress log: October 15, 2026 — Faster apply page and safer bank payment handling (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_06.sql

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
  '2026-10-15'::date,
  '07',
  'v1 launch prep',
  'Faster apply page and safer bank payment handling',
  $summary$The online application loads faster, with a branded loading screen and each program's form loading only when a family picks it. Behind the scenes, a bank payment that fails after first showing as paid now reopens the charge correctly and can never be processed twice.$summary$,
  $highlights$[
    "Faster apply page — branded loading and per-program forms that load on demand",
    "Clear messages — families see a helpful note if a program is no longer offered",
    "Safer bank payments — failed ACH payments reopen the charge correctly",
    "No double processing — repeated payment notices are handled only once"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
