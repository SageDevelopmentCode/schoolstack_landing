-- Tag mobile push delivery rows with a stable notification kind for admin analytics.
-- Run after: 20261013_add_push_notification_deliveries.sql

alter table public.push_notification_deliveries
  add column if not exists notification_kind text;

alter table public.push_notification_deliveries
  drop constraint if exists push_notification_deliveries_notification_kind_check;

alter table public.push_notification_deliveries
  add constraint push_notification_deliveries_notification_kind_check
  check (
    notification_kind is null
    or notification_kind in (
      'message.new',
      'committee.join_request_admin',
      'committee.join_approved',
      'committee.task_assigned',
      'committee.message_posted',
      'committee.workspace_resource',
      'committee.workspace_event',
      'committee.workspace_task'
    )
  );

create index if not exists push_notification_deliveries_kind_created_idx
  on public.push_notification_deliveries (notification_kind, created_at desc);

create index if not exists push_notification_deliveries_org_kind_created_idx
  on public.push_notification_deliveries (organization_id, notification_kind, created_at desc);
