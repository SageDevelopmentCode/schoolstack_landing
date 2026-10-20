-- Promoted to supabase/migrations/20261124_add_scheduled_visit_day_of_parent_reminder.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-10-19: Day-of parent reminder tracking for scheduled admissions visits.

alter table public.admissions_scheduled_visits
  add column if not exists day_of_parent_reminder_sent_at timestamptz;

comment on column public.admissions_scheduled_visits.day_of_parent_reminder_sent_at is
  'Set when the cron sends the day-of parent reminder email for this visit.';
