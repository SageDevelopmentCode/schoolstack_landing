-- Organization progress log: September 21, 2026 — Committee attachments and parent attendance history (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_20.sql

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
  '2026-09-21'::date,
  '07',
  'v1 launch prep',
  'Committee attachments and parent attendance history',
  $summary$Committee members can now add resources, events, and tasks themselves — not just admins. Committee chat supports file attachments so groups can share PDFs and images. Parents can view their child's attendance history on the MudKitchen mobile app.$summary$,
  $highlights$[
    "Member contributions — active committee members add resources, events, and tasks",
    "Message attachments — share PDFs and images in committee conversations",
    "Parent attendance history — see past attendance records per child on mobile",
    "Refreshed app icon — updated MudKitchen icon on iOS and Android"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
