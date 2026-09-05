-- Organization progress log: September 3, 2026 — Program parent portals, apply entry, tuition (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_02.sql

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
  '2026-09-03'::date,
  '07',
  'v1 launch prep',
  'Program-specific parent portals and a clearer apply starting point',
  $summary$Programs like your co-op can now have their own parent portal with a custom set of features, separate from the main school portal. Families land on one apply page, sign in, then pick which program to apply to. We also refreshed the tuition workspace for admins with a cleaner family sidebar and tab layout.$summary$,
  $highlights$[
    "Program parent portals — enable a dedicated portal per program with its own features and address",
    "Portal preview — admins can preview what families will see before going live",
    "One apply entry point — families sign in once, then choose their program",
    "Tuition workspace refresh — redesigned layout for rates, payments, and family billing",
    "Context-aware preview — family preview shows the right portal for each program"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
