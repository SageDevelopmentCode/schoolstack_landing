-- One-off backfill: infer notification_kind on legacy push_notification_deliveries rows.
-- Run manually in Supabase SQL Editor after push_notification_deliveries_kind migration.
-- Safe to re-run: only updates rows where notification_kind is null.

update public.push_notification_deliveries
set notification_kind = 'message.new'
where notification_kind is null
  and thread_id is not null;

update public.push_notification_deliveries
set notification_kind = 'committee.join_request_admin'
where notification_kind is null
  and title like '% — Committee join request';

update public.push_notification_deliveries
set notification_kind = 'committee.join_approved'
where notification_kind is null
  and body = 'You''re in — open your committee workspace';

update public.push_notification_deliveries
set notification_kind = 'committee.task_assigned'
where notification_kind is null
  and body like '"%" assigned by %';

update public.push_notification_deliveries
set notification_kind = 'committee.workspace_resource'
where notification_kind is null
  and body like 'New resource added:%';

update public.push_notification_deliveries
set notification_kind = 'committee.workspace_event'
where notification_kind is null
  and body like 'New calendar event:%';

update public.push_notification_deliveries
set notification_kind = 'committee.workspace_task'
where notification_kind is null
  and body like 'New task added:%';

update public.push_notification_deliveries
set notification_kind = 'committee.message_posted'
where notification_kind is null
  and thread_id is null
  and title not like '% — Committee join request'
  and body not like 'New resource added:%'
  and body not like 'New calendar event:%'
  and body not like 'New task added:%'
  and body <> 'You''re in — open your committee workspace'
  and body not like '"%" assigned by %';
