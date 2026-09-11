-- Classroom signups: multiselect classroom audience
-- Run after: 20260922_teacher_activity_notification_reads.sql

alter table public.classroom_signups
  add column if not exists classroom_ids uuid[] not null default '{}';

alter table public.classroom_signups
  drop constraint if exists classroom_signups_audience_check;

alter table public.classroom_signups
  add constraint classroom_signups_audience_check
  check (audience in ('assigned', 'classroom', 'classrooms'));
