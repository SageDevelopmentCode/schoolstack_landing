-- Organization progress log: October 6, 2026 — Failed bank payment alerts and in-app PDFs (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_05.sql

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
  '2026-10-06'::date,
  '07',
  'v1 launch prep',
  'Failed bank payment alerts and in-app PDFs',
  $summary$When a bank payment does not go through, the family and the school now both get an email so it can be sorted quickly. Forms and documents open in a PDF viewer inside the MudKitchen mobile app on iPhone and Android, and typed signatures now appear in a cursive style.$summary$,
  $highlights$[
    "Failed payment emails — families and admins are told when a bank payment fails",
    "In-app PDF viewer — open forms and documents without leaving the app, on iOS and Android",
    "Cursive signatures — typed signatures on agreements and forms look like signatures"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
