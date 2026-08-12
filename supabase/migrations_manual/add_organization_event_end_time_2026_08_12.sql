-- Promoted to supabase/migrations/20260814_add_organization_event_end_time.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Add end_time for timed organization events (week calendar grid)

alter table public.organization_events
  add column if not exists end_time text;
