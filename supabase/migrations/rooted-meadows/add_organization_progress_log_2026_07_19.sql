-- Organization progress log: July 19, 2026 — Phase 02 Foundation (Rooted Meadows)
-- Run after: add_product_organization_progress_log.sql (or add_product_timeline_bootstrap.sql)

insert into public.organization_progress_log (
  organization_id,
  entry_date,
  phase_number,
  phase_title,
  title,
  summary,
  highlights
)
values (
  'c14e04d2-d39a-4704-af0a-847edae8220a'::uuid,
  '2026-07-19'::date,
  '02',
  'Foundation',
  'Stronger application submissions and fee payments',
  'We hardened the application pipeline so families cannot accidentally submit an incomplete application, and fee payments are handled more reliably. Required student fields, custom questions, and acknowledgments are all checked before submit — with clear messages when something is missing. Checkout and payment confirmation were also tightened to handle edge cases more safely, and we expanded automated testing on the apply flow to catch regressions early.',
  '[
    "Applications cannot be submitted until required fields and acknowledgments are complete",
    "Clearer validation messages when a family misses a required step",
    "More reliable application fee checkout and payment confirmation",
    "Mobile dropdown fields on the apply form polished further",
    "Expanded automated test coverage for apply and admissions flows"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
