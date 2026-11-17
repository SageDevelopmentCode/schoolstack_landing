-- Atomic rate limit for teacher classroom signup reminders (one per signup per hour).
-- Run after: 20261166_free_school_signup_details.sql

alter table public.classroom_signups
  add column if not exists last_reminder_sent_at timestamptz;

comment on column public.classroom_signups.last_reminder_sent_at is
  'Set when a teacher reminder is claimed/sent; used to enforce the hourly reminder cooldown.';