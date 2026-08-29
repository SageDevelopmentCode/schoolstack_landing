-- Organization progress log: August 21, 2026 — Billing accuracy (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_20.sql

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
  '2026-08-21'::date,
  '03',
  'Tuition & billing',
  'Tuition billing accuracy improvements',
  $summary$We fixed several behind-the-scenes billing issues that could affect family balances — especially for split-billing households and late fees. Charges and payments should now settle more reliably, and duplicate late fees are prevented when multiple guardians share tuition.$summary$,
  $highlights$[
    "More reliable payment settlement — payments apply to the right charges",
    "Late fee fixes — avoids duplicate late fees on split-billing accounts",
    "Stronger charge generation — edge cases in rate plans handled correctly"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
