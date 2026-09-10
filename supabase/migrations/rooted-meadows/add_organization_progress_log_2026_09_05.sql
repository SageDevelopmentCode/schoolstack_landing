-- Organization progress log: September 5, 2026 — Bulletin polish, messages, committees (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_04.sql

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
  '2026-09-05'::date,
  '07',
  'v1 launch prep',
  'Bulletin attachments, messages polish, and committee descriptions',
  $summary$Families and staff can now open bulletin attachments without leaving the portal. We cleaned up parent and teacher home screens and made message threads more reliable when starting a conversation. When creating a committee, admins can add a short description so members know what the group is for.$summary$,
  $highlights$[
    "Bulletin attachments — preview images and files directly from school updates",
    "Cleaner home screens — parent and teacher dashboards are easier to scan",
    "Message thread fixes — starting a conversation is more reliable",
    "Committee descriptions — add context when creating a new committee"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
