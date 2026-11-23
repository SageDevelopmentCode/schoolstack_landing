-- Expand push notification_kind for classroom signup reminders and staff hours
-- adjustment reviews. Both are sent from code (MOBILE_PUSH_NOTIFICATION_KINDS)
-- but their delivery logs were rejected by the check constraint (23514).
-- Run after: 20261141_expand_push_newsletter_kind.sql

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
      'newsletter.published',
      'attendance.present',
      'attendance.pickup',
      'staff_hours.adjustment_reviewed',
      'classroom_signup.reminder'
    )
  );
