-- Promoted to supabase/migrations/20260923_classroom_signup_multiselect_audience.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.classroom_signups
  add column if not exists classroom_ids uuid[] not null default '{}';

alter table public.classroom_signups
  drop constraint if exists classroom_signups_audience_check;

alter table public.classroom_signups
  add constraint classroom_signups_audience_check
  check (audience in ('assigned', 'classroom', 'classrooms'));
