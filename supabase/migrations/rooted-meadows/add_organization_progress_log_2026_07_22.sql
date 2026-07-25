-- Organization progress log: July 22, 2026 — Phase 03 Tuition & billing (Rooted Meadows)
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
  '2026-07-22'::date,
  '03',
  'Tuition & billing',
  'Tuition & billing is here — set up rates, assign families, and let parents pay online',
  'We kicked off Phase 3 by building your full tuition and billing system. Your team can now set up tuition plans step by step — choose the program and school year, enter your rates (including different tiers like standard tuition or financial aid), pick payment schedules families can choose from, and add any extra fees. Once a plan is active, you can assign it to enrolled families, see who owes what, and record payments your team receives outside the system. Families also get a new step during enrollment to pick their payment plan with a clear schedule preview, plus a Billing page in the parent portal where they can view invoices, pay online, and turn on autopay.',
  '[
    "Guided tuition setup wizard — program, rates, payment schedules, fees, then review and activate",
    "Support for multiple rate tiers (e.g. standard tuition and financial aid amounts)",
    "Families choose their payment plan during enrollment, with a clear schedule preview",
    "New Tuition section in your admin — rate catalog, family balances, and per-family adjustments",
    "Parent Billing page — families view invoices, pay online, and manage autopay",
    "Your team can record manual payments and see collected vs. outstanding totals at a glance"
  ]'::jsonb
)
on conflict (organization_id, entry_date) do nothing;
