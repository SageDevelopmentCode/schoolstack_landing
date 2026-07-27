-- Organization progress log: July 8, 2026 — Phase 01 Admissions (Rooted Meadows)
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
  '2026-07-08'::date,
  '01',
  'Admissions',
  'Enrollment checklist builder and staff scheduling tools',
  'You can now build a custom enrollment checklist for each application form — starting from ready-made templates like your enrollment agreement, health forms, and photo release. Upload your own PDFs for families to review and sign, add custom questions, and preview exactly what families will see. We also added a schedule page to view upcoming tours and interviews, plus an activity log so your team can see recent admissions actions in one place.',
  '[
    "Built an enrollment checklist editor for each application form",
    "Pre-built templates for common steps like enrollment agreement, health forms, and photo release",
    "Upload PDF documents for families to review and sign",
    "Preview the family enrollment experience before it goes live",
    "New schedule page to see upcoming tours, interviews, and shadow days",
    "Activity log showing recent admissions actions for your team"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
