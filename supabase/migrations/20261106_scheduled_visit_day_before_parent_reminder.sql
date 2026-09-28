-- 2026-11-06: Track day-before parent reminder sends for scheduled admissions visits.

alter table public.admissions_scheduled_visits
  add column if not exists day_before_parent_reminder_sent_at timestamptz;

comment on column public.admissions_scheduled_visits.day_before_parent_reminder_sent_at is
  'Set when the cron sends the day-before parent reminder email for this visit.';
