-- Enforce campus tour slot capacity and overlap under concurrency.
-- Run after: 20261103_portal_link_membership_helpers.sql

create or replace function public.admissions_parse_time_slot_minutes(p_time_slot text)
returns int
language plpgsql
immutable
as $$
declare
  v_match text[];
  v_hour int;
  v_minute int;
  v_period text;
begin
  v_match := regexp_match(trim(p_time_slot), '^(\d{1,2}):(\d{2})\s*(AM|PM)$', 'i');
  if v_match is null then
    return null;
  end if;

  v_hour := v_match[1]::int;
  v_minute := v_match[2]::int;
  v_period := upper(v_match[3]);

  if v_period = 'AM' then
    if v_hour = 12 then
      v_hour := 0;
    end if;
  elsif v_hour <> 12 then
    v_hour := v_hour + 12;
  end if;

  return v_hour * 60 + v_minute;
end;
$$;

create or replace function public.admissions_minutes_to_time_slot_label(p_minutes int)
returns text
language plpgsql
immutable
as $$
declare
  v_hour int;
  v_minute int;
  v_period text;
  v_hour12 int;
begin
  v_hour := p_minutes / 60;
  v_minute := p_minutes % 60;

  if v_hour >= 12 then
    v_period := 'PM';
    if v_hour > 12 then
      v_hour12 := v_hour - 12;
    else
      v_hour12 := 12;
    end if;
  else
    v_period := 'AM';
    if v_hour = 0 then
      v_hour12 := 12;
    else
      v_hour12 := v_hour;
    end if;
  end if;

  return v_hour12::text || ':' || lpad(v_minute::text, 2, '0') || ' ' || v_period;
end;
$$;

create or replace function public.admissions_duration_slot_count(p_duration_minutes int)
returns int
language sql
immutable
as $$
  select greatest(1, round(p_duration_minutes::numeric / 30)::int);
$$;

create or replace function public.admissions_visit_time_ranges_overlap(
  p_start_minutes int,
  p_duration_minutes int,
  p_other_start_minutes int,
  p_other_duration_minutes int
)
returns boolean
language sql
immutable
as $$
  select
    p_start_minutes < (p_other_start_minutes + p_other_duration_minutes)
    and p_other_start_minutes < (p_start_minutes + p_duration_minutes);
$$;

create or replace function public.campus_tour_group_pool_count(
  p_organization_id uuid,
  p_slot_date date,
  p_slot_time text,
  p_group_day_key date,
  p_exclude_visit_id uuid default null
)
returns int
language sql
stable
as $$
  select count(*)::int
  from public.admissions_scheduled_visits v
  where v.organization_id = p_organization_id
    and v.status = 'scheduled'
    and v.action_type = 'schedule_campus_tour'
    and v.scheduling_mode = 'time_slot'
    and (p_exclude_visit_id is null or v.id <> p_exclude_visit_id)
    and (
      case
        when p_group_day_key is not null then v.scheduled_date = p_group_day_key
        else v.scheduled_date = p_slot_date and v.start_time_slot = p_slot_time
      end
    );
$$;

create or replace function public.enforce_campus_tour_slot_capacity()
returns trigger
language plpgsql
as $$
declare
  v_slot public.admissions_availability_slots;
  v_start_minutes int;
  v_cell_count int;
  v_cell_minutes int;
  v_cell_label text;
  v_i int;
  v_tour_count int;
  v_visit record;
  v_visit_start_minutes int;
  v_visit_slot public.admissions_availability_slots;
  v_lock_key bigint;
