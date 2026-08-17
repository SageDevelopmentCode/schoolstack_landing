-- Promoted to supabase/migrations/20260822_add_family_notification_emails.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-08-16
-- Purpose: Let families configure up to 2 notification email addresses in the parent portal.

alter table public.families
  add column if not exists notification_emails text[] not null default '{}';

alter table public.families
  drop constraint if exists families_notification_emails_max_two;

alter table public.families
  add constraint families_notification_emails_max_two
  check (coalesce(array_length(notification_emails, 1), 0) <= 2);
