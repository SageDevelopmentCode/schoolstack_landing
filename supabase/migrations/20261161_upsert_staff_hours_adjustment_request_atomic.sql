-- Serialize teacher pending adjustment upserts against concurrent review.
-- Run after: 20261160_review_staff_hours_adjustment_request_atomic.sql

create or replace function public.upsert_staff_hours_adjustment_request_atomic(
  p_organization_id uuid,
  p_staff_member_id uuid,
  p_work_date date,
  p_note text,
  p_proposed_sessions jsonb,
  p_previous_sessions jsonb,
  p_submitted_by_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_proposed jsonb := coalesce(p_proposed_sessions, '[]'::jsonb);
  v_previous jsonb := coalesce(p_previous_sessions, '[]'::jsonb);
begin
  if jsonb_typeof(v_proposed) <> 'array'
    or jsonb_array_length(v_proposed) = 0
    or jsonb_array_length(v_proposed) > 12
  then
    raise exception 'staff_hours_adjustment:invalid_sessions';
  end if;

  if jsonb_typeof(v_previous) <> 'array' then
    v_previous := '[]'::jsonb;
  end if;

  select id
  into v_request_id
  from public.staff_hours_adjustment_requests
  where organization_id = p_organization_id
    and staff_member_id = p_staff_member_id
    and work_date = p_work_date
    and status = 'pending'
  for update;

  if found then
    update public.staff_hours_adjustment_requests
    set
      note = v_note,
      proposed_sessions = v_proposed,
      previous_sessions = v_previous,
      submitted_by_user_id = p_submitted_by_user_id
    where id = v_request_id
      and status = 'pending';

    return v_request_id;
  end if;

  begin
    insert into public.staff_hours_adjustment_requests (
      organization_id,
      staff_member_id,
      work_date,
      status,
      note,
      proposed_sessions,
      previous_sessions,
      submitted_by_user_id
    )
    values (
      p_organization_id,
      p_staff_member_id,
      p_work_date,
      'pending',
      v_note,
      v_proposed,
      v_previous,
      p_submitted_by_user_id
    )
    returning id into v_request_id;

    return v_request_id;
  exception
    when unique_violation then
      select id
      into v_request_id
      from public.staff_hours_adjustment_requests
      where organization_id = p_organization_id
        and staff_member_id = p_staff_member_id
        and work_date = p_work_date
        and status = 'pending'
      for update;

      if not found then
        raise;
      end if;

      update public.staff_hours_adjustment_requests
      set
        note = v_note,
        proposed_sessions = v_proposed,
        previous_sessions = v_previous,
        submitted_by_user_id = p_submitted_by_user_id
      where id = v_request_id
        and status = 'pending';

      return v_request_id;
  end;
end;
$$;

revoke execute on function public.upsert_staff_hours_adjustment_request_atomic(
  uuid,
  uuid,
  date,
  text,
  jsonb,
  jsonb,
  uuid
)
  from public, anon, authenticated;

grant execute on function public.upsert_staff_hours_adjustment_request_atomic(
  uuid,
  uuid,
  date,
  text,
  jsonb,
  jsonb,
  uuid
)
  to service_role;
