-- Promoted to supabase/migrations/20261133_add_post_submit_step_admin_completion_notes.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.admissions_scheduled_visits
  add column if not exists admin_completion_notes text null;

comment on column public.admissions_scheduled_visits.admin_completion_notes is
  'Internal notes for school staff documenting a completed post-application step (not shown in family portal).';
