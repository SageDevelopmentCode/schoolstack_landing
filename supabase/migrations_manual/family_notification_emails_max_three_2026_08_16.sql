-- Promoted to supabase/migrations/20260823_family_notification_emails_max_three.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-08-16: Allow up to 3 family notification emails.

alter table public.families
  drop constraint if exists families_notification_emails_max_two;

alter table public.families
  drop constraint if exists families_notification_emails_max_three;

alter table public.families
  add constraint families_notification_emails_max_three
  check (coalesce(array_length(notification_emails, 1), 0) <= 3);
