-- Organization progress log: October 21, 2026 — Photos in the mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_20.sql

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
  '2026-10-21'::date,
  '07',
  'v1 launch prep',
  'Photos in the mobile app',
  $summary$School Photos arrived in the MudKitchen mobile app for everyone. Admins can upload, browse, and change a photo's date from their phone, and teachers and parents, including co-op families, can view the gallery on the go.$summary$,
  $highlights$[
    "Admin photos on mobile — upload, grid view, full-screen viewer, and date changes",
    "Teacher and parent galleries — browse school photos in the app, including in the co-op portal",
    "Support on Home — a MudKitchen Support messages card for parents and teachers"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
