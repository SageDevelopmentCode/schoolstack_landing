-- Organization progress log: July 24, 2026 — Phase 03 Tuition & billing (Rooted Meadows)
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
  '2026-07-24'::date,
  '03',
  'Tuition & billing',
  'Enrollment checklist saves progress — tuition billing automation begins',
  'Families working through enrollment can now save their checklist and come back to the same step later, so they don''t have to start over. Your team can also update checklist items from the admin side. On the billing side, we laid the groundwork for automated tuition — charges can generate on a schedule, you can email invoices to families, and families can turn on autopay or get reminders when a payment is due.',
  '[
    "Families save enrollment checklist progress and pick up where they left off",
    "Your team can update checklist steps from the admin portal",
    "Automated tuition billing — charges generate on schedule without manual entry",
    "Send tuition invoices to families by email",
    "Autopay and payment reminders help families stay current"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
