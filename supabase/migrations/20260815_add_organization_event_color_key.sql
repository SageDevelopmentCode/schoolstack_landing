-- Add color_key for per-event calendar block colors
-- Run after: 20260814_add_organization_event_end_time.sql

alter table public.organization_events
  add column if not exists color_key text;
