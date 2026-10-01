-- Backfill committee.message.posted activity_events for existing committee_messages
-- that have no matching activity row. Safe to run multiple times.
-- Date: 2026-09-30

insert into public.activity_events (
  organization_id,
  actor_type,
  actor_user_id,
  actor_name,
  surface,
  action,
  entity_type,
  entity_id,
  summary,
  metadata,
  severity,
  created_at
)
select
  c.organization_id,
  case when msg.sender_member_id is null then 'school_admin' else 'parent' end,
  coalesce(cm.user_id, null),
  coalesce(cm.display_name, 'School Admin'),
  case when msg.sender_member_id is null then 'school_admin' else 'parent_portal' end,
  'committee.message.posted',
  'committee_message',
  msg.id,
  'New message posted: "' || left(
    coalesce(nullif(trim(msg.body), ''), 'Attachment'),
    77
  ) || case when length(coalesce(nullif(trim(msg.body), ''), 'Attachment')) > 77 then '…' else '' end || '"',
  jsonb_build_object(
    'committeeId', c.id,
    'committeeName', c.name,
    'messagePreview', left(coalesce(nullif(trim(msg.body), ''), 'Attachment'), 80),
    'actorMemberId', msg.sender_member_id
  ),
  'info',
  msg.created_at
from public.committee_messages msg
join public.committees c on c.id = msg.committee_id
left join public.committee_members cm on cm.id = msg.sender_member_id
where not exists (
  select 1
  from public.activity_events ae
  where ae.action = 'committee.message.posted'
    and ae.entity_id = msg.id
);
