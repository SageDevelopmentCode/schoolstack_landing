-- Family-level notification email overrides for parent portal (up to 2 addresses).
-- Run after: 20260821_add_document_template_content_revision.sql

alter table public.families
  add column if not exists notification_emails text[] not null default '{}';

alter table public.families
  drop constraint if exists families_notification_emails_max_two;

alter table public.families
  add constraint families_notification_emails_max_two
  check (coalesce(array_length(notification_emails, 1), 0) <= 2);
