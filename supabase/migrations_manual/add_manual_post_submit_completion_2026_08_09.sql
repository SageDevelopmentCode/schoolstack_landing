-- Promoted to supabase/migrations/20260807_add_manual_post_submit_completion.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.admissions_scheduled_visits
  add column if not exists completed_manually_at timestamptz null,
  add column if not exists completed_manually_by_user_id uuid null references auth.users(id);
