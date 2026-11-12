-- Allow superseded terminal status when a teacher saves hours directly after a pending request.
-- Run after: 20261161_upsert_staff_hours_adjustment_request_atomic.sql

alter table public.staff_hours_adjustment_requests
  drop constraint if exists staff_hours_adjustment_requests_status_check;

alter table public.staff_hours_adjustment_requests
  add constraint staff_hours_adjustment_requests_status_check
  check (status in ('pending', 'approved', 'denied', 'superseded'));
