-- Organization progress log: September 10, 2026 — Activity notifications, guides, charge waiving (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_09.sql

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
  '2026-09-10'::date,
  '07',
  'v1 launch prep',
  'Activity notifications, how-to guides, and tuition charge waiving',
  $summary$Parents now get a notification center that highlights new messages, bulletin posts, co-op signups, and other activity — so nothing important gets missed. We added a documentation section with searchable how-to guides for families. On the admin side, you can waive a tuition charge when a family should not be billed.$summary$,
  $highlights$[
    "Activity notifications — see what's new across messages, bulletin, and co-op updates",
    "Unread badges — know at a glance when something needs attention",
    "How-to guides — searchable help for parents in the portal",
    "Waive tuition charges — admins can remove a charge that should not apply"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
