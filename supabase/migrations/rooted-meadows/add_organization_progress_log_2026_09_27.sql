-- Organization progress log: September 27, 2026 — Edit and delete messages (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_24.sql

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
  '2026-09-27'::date,
  '07',
  'v1 launch prep',
  'Edit and delete messages',
  $summary$Families, teachers, and admins can now fix a typo or take back a message. Sent messages can be edited on the web and in the MudKitchen mobile app, and messages can be deleted from the app.$summary$,
  $highlights$[
    "Edit sent messages — corrections are marked as edited so everyone knows",
    "Edit and delete on mobile — a quick menu on each of your own messages",
    "Clear deleted state — removed messages show Message has been deleted"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
