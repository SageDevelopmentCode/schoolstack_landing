-- Promoted to supabase/migrations/20261137_expand_push_notification_kinds.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

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
      'committee.workspace_task',
      'bulletin.published',
      'gallery.photos_uploaded',
      'attendance.present',
      'attendance.pickup'
    )
  );
