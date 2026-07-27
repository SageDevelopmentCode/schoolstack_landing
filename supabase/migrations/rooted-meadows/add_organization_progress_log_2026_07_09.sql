-- Organization progress log: July 9, 2026 — Phase 01 Admissions (Rooted Meadows)
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
  '2026-07-09'::date,
  '01',
  'Admissions',
  'Families can now complete enrollment after acceptance',
  'When you accept an application, you can now kick off enrollment with one click. You choose the right enrollment agreement for that student — like your standard agreement or the conditional support agreement — and the family receives a personalized checklist with just the steps they need. Families work through it from their apply page, and you can see their progress from the submission detail view.',
  '[
    "Start enrollment directly from an accepted application",
    "Choose the correct enrollment agreement when enrollment begins",
    "Families get a personalized checklist on their apply page",
    "Shared steps like health forms and photo release stay the same for everyone",
    "Track enrollment progress from each submission in admin"
  ]'::jsonb

from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
