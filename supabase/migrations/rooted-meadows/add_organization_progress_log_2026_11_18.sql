-- Organization progress log: November 18, 2026 — Redesigned apply experience and a Family view builder (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_17.sql

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
  '2026-11-18'::date,
  '07',
  'v1 launch prep',
  'Redesigned apply experience and a Family view builder',
  $summary$Families applying to Rooted Meadows see a redesigned application form, sign-in step, and tour booking. Admins can now edit the application form and checklist in a Family view that shows exactly what families will see, with a stage bar and a final review step to catch anything that needs fixing.$summary$,
  $highlights$[
    "New apply experience — redesigned application, sign-in, and tour booking",
    "Family view builder — edit forms on a live preview of the family experience",
    "Stage bar and final review — step through setup and catch anything that needs a fix"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
