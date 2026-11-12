-- Serialize staff hours adjustment review: lock the request, apply hours from locked
-- proposed_sessions, and set status in one transaction.
-- Run after: 20261159_replace_staff_work_time_closed_sessions_atomic.sql

create or replace function public.review_staff_hours_adjustment_request_atomic(
  p_organization_id uuid,
  p_request_id uuid,
  p_decision text,
  p_reviewer_user_id uuid,
  p_timezone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.staff_hours_adjustment_requests%rowtype;
  v_entries jsonb := '[]'::jsonb;
  v_elem jsonb;
  v_clock_in text;
  v_clock_out text;
  v_start_mins integer;
  v_end_mins integer;
  v_clock_in_at timestamptz;
  v_clock_out_at timestamptz;
  v_tz text;
begin
  if p_decision is distinct from 'approved' and p_decision is distinct from 'denied' then
    raise exception 'staff_hours_adjustment:invalid_decision';
  end if;

  v_tz := nullif(trim(p_timezone), '');
  if v_tz is null then
    v_tz := 'America/Denver';
  end if;

  select *
  into v_request
  from public.staff_hours_adjustment_requests
  where id = p_request_id
    and organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'staff_hours_adjustment:not_found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'staff_hours_adjustment:already_reviewed';
  end if;

  if p_decision = 'approved' then
    if jsonb_typeof(v_request.proposed_sessions) <> 'array'
      or jsonb_array_length(v_request.proposed_sessions) = 0
      or jsonb_array_length(v_request.proposed_sessions) > 12
    then
      raise exception 'staff_hours_adjustment:invalid_sessions';
    end if;

    for v_elem in
      select value from jsonb_array_elements(v_request.proposed_sessions) as value
    loop
      v_clock_in := v_elem->>'clockIn';
      v_clock_out := v_elem->>'clockOut';

      if v_clock_in is null
        or v_clock_out is null
        or v_clock_in !~ '^\d{2}:\d{2}$'
        or v_clock_out !~ '^\d{2}:\d{2}$'
      then
        raise exception 'staff_hours_adjustment:invalid_sessions';
      end if;

      v_start_mins :=
        (split_part(v_clock_in, ':', 1)::integer * 60)
        + split_part(v_clock_in, ':', 2)::integer;
      v_end_mins :=
        (split_part(v_clock_out, ':', 1)::integer * 60)
        + split_part(v_clock_out, ':', 2)::integer;

      if v_end_mins <= v_start_mins then
        raise exception 'staff_hours_adjustment:invalid_sessions';
      end if;

      v_clock_in_at :=
        ((v_request.work_date::text || ' ' || v_clock_in || ':00')::timestamp at time zone v_tz);
      v_clock_out_at :=
        ((v_request.work_date::text || ' ' || v_clock_out || ':00')::timestamp at time zone v_tz);

      v_entries := v_entries || jsonb_build_array(
        jsonb_build_object(
          'clock_in_at', to_jsonb(v_clock_in_at),
          'clock_out_at', to_jsonb(v_clock_out_at)
        )
      );
    end loop;

    perform public.replace_staff_work_time_closed_sessions_atomic(
      v_request.organization_id,
      v_request.staff_member_id,
      v_request.work_date,
      p_reviewer_user_id,
      v_entries
    );
  end if;

  update public.staff_hours_adjustment_requests
  set
    status = p_decision,
    reviewed_by_user_id = p_reviewer_user_id,
    reviewed_at = now()
  where id = v_request.id
    and status = 'pending';

  return jsonb_build_object(
    'staff_member_id', v_request.staff_member_id,
    'work_date', to_char(v_request.work_date, 'YYYY-MM-DD'),
    'submitted_by_user_id', v_request.submitted_by_user_id,
    'approved', p_decision = 'approved'
  );
end;
$$;

revoke execute on function public.review_staff_hours_adjustment_request_atomic(
  uuid,
  uuid,
  text,
  uuid,
  text
)
  from public, anon, authenticated;

grant execute on function public.review_staff_hours_adjustment_request_atomic(
  uuid,
  uuid,
  text,
  uuid,
  text
)
  to service_role;
