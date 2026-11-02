-- Manual mirror: expand push notification_kind for newsletter published.
-- Run after: add_committee_projects_2026_11_01.sql (or latest manual newsletter-related migration)

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
      'attendance.pickup'
    )
  );
