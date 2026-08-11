-- Manual admin completion for post-submit visit steps (tour, interview, shadow day).
-- Run after: 20260806_add_portal_messages.sql

alter table public.admissions_scheduled_visits
  add column if not exists completed_manually_at timestamptz null,
  add column if not exists completed_manually_by_user_id uuid null references auth.users(id);