begin
  if new.action_type <> 'schedule_campus_tour'
    or coalesce(new.scheduling_mode, 'time_slot') <> 'time_slot'
    or new.status <> 'scheduled' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'scheduled'
      and new.status = 'scheduled'
      and old.scheduled_date = new.scheduled_date
      and old.start_time_slot = new.start_time_slot
      and old.duration_minutes = new.duration_minutes
      and old.action_type = new.action_type
      and coalesce(old.scheduling_mode, 'time_slot') = coalesce(new.scheduling_mode, 'time_slot') then
      return new;
    end if;
  end if;

  select s.*
  into v_slot
  from public.admissions_availability_slots s
  where s.organization_id = new.organization_id
    and s.date = new.scheduled_date
    and s.time_slot = new.start_time_slot
  for update;

  if not found then
    raise exception 'slot_unavailable'
      using errcode = 'P0001';
  end if;

  v_start_minutes := public.admissions_parse_time_slot_minutes(new.start_time_slot);
  if v_start_minutes is null then
    raise exception 'slot_unavailable'
      using errcode = 'P0001';
  end if;

  v_cell_count := public.admissions_duration_slot_count(new.duration_minutes);
  if (v_start_minutes - 360) / 30 + v_cell_count > 36 then
    raise exception 'slot_unavailable'
      using errcode = 'P0001';
  end if;

  for v_i in 0..(v_cell_count - 1) loop
    v_cell_minutes := v_start_minutes + (v_i * 30);
    v_cell_label := public.admissions_minutes_to_time_slot_label(v_cell_minutes);

    if not exists (
      select 1
      from public.admissions_availability_slots s
      where s.organization_id = new.organization_id
        and s.date = new.scheduled_date
        and s.time_slot = v_cell_label
    ) then
      raise exception 'slot_unavailable'
        using errcode = 'P0001';
    end if;
  end loop;

  if v_slot.tour_booking_mode = 'group' then
    if v_slot.group_day_key is not null then
      v_lock_key := hashtext(new.organization_id::text || ':' || v_slot.group_day_key::text);
    else
      v_lock_key := hashtext(
        new.organization_id::text || ':' || new.scheduled_date::text || ':' || new.start_time_slot
      );
    end if;
    perform pg_advisory_xact_lock(v_lock_key);

    v_tour_count := public.campus_tour_group_pool_count(
      new.organization_id,
      v_slot.date,
      v_slot.time_slot,
      v_slot.group_day_key,
      case when tg_op = 'UPDATE' then old.id else null end
    );

    if v_tour_count >= v_slot.group_capacity then
      raise exception 'slot_unavailable'
        using errcode = 'P0001';
    end if;
  else
    perform pg_advisory_xact_lock(
      hashtext(new.organization_id::text || ':' || new.scheduled_date::text)
    );
  end if;

  for v_visit in
    select v.*
    from public.admissions_scheduled_visits v
    where v.organization_id = new.organization_id
      and v.status = 'scheduled'
      and coalesce(v.scheduling_mode, 'time_slot') = 'time_slot'
      and v.scheduled_date = new.scheduled_date
      and (tg_op <> 'UPDATE' or v.id <> old.id)
  loop
    v_visit_start_minutes := public.admissions_parse_time_slot_minutes(v_visit.start_time_slot);
    if v_visit_start_minutes is null then
      continue;
    end if;

    if not public.admissions_visit_time_ranges_overlap(
      v_start_minutes,
      new.duration_minutes,
      v_visit_start_minutes,
      v_visit.duration_minutes
    ) then
      continue;
    end if;

    if v_visit.action_type = 'schedule_family_interview' then
      raise exception 'slot_unavailable'
        using errcode = 'P0001';
    end if;

    if v_visit.action_type <> 'schedule_campus_tour' then
      continue;
    end if;

    select s.*
    into v_visit_slot
    from public.admissions_availability_slots s
    where s.organization_id = v_visit.organization_id
      and s.date = v_visit.scheduled_date
      and s.time_slot = v_visit.start_time_slot;

    if not found or v_visit_slot.tour_booking_mode = 'exclusive' then
      raise exception 'slot_unavailable'
        using errcode = 'P0001';
    end if;

    if v_slot.tour_booking_mode = 'group'
      and v_visit_slot.tour_booking_mode = 'group'
      and (
        (
          v_slot.group_day_key is not null
          and v_visit_slot.group_day_key is not null
          and v_slot.group_day_key = v_visit_slot.group_day_key
        )
        or (
          v_slot.group_day_key is null
          and v_visit_slot.group_day_key is null
          and v_slot.date = v_visit_slot.date
          and v_slot.time_slot = v_visit_slot.time_slot
        )
      ) then
      continue;
    end if;

    raise exception 'slot_unavailable'
      using errcode = 'P0001';
  end loop;

  return new;
end;
$$;

drop trigger if exists enforce_campus_tour_slot_capacity on public.admissions_scheduled_visits;

create trigger enforce_campus_tour_slot_capacity
  before insert or update on public.admissions_scheduled_visits
  for each row
  execute function public.enforce_campus_tour_slot_capacity();
