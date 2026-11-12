-- Atomic replace of closed staff work time entries for one day (delete + insert in one transaction).
-- Run after: 20261158_add_staff_hours_adjustment_requests.sql

create or replace function public.replace_staff_work_time_closed_sessions_atomic(
  p_organization_id uuid,
  p_staff_member_id uuid,
  p_work_date date,
  p_recorded_by_user_id uuid,
  p_entries jsonb
)
returns void
language plpgsql
set search_path = public
as $$
begin
  if p_entries is null
    or jsonb_typeof(p_entries) <> 'array'
    or jsonb_array_length(p_entries) = 0
  then
    raise exception 'invalid_sessions' using errcode = 'P0001';
  end if;

  delete from public.staff_work_time_entries
  where organization_id = p_organization_id
    and staff_member_id = p_staff_member_id
    and work_date = p_work_date
    and clock_out_at is not null;

  insert into public.staff_work_time_entries (
    organization_id,
    staff_member_id,
    work_date,
    clock_in_at,
    clock_out_at,
    recorded_by_user_id
  )
  select
    p_organization_id,
    p_staff_member_id,
    p_work_date,
    (entry->>'clock_in_at')::timestamptz,
    (entry->>'clock_out_at')::timestamptz,
    p_recorded_by_user_id
  from jsonb_array_elements(p_entries) as entry;
end;
$$;

revoke execute on function public.replace_staff_work_time_closed_sessions_atomic(
  uuid,
  uuid,
  date,
  uuid,
  jsonb
)
  from public, anon, authenticated;

grant execute on function public.replace_staff_work_time_closed_sessions_atomic(
  uuid,
  uuid,
  date,
  uuid,
  jsonb
)
  to service_role;
