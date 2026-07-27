-- Organization progress log: July 3, 2026 — Phase 01 Admissions (Rooted Meadows)
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
select
  o.id,
  '2026-07-03'::date,
  '01',
  'Admissions',
  'Your application form is ready to share',
  'We finished building your admissions application form with all the sections families will fill out — academic history, parent information, getting to know your child, and more. Families can now start an application through a public link, and you can preview the full form in your admin dashboard before publishing it.',
  '[
    "Built all application sections families will complete when applying",
    "Set up your public apply link so families can start online",
    "Added document upload for transcripts and school reports",
    "Added a preview in admin so you can review the form before going live"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
