-- Add end_time for timed organization events (week calendar grid)
-- Run after: 20260813_add_student_profile_photos.sql

alter table public.organization_events
  add column if not exists end_time text;
