-- Promoted to supabase/migrations/20261145_restrict_staff_work_time_entries_authenticated_writes.sql for local/CI.
-- Run this in Supabase SQL Editor on production if 20261144 was applied with staff insert/update policies.

drop policy if exists "Staff insert own staff_work_time_entries"
  on public.staff_work_time_entries;

drop policy if exists "Staff update own staff_work_time_entries"
  on public.staff_work_time_entries;

revoke insert, update, delete on public.staff_work_time_entries from anon, authenticated;
