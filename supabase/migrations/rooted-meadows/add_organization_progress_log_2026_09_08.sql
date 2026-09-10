-- Organization progress log: September 8, 2026 — Multi-PDF curriculum and reading experience (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_07.sql

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
  '2026-09-08'::date,
  '07',
  'v1 launch prep',
  'Multiple curriculum documents and a clearer reading experience',
  $summary$Programs can now share more than one curriculum PDF, and families can switch between school-wide and co-op portal views without getting lost. The curriculum page adds a discussion panel alongside the document so parents can comment while they read.$summary$,
  $highlights$[
    "Multiple curriculum PDFs — upload and organize several guides per program",
    "Discussion alongside the document — comment in a sidebar while viewing the PDF",
    "Portal switcher — move between school and co-op portals more clearly",
    "Guide list — pick which curriculum document to open"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
