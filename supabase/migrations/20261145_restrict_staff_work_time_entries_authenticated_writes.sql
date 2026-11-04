-- Remove staff PostgREST write path on staff_work_time_entries (My Hours uses service_role API).
-- Run after: 20261144_add_staff_work_time_entries.sql

drop policy if exists "Staff insert own staff_work_time_entries"
  on public.staff_work_time_entries;

drop policy if exists "Staff update own staff_work_time_entries"
  on public.staff_work_time_entries;

revoke insert, update, delete on public.staff_work_time_entries from anon, authenticated;
