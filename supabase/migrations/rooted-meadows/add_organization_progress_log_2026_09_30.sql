-- Organization progress log: September 30, 2026 — Co-op program in the mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_29.sql

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
  '2026-09-30'::date,
  '07',
  'v1 launch prep',
  'Co-op program in the mobile app',
  $summary$Co-op families can now switch into their co-op program in the MudKitchen mobile app, with a banner showing which portal they are in and a Home built around the co-op. Committees also show unread markers on each section so members can see what is new.$summary$,
  $highlights$[
    "Co-op portal on mobile — switch into the co-op with Overview, Family, Co-op, and Learn tabs",
    "Clear context — a Viewing Co-op banner shows which program you are in",
    "Committee unread markers — see new messages, tasks, resources, and events at a glance"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
