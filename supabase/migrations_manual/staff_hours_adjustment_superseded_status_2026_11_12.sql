-- Promoted to supabase/migrations/20261162_staff_hours_adjustment_superseded_status.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Run after: upsert_staff_hours_adjustment_request_atomic_2026_11_12.sql

alter table public.staff_hours_adjustment_requests
  drop constraint if exists staff_hours_adjustment_requests_status_check;

alter table public.staff_hours_adjustment_requests
  add constraint staff_hours_adjustment_requests_status_check
  check (status in ('pending', 'approved', 'denied', 'superseded'));
