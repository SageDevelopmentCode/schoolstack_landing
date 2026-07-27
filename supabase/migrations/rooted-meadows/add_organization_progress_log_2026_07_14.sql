-- Organization progress log: July 14, 2026 — Phase 02 Foundation (Rooted Meadows)
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
  '2026-07-14'::date,
  '02',
  'Foundation',
  'Imported real applications and added answer review',
  'We kicked off Phase 2 by bringing your first real family records into MudKitchen — applications from your prior forms are now proper student, family, and application records instead of living only in PDFs. From the admissions panel, your team can open any submission to read the full application answers and download a PDF copy for your files.',
  '[
    "Phase 2 (Foundation) started — bringing existing records into your school",
    "Imported submitted applications from your prior forms into family and student records",
    "View full application answers from any submission in the admissions detail panel",
    "Download a PDF copy of any application for your records"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
