-- Promoted to supabase/migrations/20260815_add_organization_event_color_key.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Add color_key for per-event calendar block colors

alter table public.organization_events
  add column if not exists color_key text;
