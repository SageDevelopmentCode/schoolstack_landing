-- Raise family notification email cap from 2 to 3 (login + 2 others).
-- Run after: 20260822_add_family_notification_emails.sql

alter table public.families
  drop constraint if exists families_notification_emails_max_two;

alter table public.families
  drop constraint if exists families_notification_emails_max_three;

alter table public.families
  add constraint families_notification_emails_max_three
  check (coalesce(array_length(notification_emails, 1), 0) <= 3);
