-- 2026-11-24: Track day-of parent reminder sends for scheduled admissions visits.
-- Run after: 20261106_scheduled_visit_day_before_parent_reminder.sql

alter table public.admissions_scheduled_visits
  add column if not exists day_of_parent_reminder_sent_at timestamptz;

comment on column public.admissions_scheduled_visits.day_of_parent_reminder_sent_at is
  'Set when the cron sends the day-of parent reminder email for this visit.';
