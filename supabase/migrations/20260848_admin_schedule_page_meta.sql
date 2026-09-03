-- Lean aggregates for school admin schedule tab header
-- Run after: 20260847_admin_students_page_meta.sql

create or replace function public.admin_schedule_page_meta(
  p_organization_id uuid,
  p_year integer,
  p_month integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_month_start date;
  v_month_end date;
  v_month_slot_count integer;
  v_month_observation_day_count integer;
  v_upcoming_visit_count integer;
begin
  v_month_start := make_date(p_year, p_month + 1, 1);
  v_month_end := (date_trunc('month', v_month_start::timestamp) + interval '1 month - 1 day')::date;

  select count(*)::int
  into v_month_slot_count
  from public.admissions_availability_slots
  where organization_id = p_organization_id
    and date >= v_month_start
    and date <= v_month_end;

  select count(distinct date)::int
  into v_month_observation_day_count
  from public.admissions_observation_slots
  where organization_id = p_organization_id
    and start_time = 'ALL_DAY'
    and end_time is null
    and date >= v_month_start
    and date <= v_month_end;

  select count(*)::int
  into v_upcoming_visit_count
  from public.admissions_scheduled_visits
  where organization_id = p_organization_id
    and status = 'scheduled'
    and completed_manually_at is null
    and coalesce(end_date, scheduled_date) >= current_date;

  return jsonb_build_object(
    'month_slot_count', coalesce(v_month_slot_count, 0),
    'month_observation_day_count', coalesce(v_month_observation_day_count, 0),
    'upcoming_visit_count', coalesce(v_upcoming_visit_count, 0)
  );
end;
$$;
